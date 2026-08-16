window.__ModuleLoader__.load({
  id: "dsh-vibe",
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);

// src/styles.css
var styles_default = ".dsh-kb-root { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); transform-origin: 50% 100%; z-index: 40; pointer-events: none; opacity: 0.5; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); }\n.dsh-kb-wrap { display: flex; align-items: stretch; gap: 3px; }\n.dsh-kb { display: flex; flex-direction: column; gap: 5px; }\n.dsh-kb-side { display: flex; flex-direction: column; justify-content: space-between; align-items: center; }\n.dsh-kb-arrows { display: flex; flex-direction: column; gap: 5px; }\n.dsh-kb-row { display: flex; gap: 5px; }\n.dsh-kb-key { height: 30px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid rgba(0,0,0,0.2); background: rgba(255,255,255,0.25); color: rgba(0,0,0,0.45); font-size: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; box-shadow: 0 1px 0 rgba(0,0,0,0.08); transition: transform 50ms ease, box-shadow 50ms ease, background 120ms ease, color 120ms ease; }\n.dsh-kb-key.on { transform: translateY(2px); box-shadow: 0 0 0 rgba(0,0,0,0.5); background: rgba(88,150,255,0.18); color: rgba(0,0,0,0.6); border-color: rgba(0,0,0,0.3); }\n.dsh-mouse { position: relative; width: 58px; height: 90px; border-radius: 28px 28px 22px 22px; border: 1px solid rgba(0,0,0,0.2); background: rgba(255,255,255,0.25); box-shadow: 0 1px 4px rgba(0,0,0,0.2); }\n.dsh-mouse-btn { position: absolute; top: 0; width: 50%; height: 40px; border-bottom: 1px solid rgba(0,0,0,0.18); transition: background 80ms ease; }\n.dsh-mouse-btn.left { left: 0; border-radius: 28px 0 0 0; }\n.dsh-mouse-btn.right { right: 0; border-radius: 0 28px 0 0; }\n.dsh-mouse-btn.on { background: rgba(88,150,255,0.18); }\n.dsh-mouse-wheel { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 9px; height: 20px; border-radius: 5px; border: 1px solid rgba(0,0,0,0.2); background: rgba(150,150,150,0.55); transition: background 80ms ease, top 80ms ease; }\n.dsh-mouse-wheel.on { background: rgba(88,150,255,0.3); }\n.dsh-mouse-wheel.mid { top: 6px; }\n@media (max-width: 920px) { .dsh-kb-root { display: none; } }\n@media (prefers-reduced-motion: reduce) { .dsh-kb-root { transition: none; } }\nbody[data-ds-dark-theme] .dsh-kb-key { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.72); box-shadow: 0 1px 0 rgba(0,0,0,0.35); }\nbody[data-ds-dark-theme] .dsh-kb-key.on { background: rgba(88,150,255,0.3); color: rgba(255,255,255,0.95); border-color: rgba(120,170,255,0.5); }\nbody[data-ds-dark-theme] .dsh-mouse { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.07); box-shadow: 0 1px 4px rgba(0,0,0,0.45); }\nbody[data-ds-dark-theme] .dsh-mouse-btn { border-bottom-color: rgba(255,255,255,0.12); }\nbody[data-ds-dark-theme] .dsh-mouse-btn.on { background: rgba(88,150,255,0.3); }\nbody[data-ds-dark-theme] .dsh-mouse-wheel { border-color: rgba(255,255,255,0.18); background: rgba(200,200,200,0.42); }\nbody[data-ds-dark-theme] .dsh-mouse-wheel.on { background: rgba(88,150,255,0.42); }\n.dsh-kb-settings { display: flex; flex-direction: column; gap: 14px; padding: 16px 0; }\n.dsh-kb-group { display: flex; flex-direction: column; gap: 10px; }\n.dsh-kb-group-title { font-size: 12px; font-weight: 500; color: var(--dsw-alias-label-secondary); }\n.dsh-kb-settings-row { display: flex; align-items: center; gap: 12px; }\n.dsh-kb-settings-row label { font-size: 12px; color: var(--dsw-alias-label-secondary); min-width: 64px; white-space: nowrap; }\n.dsh-kb-settings-row input[type=range] { flex: 1; accent-color: var(--dsw-alias-brand-primary); }\n.dsh-kb-settings-row input[type=checkbox] { accent-color: var(--dsw-alias-brand-primary); width: 15px; height: 15px; }\n.dsh-kb-settings-val { font-size: 12px; color: var(--dsw-alias-label-tertiary); min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; }\n.dsh-kb-seg { display: inline-flex; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; overflow: hidden; }\n.dsh-kb-seg-btn { border: none; background: transparent; color: var(--dsw-alias-label-secondary); padding: 3px 14px; font-size: 12px; cursor: pointer; }\n.dsh-kb-seg-btn.on { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n.dsh-kb-seg-btn + .dsh-kb-seg-btn { border-left: 1px solid var(--dsw-alias-border-l2); }\n.dsh-kb-flame { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 45; pointer-events: none; }\n";

// src/components/Overlay.tsx
var React2 = __toESM(require("react"), 1);

// src/config.ts
var KEY = "dsh-vibe.config";
var LEGACY_KEY = "dsh-keyboard.config";
var DEFAULTS = { enabled: true, flame: true, shake: "off", sound: true, opacity: 0.5, scale: 1 };
function clamp(v, min, max, def) {
  const n = typeof v === "number" && !Number.isNaN(v) ? v : def;
  return Math.min(max, Math.max(min, n));
}
function normalizeConfig(c) {
  const o = c ?? {};
  const shake = o.shake === "light" || o.shake === "medium" ? o.shake : "off";
  return {
    enabled: o.enabled !== false,
    flame: o.flame !== false,
    shake,
    sound: o.sound !== false,
    opacity: clamp(o.opacity, 0.1, 1, 0.5),
    scale: clamp(o.scale, 0.6, 1.5, 1)
  };
}
function loadConfig() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      let raw = window.localStorage.getItem(KEY);
      if (!raw) raw = window.localStorage.getItem(LEGACY_KEY);
      if (raw) {
        const cfg = normalizeConfig(JSON.parse(raw));
        try {
          window.localStorage.setItem(KEY, JSON.stringify(cfg));
        } catch {
        }
        return cfg;
      }
    }
  } catch {
  }
  return { ...DEFAULTS };
}
var config = loadConfig();
var listeners = /* @__PURE__ */ new Set();
function getConfig() {
  return config;
}
function setConfig(patch) {
  config = normalizeConfig({ ...config, ...patch });
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(KEY, JSON.stringify(config));
    }
  } catch {
  }
  for (const fn of listeners) fn(config);
}
function subscribeConfig(fn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// src/caret.ts
var PROPS = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize"
];
function computeCaretPosition(textarea) {
  const position = textarea.selectionEnd || 0;
  const value = textarea.value || "";
  const div = document.createElement("div");
  document.body.appendChild(div);
  const style = div.style;
  const computed = getComputedStyle(textarea);
  style.whiteSpace = "pre-wrap";
  style.wordWrap = "break-word";
  style.position = "absolute";
  style.visibility = "hidden";
  for (const p of PROPS) {
    ;
    style[p] = computed[p];
  }
  if (textarea.scrollHeight > parseInt(computed.height, 10)) style.overflowY = "scroll";
  div.textContent = value.substring(0, position);
  const span = document.createElement("span");
  span.textContent = value.substring(position) || ".";
  div.appendChild(span);
  const left = span.offsetLeft + (parseInt(computed.borderLeftWidth, 10) || 0) - textarea.scrollLeft;
  const top = span.offsetTop + (parseInt(computed.borderTopWidth, 10) || 0) - textarea.scrollTop;
  document.body.removeChild(div);
  const rect = textarea.getBoundingClientRect();
  return { x: rect.left + left, y: rect.top + top };
}

