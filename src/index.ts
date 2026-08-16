export const name = 'dsh-vibe'

function sseData(frame: { type: string }): string {
  return 'data: ' + JSON.stringify(frame) + '\n\n'
}

export default {
  inject: ['webServer'],
  apply(ctx: any) {
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
