import esbuild from 'esbuild'
import { writeFileSync } from 'node:fs'

const ID = 'dsh-vibe'
const watch = process.argv.includes('--watch') || process.argv.includes('-w')

const clientOptions = {
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
}

const hostOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  external: ['@deepseek-ai/schemastery', '@deepseek-ai/dsh-settings'],
  outfile: 'lib/index.js',
  minify: false,
  logLevel: 'info',
}

function wrap(code) {
  return `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(ID)},\n  factory: function (require) {\n    var module = { exports: {} }\n    var exports = module.exports\n${code}\n    return module.exports\n  },\n})\n`
}

function writeClient(outputFiles) {
  writeFileSync('lib/client.js', wrap(outputFiles[0].text))
}

if (watch) {
  const clientCtx = await esbuild.context({
    ...clientOptions,
    plugins: [{
      name: 'wrap-client',
      setup(build) {
        build.onEnd((result) => {
          if (result.outputFiles) { writeClient(result.outputFiles); console.log('[watch] rebuilt lib/client.js') }
        })
      },
    }],
  })
  await clientCtx.watch()

  const hostCtx = await esbuild.context(hostOptions)
  await hostCtx.watch()

  console.log('[watch] watching src/ — client hot-reloads via dsh-client-hmr; host changes need a harness restart')
} else {
  const client = await esbuild.build(clientOptions)
  writeClient(client.outputFiles)
  await esbuild.build(hostOptions)
  console.log('built lib/client.js and lib/index.js')
}