// src/motion.ts
function reducedMotion() {
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// src/flame.ts
var canvas = null;
var ctx = null;
var particles = [];
var raf = null;
function initFlame(c) {
  canvas = c;
  ctx = c ? c.getContext("2d") : null;
}
function spawnFlame(x, y) {
  if (reducedMotion() || getConfig().flame === false) return;
  if (!ctx) return;
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = 0.6 + Math.random() * 2.6;
    particles.push({
      x: x + (Math.random() - 0.5) * 3,
      y: y + (Math.random() - 0.5) * 2,
      vx: Math.cos(a) * speed * 0.5,
      vy: -Math.abs(Math.sin(a)) * speed - 1.2,
      life: 1,
      decay: 0.02 + Math.random() * 0.03,
      size: 2 + Math.random() * 4
    });
  }
  if (particles.length > 500) particles.splice(0, particles.length - 500);
  if (raf === null) raf = requestAnimationFrame(frame);
}
function frame() {
  raf = null;
  const c = canvas;
  if (!c || !ctx) {
    particles = [];
    return;
  }
  if (c.width !== window.innerWidth || c.height !== window.innerHeight) {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
  const g = ctx;
  g.clearRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = "lighter";
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= p.decay;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vy -= 0.05;
    p.vx *= 0.97;
    const t = p.life;
    g.fillStyle = "hsla(" + (12 + 40 * t) + ", 100%, " + (42 + 24 * t) + "%, " + t + ")";
    g.beginPath();
    g.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
    g.fill();
  }
  g.globalCompositeOperation = "source-over";
  if (particles.length > 0) raf = requestAnimationFrame(frame);
}
function stopFlame() {
  if (raf !== null) {
    cancelAnimationFrame(raf);
    raf = null;
  }
  particles = [];
  canvas = null;
  ctx = null;
}

