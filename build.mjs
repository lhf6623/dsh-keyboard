import esbuild from 'esbuild'
import { writeFileSync } from 'node:fs'

const ID = 'dsh-vibe'

// Client: bundle TSX -> CommonJS (react external), then wrap in the ModuleLoader factory.
const client = await esbuild.build({
  entryPoints: ['src/client.tsx'],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  external: ['react'],
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  loader: { '.css': 'text' },
  minify: false,
  logLevel: 'info',
})
const clientCode = client.outputFiles[0].text
const wrapped = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(ID)},
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
${clientCode}
    return module.exports
  },
})
`
writeFileSync('lib/client.js', wrapped)

// Host: bundle TS -> ESM.
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  outfile: 'lib/index.js',
  minify: false,
  logLevel: 'info',
})

console.log('built lib/client.js and lib/index.js')
