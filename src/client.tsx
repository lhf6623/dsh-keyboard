import { Overlay } from './ui/overlay'
import { VibeCard } from './settings/settings'
import { playAnswerSound } from './fx/audio'
import { shakePage } from './fx/shake'
import { attachSettings, normalizeConfig } from './settings/config'

export const inject = ['slots', 'connection', 'remote', 'settingsScope']

export function apply(ctx: any) {
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'dsh-vibe' },
    Overlay,
  ))
  // 独立「氛围」设置标签（settings.section）：显示不依赖 api-proxy 白名单，
  // 与系统设置面板同级的单独配置页。
  ctx.slots.inject('settings.section', () => ctx.slots.register(
    { name: 'settings.section', id: 'vibe', order: 5, label: () => '氛围' },
    VibeCard,
  ))
  // 绑定系统 settings namespace：配置来自 cordis.yml（Config schema）经 settings 服务解析，
  // 浏览器只读；namespace 未被 api-proxy 白名单暴露时 scope 为 unavailable，读取默认值。
  ctx.inject(['settingsScope'], (sctx: any) => {
    const scope = sctx.settingsScope.bind({
      namespace: 'dsh-vibe',
      decode: (raw: unknown) => normalizeConfig(raw),
    })
    attachSettings(scope)
  })
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