// src/audio.ts
var audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function primeAudio() {
  try {
    ensureAudio();
  } catch {
  }
}
function playAnswerSound() {
  if (getConfig().sound === false) return;
  let ctx2 = null;
  try {
    ctx2 = ensureAudio();
  } catch {
  }
  if (!ctx2) return;
  try {
    const now = ctx2.currentTime;
    const osc = ctx2.createOscillator();
    const gain = ctx2.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);
    gain.gain.setValueAtTime(1e-4, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(1e-4, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx2.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  } catch {
  }
}

// src/shake.ts
var shakeAnim = null;
var answerShakeAnim = null;
function keyframes(amp) {
  return [
    { transform: "translateX(0)" },
    { transform: "translateX(" + amp + "px)" },
    { transform: "translateX(" + -amp + "px)" },
    { transform: "translateX(" + amp * 0.6 + "px)" },
    { transform: "translateX(" + -amp * 0.4 + "px)" },
    { transform: "translateX(0)" }
  ];
}
function triggerShake(card) {
  const level = getConfig().shake;
  if (level === "off" || reducedMotion()) return;
  if (!card || typeof card.animate !== "function") return;
  const amp = level === "medium" ? 2 : 1;
  const dur = level === "medium" ? 180 : 120;
  if (shakeAnim) shakeAnim.cancel();
  shakeAnim = card.animate(keyframes(amp), { duration: dur, easing: "ease-out" });
}
function shakePage() {
  const level = getConfig().shake;
  if (level === "off" || reducedMotion()) return;
  const target = document.body;
  if (!target || typeof target.animate !== "function") return;
  const amp = level === "medium" ? 3 : 2;
  const dur = level === "medium" ? 220 : 160;
  if (answerShakeAnim) answerShakeAnim.cancel();
  answerShakeAnim = target.animate(keyframes(amp), { duration: dur, easing: "ease-out" });
}
function stopShake() {
  if (shakeAnim) {
    shakeAnim.cancel();
    shakeAnim = null;
  }
  if (answerShakeAnim) {
    answerShakeAnim.cancel();
    answerShakeAnim = null;
  }
}

// src/components/Keyboard.tsx
var React = __toESM(require("react"), 1);

// src/layout.ts
var ROWS = [
  [
    ["Escape", "Esc", 1],
    ["_spacer", "", 18],
    ["F1", "F1", 1],
    ["F2", "F2", 1],
    ["F3", "F3", 1],
    ["F4", "F4", 1],
    ["_spacer", "", 18],
    ["F5", "F5", 1],
    ["F6", "F6", 1],
    ["F7", "F7", 1],
    ["F8", "F8", 1],
    ["_spacer", "", 18],
    ["F9", "F9", 1],
    ["F10", "F10", 1],
    ["F11", "F11", 1],
    ["F12", "F12", 1]
  ],
  [
    ["Backquote", "~", 1],
    ["Digit1", "1", 1],
    ["Digit2", "2", 1],
    ["Digit3", "3", 1],
    ["Digit4", "4", 1],
    ["Digit5", "5", 1],
    ["Digit6", "6", 1],
    ["Digit7", "7", 1],
    ["Digit8", "8", 1],
    ["Digit9", "9", 1],
    ["Digit0", "0", 1],
    ["Minus", "-", 1],
    ["Equal", "=", 1],
    ["Backspace", "Del", 2]
  ],
  [
    ["Tab", "Tab", 1.5],
    ["KeyQ", "Q", 1],
    ["KeyW", "W", 1],
    ["KeyE", "E", 1],
    ["KeyR", "R", 1],
    ["KeyT", "T", 1],
    ["KeyY", "Y", 1],
    ["KeyU", "U", 1],
    ["KeyI", "I", 1],
    ["KeyO", "O", 1],
    ["KeyP", "P", 1],
    ["BracketLeft", "[", 1],
    ["BracketRight", "]", 1],
    ["Backslash", "\\", 1.5]
  ],
  [
    ["CapsLock", "Caps", 1.8],
    ["KeyA", "A", 1],
    ["KeyS", "S", 1],
    ["KeyD", "D", 1],
    ["KeyF", "F", 1],
    ["KeyG", "G", 1],
    ["KeyH", "H", 1],
    ["KeyJ", "J", 1],
    ["KeyK", "K", 1],
    ["KeyL", "L", 1],
    ["Semicolon", ";", 1],
    ["Quote", "'", 1],
    ["Enter", "Enter", 2.2]
  ],
  [
    ["ShiftLeft", "Shift", 2.3],
    ["KeyZ", "Z", 1],
    ["KeyX", "X", 1],
    ["KeyC", "C", 1],
    ["KeyV", "V", 1],
    ["KeyB", "B", 1],
    ["KeyN", "N", 1],
    ["KeyM", "M", 1],
    ["Comma", ",", 1],
    ["Period", ".", 1],
    ["Slash", "/", 1],
    ["ShiftRight", "Shift", 2.7]
  ],
  [
    ["ControlLeft", "Ctrl", 1.5],
    ["MetaLeft", "Cmd", 1.3],
    ["AltLeft", "Alt", 1.3],
    ["Space", "", 6.7],
    ["AltRight", "Alt", 1.3],
    ["MetaRight", "Cmd", 1.3],
    ["ControlRight", "Ctrl", 1.5]
  ]
];

// src/components/Keyboard.tsx
function Key(props) {
  const cls = "dsh-kb-key" + (props.on ? " on" : "");
  return /* @__PURE__ */ React.createElement("div", { className: cls, style: { width: Math.round(props.w * 30 + (props.w - 1) * 5) + "px" } }, props.label);
}
function KeyboardMain(props) {
  return /* @__PURE__ */ React.createElement("div", { className: "dsh-kb" }, ROWS.map((row) => /* @__PURE__ */ React.createElement("div", { className: "dsh-kb-row", key: row[0][0] }, row.map((k, i) => {
    if (k[0] === "_spacer") return /* @__PURE__ */ React.createElement("div", { key: "spacer-" + i, style: { width: k[2] + "px" } });
    return /* @__PURE__ */ React.createElement(Key, { key: k[0], label: k[1], w: k[2], on: !!props.pressed[k[0]] });
  }))));
}
function ArrowView(props) {
  return /* @__PURE__ */ React.createElement("div", { className: "dsh-kb-arrows" }, /* @__PURE__ */ React.createElement("div", { className: "dsh-kb-row" }, /* @__PURE__ */ React.createElement("div", { style: { width: "30px" } }), /* @__PURE__ */ React.createElement(Key, { label: "\u2191", w: 1, on: !!props.pressed["ArrowUp"] }), /* @__PURE__ */ React.createElement("div", { style: { width: "30px" } })), /* @__PURE__ */ React.createElement("div", { className: "dsh-kb-row" }, /* @__PURE__ */ React.createElement(Key, { label: "\u2190", w: 1, on: !!props.pressed["ArrowLeft"] }), /* @__PURE__ */ React.createElement(Key, { label: "\u2193", w: 1, on: !!props.pressed["ArrowDown"] }), /* @__PURE__ */ React.createElement(Key, { label: "\u2192", w: 1, on: !!props.pressed["ArrowRight"] })));
}
function MouseView(props) {
  const m = props.mouse;
  const wheelCls = "dsh-mouse-wheel" + (m.middle ? " mid" : "") + (m.wheel ? " on" : "");
  return /* @__PURE__ */ React.createElement("div", { className: "dsh-mouse" }, /* @__PURE__ */ React.createElement("div", { className: "dsh-mouse-btn left" + (m.left ? " on" : "") }), /* @__PURE__ */ React.createElement("div", { className: "dsh-mouse-btn right" + (m.right ? " on" : "") }), /* @__PURE__ */ React.createElement("div", { className: wheelCls }));
}

// src/components/Overlay.tsx
function Overlay() {
  const [pressed, setPressed] = React2.useState({});
  const [mouse, setMouse] = React2.useState({ left: false, right: false, middle: false, wheel: false });
  const [bottom, setBottom] = React2.useState(170);
  const [left, setLeft] = React2.useState(null);
  const [cfg, setCfg] = React2.useState(getConfig());
  const flameRef = React2.useRef(null);
  React2.useEffect(() => {
    setCfg(getConfig());
    return subscribeConfig(setCfg);
  }, []);
  React2.useEffect(() => {
    initFlame(flameRef.current);
    function onInput(e) {
      const t = e.target;
      if (!t || t.tagName !== "TEXTAREA") return;
      if (typeof t.closest !== "function" || !t.closest("[data-composer-card]")) return;
      const card = t.closest("[data-composer-card]");
      const pos = computeCaretPosition(t);
      spawnFlame(pos.x, pos.y);
      triggerShake(card);
    }
    document.addEventListener("input", onInput);
    return () => {
      document.removeEventListener("input", onInput);
      stopFlame();
      stopShake();
    };
  }, []);
  React2.useEffect(() => {
    function clearPressed() {
      setPressed((prev) => Object.keys(prev).length ? {} : prev);
    }
    function clearAll() {
      clearPressed();
      setMouse((prev) => !prev.left && !prev.right && !prev.middle && !prev.wheel ? prev : { left: false, right: false, middle: false, wheel: false });
    }
    function reconcileModifiers(e) {
      if (typeof e.getModifierState !== "function") return;
      setPressed((prev) => {
        let changed = false;
        let next = null;
        const drop = (a, b) => {
          if (prev[a] || prev[b]) {
            if (next === null) next = { ...prev };
            delete next[a];
            delete next[b];
            changed = true;
          }
        };
        if (!e.getModifierState("Shift")) drop("ShiftLeft", "ShiftRight");
        if (!e.getModifierState("Alt")) drop("AltLeft", "AltRight");
        if (!e.getModifierState("Control")) drop("ControlLeft", "ControlRight");
        if (!e.getModifierState("Meta")) drop("MetaLeft", "MetaRight");
        return changed ? next : prev;
      });
    }
    function keyDown(e) {
      primeAudio();
      reconcileModifiers(e);
      if (e.repeat) return;
      setPressed((prev) => {
        if (prev[e.code]) return prev;
        const next = { ...prev };
        next[e.code] = true;
        return next;
      });
    }
    function keyUp(e) {
      setPressed((prev) => {
        if (!prev[e.code]) return prev;
        const next = { ...prev };
        delete next[e.code];
        return next;
      });
      reconcileModifiers(e);
    }
    function applyButtons(buttons) {
      setMouse((prev) => {
        const n = { left: !!(buttons & 1), right: !!(buttons & 2), middle: !!(buttons & 4), wheel: prev.wheel };
        if (n.left === prev.left && n.right === prev.right && n.middle === prev.middle) return prev;
        return n;
      });
    }
    function onMouse(e) {
      primeAudio();
      applyButtons(e.buttons || 0);
    }
    function onMouseLeave() {
      setMouse((prev) => !prev.left && !prev.right && !prev.middle ? prev : { left: false, right: false, middle: false, wheel: prev.wheel });
    }
    let wheelTimer = null;
    function onWheel() {
      setMouse((prev) => ({ left: prev.left, right: prev.right, middle: prev.middle, wheel: true }));
      if (wheelTimer) window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        setMouse((prev) => prev.wheel ? { left: prev.left, right: prev.right, middle: prev.middle, wheel: false } : prev);
      }, 180);
    }
    function onVisibility() {
      if (document.hidden) clearAll();
    }
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("mousedown", onMouse);
    window.addEventListener("mouseup", onMouse);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("wheel", onWheel);
    window.addEventListener("blur", clearAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("mousedown", onMouse);
      window.removeEventListener("mouseup", onMouse);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("blur", clearAll);
      document.removeEventListener("visibilitychange", onVisibility);
      if (wheelTimer) window.clearTimeout(wheelTimer);
    };
  }, []);
  React2.useEffect(() => {
    function measure() {
      const overlay = document.querySelector("[data-shell-overlay]");
      const frame2 = overlay ? overlay.parentElement : null;
      if (frame2) {
        const tpl = frame2.style.gridTemplateColumns || getComputedStyle(frame2).gridTemplateColumns;
        const m1 = tpl.match(/^s*([d.]+)px/);
        const m2 = tpl.match(/([d.]+)pxs*$/);
        const sidebarW = m1 ? parseFloat(m1[1]) : 0;
        const detailsW = m2 ? parseFloat(m2[1]) : 0;
        setLeft(Math.round(sidebarW + (window.innerWidth - sidebarW - detailsW) / 2));
      }
      const el = document.querySelector("[data-composer-card]") || document.querySelector("[data-composer-seat]");
      if (el) {
        const rect = el.getBoundingClientRect();
        setBottom(Math.round(window.innerHeight - rect.top + 10));
      }
    }
    measure();
    window.addEventListener("resize", measure);
    let obs = null;
    const seat = document.querySelector("[data-composer-card]") || document.querySelector("[data-composer-seat]");
    if (seat && typeof ResizeObserver !== "undefined") {
      obs = new ResizeObserver(measure);
      obs.observe(seat);
    }
    let mo = null;
    const ov = document.querySelector("[data-shell-overlay]");
    const fr = ov ? ov.parentElement : null;
    if (fr && typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(measure);
      mo.observe(fr, { attributes: true, attributeFilter: ["style", "data-sidebar-collapsed", "data-details-collapsed"] });
    }
    return () => {
      window.removeEventListener("resize", measure);
      if (obs) obs.disconnect();
      if (mo) mo.disconnect();
    };
  }, []);
  const rootStyle = { bottom: bottom + "px" };
  if (left !== null) rootStyle.left = left + "px";
  if (!cfg.enabled) rootStyle.display = "none";
  rootStyle.opacity = cfg.opacity;
  rootStyle.transform = "translateX(-50%) scale(" + cfg.scale + ")";
  const keyboard = left !== null ? /* @__PURE__ */ React2.createElement("div", { className: "dsh-kb-root", style: rootStyle }, /* @__PURE__ */ React2.createElement("div", { className: "dsh-kb-wrap" }, /* @__PURE__ */ React2.createElement(KeyboardMain, { pressed }), /* @__PURE__ */ React2.createElement("div", { className: "dsh-kb-side" }, /* @__PURE__ */ React2.createElement(MouseView, { mouse }), /* @__PURE__ */ React2.createElement(ArrowView, { pressed })))) : null;
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, keyboard, /* @__PURE__ */ React2.createElement("canvas", { className: "dsh-kb-flame", ref: flameRef, style: { pointerEvents: "none" } }));
}

