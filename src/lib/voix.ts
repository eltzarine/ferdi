/* Lecture à voix haute des textes. Provisoire : voix du navigateur en attendant la voix de Ferdi
   (fichiers audio par texte, à brancher ici sans toucher aux écrans). */
let enCours: ((parle: boolean) => void) | null = null

export function arreter() {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  enCours?.(false)
  enCours = null
}

/** Lit le texte ; `etat` reçoit true pendant la lecture puis false. Renvoie false si la voix est indisponible. */
export function lire(texte: string, etat: (parle: boolean) => void): boolean {
  if (!('speechSynthesis' in window)) return false
  const memeBouton = enCours === etat
  arreter()
  if (memeBouton) return true
  const u = new SpeechSynthesisUtterance(texte)
  u.lang = 'fr-FR'
  u.rate = 1.02
  u.pitch = 1.35
  const v = speechSynthesis.getVoices().find((x) => /^fr/i.test(x.lang))
  if (v) u.voice = v
  u.onend = u.onerror = () => {
    etat(false)
    if (enCours === etat) enCours = null
  }
  enCours = etat
  etat(true)
  speechSynthesis.speak(u)
  return true
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) speechSynthesis.getVoices()
