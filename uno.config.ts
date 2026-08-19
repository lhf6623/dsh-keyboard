import { defineConfig, presetUno } from "unocss";

// 所有 UnoCSS 生成的原子类都带 vibe- 前缀，避免与 DSH 自身的类名冲突。
// dsh-dark: 变体跟随 DSH 的深色模式属性 body[data-ds-dark-theme]，
// 用于把键帽/鼠标等组件的深色配色也写成原子类。
export default defineConfig({
  presets: [presetUno({ prefix: "vibe-" })],
  variants: [
    (matcher: string) => {
      if (!matcher.startsWith("dsh-dark:")) return matcher;
      return {
        matcher: matcher.slice(9),
        selector: (s: string) => `body[data-ds-dark-theme] ${s}`,
      };
    },
  ],
});
