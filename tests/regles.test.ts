import { describe, expect, it } from 'vitest'
import { cibleTouchee, clavier, lettresDonnees, motSaisi, motSecretPartiel, puzzleDepart, puzzleResolu } from '../src/lib/regles'
import parcours from '../public/sites/gaillon/parcours.json'

describe('mot caché', () => {
  it('donne une lettre sur deux en plus aux 5–8 ans', () => {
    expect([...lettresDonnees('ITALIE', [], '5–8 ans')].sort()).toEqual([0, 2, 4])
    expect(lettresDonnees('ITALIE', [], '9–12 ans').size).toBe(0)
  })
  it('met au clavier toutes les lettres manquantes, et plus de pièges pour les 13–16 ans', () => {
    const d = lettresDonnees('ESTOUTEVILLE', [0, 1, 2, 4, 5, 6, 8, 9, 10, 11], '9–12 ans')
    const k = clavier('ESTOUTEVILLE', d, 'AUNR', '9–12 ans')
    expect(k).toContain('O')
    expect(k).toContain('V')
    expect(k).toHaveLength(6)
    expect(clavier('ESTOUTEVILLE', d, 'AUNR', '13–16 ans')).toHaveLength(8)
  })
  it('reconstitue le mot avec les lettres posées', () => {
    const d = lettresDonnees('ESTOUTEVILLE', [0, 1, 2, 4, 5, 6, 8, 9, 10, 11], '9–12 ans')
    expect(motSaisi('ESTOUTEVILLE', d, ['O', 'V'])).toBe('ESTOUTEVILLE')
  })
})

describe('puzzle', () => {
  it('ne commence jamais résolu', () => {
    for (let i = 0; i < 50; i++) expect(puzzleResolu(puzzleDepart(2))).toBe(false)
  })
})

describe('cherche et trouve', () => {
  it('reconnaît une touche près de la cible', () => {
    const c = { bateau: [0.2, 0.72] as [number, number] }
    expect(cibleTouchee(0.21, 0.73, c, ['bateau'], 0.65)).toBe('bateau')
    expect(cibleTouchee(0.5, 0.5, c, ['bateau'], 0.65)).toBeNull()
  })
})

describe('parcours de Gaillon', () => {
  it('a 8 étapes dont les lettres forment le mot secret', () => {
    expect(parcours.etapes).toHaveLength(8)
    expect(parcours.etapes.map((e) => e.page.lettre).join('')).toBe(parcours.motSecret)
    expect(motSecretPartiel(parcours.motSecret, 3).join('')).toBe('SOU_____')
  })
  it('a des questions dont la bonne réponse existe', () => {
    for (const e of parcours.etapes) for (const q of e.questions) expect(q.choix[q.bonne]).toBeTruthy()
  })
  it('a des énigmes « mot » solubles avec leur clavier', () => {
    for (const e of parcours.etapes) {
      const j = e.jeu as { t: string; mot?: string; donne?: number[]; extra?: string }
      if (j.t !== 'mot') continue
      const d = lettresDonnees(j.mot!, j.donne!, '9–12 ans')
      const touches = clavier(j.mot!, d, j.extra!, '9–12 ans')
      const manquantes = [...j.mot!].filter((_, i) => !d.has(i))
      for (const l of manquantes) expect(touches).toContain(l)
    }
  })
})
