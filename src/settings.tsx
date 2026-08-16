import * as React from 'react'
import { getConfig, setConfig, subscribeConfig, VibeConfig, ShakeLevel } from './config'

const SHAKE_LABELS: Record<ShakeLevel, string> = { off: '关', light: '轻', medium: '中', strong: '强' }
const SHAKE_LEVELS: ShakeLevel[] = ['off', 'light', 'medium', 'strong']

const ROW = 'vibe-flex vibe-items-center vibe-gap-3'
const LABEL = 'vibe-text-xs vibe-text-[var(--dsw-alias-label-secondary)] vibe-min-w-16 vibe-whitespace-nowrap'
const GROUP_TITLE = 'vibe-text-xs vibe-font-medium vibe-text-[var(--dsw-alias-label-secondary)]'
const VAL = 'vibe-text-xs vibe-text-[var(--dsw-alias-label-tertiary)] vibe-min-w-10 vibe-text-right vibe-tabular-nums'
const CHECKBOX = 'vibe-accent-[var(--dsw-alias-brand-primary)] vibe-w-[15px] vibe-h-[15px]'
const RANGE = 'vibe-flex-1 vibe-accent-[var(--dsw-alias-brand-primary)]'

export function VibeSection() {
  const [cfg, setCfg] = React.useState<VibeConfig>(getConfig())
  React.useEffect(() => {
    setCfg(getConfig())
    return subscribeConfig(setCfg)
  }, [])
  const update = (patch: Partial<VibeConfig>) => setConfig(patch)

  return (
    <div className="vibe-flex vibe-flex-col vibe-gap-3.5 vibe-py-4">
      <div className="vibe-flex vibe-flex-col vibe-gap-2.5">
        <div className={GROUP_TITLE}>键盘外观</div>
        <div className={ROW}>
          <label className={LABEL}>显示键盘</label>
          <input className={CHECKBOX} type="checkbox" checked={cfg.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
        </div>
        <div className={ROW}>
          <label className={LABEL}>键盘透明度</label>
          <input className={RANGE} type="range" min="0.1" max="1" step="0.05" value={cfg.opacity} onChange={(e) => update({ opacity: parseFloat(e.target.value) })} />
          <span className={VAL}>{Math.round(cfg.opacity * 100)}%</span>
        </div>
        <div className={ROW}>
          <label className={LABEL}>键盘缩放</label>
          <input className={RANGE} type="range" min="0.6" max="1.5" step="0.05" value={cfg.scale} onChange={(e) => update({ scale: parseFloat(e.target.value) })} />
          <span className={VAL}>{Math.round(cfg.scale * 100)}%</span>
        </div>
      </div>

      <div className="vibe-flex vibe-flex-col vibe-gap-2.5">
        <div className={GROUP_TITLE}>打字反馈</div>
        <div className={ROW}>
          <label className={LABEL}>打字火焰</label>
          <input className={CHECKBOX} type="checkbox" checked={cfg.flame} onChange={(e) => update({ flame: e.target.checked })} />
        </div>
        <div className={ROW}>
          <label className={LABEL}>输入抖动</label>
          <div className="vibe-inline-flex vibe-border vibe-border-solid vibe-border-[var(--dsw-alias-border-l2)] vibe-rounded-lg vibe-overflow-hidden vibe-divide-x vibe-divide-solid vibe-divide-[var(--dsw-alias-border-l2)]">
            {SHAKE_LEVELS.map((level) => (
              <button key={level} type="button"
                className={'vibe-border-0 vibe-px-[14px] vibe-py-[3px] vibe-text-[12px] vibe-cursor-pointer ' + (cfg.shake === level
                  ? 'vibe-bg-[var(--dsw-alias-interactive-bg-hover)] vibe-text-[var(--dsw-alias-label-primary)]'
                  : 'vibe-bg-transparent vibe-text-[var(--dsw-alias-label-secondary)]')}
                onClick={() => update({ shake: level })}>
                {SHAKE_LABELS[level]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="vibe-flex vibe-flex-col vibe-gap-2.5">
        <div className={GROUP_TITLE}>回答反馈</div>
        <div className={ROW}>
          <label className={LABEL}>回答提示音</label>
          <input className={CHECKBOX} type="checkbox" checked={cfg.sound} onChange={(e) => update({ sound: e.target.checked })} />
        </div>
      </div>
    </div>
  )
}
