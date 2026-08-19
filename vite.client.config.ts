import { defineConfig } from "vite";
import { unocssCssPlugin, moduleLoaderWrapPlugin } from "./vite.shared.ts";

// 客户端：Vite lib mode（CJS）+ UnoCSS 生成 + ModuleLoader 包装
export default defineConfig({
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
    rollupOptions: { external: ["react"] },
  },
});
