import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/client.tsx',
      formats: ['cjs'],
      fileName: () => 'client.cjs.js',
    },
    outDir: 'lib',
    emptyOutDir: false,
    rollupOptions: {
      external: ['react'],
    },
  },
})
