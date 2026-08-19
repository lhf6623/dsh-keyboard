import { defineConfig } from "vite";
import {
  assertPatchName,
  moduleLoaderWrapPlugin,
  resolve,
  unocssCssPlugin,
} from "./vite.shared.ts";

assertPatchName();

// 客户端：Vite lib mode（CJS）+ UnoCSS 生成 + ModuleLoader 包装
export default defineConfig({
  resolve,
  // 自动 JSX runtime（react/jsx-runtime）：组件无需 import React；与 harness 官方客户端插件一致
  esbuild: { jsx: "automatic" },
  plugins: [unocssCssPlugin(), moduleLoaderWrapPlugin()],
  build: {
    lib: {
      entry: "src/client/index.tsx",
      formats: ["cjs"],
      fileName: () => "client.cjs.js",
    },
    outDir: "lib",
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      // external 是精确匹配：react/jsx-runtime 也要列出来，运行时由 ModuleLoader 注入
      external: ["react", "react/jsx-runtime"],
    },
  },
});
