import * as React from 'react'

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

export function Key(props: { label: string; w: number; on: boolean; mole?: string }) {
  const cls = KEY_LAYOUT + ' ' + (props.on ? KEY_DOWN : KEY_UP)
  const flipRef = React.useRef<HTMLDivElement | null>(null)
  // 键帽内部内容翻转：正面字母 ↔ 背面小动物（键帽边框/背景不动）
  React.useEffect(() => {
    const el = flipRef.current
    if (!props.mole || !el) return
    el.animate(
      [
        { transform: 'rotateY(0deg)' },
        { transform: 'rotateY(180deg)', offset: 0.5 },
        { transform: 'rotateY(180deg)', offset: 0.8 },
        { transform: 'rotateY(360deg)' },
      ],
      { duration: 2400, easing: 'ease-in-out', fill: 'forwards' },
    )
  }, [props.mole])

  return (
    <div className={cls + ' vibe-relative'} style={{ width: Math.round(props.w * 30 + (props.w - 1) * 5) + 'px', perspective: 260 }}>
      {/* 键帽不动，内部内容层翻面 */}
      <div ref={flipRef} className="vibe-absolute vibe-inset-0" style={{ transformStyle: 'preserve-3d' }}>
        <div className="vibe-absolute vibe-inset-0 vibe-flex vibe-items-center vibe-justify-center" style={{ backfaceVisibility: 'hidden' }}>
          {props.label}
        </div>
        <div
          className="vibe-absolute vibe-inset-0 vibe-flex vibe-items-center vibe-justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', fontSize: 20, lineHeight: 1 }}>
          {props.mole ?? ''}
        </div>
      </div>
    </div>
  )
}
