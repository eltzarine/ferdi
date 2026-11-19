# Ferdi — chasseur d’Histoire

Jeu de piste pour les 5–18 ans dans les châteaux et musées, joué sur le téléphone des parents.
Ferdi reprend la quête de son arrière-grand-père Ferdinand, chercheur de trésor : dans chaque lieu, le carnet
de Papi cache des énigmes et des dessins qui mènent à un indice ; réunis, les indices mènent au trésor.
Premier lieu : le château de Gaillon (8 énigmes, dont les lettres forment l’indice du château).

**Jouer :** https://eltzarine.github.io/ferdi/

## Technique

- **React + TypeScript + Vite**, publiée en **PWA** (installable, hors ligne) sur GitHub Pages.
- **Capacitor** pour les versions mobiles : le même code devient une appli iOS et Android
  (`npx cap add ios`, `npx cap add android`, puis `npm run cap:sync`).
- Aucun compte : profil, énigmes résolues et certificats sont gardés sur le téléphone (`src/lib/stockage.ts`).

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

## Voix de Ferdi

Les textes à écouter (récits, questions, conseils de Papi, consignes, défis) sont joués depuis
`public/voix/` quand ils ont été enregistrés, sinon avec la voix du navigateur.

```sh
node tools/voix.mjs --compter                                   # textes et caractères (≈ crédits ElevenLabs)
ELEVENLABS_API_KEY=… FERDI_VOICE_ID=… node tools/voix.mjs        # enregistre les textes manquants
```

Un texte modifié est réenregistré au prochain passage, les autres ne coûtent rien.

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

- Photos des étapes (Wikimedia Commons) : Porte de Gaillon par Édouard Baldus (années 1850, domaine public),
  Porte de Gênes, orangerie et blason du pavillon Colbert, Maison Grise (CC BY-SA 3.0 / 4.0),
  fontaine de marbre restituée (CC BY-SA 4.0), plan du parc de Gaillon par Le Rouge (1750, domaine public).
- Images d'archives : Israël Silvestre, Jacques Androuet du Cerceau, Viollet-le-Duc, carte de Cassini,
  Art Institute of Chicago, Wikimedia Commons (licences dans le storyboard et le document du parcours).
- Mascotte : image générée (ElevenLabs), version ado depuis nov. 2026. Intro : 7 cartes illustrées (`src/ecrans/histoire.tsx`) ; voix « Ferdi » et « Ferdinand » à refaire avec ElevenLabs (voix du navigateur en attendant).
- Bruitages : synthétisés dans le navigateur.
- Photos de l'intro : Muriel Marc (grenier), Totorvdr59 (chantier du château, tour de la Sirène 2016),
  Jean-Eugène Durand (pavillon d'entrée) — CC BY-SA 4.0 ; Absinthologue (pavillon) — CC0 ;
  François-Étienne Villeret (portail, CC0) ; objets du grenier : Art Institute of Chicago (CC0).
- Polices : Bangers, Andika, Caveat (SIL Open Font License).
