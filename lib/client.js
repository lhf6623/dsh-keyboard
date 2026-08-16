window.__ModuleLoader__.load({
  id: 'dsh-keyboard',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')

    var BS = String.fromCharCode(92)
    var SQ = String.fromCharCode(39)

    var STYLE_TAG = 'dsh-keyboard/style.css'
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + STYLE_TAG + '"]') === null) {
      var tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-keyboard'
      tag.dataset.pluginCss = STYLE_TAG
      tag.textContent = [
        '.dsh-kb-root { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 40; pointer-events: none; opacity: 0.62; }',
        '.dsh-kb-wrap { display: flex; align-items: stretch; gap: 3px; }',
        '.dsh-kb { display: flex; flex-direction: column; gap: 5px; }',
        '.dsh-kb-side { display: flex; flex-direction: column; justify-content: space-between; }',
        '.dsh-kb-arrows { display: flex; flex-direction: column; gap: 5px; }',
        '.dsh-kb-row { display: flex; gap: 5px; }',
        '.dsh-kb-key { height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid rgba(0,0,0,0.4); background: rgba(255,255,255,0.5); color: #1a1a1a; font-size: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; box-shadow: 0 1px 0 rgba(0,0,0,0.18); transition: transform 50ms ease, box-shadow 50ms ease, background 120ms ease, color 120ms ease; }',
        '.dsh-kb-key.on { transform: translateY(2px); box-shadow: 0 0 0 rgba(0,0,0,0.5); background: rgba(88,150,255,0.35); color: #000; border-color: rgba(0,0,0,0.55); }',
        '.dsh-mouse { position: relative; width: 58px; height: 90px; border-radius: 28px 28px 22px 22px; border: 1px solid rgba(0,0,0,0.4); background: rgba(255,255,255,0.5); box-shadow: 0 1px 4px rgba(0,0,0,0.2); }',
        '.dsh-mouse-btn { position: absolute; top: 0; width: 50%; height: 40px; border-bottom: 1px solid rgba(0,0,0,0.3); transition: background 80ms ease; }',
        '.dsh-mouse-btn.left { left: 0; border-radius: 28px 0 0 0; }',
        '.dsh-mouse-btn.right { right: 0; border-radius: 0 28px 0 0; }',
        '.dsh-mouse-btn.on { background: rgba(88,150,255,0.35); }',
        '.dsh-mouse-wheel { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 9px; height: 20px; border-radius: 5px; border: 1px solid rgba(0,0,0,0.4); background: rgba(120,120,120,0.85); transition: background 80ms ease, top 80ms ease; }',
        '.dsh-mouse-wheel.on { background: rgba(88,150,255,0.6); }',
        '.dsh-mouse-wheel.mid { top: 6px; }',
        '@media (max-width: 920px) { .dsh-kb-root { display: none; } }',
      ].join('\n')
      document.head.appendChild(tag)
    }

    var ROWS = [
      [
        ['Escape','Esc',2], ['_spacer','',1], ['F1','F1',1], ['F2','F2',1], ['F3','F3',1], ['F4','F4',1],
        ['F5','F5',1], ['F6','F6',1], ['F7','F7',1], ['F8','F8',1],
        ['F9','F9',1], ['F10','F10',1], ['F11','F11',1], ['F12','F12',1]
      ],
      [
        ['Backquote','~',1], ['Digit1','1',1], ['Digit2','2',1], ['Digit3','3',1], ['Digit4','4',1],
        ['Digit5','5',1], ['Digit6','6',1], ['Digit7','7',1], ['Digit8','8',1], ['Digit9','9',1],
        ['Digit0','0',1], ['Minus','-',1], ['Equal','=',1], ['Backspace','Del',2]
      ],
      [
        ['Tab','Tab',1.5], ['KeyQ','Q',1], ['KeyW','W',1], ['KeyE','E',1], ['KeyR','R',1], ['KeyT','T',1],
        ['KeyY','Y',1], ['KeyU','U',1], ['KeyI','I',1], ['KeyO','O',1], ['KeyP','P',1],
        ['BracketLeft','[',1], ['BracketRight',']',1], ['Backslash',BS,1.5]
      ],
      [
        ['CapsLock','Caps',1.8], ['KeyA','A',1], ['KeyS','S',1], ['KeyD','D',1], ['KeyF','F',1], ['KeyG','G',1],
        ['KeyH','H',1], ['KeyJ','J',1], ['KeyK','K',1], ['KeyL','L',1],
        ['Semicolon',';',1], ['Quote',SQ,1], ['Enter','Enter',2.2]
      ],
      [
        ['ShiftLeft','Shift',2.3], ['KeyZ','Z',1], ['KeyX','X',1], ['KeyC','C',1], ['KeyV','V',1], ['KeyB','B',1],
        ['KeyN','N',1], ['KeyM','M',1], ['Comma',',',1], ['Period','.',1], ['Slash','/',1], ['ShiftRight','Shift',2.7]
      ],
      [
        ['ControlLeft','Ctrl',1.5], ['MetaLeft','Cmd',1.3], ['AltLeft','Alt',1.3], ['Space','',7],
        ['AltRight','Alt',1.3], ['MetaRight','Cmd',1.3], ['ControlRight','Ctrl',1.5]
      ]
    ]

    function Key(props) {
      var cls = 'dsh-kb-key' + (props.on ? ' on' : '')
      return React.createElement('div', {
        className: cls,
        style: { width: Math.round(props.w * 30 + (props.w - 1) * 5) + 'px' },
      }, props.label)
    }

    function KeyboardMain(props) {
      return React.createElement('div', { className: 'dsh-kb' },
        ROWS.map(function (row) {
          return React.createElement('div', { className: 'dsh-kb-row', key: row[0][0] },
            row.map(function (k) {
              if (k[0] === '_spacer') {
                return React.createElement('div', { key: '_spacer', style: { width: Math.round(k[2] * 30 + (k[2] - 1) * 5) + 'px' } })
              }
              return React.createElement(Key, { key: k[0], label: k[1], w: k[2], on: !!props.pressed[k[0]] })
            }),
          )
        }),
      )
    }

    function ArrowView(props) {
      return React.createElement('div', { className: 'dsh-kb-arrows' },
        React.createElement('div', { className: 'dsh-kb-row' },
          React.createElement('div', { style: { width: '30px' } }),
          React.createElement(Key, { label: '↑', w: 1, on: !!props.pressed['ArrowUp'] }),
          React.createElement('div', { style: { width: '30px' } }),
        ),
        React.createElement('div', { className: 'dsh-kb-row' },
          React.createElement(Key, { label: '←', w: 1, on: !!props.pressed['ArrowLeft'] }),
          React.createElement(Key, { label: '↓', w: 1, on: !!props.pressed['ArrowDown'] }),
          React.createElement(Key, { label: '→', w: 1, on: !!props.pressed['ArrowRight'] }),
        ),
      )
    }

    function MouseView(props) {
      var m = props.mouse
      var wheelCls = 'dsh-mouse-wheel' + (m.middle ? ' mid' : '') + (m.wheel ? ' on' : '')
      return React.createElement('div', { className: 'dsh-mouse' },
        React.createElement('div', { className: 'dsh-mouse-btn left' + (m.left ? ' on' : '') }),
        React.createElement('div', { className: 'dsh-mouse-btn right' + (m.right ? ' on' : '') }),
        React.createElement('div', { className: wheelCls }),
      )
    }

    function Overlay() {
      var pressedState = React.useState({})
      var pressed = pressedState[0]
      var setPressed = pressedState[1]
      var mouseState = React.useState({ left: false, right: false, middle: false, wheel: false })
      var mouse = mouseState[0]
      var setMouse = mouseState[1]

      React.useEffect(function () {
        function keyDown(e) {
          if (e.repeat) return
          setPressed(function (prev) {
            if (prev[e.code]) return prev
            var next = {}
            for (var k in prev) next[k] = prev[k]
            next[e.code] = true
            return next
          })
        }
        function keyUp(e) {
          setPressed(function (prev) {
            if (!prev[e.code]) return prev
            var next = {}
            for (var k in prev) { if (k !== e.code) next[k] = prev[k] }
            return next
          })
        }
        function applyButtons(buttons) {
          setMouse(function (prev) {
            var n = { left: !!(buttons & 1), right: !!(buttons & 2), middle: !!(buttons & 4), wheel: prev.wheel }
            if (n.left === prev.left && n.right === prev.right && n.middle === prev.middle) return prev
            return n
          })
        }
        function onMouse(e) { applyButtons(e.buttons || 0) }
        function onMouseLeave() {
          setMouse(function (prev) {
            if (!prev.left && !prev.right && !prev.middle) return prev
            return { left: false, right: false, middle: false, wheel: prev.wheel }
          })
        }
        var wheelTimer = null
        function onWheel() {
          setMouse(function (prev) {
            return { left: prev.left, right: prev.right, middle: prev.middle, wheel: true }
          })
          if (wheelTimer) window.clearTimeout(wheelTimer)
          wheelTimer = window.setTimeout(function () {
            setMouse(function (prev) {
              if (!prev.wheel) return prev
              return { left: prev.left, right: prev.right, middle: prev.middle, wheel: false }
            })
          }, 180)
        }
        window.addEventListener('keydown', keyDown)
        window.addEventListener('keyup', keyUp)
        window.addEventListener('mousedown', onMouse)
        window.addEventListener('mouseup', onMouse)
        window.addEventListener('mousemove', onMouse)
        window.addEventListener('mouseleave', onMouseLeave)
        window.addEventListener('wheel', onWheel)
        return function () {
          window.removeEventListener('keydown', keyDown)
          window.removeEventListener('keyup', keyUp)
          window.removeEventListener('mousedown', onMouse)
          window.removeEventListener('mouseup', onMouse)
          window.removeEventListener('mousemove', onMouse)
          window.removeEventListener('mouseleave', onMouseLeave)
          window.removeEventListener('wheel', onWheel)
          if (wheelTimer) window.clearTimeout(wheelTimer)
        }
      }, [])

      return React.createElement('div', { className: 'dsh-kb-root' },
        React.createElement('div', { className: 'dsh-kb-wrap' },
          React.createElement(KeyboardMain, { pressed: pressed }),
          React.createElement('div', { className: 'dsh-kb-side' },
            React.createElement(MouseView, { mouse: mouse }),
            React.createElement(ArrowView, { pressed: pressed }),
          ),
        ),
      )
    }

    var inject = ['slots']

    function apply(ctx) {
      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register(
          { name: 'shell.overlay', id: 'dsh-keyboard' },
          Overlay,
        )
      })
    }

    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
