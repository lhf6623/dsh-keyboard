// dsh-vibe — Host half.
// Observes AI turn completion through the documented `session/event` firehose
// (event.type === "turn/end") and pushes an SSE frame to the browser half,
// which plays the completion sound and shakes the page.

function sseData(frame) {
  return 'data: ' + JSON.stringify(frame) + '\n\n'
}

export default {
  inject: ['webServer'],
  apply(ctx) {
    const connections = new Set()

    function broadcast(type) {
      const line = sseData({ type })
      for (const res of connections) {
        try { res.write(line) } catch (e) { /* connection closed */ }
      }
    }

    ctx.on('session/event', (_session, event) => {
      if (event && event.type === 'turn/end') broadcast('answer-done')
    })

    ctx.effect(() => {
      const disposeRoute = ctx.webServer.register({
        kind: 'exact',
        path: '/api/vibe-events',
        handler: (req, res) => {
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
