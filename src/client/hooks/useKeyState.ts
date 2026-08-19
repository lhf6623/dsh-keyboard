import * as React from 'react'
import { onKeyDown, onKeyUp } from '../lib/events/keyboard'
import { onPageDeactivate } from '../lib/events/page'

/**
 * 全局按键状态：pressed[code] 驱动键帽高亮。
 * 订阅键盘事件源（events/keyboard.ts），修饰键按 getModifierState 修正
 * （区分左右 Shift/Alt/Ctrl/Cmd），页面失活自动清键。
 */
export function useKeyState(): Record<string, boolean> {
  const [pressed, setPressed] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    function clearPressed() {
      setPressed((prev) => (Object.keys(prev).length ? {} : prev))
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

    const offDown = onKeyDown(keyDown)
    const offUp = onKeyUp(keyUp)
    const offPage = onPageDeactivate(clearPressed)
    return () => {
      offDown()
      offUp()
      offPage()
    }
  }, [])

  return pressed
}