// src/components/Settings.tsx
var React3 = __toESM(require("react"), 1);
var SHAKE_LABELS = { off: "\u5173", light: "\u8F7B", medium: "\u4E2D" };
function VibeSection() {
  const [cfg, setCfg] = React3.useState(getConfig());
  React3.useEffect(() => {
    setCfg(getConfig());
    return subscribeConfig(setCfg);
  }, []);
  const update = (patch) => setConfig(patch);
  return /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-settings" }, /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-group" }, /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-group-title" }, "\u952E\u76D8\u5916\u89C2"), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-settings-row" }, /* @__PURE__ */ React3.createElement("label", null, "\u663E\u793A\u952E\u76D8"), /* @__PURE__ */ React3.createElement("input", { type: "checkbox", checked: cfg.enabled, onChange: (e) => update({ enabled: e.target.checked }) })), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-settings-row" }, /* @__PURE__ */ React3.createElement("label", null, "\u952E\u76D8\u900F\u660E\u5EA6"), /* @__PURE__ */ React3.createElement("input", { type: "range", min: "0.1", max: "1", step: "0.05", value: cfg.opacity, onChange: (e) => update({ opacity: parseFloat(e.target.value) }) }), /* @__PURE__ */ React3.createElement("span", { className: "dsh-kb-settings-val" }, Math.round(cfg.opacity * 100), "%")), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-settings-row" }, /* @__PURE__ */ React3.createElement("label", null, "\u952E\u76D8\u7F29\u653E"), /* @__PURE__ */ React3.createElement("input", { type: "range", min: "0.6", max: "1.5", step: "0.05", value: cfg.scale, onChange: (e) => update({ scale: parseFloat(e.target.value) }) }), /* @__PURE__ */ React3.createElement("span", { className: "dsh-kb-settings-val" }, Math.round(cfg.scale * 100), "%"))), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-group" }, /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-group-title" }, "\u6253\u5B57\u53CD\u9988"), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-settings-row" }, /* @__PURE__ */ React3.createElement("label", null, "\u6253\u5B57\u706B\u7130"), /* @__PURE__ */ React3.createElement("input", { type: "checkbox", checked: cfg.flame, onChange: (e) => update({ flame: e.target.checked }) })), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-settings-row" }, /* @__PURE__ */ React3.createElement("label", null, "\u8F93\u5165\u6296\u52A8"), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-seg" }, Object.keys(SHAKE_LABELS).map((level) => /* @__PURE__ */ React3.createElement("button", { key: level, type: "button", className: "dsh-kb-seg-btn" + (cfg.shake === level ? " on" : ""), onClick: () => update({ shake: level }) }, SHAKE_LABELS[level]))))), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-group" }, /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-group-title" }, "\u56DE\u7B54\u53CD\u9988"), /* @__PURE__ */ React3.createElement("div", { className: "dsh-kb-settings-row" }, /* @__PURE__ */ React3.createElement("label", null, "\u56DE\u7B54\u63D0\u793A\u97F3"), /* @__PURE__ */ React3.createElement("input", { type: "checkbox", checked: cfg.sound, onChange: (e) => update({ sound: e.target.checked }) }))));
}

// src/client.tsx
var STYLE_TAG = "dsh-vibe/style.css";
if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + STYLE_TAG + '"]') === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-vibe";
  tag.dataset.pluginCss = STYLE_TAG;
  tag.textContent = styles_default;
  document.head.appendChild(tag);
}
var inject = ["slots"];
function apply(ctx2) {
  ctx2.slots.inject("shell.overlay", () => ctx2.slots.register(
    { name: "shell.overlay", id: "dsh-vibe" },
    Overlay
  ));
  ctx2.slots.inject("settings.section", () => ctx2.slots.register(
    { name: "settings.section", id: "vibe", order: 5, label: () => "\u6C1B\u56F4" },
    VibeSection
  ));
  if (typeof EventSource !== "undefined") {
    ctx2.effect(() => {
      const es = new EventSource("/api/vibe-events");
      es.onmessage = (e) => {
        let data = null;
        try {
          data = JSON.parse(e.data);
        } catch {
        }
        if (data && data.type === "answer-done") {
          playAnswerSound();
          shakePage();
        }
      };
      return () => {
        es.close();
      };
    });
  }
}

    return module.exports
  },
})
