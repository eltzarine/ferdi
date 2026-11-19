/* Splash, accueil du lieu, profil (l'histoire de Ferdi est dans histoire.tsx). */
import { useEffect, useState } from 'react'
import { useApp, telechargerParcours } from '../etat'
import { Bouton, BoutonSon, Cases, Entete } from '../ui/commun'
import { bip } from '../lib/sons'
import type { Age } from '../types'

export function Splash() {
  const { aller, setApresHistoire } = useApp()
  return (
    <section className="scr on" id="splash">
      <div className="fond" />
      <div className="ray" />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="logo">FERDI</div>
        <div className="sous">chasseur d’Histoire</div>
      </div>
      <img className="f" src="ferdi/ferdi_m4.png" alt="Ferdi saute de joie" />
      <div className="bas">
        <Bouton son="go" id="explorer" onClick={() => { setApresHistoire('accueil'); aller('histoire') }}>Explorer</Bouton>
        <small>© XVI2026</small>
      </div>
    </section>
  )
}

export function Accueil() {
  const { parcours } = useApp()
  const [n, setN] = useState(0)
  const [pret, setPret] = useState(false)
  const [txt, setTxt] = useState('Téléchargement du parcours…')
  useEffect(() => {
    if (!parcours) return
    let fini = false
    telechargerParcours(parcours, (a, t) => { if (!fini) { setN(Math.round((a / t) * 8)); setTxt(`Téléchargement du parcours · ${a} / ${t}`) } }).then((ok) => {
      if (fini) return
      setPret(true)
      setTxt(ok ? 'Parcours téléchargé : il marchera même sans réseau ✓' : 'Parcours prêt (une partie restera à charger sur place)')
      bip('pop')
    })
    return () => { fini = true }
  }, [parcours])
  if (!parcours) return <section className="scr on" id="accueil"><Entete titre="Chargement…" /></section>
  return (
    <section className="scr on" id="accueil">
      <Entete titre={parcours.nom} droite={<BoutonSon />} />
      <div className="ct">
        <div className="bd-image plein" style={{ height: 290, flex: 'none' }}><img src={parcours.accueil.image} alt={'Collage : ' + parcours.nom + ' et Ferdi'} /></div>
        <div className="row"><span className="bd-etiq vert">Jeu disponible</span><span className="bd-etiq">{parcours.etapes.length} étapes</span><span className="bd-etiq corail">{parcours.accueil.duree}</span></div>
        <h1 className="bd-titre h1">{parcours.accueil.titre}</h1>
        <div className="bd-recit">{parcours.accueil.accroche}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span className="lg">{txt}</span><Cases n={pret ? 8 : n} encours={false} /></div>
        <Bouton vers="profil" disabled={!pret} id="go-start">Commencer l’aventure</Bouton>
        <Bouton vers="carte" className="discret">Voir tous les lieux</Bouton>
      </div>
    </section>
  )
}

const AGES: [Age, string][] = [['5–8 ans', 'Images et voix'], ['9–12 ans', 'Énigmes avec aide'], ['13–16 ans', 'Défis et archives'], ['Lycée', '15–18 ans · documents et programme']]

export function Profil() {
  const { s, maj, aller, toast } = useApp()
  return (
    <section className="scr on" id="profil">
      <Entete titre="Qui part à l’aventure ?" retour />
      <div className="ct">
        <div className="bd-champ"><label htmlFor="pn">Ton prénom</label><input id="pn" placeholder="Ex. Jules" autoComplete="off" maxLength={16} value={s.nom} onChange={(e) => maj({ nom: e.target.value.trimStart() })} /></div>
        <span className="bd-titre" style={{ fontSize: 20 }}>Ton âge</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
          {AGES.map(([a, d]) => (
            <button key={a} className={'bd-vignette age' + (s.age === a ? ' on' : '')} data-age={a} onClick={() => { bip('tap'); maj({ age: a }) }}
              style={{ textAlign: 'left', fontFamily: 'inherit', padding: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="bd-titre" style={{ fontSize: 22, lineHeight: '24px' }}>{a}</span><span style={{ fontSize: 13, lineHeight: '17px' }}>{d}</span>
            </button>
          ))}
        </div>
        <span className="bd-titre" style={{ fontSize: 20 }}>Ton guide : Ferdi</span>
        <div className="bd-vignette bd-scotch" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--ciel)' }}>
          <img src="ferdi/ferdi_m1.png" alt="Ferdi" style={{ height: 150, width: 'auto', flex: 'none', margin: '-6px 0' }} />
          <div className="bd-bulle" style={{ fontSize: 16, lineHeight: '22px', flex: 1 }}>
            {s.nom.trim() ? `Salut ${s.nom.trim()} ! Moi c’est Ferdi. On part à la recherche des pages du carnet ?` : 'Salut, moi c’est Ferdi ! Et toi, comment tu t’appelles ?'}
          </div>
        </div>
        <Bouton id="go-profil" onClick={() => {
          if (!s.nom.trim()) { bip('non'); toast('Écris ton prénom pour que Ferdi te reconnaisse !'); document.getElementById('pn')?.focus(); return }
          bip('go'); aller('carte')
        }}>C’est parti !</Bouton>
      </div>
    </section>
  )
}

export { Histoire } from './histoire'
