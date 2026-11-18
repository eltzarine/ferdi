/* Sauvegarde locale (aucun compte). Une seule porte d'accès pour pouvoir passer plus tard
   au stockage natif de Capacitor (@capacitor/preferences) sans toucher au reste de l'appli. */
import type { Sauvegarde } from '../types'

const CLE = 'ferdi.sauvegarde.v1'

export const SAUVEGARDE_VIDE: Sauvegarde = {
  nom: '',
  age: '9–12 ans',
  fait: {},
  certificats: [],
  visites: [],
  voix: true,
  sfx: true,
  histoireVue: false,
}

export function charger(): Sauvegarde {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return { ...SAUVEGARDE_VIDE }
    return { ...SAUVEGARDE_VIDE, ...JSON.parse(brut) }
  } catch {
    return { ...SAUVEGARDE_VIDE }
  }
}

export function enregistrer(s: Sauvegarde): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(s))
  } catch {
    /* stockage plein ou bloqué (navigation privée) : l'appli continue sans sauvegarde */
  }
}

export function effacer(): void {
  try {
    localStorage.removeItem(CLE)
  } catch {
    /* rien */
  }
}
