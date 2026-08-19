import { createEventSource } from './source'

/** 订阅 window 鼠标事件（原始事件广播；首个订阅挂监听，最后一个退订摘监听）。 */
export const onMouseDown = createEventSource<MouseEvent>(window, 'mousedown')
export const onMouseUp = createEventSource<MouseEvent>(window, 'mouseup')
export const onMouseMove = createEventSource<MouseEvent>(window, 'mousemove')
export const onMouseLeave = createEventSource<MouseEvent>(window, 'mouseleave')
export const onWheel = createEventSource<WheelEvent>(window, 'wheel')
