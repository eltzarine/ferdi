/* Certificat en image (PNG 1080 × 1350, format portrait des réseaux sociaux), dessiné dans un canvas
   aux couleurs du design system BD. Aucune donnée ne quitte le téléphone. */

type Donnees = { nom: string; lieu: string; indice: string; vignette: string; date: string; score?: string }

const ENCRE = '#1e1b18'
const PAPIER = '#f6efe2'
const BLANC = '#fffdf8'
const MOUTARDE = '#e8b23a'
const ORANGE = '#f2762e'
const VERT = '#3e9e5c'
const ROUGE = '#d9483b'

function image(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => {
    const i = new Image()
    i.onload = () => ok(i)
    i.onerror = ko
    i.src = src
  })
}

function texteCentre(c: CanvasRenderingContext2D, t: string, y: number, maxW: number, interligne: number) {
  const mots = t.split(' ')
  const lignes: string[] = []
  let l = ''
  for (const m of mots) {
    const essai = l ? l + ' ' + m : m
    if (c.measureText(essai).width > maxW && l) { lignes.push(l); l = m } else l = essai
  }
  if (l) lignes.push(l)
  lignes.forEach((x, k) => c.fillText(x, 540, y + k * interligne))
  return y + lignes.length * interligne
}

export async function dessinerCertificat(d: Donnees): Promise<Blob> {
  await Promise.all(['72px Bangers', '700 40px Andika', '40px Andika', '700 48px Caveat'].map((f) => document.fonts.load(f).catch(() => undefined)))
  const W = 1080, H = 1350
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const c = cv.getContext('2d')!
  c.textAlign = 'center'
  c.textBaseline = 'alphabetic'

  /* fond papier + grain */
  c.fillStyle = PAPIER
  c.fillRect(0, 0, W, H)
  for (let k = 0; k < 2500; k++) {
    c.fillStyle = `rgba(30,27,24,${Math.random() * 0.05})`
    c.fillRect(Math.random() * W, Math.random() * H, 2, 2)
  }
  /* bandeau du haut */
  c.fillStyle = ENCRE
  c.beginPath()
  c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, 190)
  for (let x = W; x >= 0; x -= 60) c.lineTo(x, 190 + (x / 60) % 2 * 14)
  c.closePath(); c.fill()
  c.fillStyle = MOUTARDE
  c.font = '92px Bangers'
  c.fillText('FERDI', 540, 112)
  c.fillStyle = PAPIER
  c.font = '40px Bangers'
  c.fillText('CHASSEUR D’HISTOIRE', 540, 160)

  /* cadre */
  c.fillStyle = ENCRE
  c.fillRect(70, 248, W - 140, H - 340)
  c.fillStyle = BLANC
  c.fillRect(58, 236, W - 140, H - 340)
  c.strokeStyle = ENCRE
  c.lineWidth = 8
  c.strokeRect(58, 236, W - 140, H - 340)

  c.fillStyle = ENCRE
  c.font = '58px Bangers'
  c.fillText('CERTIFICAT DE CHASSEUR D’HISTOIRE', 540, 330)

  /* sceau du lieu */
  try {
    const v = await image(d.vignette)
    c.save()
    c.beginPath(); c.arc(540, 500, 118, 0, Math.PI * 2); c.fillStyle = ENCRE; c.fill()
    c.beginPath(); c.arc(540, 500, 110, 0, Math.PI * 2); c.fillStyle = VERT; c.fill()
    c.beginPath(); c.arc(540, 500, 96, 0, Math.PI * 2); c.clip()
    const s = Math.max(192 / v.width, 192 / v.height)
    c.drawImage(v, 540 - (v.width * s) / 2, 500 - (v.height * s) / 2, v.width * s, v.height * s)
    c.restore()
  } catch { /* vignette indisponible : on continue sans */ }

  c.fillStyle = ENCRE
  c.font = '96px Bangers'
  c.fillText(d.nom.toUpperCase(), 540, 712)
  c.font = '40px Andika'
  let y = texteCentre(c, `a résolu les 8 énigmes du carnet de Papi Ferdinand au ${d.lieu.charAt(0).toLowerCase() + d.lieu.slice(1)} et trouvé l’indice du château :`, 772, 820, 50)

  /* indice en cases */
  const n = d.indice.length
  const cw = Math.min(96, 820 / n - 10)
  const x0 = 540 - (n * (cw + 10) - 10) / 2
  y += 26
  c.font = `${Math.round(cw * 0.78)}px Bangers`
  ;[...d.indice].forEach((l, k) => {
    const x = x0 + k * (cw + 10)
    c.fillStyle = ENCRE; c.fillRect(x + 5, y + 5, cw, cw * 1.15)
    c.fillStyle = MOUTARDE; c.fillRect(x, y, cw, cw * 1.15)
    c.strokeStyle = ENCRE; c.lineWidth = 4; c.strokeRect(x, y, cw, cw * 1.15)
    c.fillStyle = ENCRE; c.fillText(l, x + cw / 2, y + cw * 0.86)
  })
  y += cw * 1.15 + 62

  c.font = '700 34px Andika'
  c.fillStyle = ENCRE
  c.fillText('Indices vers le trésor : 1 / 5', 540, y)
  if (d.score) { c.font = '32px Andika'; c.fillText(d.score, 540, y + 48) }

  /* date et tampon */
  c.font = '700 44px Caveat'
  c.fillStyle = '#4a3420'
  c.textAlign = 'left'
  c.fillText('Le ' + d.date, 110, 1212)
  c.save()
  c.translate(888, 1178)
  c.rotate(-0.18)
  c.strokeStyle = ROUGE; c.lineWidth = 7
  c.beginPath(); c.arc(0, 0, 64, 0, Math.PI * 2); c.stroke()
  c.beginPath(); c.arc(0, 0, 51, 0, Math.PI * 2); c.stroke()
  c.fillStyle = ROUGE; c.textAlign = 'center'
  c.font = '34px Bangers'; c.fillText('VALIDÉ', 0, 8)
  c.font = '19px Bangers'; c.fillText(d.lieu.replace('Château de ', '').toUpperCase(), 0, 33)
  c.restore()

  /* bas de page */
  c.fillStyle = ORANGE
  c.fillRect(0, H - 70, W, 70)
  c.fillStyle = ENCRE
  c.textAlign = 'center'
  c.font = '34px Bangers'
  c.fillText('© XVI2026 · Ferdi, chasseur d’Histoire', 540, H - 24)

  return new Promise((ok, ko) => cv.toBlob((b) => (b ? ok(b) : ko(new Error('canvas'))), 'image/png'))
}

/** Enregistre l'image : feuille de partage du téléphone (« Enregistrer l'image ») si possible, sinon téléchargement. */
export async function enregistrerCertificat(blob: Blob, nomFichier: string, texte?: string): Promise<'partage' | 'telecharge' | 'annule'> {
  const fichier = new File([blob], nomFichier, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: [fichier] })) {
    try {
      await nav.share({ files: [fichier], title: 'Mon certificat Ferdi', text: texte })
      return 'partage'
    } catch {
      return 'annule'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'telecharge'
}
