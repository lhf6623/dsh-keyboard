import * as React from 'react'
import { getConfig, subscribeConfig, VibeConfig } from '../settings/config'
import { computeCaretPosition } from './caret'
import { initFlame, spawnFlame, stopFlame } from '../fx/flame'
import { primeAudio } from '../fx/audio'
import { triggerShake, stopShake } from '../fx/shake'
import { KeyboardMain, ArrowView, MouseView, MouseState } from './keyboard'

export function Overlay() {
  const [pressed, setPressed] = React.useState<Record<string, boolean>>({})
  const [mouse, setMouse] = React.useState<MouseState>({ left: false, right: false, middle: false, wheel: false })
  const [bottom, setBottom] = React.useState(170)
  const [left, setLeft] = React.useState<number | null>(null)
  const [cfg, setCfg] = React.useState<VibeConfig>(getConfig())
  const flameRef = React.useRef<HTMLCanvasElement | null>(null)

  // config subscription
  React.useEffect(() => {
    setCfg(getConfig())
    return subscribeConfig(setCfg)
  }, [])

  // flame canvas + composer input
  React.useEffect(() => {
    initFlame(flameRef.current)
    function onInput(e: Event) {
      const t = e.target as HTMLTextAreaElement
      if (!t || t.tagName !== 'TEXTAREA') return
      if (typeof t.closest !== 'function' || !t.closest('[data-composer-card]')) return
      const card = t.closest('[data-composer-card]')
      const pos = computeCaretPosition(t)
      spawnFlame(pos.x, pos.y)
      triggerShake(card)
    }
    document.addEventListener('input', onInput)
    return () => {
      document.removeEventListener('input', onInput)
      stopFlame()
      stopShake()
    }
  }, [])

  // key / mouse listeners
  React.useEffect(() => {
    function clearPressed() {
      setPressed((prev) => (Object.keys(prev).length ? {} : prev))
    }
    function clearAll() {
      clearPressed()
      setMouse((prev) => (!prev.left && !prev.right && !prev.middle && !prev.wheel ? prev : { left: false, right: false, middle: false, wheel: false }))
    }
    function reconcileModifiers(e: KeyboardEvent) {
      if (typeof e.getModifierState !== 'function') return
      setPressed((prev) => {
        let changed = false
        let next: Record<string, boolean> | null = null
        const drop = (a: string, b: string) => {
          if (prev[a] || prev[b]) {
            if (next === null) next = { ...prev }
            delete next[a]; delete next[b]; changed = true
          }
        }
        if (!e.getModifierState('Shift')) drop('ShiftLeft', 'ShiftRight')
        if (!e.getModifierState('Alt')) drop('AltLeft', 'AltRight')
        if (!e.getModifierState('Control')) drop('ControlLeft', 'ControlRight')
        if (!e.getModifierState('Meta')) drop('MetaLeft', 'MetaRight')
        return changed ? (next as Record<string, boolean>) : prev
      })
    }
    function keyDown(e: KeyboardEvent) {
      primeAudio()
      reconcileModifiers(e)
      if (e.repeat) return
      setPressed((prev) => {
        if (prev[e.code]) return prev
        const next = { ...prev }
        next[e.code] = true
        return next
      })
    }
    function keyUp(e: KeyboardEvent) {
      setPressed((prev) => {
        if (!prev[e.code]) return prev
        const next = { ...prev }
        delete next[e.code]
        return next
      })
      reconcileModifiers(e)
    }
    function applyButtons(buttons: number) {
      setMouse((prev) => {
        const n: MouseState = { left: !!(buttons & 1), right: !!(buttons & 2), middle: !!(buttons & 4), wheel: prev.wheel }
        if (n.left === prev.left && n.right === prev.right && n.middle === prev.middle) return prev
        return n
      })
    }
    function onMouse(e: MouseEvent) { primeAudio(); applyButtons(e.buttons || 0) }
    function onMouseLeave() {
      setMouse((prev) => (!prev.left && !prev.right && !prev.middle ? prev : { left: false, right: false, middle: false, wheel: prev.wheel }))
    }
    let wheelTimer: number | null = null
    function onWheel() {
      setMouse((prev) => ({ left: prev.left, right: prev.right, middle: prev.middle, wheel: true }))
      if (wheelTimer) window.clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(() => {
        setMouse((prev) => (prev.wheel ? { left: prev.left, right: prev.right, middle: prev.middle, wheel: false } : prev))
      }, 180)
    }
    function onVisibility() { if (document.hidden) clearAll() }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('mousedown', onMouse)
    window.addEventListener('mouseup', onMouse)
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('wheel', onWheel)
    window.addEventListener('blur', clearAll)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('mousedown', onMouse)
      window.removeEventListener('mouseup', onMouse)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('blur', clearAll)
      document.removeEventListener('visibilitychange', onVisibility)
      if (wheelTimer) window.clearTimeout(wheelTimer)
    }
  }, [])

  // position / layout measurement
  // 输入框的位置会随多种情况变化：视口缩放、任意滚动（含内部容器）、内容增长把输入框
  // 往下推（AI 回复后 composer 从垂直居中移到下方）、shell 布局重排（侧边栏切换等）。
  // 这里统一监听所有这些来源，用 rAF 合并高频触发，只有位置实际变化才更新 state。
  React.useEffect(() => {
    function measure() {
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay ? overlay.parentElement : null
      if (frame) {
        const tpl = frame.style.gridTemplateColumns || getComputedStyle(frame).gridTemplateColumns
        const m1 = tpl.match(/^\s*([\d.]+)px/)
        const m2 = tpl.match(/([\d.]+)px\s*$/)
        const sidebarW = m1 ? parseFloat(m1[1]) : 0
        const detailsW = m2 ? parseFloat(m2[1]) : 0
        const l = Math.round(sidebarW + (window.innerWidth - sidebarW - detailsW) / 2)
        setLeft((prev) => (prev === l ? prev : l))
      }
      const el = document.querySelector('[data-composer-card]') || document.querySelector('[data-composer-seat]')
      if (el) {
        const rect = el.getBoundingClientRect()
        const b = Math.round(window.innerHeight - rect.top + 10)
        setBottom((prev) => (prev === b ? prev : b))
      }
    }
    let rafId: number | null = null
    function scheduleMeasure() {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        measure()
      })
    }
    measure()
    window.addEventListener('resize', scheduleMeasure)
    // capture 阶段监听，覆盖所有内部滚动容器（聊天区滚动也会移动输入框）
    window.addEventListener('scroll', scheduleMeasure, true)
    let obs: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      obs = new ResizeObserver(scheduleMeasure)
      const seat = document.querySelector('[data-composer-card]') || document.querySelector('[data-composer-seat]')
      if (seat) obs.observe(seat)
      // 内容增长（如 AI 流式回复）会把输入框往下推：观察 body/html 尺寸变化
      obs.observe(document.body)
      obs.observe(document.documentElement)
    }
    let mo: MutationObserver | null = null
    const ov = document.querySelector('[data-shell-overlay]')
    const fr = ov ? ov.parentElement : null
    if (fr && typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(scheduleMeasure)
      // childList + subtree：输入框被移动/重排、聊天内容插入等都会触发重新测量
      mo.observe(fr, {
        attributes: true,
        attributeFilter: ['style', 'class', 'data-sidebar-collapsed', 'data-details-collapsed'],
        childList: true,
        subtree: true,
      })
    }
    return () => {
      window.removeEventListener('resize', scheduleMeasure)
      window.removeEventListener('scroll', scheduleMeasure, true)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      if (obs) obs.disconnect()
      if (mo) mo.disconnect()
    }
  }, [])

  const rootStyle: React.CSSProperties = { bottom: bottom + 'px' }
  if (left !== null) rootStyle.left = left + 'px'
  if (!cfg.enabled) rootStyle.display = 'none'
  rootStyle.opacity = cfg.opacity
  rootStyle.transform = 'translateX(-50%) scale(' + cfg.scale + ')'

  const keyboard = left !== null ? (
    <div className="vibe-fixed vibe-z-40 vibe-pointer-events-none vibe-origin-[50%_100%] vibe-transition-[left,bottom] vibe-duration-300 [@media(max-width:920px)]:vibe-hidden motion-reduce:vibe-transition-none" style={rootStyle}>
      <div className="vibe-flex vibe-items-stretch vibe-gap-[3px]">
        <KeyboardMain pressed={pressed} />
        <div className="vibe-flex vibe-flex-col vibe-justify-between vibe-items-center">
          <MouseView mouse={mouse} />
          <ArrowView pressed={pressed} />
        </div>
      </div>
    </div>
  ) : null

  return (
    <React.Fragment>
      {keyboard}
      <canvas className="vibe-fixed vibe-top-0 vibe-left-0 vibe-w-full vibe-h-full vibe-z-45 vibe-pointer-events-none" ref={flameRef} />
    </React.Fragment>
  )
}