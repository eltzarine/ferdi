/* État de l'appli : sauvegarde, contenus des lieux, navigation entre écrans, messages. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Ecran, Lieu, Parcours, Sauvegarde } from './types'
import { charger, enregistrer, effacer, SAUVEGARDE_VIDE } from './lib/stockage'
import { activerSons } from './lib/sons'
import { arreter } from './lib/voix'
import { surAvantRecharge } from './pwa/miseAJour'

type Ctx = {
  s: Sauvegarde
  maj: (p: Partial<Sauvegarde>) => void
  reinitialiser: () => void
  lieux: Lieu[]
  parcours: Parcours | null
  fait: number
  reussirEtape: (i: number) => void
  ecran: Ecran
  aller: (e: Ecran) => void
  retour: () => void
  etapeCourante: number
  choisirEtape: (i: number) => void
  apresHistoire: Ecran
  setApresHistoire: (e: Ecran) => void
  toast: (t: string) => void
  messageToast: string | null
  feuille: ReactNode | null
  ouvrirFeuille: (n: ReactNode) => void
  fermerFeuille: () => void
}

const C = createContext<Ctx | null>(null)
export const useApp = () => {
  const c = useContext(C)
  if (!c) throw new Error('useApp hors du fournisseur')
  return c
}

export function FournisseurApp({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Sauvegarde>(charger)
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [parcours, setParcours] = useState<Parcours | null>(null)
  const [ecran, setEcran] = useState<Ecran>('splash')
  const pile = useRef<Ecran[]>([])
  const [etapeCourante, setEtape] = useState(0)
  const [apresHistoire, setApresHistoire] = useState<Ecran>('accueil')
  const [messageToast, setToast] = useState<string | null>(null)
  const [feuille, setFeuille] = useState<ReactNode | null>(null)
  const minuteur = useRef<number>(0)
  const sRef = useRef(s)
  sRef.current = s

  useEffect(() => {
    enregistrer(s)
    activerSons(s.sfx)
  }, [s])
  useEffect(() => surAvantRecharge(() => enregistrer(sRef.current)), [])

  useEffect(() => {
    fetch('sites/index.json')
      .then((r) => r.json())
      .then((d: { lieux: Lieu[] }) => {
        setLieux(d.lieux)
        const jeu = d.lieux.find((l) => l.etat === 'jeu' && l.parcours)
        if (jeu?.parcours) return fetch(jeu.parcours).then((r) => r.json()).then(setParcours)
      })
      .catch(() => setToast('Impossible de charger les lieux : vérifie ta connexion.'))
  }, [])

  const maj = useCallback((p: Partial<Sauvegarde>) => setS((o) => ({ ...o, ...p })), [])
  const fait = parcours ? s.fait[parcours.id] ?? 0 : 0

  const reussirEtape = useCallback(
    (i: number) => {
      if (!parcours) return
      setS((o) => {
        const n = Math.max(o.fait[parcours.id] ?? 0, i + 1)
        const certificats = n >= parcours.etapes.length && !o.certificats.includes(parcours.id) ? [...o.certificats, parcours.id] : o.certificats
        return { ...o, fait: { ...o.fait, [parcours.id]: n }, certificats }
      })
    },
    [parcours],
  )

  const aller = useCallback((e: Ecran) => {
    arreter()
    setFeuille(null)
    setEcran((cur) => {
      if (cur !== e) pile.current.push(cur)
      return e
    })
  }, [])
  const retour = useCallback(() => {
    arreter()
    setEcran(pile.current.pop() ?? 'accueil')
  }, [])

  const toast = useCallback((t: string) => {
    setToast(t)
    clearTimeout(minuteur.current)
    minuteur.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const reinitialiser = useCallback(() => {
    effacer()
    setS({ ...SAUVEGARDE_VIDE })
    pile.current = []
    setEcran('splash')
  }, [])

  const v = useMemo<Ctx>(
    () => ({
      s, maj, reinitialiser, lieux, parcours, fait, reussirEtape, ecran, aller, retour,
      etapeCourante, choisirEtape: setEtape, apresHistoire, setApresHistoire,
      toast, messageToast, feuille, ouvrirFeuille: setFeuille, fermerFeuille: () => setFeuille(null),
    }),
    [s, maj, reinitialiser, lieux, parcours, fait, reussirEtape, ecran, aller, retour, etapeCourante, apresHistoire, toast, messageToast, feuille],
  )
  return <C.Provider value={v}>{children}</C.Provider>
}

/** Télécharge tout le parcours d'un lieu pour jouer sans réseau (cache « ferdi-site-<lieu> »). */
export async function telechargerParcours(p: Parcours, progression: (fait: number, total: number) => void): Promise<boolean> {
  const urls = new Set<string>([p.accueil.image, p.fiche.image, p.fin.image, 'media/intro_poster.jpg'])
  p.etapes.forEach((e) => {
    urls.add(e.image)
    urls.add(e.croquis)
    if ('img' in e.jeu) urls.add(e.jeu.img)
  })
  const liste = [...urls]
  let n = 0
  const cache = 'caches' in window ? await caches.open('ferdi-site-' + p.id).catch(() => null) : null
  let ok = true
  for (const u of liste) {
    try {
      if (cache) {
        if (!(await cache.match(u))) await cache.add(u)
      } else await fetch(u)
    } catch {
      ok = false
    }
    progression(++n, liste.length)
  }
  return ok
}
