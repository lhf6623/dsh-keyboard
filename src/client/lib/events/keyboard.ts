import { createEventSource } from './source'

/** 订阅 window keydown / keyup（原始事件广播；首个订阅挂监听，最后一个退订摘监听）。 */
export const onKeyDown = createEventSource<KeyboardEvent>(window, 'keydown')
export const onKeyUp = createEventSource<KeyboardEvent>(window, 'keyup')
