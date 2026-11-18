import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/* Génère dist/sw.js à partir de tools/sw.js : VERSION = empreinte de tous les fichiers publiés,
   PRECACHE = coquille de l'appli (pages, scripts, styles, polices, images de Ferdi, icônes, liste des lieux).
   Les parcours (images, vidéo) sont téléchargés par l'appli elle-même au scan du QR d'entrée. */
function serviceWorker(): Plugin {
  return {
    name: 'ferdi-sw',
    apply: 'build',
    closeBundle() {
      const dist = 'dist'
      const fichiers: string[] = []
      const parcourir = (d: string) => {
        for (const f of readdirSync(d)) {
          const p = join(d, f)
          if (statSync(p).isDirectory()) parcourir(p)
          else fichiers.push(relative(dist, p).split('\\').join('/'))
        }
      }
      parcourir(dist)
      const h = createHash('sha256')
      for (const f of fichiers.sort()) if (f !== 'sw.js') h.update(f).update(readFileSync(join(dist, f)))
      const version = h.digest('hex').slice(0, 12)
      const precache = ['./', ...fichiers.filter((f) => f !== 'sw.js' && !f.startsWith('sites/gaillon/') && !f.startsWith('media/'))]
      const sw = readFileSync('tools/sw.js', 'utf8').replace('@@VERSION@@', version).replace('@@PRECACHE@@', JSON.stringify(precache))
      writeFileSync(join(dist, 'sw.js'), sw)
      console.log('ferdi-sw', version, precache.length, 'fichiers en cache')
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serviceWorker()],
  build: { assetsInlineLimit: 0 },
})
