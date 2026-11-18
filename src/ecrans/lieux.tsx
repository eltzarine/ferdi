/* Carte des lieux et fiche du lieu. */
import { useState } from 'react'
import { useApp } from '../etat'
import { Bouton, Ecoute, Entete, Nav } from '../ui/commun'
import { FOND_CARTE } from '../lib/icones'
import { bip } from '../lib/sons'
import type { Lieu } from '../types'

type Filtre = 'tous' | 'jeu' | 'visite' | 'certif'

export function Carte() {
  const { lieux, s, aller, toast, ouvrirFeuille } = useApp()
  const [zoom, setZoom] = useState(1)
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [q, setQ] = useState('')
  const tags = (l: Lieu) => [l.etat === 'jeu' ? 'jeu' : '', s.visites.includes(l.id) || l.id === 'gaillard' ? 'visite' : '', s.certificats.includes(l.id) ? 'certif' : '']
  const visibles = lieux.filter((l) => (filtre === 'tous' || tags(l).includes(filtre)) && (!q || l.nom.toLowerCase().includes(q.toLowerCase())))
  const ouvrir = (l: Lieu) => {
    bip('pop')
    if (l.etat === 'jeu') { aller('lieu'); return }
    ouvrirFeuille(
      <>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <img src={l.vignette} alt="" style={{ width: 70, height: 70, borderRadius: 999, border: '3px solid var(--encre)', objectFit: 'cover' }} />
          <div><div className="bd-titre" style={{ fontSize: 24 }}>{l.nom}</div><div className="lg">Bientôt disponible</div></div>
        </div>
        <div className="bd-bulle" style={{ fontSize: 16, lineHeight: '22px' }}>Ferdinand a peut-être caché une page ici aussi… Je te préviens dès que le jeu est prêt !</div>
      </>,
    )
  }
  const anneau = (l: Lieu) => (s.certificats.includes(l.id) || l.etat === 'jeu' ? 'var(--vert)' : tags(l).includes('visite') ? 'var(--ciel)' : 'var(--blanc-papier)')
  const gail = lieux.find((l) => l.etat === 'jeu')
  return (
    <section className="scr on" id="carte">
      <Entete titre="Carte des lieux" />
      <div className="ct" style={{ gap: 10, paddingBottom: 10 }}>
        <div className="bd-champ"><input aria-label="Rechercher un lieu" placeholder="Rechercher un château, un musée…" style={{ height: 46 }} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="row">
          {(['tous', 'jeu', 'visite', 'certif'] as Filtre[]).map((f) => (
            <span key={f} className={'bd-etiq chip' + (filtre === f ? ' on' : '')} onClick={() => { bip('tap'); setFiltre(f) }}>
              {{ tous: 'Tous', jeu: 'Jeu disponible', visite: 'Visités', certif: 'Certificats' }[f]}
            </span>
          ))}
        </div>
        <div className="bd-image plein" style={{ flex: 1, minHeight: 330, position: 'relative', overflow: 'hidden' }}>
          <div className="carte" style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})` }}>
            <div style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: FOND_CARTE }} />
            {visibles.map((l) => {
              const t = l.etat === 'jeu' ? 66 : 48
              return (
                <a key={l.id} className={'pin' + (l.etat === 'jeu' ? ' gail' : '')} data-lieu={l.id} style={{ left: l.x + '%', top: l.y + '%' }} onClick={() => ouvrir(l)}>
                  <span className="pin-lbl">{l.court ?? l.nom}</span>
                  <img src={l.vignette} alt="" style={{ width: t, height: t, boxShadow: `0 0 0 4px ${anneau(l)},0 0 0 6px var(--encre),4px 4px 0 6px var(--encre)` }} />
                  {l.etat === 'jeu' && <span className="bd-etiq vert" style={{ minHeight: 22, fontSize: 12, padding: '0 6px' }}>{s.certificats.includes(l.id) ? '★ Certificat' : 'Jeu'}</span>}
                </a>
              )
            })}
          </div>
          <div style={{ position: 'absolute', right: 8, top: 8, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 3 }}>
            <button className="bd-btn second" aria-label="Zoomer" style={{ minHeight: 40, width: 40, padding: 0, fontSize: 24 }} onClick={() => { bip('tap'); setZoom((z) => Math.min(1.8, z + 0.2)) }}>+</button>
            <button className="bd-btn second" aria-label="Dézoomer" style={{ minHeight: 40, width: 40, padding: 0, fontSize: 24 }} onClick={() => { bip('tap'); setZoom((z) => Math.max(1, z - 0.2)) }}>−</button>
          </div>
          <button className="bd-btn ciel" style={{ position: 'absolute', left: 8, top: 8, minHeight: 40, fontSize: 15, padding: '0 10px', zIndex: 3 }} onClick={() => { bip('pop'); toast('📍 Tu es à 2 km du château de Gaillon') }}>Autour de moi</button>
        </div>
        {gail && (
          <a className="bd-vignette bd-scotch tap" onClick={() => { bip('tap'); aller('lieu') }} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px' }}>
            <img src={gail.vignette} alt="" style={{ width: 56, height: 56, borderRadius: 999, border: '3px solid var(--encre)', flex: 'none', objectFit: 'cover' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span className="bd-titre" style={{ fontSize: 20, lineHeight: '22px' }}>{gail.nom}</span><span className="lg">Gaillon (27) · {gail.distance}</span></div>
            <span className="bd-etiq vert">Jeu</span>
          </a>
        )}
      </div>
      <Nav actif="carte" />
    </section>
  )
}

export function FicheLieu() {
  const { parcours, s, maj, toast } = useApp()
  if (!parcours) return null
  const vu = s.visites.includes(parcours.id)
  return (
    <section className="scr on" id="lieu">
      <Entete titre={parcours.nom} retour />
      <div className="ct">
        <div className="bd-image plein" style={{ height: 199, flex: 'none' }}><img src={parcours.fiche.image} alt={'Collage : ' + parcours.nom} /></div>
        <div className="row"><span className="bd-etiq vert">Jeu disponible</span><span className="bd-etiq">{parcours.accueil.duree}</span><span className="bd-etiq corail">{parcours.accueil.ages}</span></div>
        <div className="bd-bulle" style={{ padding: 0 }}><Ecoute texte={parcours.fiche.bulle} /></div>
        <div className="bd-vignette bd-scotch" style={{ marginTop: 12 }}><span className="bd-titre" style={{ fontSize: 20 }}>Ouverture 2026</span><p className="p" style={{ fontSize: 16, lineHeight: '22px' }}>{parcours.fiche.ouverture}</p></div>
        <Bouton vers="plan" son="go" id="lancer">Lancer le parcours</Bouton>
        <Bouton className="second" onClick={() => { const v = vu ? s.visites.filter((x) => x !== parcours.id) : [...s.visites, parcours.id]; maj({ visites: v }); bip(vu ? 'tap' : 'ok'); if (!vu) toast('Ajouté à ton carnet : « Visité »') }}>
          {vu ? '✓ Tu y es allé' : 'J’y suis allé'}
        </Bouton>
      </div>
    </section>
  )
}
