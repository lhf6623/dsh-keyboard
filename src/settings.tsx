import * as React from 'react'
import { getConfig, setConfig, subscribeConfig, VibeConfig, ShakeLevel } from './config'

const SHAKE_LABELS: Record<ShakeLevel, string> = { off: '关', light: '轻', medium: '中' }

export function VibeSection() {
  const [cfg, setCfg] = React.useState<VibeConfig>(getConfig())
  React.useEffect(() => {
    setCfg(getConfig())
    return subscribeConfig(setCfg)
  }, [])
  const update = (patch: Partial<VibeConfig>) => setConfig(patch)

  return (
    <div className="dsh-kb-settings">
      <div className="dsh-kb-group">
        <div className="dsh-kb-group-title">键盘外观</div>
        <div className="dsh-kb-settings-row">
          <label>显示键盘</label>
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
        </div>
        <div className="dsh-kb-settings-row">
          <label>键盘透明度</label>
          <input type="range" min="0.1" max="1" step="0.05" value={cfg.opacity} onChange={(e) => update({ opacity: parseFloat(e.target.value) })} />
          <span className="dsh-kb-settings-val">{Math.round(cfg.opacity * 100)}%</span>
        </div>
        <div className="dsh-kb-settings-row">
          <label>键盘缩放</label>
          <input type="range" min="0.6" max="1.5" step="0.05" value={cfg.scale} onChange={(e) => update({ scale: parseFloat(e.target.value) })} />
          <span className="dsh-kb-settings-val">{Math.round(cfg.scale * 100)}%</span>
        </div>
      </div>
      <div className="dsh-kb-group">
        <div className="dsh-kb-group-title">打字反馈</div>
        <div className="dsh-kb-settings-row">
          <label>打字火焰</label>
          <input type="checkbox" checked={cfg.flame} onChange={(e) => update({ flame: e.target.checked })} />
        </div>
        <div className="dsh-kb-settings-row">
          <label>输入抖动</label>
          <div className="dsh-kb-seg">
            {(Object.keys(SHAKE_LABELS) as ShakeLevel[]).map((level) => (
              <button key={level} type="button" className={'dsh-kb-seg-btn' + (cfg.shake === level ? ' on' : '')} onClick={() => update({ shake: level })}>
                {SHAKE_LABELS[level]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="dsh-kb-group">
        <div className="dsh-kb-group-title">回答反馈</div>
        <div className="dsh-kb-settings-row">
          <label>回答提示音</label>
          <input type="checkbox" checked={cfg.sound} onChange={(e) => update({ sound: e.target.checked })} />
        </div>
      </div>
    </div>
  )
}