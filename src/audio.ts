import { getConfig } from './config'

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
  if (getConfig().sound === false) return
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
