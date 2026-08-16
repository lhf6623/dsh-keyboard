import { reducedMotion } from './motion'
import { getConfig } from './config'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  decay: number
  size: number
}

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let raf: number | null = null

export function initFlame(c: HTMLCanvasElement | null): void {
  canvas = c
  ctx = c ? c.getContext('2d') : null
}

export function spawnFlame(x: number, y: number): void {
  if (reducedMotion() || getConfig().flame === false) return
  if (!ctx) return
  const n = 16
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const speed = 0.6 + Math.random() * 2.6
    particles.push({
      x: x + (Math.random() - 0.5) * 3,
      y: y + (Math.random() - 0.5) * 2,
      vx: Math.cos(a) * speed * 0.5,
      vy: -Math.abs(Math.sin(a)) * speed - 1.2,
      life: 1,
      decay: 0.02 + Math.random() * 0.03,
      size: 2 + Math.random() * 4,
    })
  }
  if (particles.length > 500) particles.splice(0, particles.length - 500)
  if (raf === null) raf = requestAnimationFrame(frame)
}

function frame(): void {
  raf = null
  const c = canvas
  if (!c || !ctx) { particles = []; return }
  if (c.width !== window.innerWidth || c.height !== window.innerHeight) {
    c.width = window.innerWidth
    c.height = window.innerHeight
  }
  const g = ctx
  g.clearRect(0, 0, c.width, c.height)
  g.globalCompositeOperation = 'lighter'
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life -= p.decay
    if (p.life <= 0) { particles.splice(i, 1); continue }
    p.x += p.vx
    p.y += p.vy
    p.vy -= 0.05
    p.vx *= 0.97
    const t = p.life
    g.fillStyle = 'hsla(' + (12 + 40 * t) + ', 100%, ' + (42 + 24 * t) + '%, ' + t + ')'
    g.beginPath()
    g.arc(p.x, p.y, p.size * t, 0, Math.PI * 2)
    g.fill()
  }
  g.globalCompositeOperation = 'source-over'
  if (particles.length > 0) raf = requestAnimationFrame(frame)
}

export function stopFlame(): void {
  if (raf !== null) { cancelAnimationFrame(raf); raf = null }
  particles = []
  canvas = null
  ctx = null
}
