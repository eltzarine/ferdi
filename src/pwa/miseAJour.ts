/* ================= Appli installable + bandeau de mise à jour (même brique que Midheim et FGC 2026) =================
   Service worker versionné, bandeau « Nouvelle version disponible », vérifications au retour sur l'appli,
   toutes les 10 minutes et au retour du réseau.
   Ici la mise à jour n'est PAS obligatoire : l'enfant finit son étape, puis elle s'applique d'elle-même
   au retour sur le plan du parcours (entre deux étapes) ou quand on touche « Mettre à jour ».
   Inactive sans manifeste, hors HTTPS ou dans l'appli native (Capacitor livre ses mises à jour par les stores). */

type Etat = { disponible: boolean; enCours: boolean }
type Ecouteur = (e: Etat) => void

const etat: Etat = { disponible: false, enCours: false }
const ecouteurs = new Set<Ecouteur>()
let reg: ServiceWorkerRegistration | null = null
let enAttente: ServiceWorker | null = null
let derniere = 0
let rechargement = false
let avantRecharge: (() => void) | null = null

const publier = () => ecouteurs.forEach((f) => f({ ...etat }))

export function ecouter(f: Ecouteur): () => void {
  ecouteurs.add(f)
  f({ ...etat })
  return () => ecouteurs.delete(f)
}

/** Appelé juste avant le rechargement (sauvegarde de la progression). */
export function surAvantRecharge(f: () => void) {
  avantRecharge = f
}

function estNatif(): boolean {
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

export function demarrer() {
  const actif =
    !!document.querySelector('link[rel="manifest"]') && 'serviceWorker' in navigator && window.isSecureContext && !estNatif() && import.meta.env.PROD
  if (!actif) return
  navigator.serviceWorker
    .register('sw.js', { scope: './', updateViaCache: 'none' })
    .then((r) => {
      reg = r
      if (r.waiting && navigator.serviceWorker.controller) proposer(r.waiting)
      suivre(r.installing)
      r.addEventListener('updatefound', () => suivre(r.installing))
      derniere = Date.now()
      setInterval(() => verifier(), 10 * 60000)
    })
    .catch(() => {
      /* PWA indisponible : l'appli fonctionne quand même */
    })
  /* Retour sur l'appli (onglet réactivé, téléphone déverrouillé, réseau revenu) : vérification immédiate. */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') verifier()
  })
  addEventListener('online', () => verifier())
  addEventListener('pageshow', (e) => {
    if ((e as PageTransitionEvent).persisted) verifier()
  })
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (etat.enCours) recharger()
  })
}

function proposer(sw: ServiceWorker) {
  enAttente = sw
  if (!etat.disponible) {
    etat.disponible = true
    document.documentElement.classList.add('has-update')
    publier()
  }
}

/** Suit un service worker en cours d'installation jusqu'à ce qu'il attende son tour. */
function suivre(sw: ServiceWorker | null) {
  if (!sw) return
  const fini = () => {
    if (sw.state === 'installed' && navigator.serviceWorker.controller) proposer(sw)
  }
  fini()
  sw.addEventListener('statechange', fini)
}

/** Cherche une nouvelle version (au plus une fois par minute, sauf si on force). */
export function verifier(forcer = false): Promise<void> {
  if (!reg || !navigator.onLine || (!forcer && Date.now() - derniere < 60000)) return Promise.resolve()
  derniere = Date.now()
  return reg.update().then(
    () => undefined,
    () => undefined,
  )
}

function recharger() {
  if (rechargement) return
  rechargement = true
  location.reload()
}

/** « Mettre à jour » : on sauvegarde, puis la nouvelle version prend la main et la page se recharge. */
export function appliquer() {
  if (etat.enCours) return
  etat.enCours = true
  publier()
  avantRecharge?.()
  /* La nouvelle version a déjà pris la main (depuis un autre onglet) : simple rechargement. */
  if (!enAttente || enAttente.state !== 'installed') {
    recharger()
    return
  }
  enAttente.postMessage({ type: 'SKIP_WAITING' })
  setTimeout(recharger, 4000)
}

/** Entre deux étapes : si une version attend, on l'applique sans rien demander. */
export function entreDeuxEtapes() {
  if (etat.disponible && !etat.enCours) appliquer()
}
