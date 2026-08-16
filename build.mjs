import { build } from 'vite'
import esbuild from 'esbuild'
import { createGenerator } from 'unocss'
import { loadConfig } from '@unocss/config'
import { readFileSync, writeFileSync, readdirSync, rmSync, watch as fsWatch } from 'node:fs'
import { join } from 'node:path'

const ID = 'dsh-vibe'
const watch = process.argv.includes('--watch') || process.argv.includes('-w')

function collectSource() {
  const files = []
  for (const name of readdirSync('src')) {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) files.push(join('src', name))
  }
  return files
}

async function generateUnoCss() {
  const { config } = await loadConfig(process.cwd())
  const uno = await createGenerator(config)
  const source = collectSource().map((f) => readFileSync(f, 'utf8')).join('\n')
  const extracted = await uno.applyExtractors(source)
  // preflights 必须开启：tabular-nums / translate 等 utility 依赖 --un-* 变量（由 preflight 定义）。
  const { css } = await uno.generate(extracted, { preflights: true })
  return css
}

async function buildClient() {
  await build({
    configFile: false,
    logLevel: 'warn',
    build: {
      lib: { entry: 'src/client.tsx', formats: ['cjs'], fileName: () => 'client.cjs.js' },
      outDir: 'lib',
      emptyOutDir: false,
      rollupOptions: { external: ['react'] },
    },
  })
  const js = readFileSync('lib/client.cjs.js', 'utf8')
  const css = await generateUnoCss()
  const wrapped = `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(ID)},\n  factory: function (require) {\n    var module = { exports: {} }\n    var exports = module.exports\n    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin="' + ${JSON.stringify(ID)} + '"]') === null) {\n      var tag = document.createElement('style')\n      tag.dataset.plugin = ${JSON.stringify(ID)}\n      tag.textContent = ${JSON.stringify(css)}\n      document.head.appendChild(tag)\n    }\n${js}\n    return module.exports\n  },\n})\n`
  writeFileSync('lib/client.js', wrapped)
  rmSync('lib/client.cjs.js', { force: true })
}

async function buildHost() {
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    external: [],
    outfile: 'lib/index.js',
    minify: false,
    logLevel: 'info',
  })
}

async function buildAll() {
  await buildHost()
  await buildClient()
  console.log('built lib/client.js and lib/index.js')
}

if (watch) {
  let timer = null
  const rebuild = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      buildAll().then(() => console.log('[watch] rebuilt')).catch((e) => console.error('[watch] build failed:', e))
    }, 200)
  }
  buildAll()
  fsWatch('src', { recursive: true }, rebuild)
  console.log('[watch] watching src/ — client hot-reloads via dsh-client-hmr; host changes need a harness restart')
} else {
  await buildAll()
}
