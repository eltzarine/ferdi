/* Fin du parcours, certificat, carnet de l'explorateur, espace parent. */
import { useEffect, useMemo } from 'react'
import { useApp } from '../etat'
import { Bouton, Ecoute, Entete, Nav } from '../ui/commun'
import { FeuilleCarnet } from './parcours'
import { bip } from '../lib/sons'
import { scoreTotal } from '../lib/regles'

const COULEURS = ['#f2762e', '#7ec8e3', '#e8b23a', '#3e9e5c', '#f28c8c']

export function Fin() {
  const { parcours } = useApp()
  useEffect(() => bip('ok'), [])
  const confettis = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ l: Math.random() * 100, c: COULEURS[i % 5], d: 2 + Math.random() * 2.5, r: Math.random() * 0.8 })), [])
  if (!parcours) return null
  return (
    <section className="scr on" id="conclusion">
      <div className="noir" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 14, position: 'relative', overflow: 'hidden' }}>
        {confettis.map((c, i) => <i key={i} className="conf" style={{ left: c.l + '%', background: c.c, animationDuration: c.d + 's', animationDelay: c.r + 's' }} />)}
        <div style={{ textAlign: 'center', marginTop: 10 }}><span className="bd-onom slam" style={{ fontSize: 52, lineHeight: '56px' }}>DÉFI RELEVÉ !</span></div>
        <div className="bd-image plein" style={{ flex: 1, position: 'relative', background: 'var(--ciel)' }}>
          <img src={parcours.fin.image} alt="" style={{ opacity: 0.35 }} />
          <img src="ferdi/ferdi_m4.png" alt="Ferdi saute de joie" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', animation: 'flotte 1.4s ease-in-out infinite' }} />
        </div>
        <div className="bd-bulle" style={{ color: 'var(--encre)', padding: 0 }}><Ecoute texte={parcours.fin.bulle} /></div>
        <Bouton vers="certificat" son="go">Mon certificat</Bouton>
      </div>
    </section>
  )
}

export function Certificat() {
  const { parcours, s, toast } = useApp()
  useEffect(() => bip('stamp'), [])
  if (!parcours) return null
  const nom = s.nom.trim() || 'Explorateur'
  const [bons, total] = scoreTotal(s.scores?.[parcours.id])
  return (
    <section className="scr on" id="certificat">
      <Entete titre="Page restaurée" retour="fin" />
      <div className="ct">
        <div className="bd-vignette bd-scotch" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', background: 'var(--blanc-papier)' }}>
          <span className="bd-titre" style={{ fontSize: 22, letterSpacing: 2 }}>Certificat d’explorateur</span>
          <img src="sites/vignettes/t_gaillon.jpg" alt={parcours.nom} style={{ width: 130, height: 130, borderRadius: 999, objectFit: 'cover', boxShadow: '0 0 0 5px var(--vert),0 0 0 8px var(--encre),5px 5px 0 8px var(--encre)', margin: '8px 0' }} />
          <span className="bd-titre h1">{nom}</span>
          <span>a retrouvé les 8 pages du carnet de Ferdinand au {parcours.nom.toLowerCase()}</span>
          <div className="row" style={{ justifyContent: 'center' }}><span className="bd-etiq">8 étapes</span><span className="bd-etiq moutarde">{parcours.motSecret}</span><span className="bd-etiq">{new Date().toLocaleDateString('fr-FR')}</span></div>
          {s.age === 'Lycée' && total > 0 && <div className="bd-etiq ciel" id="score" style={{ fontSize: 16 }}>Niveau lycée · {bons} / {total} bonnes réponses du premier coup</div>}
          <div className="bd-tampon slam" style={{ width: 92, height: 92, fontSize: 15, marginTop: 4, animationDelay: '.4s' }}>VALIDÉ<small>Gaillon</small></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
          <Bouton className="second" style={{ fontSize: 18, padding: '0 8px' }} son="ok" onClick={() => toast('📜 Certificat enregistré dans ton carnet')}>Télécharger</Bouton>
          <Bouton className="second" style={{ fontSize: 18, padding: '0 8px' }} onClick={async () => {
            const t = `${nom} a retrouvé les 8 pages du carnet de Ferdinand au ${parcours.nom} !`
            if (navigator.share) { try { await navigator.share({ title: 'Mon certificat', text: t }) } catch { /* annulé */ } } else toast('Partage : « ' + t + ' »')
          }}>Partager</Bouton>
        </div>
        <Bouton vers="carnet">Voir mon carnet</Bouton>
      </div>
    </section>
  )
}

