#!/usr/bin/env node
/* Enregistre avec la voix de Ferdi (ElevenLabs) tous les textes à écouter du jeu.
   Usage :
     node tools/voix.mjs --compter                      → liste les textes et le nombre de caractères (≈ crédits)
     ELEVENLABS_API_KEY=… FERDI_VOICE_ID=… node tools/voix.mjs
   Les MP3 vont dans public/voix/<empreinte>.mp3 et public/voix/index.json ; un texte déjà enregistré
   n'est pas refait (relancer le script ne coûte que les textes nouveaux ou modifiés).
   L'appli joue ces fichiers et garde la voix du navigateur pour les textes qui manquent. */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DOSSIER = 'public/voix'
const MODELE = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2'

function empreinte(texte) {
  let h = 0x811c9dc5
  const t = texte.normalize('NFC').trim()
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/* Mêmes textes que ceux affichés avec un bouton « Écouter » (voir src/ecrans). */
function textes() {
  const t = new Set()
  for (const lieu of readdirSync('public/sites', { withFileTypes: true })) {
    if (!lieu.isDirectory()) continue
    const f = join('public/sites', lieu.name, 'parcours.json')
    if (!existsSync(f)) continue
    const p = JSON.parse(readFileSync(f, 'utf8'))
    t.add(p.fiche.bulle)
    t.add(p.fin.bulle)
    if (p.premierIndice) t.add('Indice : ' + p.premierIndice)
    for (const e of p.etapes) {
      t.add(e.recit)
      for (const q of e.questions) t.add(q.texte)
      t.add('Le conseil de Papi : ' + e.page.indice)
      t.add(e.jeu.consigne)
      t.add(e.defi)
      if (e.suite) t.add('Indice : ' + e.suite)
      if (e.lycee) {
        t.add(e.lycee.recit)
        for (const q of e.lycee.questions) t.add(q.texte)
        if (e.lycee.indice) t.add('Le conseil de Papi : ' + e.lycee.indice)
        if (e.lycee.jeu) t.add(e.lycee.jeu.consigne)
      }
    }
  }
  return [...t].filter(Boolean)
}

const tous = textes()
mkdirSync(DOSSIER, { recursive: true })
const indexF = join(DOSSIER, 'index.json')
const index = existsSync(indexF) ? JSON.parse(readFileSync(indexF, 'utf8')) : {}
const aFaire = tous.filter((x) => !index[empreinte(x)])
const car = (l) => l.reduce((n, x) => n + x.length, 0)
console.log(`${tous.length} textes (${car(tous)} caractères) · à enregistrer : ${aFaire.length} (${car(aFaire)} caractères ≈ crédits ElevenLabs)`)

if (process.argv.includes('--compter')) process.exit(0)
const cle = process.env.ELEVENLABS_API_KEY
const voix = process.env.FERDI_VOICE_ID
if (!cle || !voix) {
  console.error('Il faut ELEVENLABS_API_KEY et FERDI_VOICE_ID (identifiant de la voix de Ferdi).')
  process.exit(1)
}
for (const texte of aFaire) {
  const id = empreinte(texte)
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voix}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'xi-api-key': cle, 'content-type': 'application/json' },
    body: JSON.stringify({ text: texte, model_id: MODELE, language_code: 'fr', voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35 } }),
  })
  if (!r.ok) {
    console.error(`Arrêt : ${r.status} ${await r.text()}`)
    break
  }
  writeFileSync(join(DOSSIER, id + '.mp3'), Buffer.from(await r.arrayBuffer()))
  index[id] = id + '.mp3'
  writeFileSync(indexF, JSON.stringify(index, null, 1) + '\n')
  console.log('✓', id, texte.slice(0, 60))
}
