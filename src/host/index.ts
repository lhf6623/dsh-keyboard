import z from "@deepseek-ai/schemastery";
import {
  installSettingsSection,
  settingsNamespace,
} from "@deepseek-ai/dsh-settings";
import { pluginName } from "@/shared/identity";

export const name = pluginName();

/** Settings namespace owned by this plugin（浏览器侧经 settingsScope 读写）。 */
export const VIBE_SETTINGS_NAMESPACE = settingsNamespace(pluginName());

export const SHAKE_LEVELS = ["off", "light", "medium", "strong"] as const;
export type ShakeLevel = (typeof SHAKE_LEVELS)[number];

export const MOLE_FREQUENCIES = ["off", "low", "medium", "high"] as const;
export type MoleFrequency = (typeof MOLE_FREQUENCIES)[number];

/**
 * 插件配置（配置式写法，见 cordis-tutorial/05-config）：
 * - 导出 Config 接口 + 同名 Schemastery schema，默认值写在 schema 里；
 * - 部署者在 cordis.yml 的 entry config 块覆盖（如 profile 的 cordis.patch.yml）；
 * - Cordis 在 apply 前校验，错误配置直接加载失败；配置变更触发 HMR 热替换。
 * 经官方 installSettingsSection（cookbook/adding-a-settings-card）注册为 settings namespace：
 * entry 配置层叠在用户文档之下，解析值 = schema 默认 < cordis.yml entry < 用户覆盖。
 */
export interface Config {
  enabled: boolean;
  opacity: number;
  moleFrequency: MoleFrequency;
  feedback: boolean;
  flame: boolean;
  shake: ShakeLevel;
  response: boolean;
  pageShakeLevel: ShakeLevel;
  sound: boolean;
}

export const Config: z<Config> = z.object({
  enabled: z.boolean().default(true),
  opacity: z.number().min(0.1).max(1).default(0.5),
  moleFrequency: z.union([...MOLE_FREQUENCIES]).default("medium"),
  // 组总开关：打字反馈（火焰 + 输入抖动）、回答反馈（整页抖动 + 提示音）
  feedback: z.boolean().default(true),
  flame: z.boolean().default(true),
  shake: z.union([...SHAKE_LEVELS]).default("off"),
  response: z.boolean().default(true),
  // 回答后整页抖动强度（含 off=关闭，不跟随输入抖动）
  pageShakeLevel: z.union([...SHAKE_LEVELS]).default("off"),
  sound: z.boolean().default(true),
});

function sseData(frame: { type: string }): string {
  return "data: " + JSON.stringify(frame) + "\n\n";
}

export default {
  inject: ["webServer"],
  apply(ctx: any, config: Config) {
    // 配置来源：默认 cordis.yml entry；settings 用户层写入后切到解析值。
    let source: () => Config = () => config;
    installSettingsSection(ctx, VIBE_SETTINGS_NAMESPACE, Config, config, {
      setSource: (get: () => Config) => {
        source = get;
      },
      onChange: () => {
        // 宿主目前不消费配置值（渲染在浏览器侧）；保持来源最新即可。
        void source();
      },
    });

    const connections = new Set<any>();

    function broadcast(type: string) {
      const line = sseData({ type });
      for (const res of connections) {
        try {
          res.write(line);
        } catch {}
      }
    }

    ctx.on("session/event", (_session: any, event: any) => {
      if (event && event.type === "turn/end") broadcast("answer-done");
    });

    ctx.effect(() => {
      const disposeRoute = ctx.webServer.register({
        kind: "exact",
        path: "/api/vibe-events",
        handler: (req: any, res: any) => {
          if (req.method !== "GET" && req.method !== "HEAD") {
            res.writeHead(405);
            res.end();
            return;
          }
          res.writeHead(200, {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            connection: "keep-alive",
          });
          res.write(": connected\n\n");
          connections.add(res);
          res.on("close", () => {
            connections.delete(res);
          });
        },
      });
      return () => {
        disposeRoute();
        for (const res of connections) res.destroy();
        connections.clear();
      };
    });
  },
};
