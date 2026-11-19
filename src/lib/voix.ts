/* Lecture à voix haute des textes.
   1. Si le texte a été enregistré avec la voix de Ferdi (fichiers MP3 générés par tools/voix.mjs,
      listés dans public/voix/index.json), on joue l'enregistrement.
   2. Sinon, voix du navigateur (en attendant que tous les textes soient enregistrés). */

let enCours: ((parle: boolean) => void) | null = null
let audio: HTMLAudioElement | null = null
let enregistrements: Record<string, string> = {}

/** Empreinte d'un texte (FNV-1a 32 bits), identique à celle de tools/voix.mjs. */
export function empreinte(texte: string): string {
  let h = 0x811c9dc5
  const t = texte.normalize('NFC').trim()
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

if (typeof window !== 'undefined') {
  fetch('voix/index.json')
    .then((r) => (r.ok ? r.json() : {}))
    .then((d: Record<string, string>) => { enregistrements = d })
    .catch(() => undefined)
  if ('speechSynthesis' in window) speechSynthesis.getVoices()
}

export function arreter() {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  if (audio) { audio.pause(); audio = null }
  enCours?.(false)
  enCours = null
}

function finir(etat: (parle: boolean) => void) {
  etat(false)
  if (enCours === etat) enCours = null
}

function voixNavigateur(texte: string, etat: (parle: boolean) => void): boolean {
  if (!('speechSynthesis' in window)) return false
  const u = new SpeechSynthesisUtterance(texte)
  u.lang = 'fr-FR'
  u.rate = 1.02
  u.pitch = 1.15
  const v = speechSynthesis.getVoices().find((x) => /^fr/i.test(x.lang))
  if (v) u.voice = v
  u.onend = u.onerror = () => finir(etat)
  enCours = etat
  etat(true)
  speechSynthesis.speak(u)
  return true
}

/** Lit le texte ; `etat` reçoit true pendant la lecture puis false. Toucher le même bouton arrête la lecture.
    Renvoie false si aucune voix n'est disponible. */
export function lire(texte: string, etat: (parle: boolean) => void): boolean {
  const memeBouton = enCours === etat
  arreter()
  if (memeBouton) return true
  const fichier = enregistrements[empreinte(texte)]
  if (fichier) {
    const a = new Audio('voix/' + fichier)
    audio = a
    enCours = etat
    etat(true)
    a.onended = () => finir(etat)
    a.onerror = () => { audio = null; if (enCours === etat) { enCours = null; voixNavigateur(texte, etat) || finir(etat) } }
    a.play().catch(() => { if (audio === a) a.onerror?.(new Event('error')) })
    return true
  }
  return voixNavigateur(texte, etat)
}
