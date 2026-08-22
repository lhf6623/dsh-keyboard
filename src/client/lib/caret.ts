export interface CaretPosition {
  x: number
  y: number
}

const PROPS = [
  'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'lineHeight',
  'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration',
  'letterSpacing', 'wordSpacing', 'tabSize',
]

// 镜像节点在首次测量时创建一次并常驻（absolutely positioned + hidden），
// 之后每次输入事件复用同一组节点，避免每个按键都创建/挂载/卸载 DOM 造成布局抖动与 GC 压力。
// disposeCaret() 在适当生命周期（如 flame 清理）调用，从 body 移除镜像并清空单例引用，
// 防止 HMR / 组件重挂载时旧节点残留；computeCaretPosition 会在镜像未挂载时按需重新挂载。
let mirrorDiv: HTMLDivElement | null = null
let mirrorSpan: HTMLSpanElement | null = null

function getMirror(): HTMLDivElement {
  if (!mirrorDiv) {
    mirrorDiv = document.createElement('div')
  }
  if (!mirrorDiv.isConnected) {
    document.body.appendChild(mirrorDiv)
  }
  return mirrorDiv
}

function getMirrorSpan(): HTMLSpanElement {
  if (!mirrorSpan) mirrorSpan = document.createElement('span')
  return mirrorSpan
}

export function computeCaretPosition(textarea: HTMLTextAreaElement): CaretPosition {
  const position = textarea.selectionEnd || 0
  const value = textarea.value || ''

  const div = getMirror()
  const span = getMirrorSpan()
  const style = div.style
  const computed = getComputedStyle(textarea)

  // 定位样式常驻；测量所依赖的文本度量（width/font/padding 等）每次都从 textarea 重新复制，
  // 以便在字体/尺寸响应式变化时仍保持与 textarea 完全一致的排版。
  style.whiteSpace = 'pre-wrap'
  style.wordWrap = 'break-word'
  style.position = 'absolute'
  style.visibility = 'hidden'
  style.top = '0'
  style.left = '0'
  for (const p of PROPS) {
    ;(style as any)[p] = (computed as any)[p]
  }
  if (textarea.scrollHeight > parseInt(computed.height, 10)) {
    style.overflowY = 'scroll'
  }

  // 复用一个 span 作为光标指示符：前缀作为文本节点，后缀（或一个占位 '.'）放入 span。
  div.textContent = value.substring(0, position)
  span.textContent = value.substring(position) || '.'
  div.appendChild(span)

  const left = span.offsetLeft + (parseInt(computed.borderLeftWidth, 10) || 0) - textarea.scrollLeft
  const top = span.offsetTop + (parseInt(computed.borderTopWidth, 10) || 0) - textarea.scrollTop

  const rect = textarea.getBoundingClientRect()
  return { x: rect.left + left, y: rect.top + top }
}

export function disposeCaret(): void {
  if (mirrorDiv && mirrorDiv.isConnected) {
    mirrorDiv.remove()
  }
  if (mirrorSpan && mirrorSpan.isConnected) {
    mirrorSpan.remove()
  }
  mirrorDiv = null
  mirrorSpan = null
}
