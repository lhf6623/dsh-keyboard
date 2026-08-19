/**
 * 原生事件源工厂：独占一个原生监听，向订阅者广播（emit 语义：纯观察、广播）。
 * 首个订阅挂监听，最后一个退订摘监听；map 用于过滤/转换原始事件（返回 null 即忽略）。
 * 对应 Cordis 事件模型（dsh-developer-guide「事件系统」）：事件源由模块拥有，订阅者互不知晓。
 */
export function createEventSource<E extends Event, T = E>(
  target: EventTarget,
  type: string,
  map?: (e: E) => T | null,
): (fn: (value: T) => void) => () => void {
  const listeners = new Set<(value: T) => void>()
  let attached = false

  function onEvent(e: Event) {
    const value = map ? map(e as E) : (e as unknown as T)
    if (value === null) return
    for (const fn of [...listeners]) fn(value)
  }

  return (fn) => {
    listeners.add(fn)
    if (!attached) {
      target.addEventListener(type, onEvent)
      attached = true
    }
    return () => {
      listeners.delete(fn)
      if (listeners.size === 0 && attached) {
        target.removeEventListener(type, onEvent)
        attached = false
      }
    }
  }
}
