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

export function computeCaretPosition(textarea: HTMLTextAreaElement): CaretPosition {
  const position = textarea.selectionEnd || 0
  const value = textarea.value || ''

  const div = document.createElement('div')
  document.body.appendChild(div)
  const style = div.style
  const computed = getComputedStyle(textarea)
  style.whiteSpace = 'pre-wrap'
  style.wordWrap = 'break-word'
  style.position = 'absolute'
  style.visibility = 'hidden'
  for (const p of PROPS) {
    ;(style as any)[p] = (computed as any)[p]
  }
  if (textarea.scrollHeight > parseInt(computed.height, 10)) style.overflowY = 'scroll'

  div.textContent = value.substring(0, position)
  const span = document.createElement('span')
  span.textContent = value.substring(position) || '.'
  div.appendChild(span)

  const left = span.offsetLeft + (parseInt(computed.borderLeftWidth, 10) || 0) - textarea.scrollLeft
  const top = span.offsetTop + (parseInt(computed.borderTopWidth, 10) || 0) - textarea.scrollTop
  document.body.removeChild(div)

  const rect = textarea.getBoundingClientRect()
  return { x: rect.left + left, y: rect.top + top }
}
