import * as React from 'react'
import { ROWS } from './layout'

export interface MouseState {
  left: boolean
  right: boolean
  middle: boolean
  wheel: boolean
}

export function Key(props: { label: string; w: number; on: boolean }) {
  const cls = 'dsh-kb-key' + (props.on ? ' on' : '')
  return <div className={cls} style={{ width: Math.round(props.w * 30 + (props.w - 1) * 5) + 'px' }}>{props.label}</div>
}

export function KeyboardMain(props: { pressed: Record<string, boolean> }) {
  return (
    <div className="dsh-kb">
      {ROWS.map((row) => (
        <div className="dsh-kb-row" key={row[0][0]}>
          {row.map((k, i) => {
            if (k[0] === '_spacer') return <div key={'spacer-' + i} style={{ width: k[2] + 'px' }} />
            return <Key key={k[0]} label={k[1]} w={k[2]} on={!!props.pressed[k[0]]} />
          })}
        </div>
      ))}
    </div>
  )
}

export function ArrowView(props: { pressed: Record<string, boolean> }) {
  return (
    <div className="dsh-kb-arrows">
      <div className="dsh-kb-row">
        <div style={{ width: '30px' }} />
        <Key label="↑" w={1} on={!!props.pressed['ArrowUp']} />
        <div style={{ width: '30px' }} />
      </div>
      <div className="dsh-kb-row">
        <Key label="←" w={1} on={!!props.pressed['ArrowLeft']} />
        <Key label="↓" w={1} on={!!props.pressed['ArrowDown']} />
        <Key label="→" w={1} on={!!props.pressed['ArrowRight']} />
      </div>
    </div>
  )
}

export function MouseView(props: { mouse: MouseState }) {
  const m = props.mouse
  const wheelCls = 'dsh-mouse-wheel' + (m.middle ? ' mid' : '') + (m.wheel ? ' on' : '')
  return (
    <div className="dsh-mouse">
      <div className={'dsh-mouse-btn left' + (m.left ? ' on' : '')} />
      <div className={'dsh-mouse-btn right' + (m.right ? ' on' : '')} />
      <div className={wheelCls} />
    </div>
  )
}