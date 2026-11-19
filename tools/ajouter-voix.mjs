#!/usr/bin/env node
/* Range un MP3 déjà enregistré (ex. généré dans ElevenLabs) pour un texte précis du jeu :
   node tools/ajouter-voix.mjs fichier.mp3 "Texte exact affiché dans l'appli" */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
const [, , fichier, texte] = process.argv
if (!fichier || !texte) { console.error('Usage : node tools/ajouter-voix.mjs fichier.mp3 "texte"'); process.exit(1) }
let h = 0x811c9dc5
const t = texte.normalize('NFC').trim()
for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
const id = h.toString(16).padStart(8, '0')
mkdirSync('public/voix', { recursive: true })
copyFileSync(fichier, `public/voix/${id}.mp3`)
const f = 'public/voix/index.json'
const index = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {}
index[id] = id + '.mp3'
writeFileSync(f, JSON.stringify(index, null, 1) + '\n')
console.log('✓', id, t.slice(0, 60))
