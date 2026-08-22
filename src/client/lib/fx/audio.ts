import { getConfig } from '../config'
import { onKeyDown } from '../events/keyboard'
import { onMouseDown } from '../events/mouse'

let audioCtx: AudioContext | null = null

function ensureAudio(): AudioContext | null {
  if (!audioCtx) {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    audioCtx = new AC()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

export function primeAudio(): void {
  try { ensureAudio() } catch {}
}

export function playAnswerSound(): void {
  const cfg = getConfig()
  // 回答反馈组总开关：关闭（response=false）时提示音也停
  if (cfg.response === false || cfg.sound === false) return
  let ctx: AudioContext | null = null
  try { ctx = ensureAudio() } catch {}
  if (!ctx) return
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.55)
  } catch {}
}

/**
 * 页面级效果：首个键鼠手势解锁 AudioContext（浏览器自动播放限制）。
 * 订阅键盘/鼠标事件源，与其他按键/鼠标消费者互不知晓。返回 disposer。
 */
export function attachAudioPrime(): () => void {
  const offKey = onKeyDown(() => primeAudio())
  const offMouse = onMouseDown(() => primeAudio())
  return () => { offKey(); offMouse() }
}
