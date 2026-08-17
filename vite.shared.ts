import type { Plugin } from 'vite'
import { createGenerator } from 'unocss'
import { loadConfig } from '@unocss/config'
import { readFileSync, writeFileSync, readdirSync, statSync, rmSync } from 'node:fs'
import { join } from 'node:path'

export const ID = 'dsh-vibe'

// 递归收集 src/ 下全部 .ts/.tsx（含子目录）
function collectSource(dir = 'src'): string[] {
  const files: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      files.push(...collectSource(p))
    } else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      files.push(p)
    }
  }
  return files
}

// 扫描源码提取 vibe-* 原子类生成 CSS（preflights 开：tabular-nums / translate 依赖 --un-* 变量）
async function generateUnoCss(): Promise<string> {
  const { config } = await loadConfig(process.cwd())
  const uno = await createGenerator(config)
  const source = collectSource().map((f) => readFileSync(f, 'utf8')).join('\n')
  const extracted = await uno.applyExtractors(source)
  const { css } = await uno.generate(extracted, { preflights: true })
  return css
}

/**
 * UnoCSS 插件：@unocss/vite 的 build 靠 transformIndexHtml 注入 CSS，lib mode 无 HTML
 * 不生效；这里用官方 unocss API 在产物写出后落盘 lib/client.css，供包装插件内联。
 */
export function unocssCssPlugin(): Plugin {
  return {
    name: 'dsh-vibe:unocss-css',
    async writeBundle() {
      writeFileSync('lib/client.css', await generateUnoCss())
    },
  }
}

/**
 * DSH 客户端插件包装：把 Vite 产出的 CJS + 内联 CSS 包进 ModuleLoader 工厂
 * （window.__ModuleLoader__.load），浏览器运行时动态注入 <style data-plugin>。
 */
export function moduleLoaderWrapPlugin(): Plugin {
  return {
    name: 'dsh-vibe:module-loader-wrap',
    async writeBundle() {
      const js = readFileSync('lib/client.cjs.js', 'utf8')
      const css = readFileSync('lib/client.css', 'utf8')
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
`
      writeFileSync('lib/client.js', wrapped)
      rmSync('lib/client.cjs.js', { force: true })
      rmSync('lib/client.css', { force: true })
    },
  }
}
