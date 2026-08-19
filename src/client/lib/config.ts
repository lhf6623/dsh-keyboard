import { configStorageKey } from '@/shared/identity'

export type ShakeLevel = 'off' | 'light' | 'medium' | 'strong'
export type MoleFrequency = 'low' | 'medium' | 'high'

export interface VibeConfig {
  enabled: boolean
  opacity: number
  moleFrequency: MoleFrequency
  molePoolSize: number
  feedback: boolean
  flame: boolean
  shake: ShakeLevel
  response: boolean
  pageShake: boolean
  pageShakeLevel: ShakeLevel
  sound: boolean
}

export const DEFAULTS: VibeConfig = {
  enabled: true, opacity: 0.5,
  moleFrequency: 'medium', molePoolSize: 6,
  feedback: true, flame: true, shake: 'off',
  response: true, pageShake: true, pageShakeLevel: 'off', sound: true,
} 

// 持久化键：localStorage（浏览器本地，发布后依然有效）。
// 系统 settings（settingsScope）可用时（白名单暴露）优先读系统值并回写，未暴露时 localStorage 是唯一存储。
const KEY = configStorageKey()

function clamp(v: unknown, min: number, max: number, def: number): number {
  const n = typeof v === 'number' && !Number.isNaN(v) ? v : def
  return Math.min(max, Math.max(min, n))
}

export function normalizeConfig(c: unknown): VibeConfig {
  const o = (c ?? {}) as any
  const level = (v: unknown): ShakeLevel => v === 'light' || v === 'medium' || v === 'strong' ? v : 'off'
  const freq = (v: unknown): MoleFrequency => v === 'low' || v === 'high' ? v : 'medium'
  return {
    enabled: o.enabled !== false,
    opacity: clamp(o.opacity, 0.1, 1, 0.5),
    moleFrequency: freq(o.moleFrequency),
    molePoolSize: Math.round(clamp(o.molePoolSize, 1, 10, 6)),
    feedback: o.feedback !== false,
    flame: o.flame !== false,
    shake: level(o.shake),
    response: o.response !== false,
    pageShake: o.pageShake !== false,
    pageShakeLevel: level(o.pageShakeLevel),
    sound: o.sound !== false,
  }
}

function loadLocal(): VibeConfig {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(KEY)
      if (raw) return normalizeConfig(JSON.parse(raw))
    }
  } catch {}
  return { ...DEFAULTS }
}

function saveLocal(c: VibeConfig): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(KEY, JSON.stringify(c))
    }
  } catch {}
}

// —— 系统 settings（可选增强）：scope ready 时用系统值并回写 localStorage ——
// 只声明用到的客户端 scope 形状，避免客户端 bundle 引入 @deepseek-ai 依赖。
export interface SettingsScopeLike<T> {
  getSnapshot(): {
    status: 'loading' | 'ready' | 'unavailable'
    value: T | undefined
    base: unknown
    user: unknown
    revision: number | undefined
    writable: boolean
    mode: 'host' | 'memory'
  }
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<void>
}

let scope: SettingsScopeLike<VibeConfig> | null = null
let config: VibeConfig = loadLocal()
const listeners = new Set<(c: VibeConfig) => void>()

/** 绑定系统 settings namespace 的客户端 scope（由 client.tsx 在 apply 时调用一次）。 */
export function attachSettings(s: SettingsScopeLike<VibeConfig>): void {
  scope = s
  const snap = s.getSnapshot()
  if (snap.status === 'ready' && snap.value) {
    config = normalizeConfig(snap.value)
    saveLocal(config)
  }
  s.subscribe(() => {
    const cur = s.getSnapshot()
    if (cur.status === 'ready' && cur.value) {
      config = normalizeConfig(cur.value)
      saveLocal(config)
      for (const fn of listeners) fn(config)
    }
  })
  // 触发首次后台读取（不阻塞激活；controller 已排队则无害）
  const p = (s as any).load?.()
  if (p && typeof p.then === 'function') p.catch(() => {})
}

export function getConfig(): VibeConfig {
  return config
}

/** 修改配置：写 localStorage 持久化；scope 可用时同步写入系统 settings。 */
export function setConfig(patch: Partial<VibeConfig>): void {
  const next = normalizeConfig({ ...config, ...patch })
  config = next
  saveLocal(next)
  for (const fn of listeners) fn(config)
  if (scope) {
    for (const [k, v] of Object.entries(patch)) {
      scope.set(k, v).catch(() => {})
    }
  }
}

export function subscribeConfig(fn: (c: VibeConfig) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
