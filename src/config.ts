export type ShakeLevel = 'off' | 'light' | 'medium'

export interface VibeConfig {
  enabled: boolean
  flame: boolean
  shake: ShakeLevel
  sound: boolean
  opacity: number
  scale: number
}

const KEY = 'dsh-vibe.config'
const LEGACY_KEY = 'dsh-keyboard.config'
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

function loadConfig(): VibeConfig {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      let raw = window.localStorage.getItem(KEY)
      if (!raw) raw = window.localStorage.getItem(LEGACY_KEY)
      if (raw) {
        const cfg = normalizeConfig(JSON.parse(raw))
        try { window.localStorage.setItem(KEY, JSON.stringify(cfg)) } catch {}
        return cfg
      }
    }
  } catch {}
  return { ...DEFAULTS }
}

let config: VibeConfig = loadConfig()
const listeners = new Set<(c: VibeConfig) => void>()

export function getConfig(): VibeConfig {
  return config
}

export function setConfig(patch: Partial<VibeConfig>): void {
  config = normalizeConfig({ ...config, ...patch })
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(KEY, JSON.stringify(config))
    }
  } catch {}
  for (const fn of listeners) fn(config)
}

export function subscribeConfig(fn: (c: VibeConfig) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
