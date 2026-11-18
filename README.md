# Ferdi — reporter du passé

Jeu de piste pour les 5–16 ans dans les châteaux et musées, joué sur le téléphone des parents.
Ferdi part à la recherche des pages du carnet de son arrière-grand-père Ferdinand, tailleur de pierre.
Premier lieu : le château de Gaillon (8 étapes, mot secret à reconstituer).

**Jouer :** https://eltzarine.github.io/ferdi/

## Technique

- **React + TypeScript + Vite**, publiée en **PWA** (installable, hors ligne) sur GitHub Pages.
- **Capacitor** pour les versions mobiles : le même code devient une appli iOS et Android
  (`npx cap add ios`, `npx cap add android`, puis `npm run cap:sync`).
- Aucun compte : profil, pages du carnet et certificats sont gardés sur le téléphone (`src/lib/stockage.ts`).

## Ajouter un lieu

Tout le contenu d'un lieu tient dans un dossier, sans toucher au code :

| Fichier | Contenu |
| --- | --- |
| `public/sites/index.json` | Lieux de la carte (position, vignette, état « jeu » ou « bientôt ») |
| `public/sites/<lieu>/parcours.json` | Accueil, fiche, 8 étapes (récit, questions, page du carnet, énigme, défi, indice suivant), fin |
| `public/sites/<lieu>/img/` | Collages, croquis du carnet, images des énigmes |

Énigmes disponibles (`src/jeux/`) : `mot`, `code`, `photo`, `cherche`, `relie`, `puzzle`.
La difficulté s'adapte à l'âge (5–8, 9–12, 13–16 ans).

## Hors ligne

Au premier écran du lieu, l'appli télécharge tout le parcours (images, croquis) dans un cache
`ferdi-site-<lieu>`, conservé d'une version à l'autre : la visite marche sans réseau.

## Mises à jour

Même brique que Midheim et FGC 2026 (`src/pwa/miseAJour.ts`, `tools/sw.js`) : le service worker
porte l'empreinte du build, et chaque publication affiche le bandeau « Nouvelle version disponible ».
Ici la mise à jour n'est **pas obligatoire** : l'enfant finit son étape, et la nouvelle version
s'installe d'elle-même au retour sur le plan du parcours (ou tout de suite avec « Mettre à jour »).
La progression est sauvegardée avant le rechargement.

## Développer

```sh
npm install
npm run dev       # serveur de développement
npm test          # tests unitaires (règles des jeux, cohérence du parcours)
npm run e2e       # parcours complet des 8 étapes dans Chromium (Playwright)
npm run build     # dist/ + dist/sw.js
```

## Structure

| Dossier | Contenu |
| --- | --- |
| `src/ecrans/` | Écrans : splash, histoire, accueil, profil, carte, fiche, plan, scan, étape, page du carnet, énigme, tampon, fin, certificat, carnet, espace parent |
| `src/jeux/` | Mini-jeux |
| `src/ui/` | Composants BD communs (bouton, bulle à écouter, en-tête, navigation…) |
| `src/lib/` | Règles des jeux, sons synthétisés, voix, sauvegarde |
| `src/pwa/` | Service worker et bandeau de mise à jour |
| `src/styles/` | Design system BD (collage) |
| `tools/sw.js` | Modèle du service worker (versionné au build) |

## Crédits

- Images d'archives : Israël Silvestre, Jacques Androuet du Cerceau, Viollet-le-Duc, carte de Cassini,
  Art Institute of Chicago, Wikimedia Commons (licences dans le storyboard et le document du parcours).
- Mascotte : image générée (ElevenLabs). Voix de l'intro : ElevenLabs (voix « Ferdi » et « Ferdinand »).
- Musique et bruitages de l'intro : composés et synthétisés pour le projet.
- Photos de l'intro : Muriel Marc (grenier), Totorvdr59 (chantier du château, tour de la Sirène 2016),
  Jean-Eugène Durand (pavillon d'entrée) — CC BY-SA 4.0 ; Absinthologue (pavillon) — CC0 ;
  François-Étienne Villeret (portail, CC0) ; objets du grenier : Art Institute of Chicago (CC0).
- Polices : Bangers, Andika, Caveat (SIL Open Font License).
