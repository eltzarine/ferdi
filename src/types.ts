/* Contenu d'un lieu : un fichier public/sites/<lieu>/parcours.json par site. */

export type Question = { texte: string; choix: string[]; bonne: number; bravo: string; oups: string }

export type Jeu =
  | { t: 'mot'; titre: string; consigne: string; mot: string; donne: number[]; extra: string; aide?: string }
  | { t: 'code'; titre: string; consigne: string; code: string; aide?: string }
  | { t: 'photo'; titre: string; consigne: string }
  | { t: 'cherche'; titre: string; consigne: string; img: string; cibles: Record<string, [number, number]> }
  | { t: 'relie'; titre: string; consigne: string; paires: [string, string][]; intrus: string[] }
  | { t: 'puzzle'; titre: string; consigne: string; img: string }

export type Etape = {
  id: number
  nom: string
  date: string
  epoque: string
  image: string
  croquis: string
  recit: string
  questions: Question[]
  page: { texte: string; indice: string; lettre: string }
  jeu: Jeu
  defi: string
  suite: string
}

export type Parcours = {
  id: string
  nom: string
  ville: string
  motSecret: string
  phraseFinale: string
  premierIndice: string
  accueil: { image: string; titre: string; accroche: string; duree: string; ages: string }
  fiche: { image: string; bulle: string; ouverture: string }
  fin: { image: string; bulle: string }
  etapes: Etape[]
}

export type Lieu = {
  id: string
  nom: string
  court?: string
  x: number
  y: number
  vignette: string
  etat: 'jeu' | 'bientot'
  distance?: string
  parcours?: string
}

export type Age = '5–8 ans' | '9–12 ans' | '13–16 ans'

export type Sauvegarde = {
  nom: string
  age: Age
  /** nombre d'étapes réussies, par lieu */
  fait: Record<string, number>
  certificats: string[]
  visites: string[]
  voix: boolean
  sfx: boolean
  histoireVue: boolean
}

export type Ecran =
  | 'splash' | 'histoire' | 'accueil' | 'profil' | 'carte' | 'lieu' | 'plan' | 'scan'
  | 'etape' | 'page' | 'jeu' | 'tampon' | 'fin' | 'certificat' | 'carnet' | 'parent'