export function Carnet() {
  const { parcours, lieux, s, fait, aller, toast, ouvrirFeuille } = useApp()
  const nom = s.nom.trim() || 'l’explorateur'
  const ep: [string, number, number][] = [['Moyen Âge', Math.min(fait, 3), 3], ['Renaissance', Math.max(0, Math.min(fait - 3, 2)), 2], ['Époque moderne', fait >= 6 ? 1 : 0, 1], ['XIXe siècle et aujourd’hui', Math.max(0, fait - 6), 2]]
  return (
    <section className="scr on" id="carnet">
      <Entete titre={'Carnet de ' + nom} />
      <div className="ct" style={{ gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
          <div className="bd-vignette" style={{ padding: '8px 10px', background: 'var(--orange)' }}><span className="bd-titre h2">{s.certificats.length}</span><div style={{ fontSize: 14, lineHeight: '18px' }}>certificat</div></div>
          <div className="bd-vignette" style={{ padding: '8px 10px', background: 'var(--ciel)' }}><span className="bd-titre h2">{fait}</span><div style={{ fontSize: 14, lineHeight: '18px' }}>pages</div></div>
          <div className="bd-vignette" style={{ padding: '8px 10px', background: 'var(--corail)' }}><span className="bd-titre h2">1</span><div style={{ fontSize: 14, lineHeight: '18px' }}>région</div></div>
        </div>
        <span className="bd-titre" style={{ fontSize: 22 }}>Ma collection</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
          {lieux.map((l) => s.certificats.includes(l.id) ? (
            <div key={l.id} className="bd-vignette tap" onClick={() => { bip('tap'); aller('certificat') }} style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', background: 'var(--moutarde)' }}>
              <img src={l.vignette} alt="" style={{ width: 62, height: 62, borderRadius: 999, objectFit: 'cover', boxShadow: '0 0 0 3px var(--vert),0 0 0 5px var(--encre)' }} />
              <span className="bd-titre" style={{ fontSize: 14, lineHeight: '15px' }}>★ {l.nom}</span>
            </div>
          ) : (
            <div key={l.id} className="bd-image tap" onClick={() => { bip('pop'); toast(l.etat === 'jeu' ? 'Continue le parcours pour gagner ce certificat !' : l.nom + ' : bientôt disponible') }} style={{ padding: '8px 4px', flexDirection: 'column', gap: 6, borderStyle: 'dashed', background: 'var(--papier-fonce)', cursor: 'pointer' }}>
              <img src={l.vignette} alt="" style={{ width: 56, height: 56, borderRadius: 999, objectFit: 'cover', filter: 'grayscale(1)', opacity: 0.55, border: '2px solid var(--encre-douce)' }} />
              <span style={{ fontSize: 12, lineHeight: '14px', color: 'var(--encre-douce)' }}><b>{l.nom}</b><br />{l.etat === 'jeu' ? `En cours : ${fait}/8` : 'Bientôt disponible'}</span>
            </div>
          ))}
        </div>
        {parcours && (
          <>
            <span className="bd-titre" style={{ fontSize: 22 }}>Le carnet de Ferdinand</span>
            <div className="pages">
              {parcours.etapes.map((e, i) => i < fait ? (
                <button key={i} className="pg-mini" onClick={() => { bip('pop'); ouvrirFeuille(<FeuilleCarnet e={e} i={i} lettre />) }}><span>{e.page.lettre}</span><small>Page {i + 1}</small></button>
              ) : (
                <div key={i} className="pg-mini vide"><span>?</span><small>Page {i + 1}</small></div>
              ))}
            </div>
          </>
        )}
        <span className="bd-titre" style={{ fontSize: 22 }}>Par époque</span>
        <div className="bd-vignette" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
          {ep.map(([n, v, t]) => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 15, lineHeight: '18px' }}>{n} · {v}/{t}</span>
              <div className="bd-cases">{Array.from({ length: t }, (_, k) => <span key={k} className={k < v ? 'ok' : ''} />)}</div>
            </div>
          ))}
        </div>
      </div>
      <Nav actif="carnet" />
    </section>
  )
}

