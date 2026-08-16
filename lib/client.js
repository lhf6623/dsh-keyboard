window.__ModuleLoader__.load({
  id: 'dsh-keyboard',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')

    var BS = String.fromCharCode(92)
    var SQ = String.fromCharCode(39)

    var KB_CONFIG_KEY = 'dsh-keyboard.config'
    var kbConfig = loadKbConfig()
    var kbConfigListeners = []
    function clampNum(v, min, max, def) {
      var n = typeof v === 'number' && !isNaN(v) ? v : def
      return Math.min(max, Math.max(min, n))
    }
    function normalizeKbConfig(c) {
      return {
        enabled: !(c && c.enabled === false),
        flame: !(c && c.flame === false),
        opacity: clampNum(c && c.opacity, 0.1, 1, 0.5),
        scale: clampNum(c && c.scale, 0.6, 1.5, 1),
      }
    }
    function loadKbConfig() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          var raw = window.localStorage.getItem(KB_CONFIG_KEY)
          if (raw) return normalizeKbConfig(JSON.parse(raw))
        }
      } catch (e) {}
      return { enabled: true, flame: true, opacity: 0.5, scale: 1 }
    }
    function setKbConfig(next) {
      kbConfig = normalizeKbConfig(next)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(KB_CONFIG_KEY, JSON.stringify(kbConfig))
        }
      } catch (e) {}
      for (var i = 0; i < kbConfigListeners.length; i++) kbConfigListeners[i](kbConfig)
    }
    function onKbConfig(fn) {
      kbConfigListeners.push(fn)
      return function () {
        var i = kbConfigListeners.indexOf(fn)
        if (i >= 0) kbConfigListeners.splice(i, 1)
      }
    }

    function computeCaretPosition(textarea) {
      var position = textarea.selectionEnd || 0
      var value = textarea.value || ''
      var props = [
        'direction','boxSizing','width','height','overflowX','overflowY',
        'borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
        'borderStyle','paddingTop','paddingRight','paddingBottom','paddingLeft',
        'fontStyle','fontVariant','fontWeight','fontStretch','fontSize','lineHeight',
        'fontFamily','textAlign','textTransform','textIndent','textDecoration',
        'letterSpacing','wordSpacing','tabSize',
      ]
      var div = document.createElement('div')
      document.body.appendChild(div)
      var style = div.style
      var computed = getComputedStyle(textarea)
      style.whiteSpace = 'pre-wrap'
      style.wordWrap = 'break-word'
      style.position = 'absolute'
      style.visibility = 'hidden'
      for (var i = 0; i < props.length; i++) {
        var p = props[i]
        style[p] = computed[p]
      }
      if (textarea.scrollHeight > parseInt(computed.height, 10)) style.overflowY = 'scroll'
      div.textContent = value.substring(0, position)
      var span = document.createElement('span')
      span.textContent = value.substring(position) || '.'
      div.appendChild(span)
      var left = span.offsetLeft + (parseInt(computed.borderLeftWidth, 10) || 0) - textarea.scrollLeft
      var top = span.offsetTop + (parseInt(computed.borderTopWidth, 10) || 0) - textarea.scrollTop
      document.body.removeChild(div)
      var rect = textarea.getBoundingClientRect()
      return { x: rect.left + left, y: rect.top + top }
    }

    var flameCanvas = null
    var flameCtx = null
    var flameParticles = []
    var flameRaf = null

    function flameReduced() {
      return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    function spawnFlame(x, y) {
      if (flameReduced() || kbConfig.flame === false) return
      if (!flameCtx) return
      var n = 16
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2
        var speed = 0.6 + Math.random() * 2.6
        flameParticles.push({
          x: x + (Math.random() - 0.5) * 3,
          y: y + (Math.random() - 0.5) * 2,
          vx: Math.cos(a) * speed * 0.5,
          vy: -Math.abs(Math.sin(a)) * speed - 1.2,
          life: 1,
          decay: 0.02 + Math.random() * 0.03,
          size: 2 + Math.random() * 4,
        })
      }
      if (flameParticles.length > 500) flameParticles.splice(0, flameParticles.length - 500)
      if (flameRaf === null) flameRaf = requestAnimationFrame(flameFrame)
    }

    function flameFrame() {
      flameRaf = null
      var c = flameCanvas
      if (!c || !flameCtx) { flameParticles = []; return }
      if (c.width !== window.innerWidth || c.height !== window.innerHeight) {
        c.width = window.innerWidth
        c.height = window.innerHeight
      }
      var ctx = flameCtx
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'lighter'
      for (var i = flameParticles.length - 1; i >= 0; i--) {
        var p = flameParticles[i]
        p.life -= p.decay
        if (p.life <= 0) { flameParticles.splice(i, 1); continue }
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.05
        p.vx *= 0.97
        var t = p.life
        ctx.fillStyle = 'hsla(' + (12 + 40 * t) + ', 100%, ' + (42 + 24 * t) + '%, ' + t + ')'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      if (flameParticles.length > 0) {
        flameRaf = requestAnimationFrame(flameFrame)
      }
    }

    function stopFlame() {
      if (flameRaf !== null) { cancelAnimationFrame(flameRaf); flameRaf = null }
      flameParticles = []
      flameCanvas = null
      flameCtx = null
    }

    var STYLE_TAG = 'dsh-keyboard/style.css'
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + STYLE_TAG + '"]') === null) {
      var tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-keyboard'
      tag.dataset.pluginCss = STYLE_TAG
      tag.textContent = [
        '.dsh-kb-root { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); transform-origin: 50% 100%; z-index: 40; pointer-events: none; opacity: 0.5; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); }',
        '.dsh-kb-wrap { display: flex; align-items: stretch; gap: 3px; }',
        '.dsh-kb { display: flex; flex-direction: column; gap: 5px; }',
        '.dsh-kb-side { display: flex; flex-direction: column; justify-content: space-between; align-items: center; }',
        '.dsh-kb-arrows { display: flex; flex-direction: column; gap: 5px; }',
        '.dsh-kb-row { display: flex; gap: 5px; }',
        '.dsh-kb-key { height: 30px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid rgba(0,0,0,0.2); background: rgba(255,255,255,0.25); color: rgba(0,0,0,0.45); font-size: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; box-shadow: 0 1px 0 rgba(0,0,0,0.08); transition: transform 50ms ease, box-shadow 50ms ease, background 120ms ease, color 120ms ease; }',
        '.dsh-kb-key.on { transform: translateY(2px); box-shadow: 0 0 0 rgba(0,0,0,0.5); background: rgba(88,150,255,0.18); color: rgba(0,0,0,0.6); border-color: rgba(0,0,0,0.3); }',
        '.dsh-mouse { position: relative; width: 58px; height: 90px; border-radius: 28px 28px 22px 22px; border: 1px solid rgba(0,0,0,0.2); background: rgba(255,255,255,0.25); box-shadow: 0 1px 4px rgba(0,0,0,0.2); }',
        '.dsh-mouse-btn { position: absolute; top: 0; width: 50%; height: 40px; border-bottom: 1px solid rgba(0,0,0,0.18); transition: background 80ms ease; }',
        '.dsh-mouse-btn.left { left: 0; border-radius: 28px 0 0 0; }',
        '.dsh-mouse-btn.right { right: 0; border-radius: 0 28px 0 0; }',
        '.dsh-mouse-btn.on { background: rgba(88,150,255,0.18); }',
        '.dsh-mouse-wheel { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 9px; height: 20px; border-radius: 5px; border: 1px solid rgba(0,0,0,0.2); background: rgba(150,150,150,0.55); transition: background 80ms ease, top 80ms ease; }',
        '.dsh-mouse-wheel.on { background: rgba(88,150,255,0.3); }',
        '.dsh-mouse-wheel.mid { top: 6px; }',
        '@media (max-width: 920px) { .dsh-kb-root { display: none; } }',
        '@media (prefers-reduced-motion: reduce) { .dsh-kb-root { transition: none; } }',
        'body[data-ds-dark-theme] .dsh-kb-key { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.72); box-shadow: 0 1px 0 rgba(0,0,0,0.35); }',
        'body[data-ds-dark-theme] .dsh-kb-key.on { background: rgba(88,150,255,0.3); color: rgba(255,255,255,0.95); border-color: rgba(120,170,255,0.5); }',
        'body[data-ds-dark-theme] .dsh-mouse { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.07); box-shadow: 0 1px 4px rgba(0,0,0,0.45); }',
        'body[data-ds-dark-theme] .dsh-mouse-btn { border-bottom-color: rgba(255,255,255,0.12); }',
        'body[data-ds-dark-theme] .dsh-mouse-btn.on { background: rgba(88,150,255,0.3); }',
        'body[data-ds-dark-theme] .dsh-mouse-wheel { border-color: rgba(255,255,255,0.18); background: rgba(200,200,200,0.42); }',
        'body[data-ds-dark-theme] .dsh-mouse-wheel.on { background: rgba(88,150,255,0.42); }',
        '.dsh-kb-settings { display: flex; flex-direction: column; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--dsw-alias-border-l2); }',
        '.dsh-kb-settings-title { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-primary); }',
        '.dsh-kb-settings-row { display: flex; align-items: center; gap: 12px; }',
        '.dsh-kb-settings-row label { font-size: 12px; color: var(--dsw-alias-label-secondary); min-width: 40px; }',
        '.dsh-kb-settings-row input[type=range] { flex: 1; accent-color: var(--dsw-alias-brand-primary); }',
        '.dsh-kb-settings-row input[type=checkbox] { accent-color: var(--dsw-alias-brand-primary); width: 15px; height: 15px; }',
        '.dsh-kb-settings-val { font-size: 12px; color: var(--dsw-alias-label-tertiary); min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; }',
        '.dsh-kb-flame { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 45; pointer-events: none; }',
      ].join('\n')
      document.head.appendChild(tag)
    }

    var ROWS = [
      [
        ['Escape','Esc',1], ['_spacer','',18], ['F1','F1',1], ['F2','F2',1], ['F3','F3',1], ['F4','F4',1],
        ['_spacer','',18], ['F5','F5',1], ['F6','F6',1], ['F7','F7',1], ['F8','F8',1],
        ['_spacer','',18], ['F9','F9',1], ['F10','F10',1], ['F11','F11',1], ['F12','F12',1]
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
        ['ControlLeft','Ctrl',1.5], ['MetaLeft','Cmd',1.3], ['AltLeft','Alt',1.3], ['Space','',6.7],
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
                return React.createElement('div', { key: '_spacer', style: { width: k[2] + 'px' } })
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
      var bottomState = React.useState(170)
      var bottom = bottomState[0]
      var setBottom = bottomState[1]
      var leftState = React.useState(null)
      var left = leftState[0]
      var setLeft = leftState[1]
      var cfgState = React.useState(kbConfig)
      var cfg = cfgState[0]
      var setCfg = cfgState[1]
      var flameRef = React.useRef(null)

      React.useEffect(function () {
        setCfg(kbConfig)
        return onKbConfig(setCfg)
      }, [])

      React.useEffect(function () {
        flameCanvas = flameRef.current
        flameCtx = flameCanvas ? flameCanvas.getContext('2d') : null
        function onInput(e) {
          var t = e.target
          if (!t || t.tagName !== 'TEXTAREA') return
          if (typeof t.closest !== 'function' || !t.closest('[data-composer-card]')) return
          var pos = computeCaretPosition(t)
          spawnFlame(pos.x, pos.y)
        }
        document.addEventListener('input', onInput)
        return function () {
          document.removeEventListener('input', onInput)
          stopFlame()
        }
      }, [])

      React.useEffect(function () {
        function clearPressed() {
          setPressed(function (prev) {
            var has = false
            for (var k in prev) { has = true; break }
            return has ? {} : prev
          })
        }
        function clearAll() {
          clearPressed()
          setMouse(function (prev) {
            if (!prev.left && !prev.right && !prev.middle && !prev.wheel) return prev
            return { left: false, right: false, middle: false, wheel: false }
          })
        }
        function reconcileModifiers(e) {
          if (typeof e.getModifierState !== 'function') return
          setPressed(function (prev) {
            var changed = false
            var next = null
            function drop(a, b) {
              if (prev[a] || prev[b]) {
                if (next === null) { next = {}; for (var k in prev) next[k] = prev[k] }
                delete next[a]; delete next[b]; changed = true
              }
            }
            if (!e.getModifierState('Shift')) drop('ShiftLeft', 'ShiftRight')
            if (!e.getModifierState('Alt')) drop('AltLeft', 'AltRight')
            if (!e.getModifierState('Control')) drop('ControlLeft', 'ControlRight')
            if (!e.getModifierState('Meta')) drop('MetaLeft', 'MetaRight')
            return changed ? next : prev
          })
        }
        function keyDown(e) {
          reconcileModifiers(e)
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
          reconcileModifiers(e)
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
        function onVisibility() {
          if (document.hidden) clearAll()
        }
        window.addEventListener('blur', clearAll)
        document.addEventListener('visibilitychange', onVisibility)
        return function () {
          window.removeEventListener('keydown', keyDown)
          window.removeEventListener('blur', clearAll)
          document.removeEventListener('visibilitychange', onVisibility)
          window.removeEventListener('keyup', keyUp)
          window.removeEventListener('mousedown', onMouse)
          window.removeEventListener('mouseup', onMouse)
          window.removeEventListener('mousemove', onMouse)
          window.removeEventListener('mouseleave', onMouseLeave)
          window.removeEventListener('wheel', onWheel)
          if (wheelTimer) window.clearTimeout(wheelTimer)
        }
      }, [])

      React.useEffect(function () {
        function measure() {
          var overlay = document.querySelector('[data-shell-overlay]')
          var frame = overlay ? overlay.parentElement : null
          if (frame) {
            var tpl = frame.style.gridTemplateColumns || getComputedStyle(frame).gridTemplateColumns
            var m1 = tpl.match(/^\s*([\d.]+)px/)
            var m2 = tpl.match(/([\d.]+)px\s*$/)
            var sidebarW = m1 ? parseFloat(m1[1]) : 0
            var detailsW = m2 ? parseFloat(m2[1]) : 0
            setLeft(Math.round(sidebarW + (window.innerWidth - sidebarW - detailsW) / 2))
          }
          var el = document.querySelector('[data-composer-card]') || document.querySelector('[data-composer-seat]')
          if (el) {
            var rect = el.getBoundingClientRect()
            setBottom(Math.round(window.innerHeight - rect.top + 10))
          }
        }
        measure()
        window.addEventListener('resize', measure)
        var obs = null
        var seat = document.querySelector('[data-composer-card]') || document.querySelector('[data-composer-seat]')
        if (seat && typeof ResizeObserver !== 'undefined') {
          obs = new ResizeObserver(measure)
          obs.observe(seat)
        }
        var mo = null
        var ov2 = document.querySelector('[data-shell-overlay]')
        var fr2 = ov2 ? ov2.parentElement : null
        if (fr2 && typeof MutationObserver !== 'undefined') {
          mo = new MutationObserver(measure)
          mo.observe(fr2, { attributes: true, attributeFilter: ['style', 'data-sidebar-collapsed', 'data-details-collapsed'] })
        }
        return function () {
          window.removeEventListener('resize', measure)
          if (obs) obs.disconnect()
          if (mo) mo.disconnect()
        }
      }, [])

      var rootStyle = { bottom: bottom + 'px' }
      if (left !== null) rootStyle.left = left + 'px'
      if (!cfg.enabled) rootStyle.display = 'none'
      rootStyle.opacity = cfg.opacity
      rootStyle.transform = 'translateX(-50%) scale(' + cfg.scale + ')'
      var keyboard = left !== null
        ? React.createElement('div', { className: 'dsh-kb-root', style: rootStyle },
            React.createElement('div', { className: 'dsh-kb-wrap' },
              React.createElement(KeyboardMain, { pressed: pressed }),
              React.createElement('div', { className: 'dsh-kb-side' },
                React.createElement(MouseView, { mouse: mouse }),
                React.createElement(ArrowView, { pressed: pressed }),
              ),
            ),
          )
        : null
      return React.createElement(React.Fragment, null,
        keyboard,
        React.createElement('canvas', { className: 'dsh-kb-flame', ref: flameRef, style: { pointerEvents: 'none' } }),
      )
    }

    function KeyboardSettingsRow() {
      var state = React.useState(kbConfig)
      var cfg = state[0]
      var setCfg = state[1]
      React.useEffect(function () {
        setCfg(kbConfig)
        return onKbConfig(setCfg)
      }, [])
      function update(patch) {
        var next = {}
        for (var k in kbConfig) next[k] = kbConfig[k]
        for (var k in patch) next[k] = patch[k]
        setKbConfig(next)
      }
      return React.createElement('div', { className: 'dsh-kb-settings' },
        React.createElement('div', { className: 'dsh-kb-settings-title' }, '键盘与鼠标'),
        React.createElement('div', { className: 'dsh-kb-settings-row' },
          React.createElement('label', null, '显示'),
          React.createElement('input', { type: 'checkbox', checked: cfg.enabled, onChange: function (e) { update({ enabled: e.target.checked }) } }),
        ),
        React.createElement('div', { className: 'dsh-kb-settings-row' },
          React.createElement('label', null, '火焰'),
          React.createElement('input', { type: 'checkbox', checked: cfg.flame, onChange: function (e) { update({ flame: e.target.checked }) } }),
        ),
        React.createElement('div', { className: 'dsh-kb-settings-row' },
          React.createElement('label', null, '透明度'),
          React.createElement('input', { type: 'range', min: '0.1', max: '1', step: '0.05', value: cfg.opacity, onChange: function (e) { update({ opacity: parseFloat(e.target.value) }) } }),
          React.createElement('span', { className: 'dsh-kb-settings-val' }, Math.round(cfg.opacity * 100) + '%'),
        ),
        React.createElement('div', { className: 'dsh-kb-settings-row' },
          React.createElement('label', null, '缩放'),
          React.createElement('input', { type: 'range', min: '0.6', max: '1.5', step: '0.05', value: cfg.scale, onChange: function (e) { update({ scale: parseFloat(e.target.value) }) } }),
          React.createElement('span', { className: 'dsh-kb-settings-val' }, Math.round(cfg.scale * 100) + '%'),
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
      ctx.slots.inject('settings.general.item', function () {
        return ctx.slots.register(
          { name: 'settings.general.item', id: 'keyboard', order: 15 },
          KeyboardSettingsRow,
        )
      })
    }

    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
