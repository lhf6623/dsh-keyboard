import * as React from 'react'
import { getConfig, subscribeConfig, VibeConfig } from '../config'
import { computeCaretPosition } from '../caret'
import { initFlame, spawnFlame, stopFlame } from '../flame'
import { primeAudio } from '../audio'
import { triggerShake, stopShake } from '../shake'
import { KeyboardMain, ArrowView, MouseView, MouseState } from './Keyboard'

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
  React.useEffect(() => {
    function measure() {
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay ? overlay.parentElement : null
      if (frame) {
        const tpl = frame.style.gridTemplateColumns || getComputedStyle(frame).gridTemplateColumns
        const m1 = tpl.match(/^s*([d.]+)px/)
        const m2 = tpl.match(/([d.]+)pxs*$/)
        const sidebarW = m1 ? parseFloat(m1[1]) : 0
        const detailsW = m2 ? parseFloat(m2[1]) : 0
        setLeft(Math.round(sidebarW + (window.innerWidth - sidebarW - detailsW) / 2))
      }
      const el = document.querySelector('[data-composer-card]') || document.querySelector('[data-composer-seat]')
      if (el) {
        const rect = el.getBoundingClientRect()
        setBottom(Math.round(window.innerHeight - rect.top + 10))
      }
    }
    measure()
    window.addEventListener('resize', measure)
    let obs: ResizeObserver | null = null
    const seat = document.querySelector('[data-composer-card]') || document.querySelector('[data-composer-seat]')
    if (seat && typeof ResizeObserver !== 'undefined') {
      obs = new ResizeObserver(measure)
      obs.observe(seat)
    }
    let mo: MutationObserver | null = null
    const ov = document.querySelector('[data-shell-overlay]')
    const fr = ov ? ov.parentElement : null
    if (fr && typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(measure)
      mo.observe(fr, { attributes: true, attributeFilter: ['style', 'data-sidebar-collapsed', 'data-details-collapsed'] })
    }
    return () => {
      window.removeEventListener('resize', measure)
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
    <div className="dsh-kb-root" style={rootStyle}>
      <div className="dsh-kb-wrap">
        <KeyboardMain pressed={pressed} />
        <div className="dsh-kb-side">
          <MouseView mouse={mouse} />
          <ArrowView pressed={pressed} />
        </div>
      </div>
    </div>
  ) : null

  return (
    <React.Fragment>
      {keyboard}
      <canvas className="dsh-kb-flame" ref={flameRef} style={{ pointerEvents: 'none' }} />
    </React.Fragment>
  )
}
