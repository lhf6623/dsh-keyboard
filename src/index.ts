import z from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'

export const name = 'dsh-vibe'

const NS = settingsNamespace('dsh-vibe')

// Durable user preferences, resolved via the DSH settings service
// (schema defaults -> user document section).
const SettingsSchema = z.object({
  enabled: z.boolean().default(true),
  flame: z.boolean().default(true),
  shake: z.union(['off', 'light', 'medium']).default('off'),
  sound: z.boolean().default(true),
  opacity: z.number().min(0.1).max(1).default(0.5),
  scale: z.number().min(0.6).max(1.5).default(1),
})

function sseData(frame: { type: string }): string {
  return 'data: ' + JSON.stringify(frame) + '\n\n'
}

export default {
  inject: ['webServer'],
  apply(ctx: any) {
    ctx.inject(['settings'], (settingsCtx: any) => {
      settingsCtx.settings.register(NS, SettingsSchema)
    })

    const connections = new Set<any>()

    function broadcast(type: string) {
      const line = sseData({ type })
      for (const res of connections) {
        try { res.write(line) } catch {}
      }
    }

    ctx.on('session/event', (_session: any, event: any) => {
      if (event && event.type === 'turn/end') broadcast('answer-done')
    })

    ctx.effect(() => {
      const disposeRoute = ctx.webServer.register({
        kind: 'exact',
        path: '/api/vibe-events',
        handler: (req: any, res: any) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405)
            res.end()
            return
          }
          res.writeHead(200, {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            'connection': 'keep-alive',
          })
          res.write(': connected\n\n')
          connections.add(res)
          res.on('close', () => { connections.delete(res) })
        },
      })
      return () => {
        disposeRoute()
        for (const res of connections) res.destroy()
        connections.clear()
      }
    })
  },
}
