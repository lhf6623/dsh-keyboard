import type { Plugin } from "vite";
import { createGenerator } from "unocss";
import { loadConfig } from "@unocss/config";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  rmSync,
  copyFileSync,
  existsSync,
} from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

export const ID = "dsh-vibe";

/**
 * 运行中 harness 的插件安装位置 (dsh-client-hmr 轮询监控这里的 client.js)。
 * 构建/监听后把产物同步过去，客户端改动即可被 harness 检测 -> SSE 通知浏览器热替换。
 * 解析顺序:
 *   1. 环境变量 DSH_VIBE_PROFILE_LIB (完整路径, 最优先)
 *   2. 环境变量 DSH_VIBE_PROFILE (profile 名, 如 'web')
 *   3. 自动扫描 ~/.dsh/profiles 下所有装了 dsh-vibe 的 profile (取第一个存在的)
 * 找不到则禁用同步 (静默跳过)。
 */
function discoverProfileLib(): string | null {
  try {
    const profilesRoot = join(homedir(), ".dsh", "profiles");
    for (const name of readdirSync(profilesRoot)) {
      const candidate = join(
        profilesRoot,
        name,
        "node_modules",
        "dsh-vibe",
        "lib",
      );
      if (existsSync(candidate)) return candidate;
    }
  } catch {}
  return null;
}

const PROFILE_LIB =
  process.env.DSH_VIBE_PROFILE_LIB ||
  (process.env.DSH_VIBE_PROFILE
    ? join(
        homedir(),
        ".dsh",
        "profiles",
        process.env.DSH_VIBE_PROFILE,
        "node_modules",
        "dsh-vibe",
        "lib",
      )
    : "") ||
  discoverProfileLib() ||
  "";

/** 把 lib/ 下某产物复制到 profile（未发现 profile 则跳过）。 */
export function syncToProfile(file: string): void {
  try {
    if (!PROFILE_LIB || !existsSync(PROFILE_LIB)) return;
    copyFileSync(file, join(PROFILE_LIB, basename(file)));
    console.log("[dsh-vibe] synced", basename(file), "→", PROFILE_LIB);
  } catch {}
}

// 递归收集 src/ 下全部 .ts/.tsx（含子目录）
function collectSource(dir = "src"): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      files.push(...collectSource(p));
    } else if (name.endsWith(".tsx") || name.endsWith(".ts")) {
      files.push(p);
    }
  }
  return files;
}

// 扫描源码提取 vibe-* 原子类生成 CSS（preflights 开：tabular-nums / translate 依赖 --un-* 变量）
async function generateUnoCss(): Promise<string> {
  const { config } = await loadConfig(process.cwd());
  const uno = await createGenerator(config);
  const source = collectSource()
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const extracted = await uno.applyExtractors(source);
  const { css } = await uno.generate(extracted, { preflights: true });
  return css;
}

/**
 * UnoCSS 插件：@unocss/vite 的 build 靠 transformIndexHtml 注入 CSS，lib mode 无 HTML
 * 不生效；这里用官方 unocss API 在产物写出后落盘 lib/client.css，供包装插件内联。
 */
export function unocssCssPlugin(): Plugin {
  return {
    name: "dsh-vibe:unocss-css",
    async writeBundle() {
      writeFileSync("lib/client.css", await generateUnoCss());
    },
  };
}

/**
 * DSH 客户端插件包装：把 Vite 产出的 CJS + 内联 CSS 包进 ModuleLoader 工厂
 * （window.__ModuleLoader__.load），浏览器运行时动态注入 <style data-plugin>。
 */
export function moduleLoaderWrapPlugin(): Plugin {
  return {
    name: "dsh-vibe:module-loader-wrap",
    async writeBundle() {
      const js = readFileSync("lib/client.cjs.js", "utf8");
      const css = readFileSync("lib/client.css", "utf8");
      const wrapped = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(ID)},
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin="' + ${JSON.stringify(ID)} + '"]') === null) {
      var tag = document.createElement('style')
      tag.dataset.plugin = ${JSON.stringify(ID)}
      tag.textContent = ${JSON.stringify(css)}
      document.head.appendChild(tag)
    }
${js}
    return module.exports
  },
})
`;
      writeFileSync("lib/client.js", wrapped);
      rmSync("lib/client.cjs.js", { force: true });
      rmSync("lib/client.css", { force: true });
      syncToProfile("lib/client.js");
    },
  };
}
