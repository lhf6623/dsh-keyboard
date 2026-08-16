export type ShakeLevel = 'off' | 'light' | 'medium'

export interface VibeConfig {
  enabled: boolean
  flame: boolean
  shake: ShakeLevel
  sound: boolean
  opacity: number
  scale: number
}

const DEFAULTS: VibeConfig = { enabled: true, flame: true, shake: 'off', sound: true, opacity: 0.5, scale: 1 }

function clamp(v: unknown, min: number, max: number, def: number): number {
  const n = typeof v === 'number' && !Number.isNaN(v) ? v : def
  return Math.min(max, Math.max(min, n))
}

export function normalizeConfig(c: unknown): VibeConfig {
  const o = (c ?? {}) as any
  const shake: ShakeLevel = o.shake === 'light' || o.shake === 'medium' ? o.shake : 'off'
  return {
    enabled: o.enabled !== false,
    flame: o.flame !== false,
    shake,
    sound: o.sound !== false,
    opacity: clamp(o.opacity, 0.1, 1, 0.5),
    scale: clamp(o.scale, 0.6, 1.5, 1),
  }
}

let config: VibeConfig = { ...DEFAULTS }
let scope: any = null
const listeners = new Set<(c: VibeConfig) => void>()

// Wire the store to a settingsScope controller (bound by apply()).
export function initConfig(s: any): void {
  scope = s
  s.subscribe(() => {
    const snap = s.getSnapshot()
    if (snap.status === 'ready' && snap.value && typeof snap.value === 'object') {
      config = normalizeConfig(snap.value)
      for (const fn of listeners) fn(config)
    }
  })
}

export function getConfig(): VibeConfig {
  return config
}

export function setConfig(patch: Partial<VibeConfig>): void {
  config = normalizeConfig({ ...config, ...patch })
  for (const fn of listeners) fn(config)
  if (scope) {
    for (const key of Object.keys(patch) as (keyof VibeConfig)[]) {
      try { scope.set(key, (patch as any)[key]) } catch {}
    }
  }
}

export function subscribeConfig(fn: (c: VibeConfig) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
