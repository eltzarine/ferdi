/* Contenu d'un lieu : un fichier public/sites/<lieu>/parcours.json par site. */

export type Question = { texte: string; choix: string[]; bonne: number; bravo: string; oups: string }

/** Question du niveau Lycée : choix multiple (comme Question) ou remise en ordre chronologique. */
export type QuestionOrdre = { t: 'ordre'; texte: string; elements: string[]; bravo: string; oups: string }
export type QuestionLycee = Question | QuestionOrdre

/** Version Lycée d'une étape : récit enrichi, document d'époque, questions plus exigeantes, énigme plus dure. */
export type EtapeLycee = {
  recit: string
  document: { image: string; titre: string; source: string }
  questions: QuestionLycee[]
  jeu?: Jeu
  indice?: string
}

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
  lycee?: EtapeLycee
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
  /** position GPS (WGS84) */
  lat: number
  lon: number
  vignette: string
  etat: 'jeu' | 'bientot'
  parcours?: string
}

export type Age = '5–8 ans' | '9–12 ans' | '13–16 ans' | 'Lycée'

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
  /** niveau Lycée : bonnes réponses du premier coup, par lieu puis par étape [bonnes, total] */
  scores?: Record<string, Record<number, [number, number]>>
}

export type Ecran =
  | 'splash' | 'histoire' | 'accueil' | 'profil' | 'carte' | 'lieu' | 'plan' | 'scan'
  | 'etape' | 'page' | 'jeu' | 'tampon' | 'fin' | 'certificat' | 'carnet' | 'parent'
