import { Overlay } from './overlay'
import { VibeSection } from './settings'
import { playAnswerSound } from './audio'
import { shakePage } from './shake'

export const inject = ['slots', 'connection', 'remote']

export function apply(ctx: any) {
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'dsh-vibe' },
    Overlay,
  ))
  ctx.slots.inject('settings.section', () => ctx.slots.register(
    { name: 'settings.section', id: 'vibe', order: 5, label: () => '氛围' },
    VibeSection,
  ))
  if (typeof EventSource !== 'undefined') {
    ctx.effect(() => {
      const es = new EventSource('/api/vibe-events')
      es.onmessage = (e) => {
        let data: any = null
        try { data = JSON.parse(e.data) } catch {}
        if (data && data.type === 'answer-done') {
          playAnswerSound()
          shakePage()
        }
      }
      return () => { es.close() }
    })
  }
}
