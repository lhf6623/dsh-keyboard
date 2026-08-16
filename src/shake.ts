import { reducedMotion } from './motion'
import { getConfig } from './config'

let shakeAnim: Animation | null = null
let answerShakeAnim: Animation | null = null

function keyframes(amp: number): Keyframe[] {
  return [
    { transform: 'translateX(0)' },
    { transform: 'translateX(' + amp + 'px)' },
    { transform: 'translateX(' + (-amp) + 'px)' },
    { transform: 'translateX(' + (amp * 0.6) + 'px)' },
    { transform: 'translateX(' + (-amp * 0.4) + 'px)' },
    { transform: 'translateX(0)' },
  ]
}

export function triggerShake(card: Element | null): void {
  const level = getConfig().shake
  if (level === 'off' || reducedMotion()) return
  if (!card || typeof (card as any).animate !== 'function') return
  const amp = level === 'strong' ? 3 : level === 'medium' ? 2 : 1
  const dur = level === 'strong' ? 220 : level === 'medium' ? 180 : 120
  if (shakeAnim) shakeAnim.cancel()
  shakeAnim = (card as any).animate(keyframes(amp), { duration: dur, easing: 'ease-out' })
}

export function shakePage(): void {
  const level = getConfig().shake
  if (level === 'off' || reducedMotion()) return
  const target = document.body
  if (!target || typeof (target as any).animate !== 'function') return
  const amp = level === 'strong' ? 4 : level === 'medium' ? 3 : 2
  const dur = level === 'strong' ? 280 : level === 'medium' ? 220 : 160
  if (answerShakeAnim) answerShakeAnim.cancel()
  answerShakeAnim = (target as any).animate(keyframes(amp), { duration: dur, easing: 'ease-out' })
}

export function stopShake(): void {
  if (shakeAnim) { shakeAnim.cancel(); shakeAnim = null }
  if (answerShakeAnim) { answerShakeAnim.cancel(); answerShakeAnim = null }
}
