/* Carte des lieux : vraie carte (Leaflet + OpenStreetMap) au style papier ancien,
   avec la mini-photo de chaque lieu à sa position GPS. Déplacement au doigt, zoom à deux doigts ou + / −. */
import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../etat'
import { Entete, Nav } from '../ui/commun'
import { bip } from '../lib/sons'
import type { Lieu } from '../types'

type Filtre = 'tous' | 'jeu' | 'visite' | 'certif'
const FILTRES: [Filtre, string][] = [['tous', 'Tous'], ['jeu', 'Jeu disponible'], ['visite', 'Visités'], ['certif', 'Certificats']]

/** Distance à vol d'oiseau, en km. */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const r = (x: number) => (x * Math.PI) / 180
  const dLat = r(b[0] - a[0])
  const dLon = r(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}
const km = (d: number) => (d < 1 ? 'à moins d’1 km' : `à ${d < 10 ? d.toFixed(1).replace('.', ',') : Math.round(d)} km`)

export function Carte() {
  const { lieux, s, aller, toast, ouvrirFeuille } = useApp()
  const boite = useRef<HTMLDivElement>(null)
  const carte = useRef<L.Map | null>(null)
  const calque = useRef<L.LayerGroup | null>(null)
  const moi = useRef<L.Marker | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [q, setQ] = useState('')
  const [position, setPosition] = useState<[number, number] | null>(null)

  const tags = (l: Lieu) => [l.etat === 'jeu' ? 'jeu' : '', s.visites.includes(l.id) ? 'visite' : '', s.certificats.includes(l.id) ? 'certif' : '']
  const visibles = useMemo(
    () => lieux.filter((l) => (filtre === 'tous' || tags(l).includes(filtre)) && (!q || l.nom.toLowerCase().includes(q.toLowerCase()))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lieux, filtre, q, s.visites, s.certificats],
  )

  const ouvrir = (l: Lieu) => {
    bip('pop')
    if (l.etat === 'jeu') { aller('lieu'); return }
    ouvrirFeuille(
      <>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <img src={l.vignette} alt="" style={{ width: 70, height: 70, borderRadius: 999, border: '3px solid var(--encre)', objectFit: 'cover' }} />
          <div><div className="bd-titre" style={{ fontSize: 24 }}>{l.nom}</div><div className="lg">Bientôt disponible{position ? ' · ' + km(distanceKm(position, [l.lat, l.lon])) : ''}</div></div>
        </div>
        <div className="bd-bulle" style={{ fontSize: 16, lineHeight: '22px' }}>Ferdinand a peut-être caché une page ici aussi… Je te préviens dès que le jeu est prêt !</div>
      </>,
    )
  }
  const ouvrirRef = useRef(ouvrir)
  ouvrirRef.current = ouvrir

  /* Création de la carte (une fois). */
  useEffect(() => {
    if (!boite.current || carte.current) return
    const m = L.map(boite.current, { zoomControl: false, attributionControl: true, minZoom: 6, maxZoom: 17, zoomSnap: 0.5 })
    m.setView([49.2, 1.35], 10)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'tuiles-papier',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m)
    m.attributionControl.setPrefix(false)
    calque.current = L.layerGroup().addTo(m)
    carte.current = m
    /* la carte est dans un écran qui vient d'apparaître : on lui laisse mesurer sa taille */
    setTimeout(() => m.invalidateSize(), 50)
    return () => { m.remove(); carte.current = null }
  }, [])

  /* Épingles : redessinées quand la liste, les filtres ou la progression changent. */
  useEffect(() => {
    const m = carte.current
    const g = calque.current
    if (!m || !g) return
    g.clearLayers()
    for (const l of visibles) {
      const jeu = l.etat === 'jeu'
      const t = jeu ? 62 : 46
      const anneau = s.certificats.includes(l.id) || jeu ? 'var(--vert)' : s.visites.includes(l.id) ? 'var(--ciel)' : 'var(--blanc-papier)'
      const badge = jeu ? `<span class="bd-etiq vert">${s.certificats.includes(l.id) ? '★ Certificat' : 'Jeu'}</span>` : ''
      const html = `<div class="pin-carte${jeu ? ' gail' : ''}" data-lieu="${l.id}"><span class="pin-lbl">${l.court ?? l.nom}</span><img src="${l.vignette}" alt="" style="width:${t}px;height:${t}px;box-shadow:0 0 0 4px ${anneau},0 0 0 6px var(--encre),4px 4px 0 6px var(--encre)">${badge}</div>`
      const icone = L.divIcon({ html, className: 'pin-leaflet', iconSize: [t + 40, t + 46], iconAnchor: [(t + 40) / 2, (t + 46) / 2] })
      L.marker([l.lat, l.lon], { icon: icone, keyboard: true, title: l.nom, riseOnHover: true, zIndexOffset: jeu ? 1000 : 0 })
        .on('click', () => ouvrirRef.current(l))
        .addTo(g)
    }
    if (visibles.length) {
      const b = L.latLngBounds(visibles.map((l) => [l.lat, l.lon] as [number, number]))
      if (position) b.extend(position)
      m.fitBounds(b, { paddingTopLeft: [50, 80], paddingBottomRight: [50, 40], maxZoom: 13 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibles, s.certificats, s.visites])

  const autourDeMoi = () => {
    bip('pop')
    if (!navigator.geolocation) { toast('La position n’est pas disponible sur cet appareil'); return }
    toast('📍 Recherche de ta position…')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos: [number, number] = [p.coords.latitude, p.coords.longitude]
        setPosition(pos)
        const m = carte.current!
        moi.current?.remove()
        moi.current = L.marker(pos, { icon: L.divIcon({ className: 'moi', html: '<span></span>', iconSize: [22, 22] }), zIndexOffset: 2000 }).addTo(m)
        const proche = [...lieux].sort((a, b) => distanceKm(pos, [a.lat, a.lon]) - distanceKm(pos, [b.lat, b.lon]))[0]
        if (proche) {
          m.fitBounds(L.latLngBounds([pos, [proche.lat, proche.lon]]), { padding: [70, 70], maxZoom: 14 })
          toast(`📍 Le lieu le plus proche : ${proche.nom}, ${km(distanceKm(pos, [proche.lat, proche.lon]))}`)
        }
      },
      () => toast('Position refusée ou indisponible : la carte reste centrée sur la vallée de la Seine'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const gail = lieux.find((l) => l.etat === 'jeu')
  return (
    <section className="scr on" id="carte">
      <Entete titre="Carte des lieux" />
      <div className="ct" style={{ gap: 10, paddingBottom: 10 }}>
        <div className="bd-champ"><input aria-label="Rechercher un lieu" placeholder="Rechercher un château, un musée…" style={{ height: 46 }} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="row">
          {FILTRES.map(([f, l]) => (
            <span key={f} className={'bd-etiq chip' + (filtre === f ? ' on' : '')} onClick={() => { bip('tap'); setFiltre(f); if (f !== 'tous' && !lieux.some((x) => tags(x).includes(f))) toast('Aucun lieu pour ce filtre… pour l’instant !') }}>{l}</span>
          ))}
        </div>
        <div className="bd-image plein carte-vraie" style={{ flex: 1, minHeight: 330, position: 'relative', overflow: 'hidden' }}>
          <div ref={boite} style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', right: 8, top: 8, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 500 }}>
            <button className="bd-btn second" aria-label="Zoomer" style={{ minHeight: 40, width: 40, padding: 0, fontSize: 24 }} onClick={() => { bip('tap'); carte.current?.zoomIn() }}>+</button>
            <button className="bd-btn second" aria-label="Dézoomer" style={{ minHeight: 40, width: 40, padding: 0, fontSize: 24 }} onClick={() => { bip('tap'); carte.current?.zoomOut() }}>−</button>
          </div>
          <button className="bd-btn ciel" style={{ position: 'absolute', left: 8, top: 8, minHeight: 40, fontSize: 15, padding: '0 10px', zIndex: 500 }} onClick={autourDeMoi}>Autour de moi</button>
        </div>
        {gail && (
          <a className="bd-vignette bd-scotch tap" onClick={() => { bip('tap'); aller('lieu') }} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px' }}>
            <img src={gail.vignette} alt="" style={{ width: 56, height: 56, borderRadius: 999, border: '3px solid var(--encre)', flex: 'none', objectFit: 'cover' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="bd-titre" style={{ fontSize: 20, lineHeight: '22px' }}>{gail.nom}</span>
              <span className="lg">Gaillon (27){position ? ' · ' + km(distanceKm(position, [gail.lat, gail.lon])) : ''}</span>
            </div>
            <span className="bd-etiq vert">Jeu</span>
          </a>
        )}
      </div>
      <Nav actif="carte" />
    </section>
  )
}
