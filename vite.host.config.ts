import { defineConfig } from 'vite'

// 宿主：Vite lib mode（ESM，harness 内部包 external）
export default defineConfig({
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'index.js' },
    outDir: 'lib',
    emptyOutDir: false,
    rollupOptions: {
      // harness 内部包运行时从 dsh 安装目录解析，不打包避免双实例
      external: ['@deepseek-ai/schemastery', '@deepseek-ai/dsh-settings'],
    },
  },
})
