/* Règles des jeux, sans interface : testées dans tests/regles.test.ts. */
import type { Age } from '../types'

/** Indices des lettres déjà posées : les 5–8 ans reçoivent en plus une lettre sur deux. */
export function lettresDonnees(mot: string, donne: number[], age: Age): Set<number> {
  const s = new Set(donne)
  if (age === '5–8 ans') for (let i = 0; i < mot.length; i += 2) s.add(i)
  return s
}

/** Touches du clavier : lettres manquantes + lettres pièges (plus nombreuses pour les 13–16 ans), mélangées. */
export function clavier(mot: string, donnees: Set<number>, extra: string, age: Age, hasard = Math.random): string[] {
  const manquantes = [...mot].filter((_, i) => !donnees.has(i))
  const pieges = [...extra, ...(age === '13–16 ans' ? ['B', 'K'] : [])]
  return melanger([...manquantes, ...pieges], hasard)
}

/** Reconstitue le mot à partir des lettres posées et de la saisie (dans l'ordre des cases vides). */
export function motSaisi(mot: string, donnees: Set<number>, saisie: string[]): string {
  let k = 0
  return [...mot].map((c, i) => (donnees.has(i) ? c : saisie[k++] ?? '')).join('')
}

export function melanger<T>(t: T[], hasard = Math.random): T[] {
  const r = [...t]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Ordre de départ du puzzle : mélangé, jamais déjà résolu. */
export function puzzleDepart(n: number, hasard = Math.random): number[] {
  const base = [...Array(n * n).keys()]
  let o = melanger(base, hasard)
  let essais = 0
  while (puzzleResolu(o) && essais++ < 20) o = melanger(base, hasard)
  if (puzzleResolu(o)) o = [...base.slice(1), base[0]]
  return o
}

export function puzzleResolu(ordre: number[]): boolean {
  return ordre.every((v, i) => v === i)
}

/** La touche (x, y en fraction de l'image) tombe-t-elle sur une cible ? */
export function cibleTouchee(
  x: number,
  y: number,
  cibles: Record<string, [number, number]>,
  restantes: Iterable<string>,
  ratio: number,
  rayon = 0.07,
): string | null {
  for (const k of restantes) {
    const [cx, cy] = cibles[k]
    if (Math.hypot(x - cx, (y - cy) * ratio) < rayon) return k
  }
  return null
}

/** Lettres gagnées du mot secret, avec un tiret bas pour celles qui manquent. */
export function motSecretPartiel(mot: string, fait: number): string[] {
  return [...mot].map((c, i) => (i < fait ? c : '_'))
}
