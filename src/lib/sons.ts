/* Bruitages du jeu, synthétisés dans le navigateur (aucun fichier audio). */
export type Son = 'tap' | 'go' | 'ok' | 'non' | 'stamp' | 'pop'

let ctx: AudioContext | null = null
let actif = true

export function activerSons(v: boolean) {
  actif = v
}

export function bip(son: Son) {
  if (!actif) return
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = ctx || new AC()
    const c = ctx
    const t = c.currentTime
    const ton = (f: number, d: number, st = 0, w: OscillatorType = 'sine', v = 0.15, f2?: number) => {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = w
      o.frequency.setValueAtTime(f, t + st)
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + st + d)
      g.gain.setValueAtTime(v, t + st)
      g.gain.exponentialRampToValueAtTime(0.001, t + st + d)
      o.connect(g).connect(c.destination)
      o.start(t + st)
      o.stop(t + st + d)
    }
    if (son === 'tap') ton(700, 0.07, 0, 'sine', 0.08, 500)
    if (son === 'go') { ton(523, 0.12); ton(784, 0.18, 0.09) }
    if (son === 'ok') [523, 659, 784, 1047].forEach((f, i) => ton(f, 0.25, i * 0.08, 'triangle', 0.14))
    if (son === 'non') { ton(220, 0.18, 0, 'square', 0.07, 160); ton(180, 0.25, 0.15, 'square', 0.07, 120) }
    if (son === 'stamp') ton(90, 0.25, 0, 'sine', 0.35, 50)
    if (son === 'pop') ton(900, 0.1, 0, 'sine', 0.12, 450)
  } catch {
    /* audio indisponible */
  }
}
