import { createEventSource } from './source'

// —— composer 输入事件源：语义化「composer 输入」，原始 document 'input' 由工厂独占 ——

/** 判断事件目标是否为 composer 输入框，是则返回该 textarea，否则 null。 */
function getComposerTextarea(e: Event): HTMLTextAreaElement | null {
  const t = e.target as HTMLTextAreaElement | null
  if (!t || t.tagName !== 'TEXTAREA') return null
  if (typeof t.closest !== 'function' || !t.closest('[data-composer-card]')) return null
  return t
}

/** 订阅 composer 输入事件（首个订阅挂 document 监听，最后一个退订摘监听），返回退订函数。 */
export const onComposerInput = createEventSource<Event, HTMLTextAreaElement>(document, 'input', getComposerTextarea)