export function Parent() {
  const { s, maj, aller, ouvrirFeuille, reinitialiser, toast, setApresHistoire } = useApp()
  const inter = (k: 'voix' | 'sfx', l: string, bord: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: bord ? '2px solid var(--papier-fonce)' : undefined }}>
      <span style={{ fontSize: 16 }}>{l}</span>
      <span className={'bd-inter' + (s[k] ? ' on' : '')} role="switch" aria-checked={s[k]} aria-label={l} onClick={() => { bip('tap'); maj({ [k]: !s[k] }) }} />
    </div>
  )
  return (
    <section className="scr on" id="parent">
      <Entete titre="Espace parent" />
      <div className="ct" style={{ gap: 10 }}>
        <span className="bd-titre" style={{ fontSize: 20 }}>Profil</span>
        <div style={{ background: 'var(--blanc-papier)', border: '2px solid var(--encre)', borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', fontSize: 16 }}><span>{(s.nom.trim() || 'Sans prénom') + ' · ' + s.age}</span><a onClick={() => aller('profil')} style={{ color: 'var(--encre)', fontWeight: 700, cursor: 'pointer' }}>Modifier</a></div>
        </div>
        <span className="bd-titre" style={{ fontSize: 20 }}>Son</span>
        <div style={{ background: 'var(--blanc-papier)', border: '2px solid var(--encre)', borderRadius: 10 }}>{inter('voix', 'Voix de Ferdi', true)}{inter('sfx', 'Bruitages', false)}</div>
        <span className="bd-titre" style={{ fontSize: 20 }}>Confidentialité</span>
        <p className="p" style={{ fontSize: 15, lineHeight: '21px' }}>Aucun compte. Le profil, les pages et les certificats restent sur ce téléphone.</p>
        <p className="p" style={{ fontSize: 15, lineHeight: '21px', background: 'var(--moutarde)', padding: '8px 12px', border: '2px solid var(--encre)', borderRadius: 8 }}>Sur iPhone, installe l’appli sur l’écran d’accueil pour ne pas perdre la collection.</p>
        <Bouton className="second" style={{ fontSize: 18, minHeight: 48 }} son="go" onClick={() => { setApresHistoire('parent'); aller('histoire') }}>▶ Revoir l’histoire de Ferdi</Bouton>
        <Bouton className="second" style={{ fontSize: 18, minHeight: 48 }} onClick={() => ouvrirFeuille(<><div className="bd-titre" style={{ fontSize: 24 }}>Installer Ferdi</div><p className="p" style={{ fontSize: 16, lineHeight: '22px' }}>Sur iPhone : touche <b>Partager</b> puis <b>Sur l’écran d’accueil</b>.<br />Sur Android : menu <b>⋮</b> puis <b>Installer l’application</b>.</p></>)}>Installer sur l’écran d’accueil</Bouton>
        <Bouton className="discret" style={{ fontSize: 18, minHeight: 48 }} onClick={() => { reinitialiser(); toast('Démo remise à zéro') }}>Recommencer la démo</Bouton>
      </div>
      <Nav actif="parent" />
    </section>
  )
}
