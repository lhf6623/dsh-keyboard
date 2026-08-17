import * as React from 'react'
import { ROWS } from './layout'

export interface MouseState {
  left: boolean
  right: boolean
  middle: boolean
  wheel: boolean
}

// —— 键帽：布局为状态无关的公共类，配色/阴影/位移按「按下与否」二选一，避免同类叠加覆盖 ——
const KEY_LAYOUT = 'vibe-flex vibe-items-center vibe-justify-center vibe-h-[30px] vibe-box-border vibe-rounded-md vibe-border vibe-border-solid vibe-text-[10px] vibe-font-mono vibe-transition-[transform,box-shadow,background-color,color]'

const KEY_UP = [
  'vibe-border-[rgba(0,0,0,0.2)]',
  'vibe-bg-[rgba(255,255,255,0.25)]',
  'vibe-text-[rgba(0,0,0,0.45)]',
  'vibe-shadow-[0_1px_0_rgba(0,0,0,0.08)]',
  'dsh-dark:vibe-border-[rgba(255,255,255,0.14)]',
  'dsh-dark:vibe-bg-[rgba(255,255,255,0.07)]',
  'dsh-dark:vibe-text-[rgba(255,255,255,0.72)]',
  'dsh-dark:vibe-shadow-[0_1px_0_rgba(0,0,0,0.35)]',
].join(' ')

const KEY_DOWN = [
  'vibe-translate-y-[2px]',
  'vibe-border-[rgba(0,0,0,0.3)]',
  'vibe-bg-[rgba(88,150,255,0.18)]',
  'vibe-text-[rgba(0,0,0,0.6)]',
  'vibe-shadow-none',
  'dsh-dark:vibe-border-[rgba(120,170,255,0.5)]',
  'dsh-dark:vibe-bg-[rgba(88,150,255,0.3)]',
  'dsh-dark:vibe-text-[rgba(255,255,255,0.95)]',
].join(' ')

export function Key(props: { label: string; w: number; on: boolean }) {
  const cls = KEY_LAYOUT + ' ' + (props.on ? KEY_DOWN : KEY_UP)
  return <div className={cls} style={{ width: Math.round(props.w * 30 + (props.w - 1) * 5) + 'px' }}>{props.label}</div>
}

export function KeyboardMain(props: { pressed: Record<string, boolean> }) {
  return (
    <div className="vibe-flex vibe-flex-col vibe-gap-[5px]">
      {ROWS.map((row) => (
        <div className="vibe-flex vibe-gap-[5px]" key={row[0][0]}>
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
    <div className="vibe-flex vibe-flex-col vibe-gap-[5px]">
      <div className="vibe-flex vibe-gap-[5px]">
        <div style={{ width: '30px' }} />
        <Key label="↑" w={1} on={!!props.pressed['ArrowUp']} />
        <div style={{ width: '30px' }} />
      </div>
      <div className="vibe-flex vibe-gap-[5px]">
        <Key label="←" w={1} on={!!props.pressed['ArrowLeft']} />
        <Key label="↓" w={1} on={!!props.pressed['ArrowDown']} />
        <Key label="→" w={1} on={!!props.pressed['ArrowRight']} />
      </div>
    </div>
  )
}

// —— 鼠标：机身/按键/滚轮，配色按状态二选一渲染 ——
const MOUSE_BODY = [
  'vibe-relative vibe-w-[58px] vibe-h-[90px] vibe-rounded-[28px_28px_22px_22px]',
  'vibe-border vibe-border-solid vibe-border-[rgba(0,0,0,0.2)]',
  'vibe-bg-[rgba(255,255,255,0.25)]',
  'vibe-shadow-[0_1px_4px_rgba(0,0,0,0.2)]',
  'dsh-dark:vibe-border-[rgba(255,255,255,0.14)]',
  'dsh-dark:vibe-bg-[rgba(255,255,255,0.07)]',
  'dsh-dark:vibe-shadow-[0_1px_4px_rgba(0,0,0,0.45)]',
].join(' ')

const MOUSE_BTN = [
  'vibe-absolute vibe-top-0 vibe-w-1/2 vibe-h-[40px]',
  'vibe-border-0 vibe-border-b vibe-border-solid vibe-border-b-[rgba(0,0,0,0.18)]',
  'vibe-transition-[background-color]',
  'dsh-dark:vibe-border-b-[rgba(255,255,255,0.12)]',
].join(' ')

const MOUSE_BTN_ON = 'vibe-bg-[rgba(88,150,255,0.18)] dsh-dark:vibe-bg-[rgba(88,150,255,0.3)]'

const WHEEL_BASE = [
  'vibe-absolute vibe-left-1/2 vibe-translate-x--1/2 vibe-w-[9px] vibe-h-[20px] vibe-rounded-[5px]',
  'vibe-border vibe-border-solid vibe-border-[rgba(0,0,0,0.2)]',
  'vibe-transition-[background-color,top]',
  'dsh-dark:vibe-border-[rgba(255,255,255,0.18)]',
].join(' ')

export function MouseView(props: { mouse: MouseState }) {
  const m = props.mouse
  const wheelTop = m.middle ? 'vibe-top-[6px]' : 'vibe-top-[20px]'
  const wheelBg = m.wheel
    ? 'vibe-bg-[rgba(88,150,255,0.3)] dsh-dark:vibe-bg-[rgba(88,150,255,0.42)]'
    : 'vibe-bg-[rgba(150,150,150,0.55)] dsh-dark:vibe-bg-[rgba(200,200,200,0.42)]'
  return (
    <div className={MOUSE_BODY}>
      <div className={MOUSE_BTN + ' vibe-left-0 vibe-rounded-tl-[28px]' + (m.left ? ' ' + MOUSE_BTN_ON : '')} />
      <div className={MOUSE_BTN + ' vibe-right-0 vibe-rounded-tr-[28px]' + (m.right ? ' ' + MOUSE_BTN_ON : '')} />
      <div className={WHEEL_BASE + ' ' + wheelTop + ' ' + wheelBg} />
    </div>
  )
}
