/* Ferdi — service worker (modèle ; dist/sw.js est généré par le plugin « ferdi-sw » de vite.config.ts).
   Même brique que Midheim et FGC 2026 : VERSION = empreinte du build, chaque publication est une nouvelle
   version, proposée par le bandeau « Nouvelle version disponible ».
   Différence avec Midheim : la mise à jour n'est pas obligatoire, elle s'applique entre deux étapes. */
"use strict";
const VERSION = "@@VERSION@@";
const SHELL = `ferdi-${VERSION}-shell`;
const RUNTIME = `ferdi-${VERSION}-runtime`;
/* Les parcours téléchargés au scan du QR d'entrée vivent dans des caches « ferdi-site-<lieu> »,
   gardés d'une version à l'autre (un enfant ne doit pas perdre son parcours hors ligne en pleine visite). */
const SITES = "ferdi-site-";
const PRECACHE = @@PRECACHE@@;

self.addEventListener("install", event => {
  event.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: "reload" })))));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const garder = new Set([SHELL, RUNTIME]);
    for (const k of await caches.keys()) if (!garder.has(k) && !k.startsWith(SITES)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

/* La page vient toujours de la version installée : la nouvelle n'arrive qu'en touchant « Mettre à jour »
   (ou automatiquement entre deux étapes). */
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  /* Vidéo : les lectures par morceaux (Range) passent par le réseau, Safari ne lit pas une réponse entière en cache. */
  if (req.headers.has("range")) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(caches.open(SHELL).then(c => c.match("index.html")).then(hit => hit || fetch(req)));
    return;
  }
  event.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const res = await fetch(req);
    /* Données des lieux (liste, parcours) : gardées pour la prochaine ouverture hors ligne. */
    if (res.ok && url.pathname.endsWith(".json")) {
      const c = await caches.open(RUNTIME);
      c.put(req, res.clone());
    }
    return res;
  })());
});
