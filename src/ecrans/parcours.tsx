/* Le parcours : plan, scan, étape (récit + questions), page du carnet, énigme, tampon. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../etat'
import { Bouton, BoutonSon, Cases, Ecoute, Entete, Icone, Retour } from '../ui/commun'
import { bip } from '../lib/sons'
import { difficile, melanger, motSecretPartiel, ordreJuste } from '../lib/regles'
import { entreDeuxEtapes } from '../pwa/miseAJour'
import { JEUX } from '../jeux'
import type { Etape, Question, QuestionLycee, QuestionOrdre } from '../types'

export function FeuilleCarnet({ e, i, lettre }: { e: Etape; i: number; lettre: boolean }) {
  return (
    <div className="feuille">
      <div className="pg-num">Page {i + 1} / 8 · {e.nom}</div>
      <img src={e.croquis} alt="Croquis de Ferdinand" />
      <p className="main">« {e.page.texte} »</p>
      <div className={'pg-lettre' + (lettre ? ' vue' : '')}>{lettre ? e.page.lettre : '?'}</div>
    </div>
  )
}

export function Plan() {
  const { parcours, fait, aller, choisirEtape, toast, ouvrirFeuille } = useApp()
  const [secoue, setSecoue] = useState(-1)
  /* Entre deux étapes : c'est le bon moment pour installer une nouvelle version. */
  useEffect(() => { if (fait > 0) entreDeuxEtapes() }, [fait])
  if (!parcours) return null
  const E = parcours.etapes
  const fin = fait >= E.length
  const indice = fin ? '' : fait === 0 ? parcours.premierIndice : E[fait - 1].suite
  return (
    <section className="scr on" id="plan">
      <Entete titre="Parcours" retour="lieu" droite={<button aria-label="Carnet" onClick={() => { bip('tap'); aller('carnet') }}><Icone nom="BOOK" /></button>} />
      <div className="ct" style={{ gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Cases n={fait} total={E.length} />
          <span className="lg">{fait} / {E.length} pages du carnet · mot secret : {motSecretPartiel(parcours.motSecret, fait).join(' ')}</span>
        </div>
        <div className="bd-vignette" style={{ padding: 0, overflow: 'hidden' }}>
          {E.map((e, i) => {
            const st = i < fait ? 'done' : i === fait ? 'cur' : 'lock'
            return (
              <div key={e.id} className={'step ' + st + (secoue === i ? ' shake' : '')} data-i={i} onClick={() => {
                if (st === 'done') { bip('pop'); ouvrirFeuille(<FeuilleCarnet e={e} i={i} lettre />) }
                else if (st === 'cur') { bip('go'); choisirEtape(i); aller('scan') }
                else { bip('non'); setSecoue(-1); requestAnimationFrame(() => setSecoue(i)); toast('🔒 Termine d’abord l’étape ' + (fait + 1) + ' !') }
              }}>
                <span className="bd-titre" style={{ width: 18, fontSize: 18, color: 'inherit' }}>{i + 1}</span>
                <span style={{ flex: 1 }}>{e.nom} <span style={{ fontSize: 13 }}>· {e.date}</span></span>
                {st === 'done' ? <span className="mini-lettre">{e.page.lettre}</span> : st === 'cur' ? <span className="bd-etiq ciel" style={{ minHeight: 22, background: 'var(--blanc-papier)' }}>En cours</span> : <Icone nom="LOCK" />}
              </div>
            )
          })}
        </div>
        <div className="bd-postit" style={{ margin: '4px 6px 0', padding: 0 }} id="indice">
          {fin ? <div style={{ padding: '10px 14px' }}><div className="bd-titre">Bravo !</div>Tu as retrouvé les 8 pages et le mot {parcours.motSecret}.</div>
            : <Ecoute texte={'Indice : ' + indice} style={{ padding: '10px 12px' }}><b className="bd-titre" style={{ fontSize: 18, display: 'block' }}>Indice</b>{indice}</Ecoute>}
        </div>
        <Bouton id="go-scan" son="go" onClick={() => { if (fin) aller('fin'); else { choisirEtape(fait); aller('scan') } }}>{fin ? 'Voir la fin du parcours' : 'Scanner le QR code'}</Bouton>
      </div>
    </section>
  )
}

export function Scan() {
  const { parcours, fait, aller, ouvrirFeuille, toast } = useApp()
  const video = useRef<HTMLVideoElement>(null)
  const flux = useRef<MediaStream | null>(null)
  const [cam, setCam] = useState(false)
  const [flash, setFlash] = useState(false)
  useEffect(() => () => flux.current?.getTracks().forEach((t) => t.stop()), [])
  if (!parcours) return null
  const indice = fait === 0 ? parcours.premierIndice : parcours.etapes[Math.min(fait, 8) - 1].suite
  const ouvrirCam = async () => {
    if (flux.current || !navigator.mediaDevices) return
    try {
      flux.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      video.current!.srcObject = flux.current
      video.current!.play()
      setCam(true)
    } catch { toast('Caméra non disponible ici : utilise « Simuler un scan »') }
  }
  return (
    <section className="scr on" id="scan">
      <div className="noir" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 14, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button aria-label="Retour" onClick={() => aller('plan')} style={{ color: 'var(--papier)', display: 'flex', background: 'none', border: 0 }}><Icone nom="BACK" /></button>
          <span className="bd-titre" style={{ color: 'var(--papier)', fontSize: 24 }}>Trouve le QR code !</span>
        </div>
        <div className="bd-image" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#2e2925' }} onClick={ouvrirCam}>
          <video className="cam" ref={video} playsInline muted />
          {!cam && <span style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 30px' }}>Touche ici pour ouvrir la caméra et viser le QR code caché près de la pierre</span>}
          <div className="viseur" />
        </div>
        <div className="bd-postit" style={{ color: 'var(--encre)', margin: '0 6px' }}><div className="bd-titre">Indice</div>{indice}</div>
        <Bouton className="ciel" id="simu" son="ok" onClick={() => { setFlash(true); setTimeout(() => aller('etape'), 450) }}>Simuler un scan réussi</Bouton>
        <Bouton className="discret" style={{ color: 'var(--papier)', borderColor: 'var(--papier)' }} onClick={() => ouvrirFeuille(<><div className="bd-titre" style={{ fontSize: 24 }}>Coup de pouce</div><div className="bd-bulle" style={{ fontSize: 16, lineHeight: '22px' }}>Le QR code est collé sur un petit panneau en bois, à hauteur d’enfant. Demande à un adulte de t’aider à le repérer !</div></>)}>Je ne trouve pas</Bouton>
        <div className={'flash' + (flash ? ' on' : '')} />
      </div>
    </section>
  )
}

/** Remise en ordre chronologique : on touche les événements du plus ancien au plus récent. */
function QuestionOrdreUI({ q, k, surReponse }: { q: QuestionOrdre; k: number; surReponse: (ok: boolean) => void }) {
  const melange = useMemo(() => melanger(q.elements), [q])
  const [suite, setSuite] = useState<string[]>([])
  const [etat, setEtat] = useState<'' | 'ok' | 'faux'>('')
  const touche = (x: string) => {
    if (etat === 'ok' || suite.includes(x)) return
    bip('tap')
    const n = [...suite, x]
    setSuite(n)
    if (n.length === q.elements.length) {
      const ok = ordreJuste(q.elements, n)
      bip(ok ? 'ok' : 'non')
      setEtat(ok ? 'ok' : 'faux')
      surReponse(ok)
      if (!ok) setTimeout(() => { setSuite([]); setEtat('') }, 1200)
    }
  }
  return (
    <div className="bd-question ordre" data-k={k}>
      <Ecoute texte={q.texte + ' ' + q.elements.join('. ')} question>{q.texte}</Ecoute>
      <div className="bd-choix-ligne col">
        {melange.map((x) => {
          const n = suite.indexOf(x)
          return (
            <button key={x} className={'bd-choix' + (etat === 'ok' ? ' ok' : etat === 'faux' && n >= 0 ? ' faux' : n >= 0 ? ' sel' : '')} data-el={x} onClick={() => touche(x)}>
              <span className="rang">{n >= 0 ? n + 1 : ''}</span>{x}
            </button>
          )
        })}
      </div>
      {etat && <div className="retour on"><Retour ok={etat === 'ok'} texte={etat === 'ok' ? q.bravo : q.oups} /></div>}
    </div>
  )
}

export function EcranEtape() {
  const { parcours, etapeCourante: i, s, maj, aller, ouvrirFeuille } = useApp()
  const [rep, setRep] = useState<Record<number, { choix: number; ok: boolean }>>({})
  const [premier, setPremier] = useState<Record<number, boolean>>({})
  const [faux, setFaux] = useState<string>('')
  if (!parcours) return null
  const e = parcours.etapes[i]
  const lyc = s.age === 'Lycée' && e.lycee ? e.lycee : null
  const qs: QuestionLycee[] = lyc ? lyc.questions : s.age === '5–8 ans' ? e.questions.slice(0, 1) : e.questions
  const tout = qs.every((_, k) => rep[k]?.ok)
  const noter = (k: number, ok: boolean) => {
    setPremier((p) => (k in p ? p : { ...p, [k]: ok }))
    setRep((o) => ({ ...o, [k]: { choix: -1, ok } }))
  }
  const suite = () => {
    if (lyc) {
      const bons = qs.filter((_, k) => premier[k]).length
      maj({ scores: { ...s.scores, [parcours.id]: { ...(s.scores?.[parcours.id] ?? {}), [i]: [bons, qs.length] } } })
    }
    aller('page')
  }
  return (
    <section className="scr on" id="etape">
      <Entete titre={`Étape ${i + 1} · ${e.nom.replace('Pierre ', 'La pierre ')}`} retour="plan" droite={<BoutonSon />} />
      <div className="ct" style={{ gap: 10 }}>
        <div className="bd-recit" style={{ alignSelf: 'flex-start', fontSize: 15, padding: '6px 12px' }}>{e.epoque}</div>
        <div className="bd-image plein" style={{ height: 178, flex: 'none' }}><img src={e.image} alt={'Collage : ' + e.nom} /></div>
        <div className="bd-bulle haut" style={{ marginTop: 4, padding: 0 }}><Ecoute texte={lyc ? lyc.recit : e.recit} invite={i === 0} /></div>
        {lyc && (
          <button className="bd-vignette document" onClick={() => { bip('pop'); ouvrirFeuille(<div className="document-grand"><img src={lyc.document.image} alt={lyc.document.titre} /><b>{lyc.document.titre}</b><small>{lyc.document.source}</small></div>) }}>
            <span className="bd-etiq moutarde">Document</span>
            <img src={lyc.document.image} alt={lyc.document.titre} />
            <span className="leg"><b>{lyc.document.titre}</b><small>{lyc.document.source} · touche pour agrandir</small></span>
          </button>
        )}
        {i < 2 && <div className="astuce"><span aria-hidden="true">👆</span><span>Touche <b>Écouter</b> : Ferdi te lit le texte et les questions.</span></div>}
        {qs.map((q, k) => {
          if ('t' in q && q.t === 'ordre') return <QuestionOrdreUI key={k} q={q} k={k} surReponse={(ok) => noter(k, ok)} />
          const r = rep[k]
          const choix = q as Question
          return (
            <div className="bd-question" key={k} data-k={k}>
              <Ecoute texte={choix.texte} question />
              <div className={'bd-choix-ligne' + (lyc ? ' col' : '')}>
                {choix.choix.map((c, j) => (
                  <button key={j} className={'bd-choix' + (r?.ok ? (j === choix.bonne ? ' ok' : ' non') : faux === `${k}-${j}` ? ' faux' : '')}
                    onClick={() => {
                      if (r?.ok) return
                      const ok = j === choix.bonne
                      bip(ok ? 'ok' : 'non')
                      setPremier((p) => (k in p ? p : { ...p, [k]: ok }))
                      setRep((o) => ({ ...o, [k]: { choix: j, ok } }))
                      if (!ok) { setFaux(''); requestAnimationFrame(() => setFaux(`${k}-${j}`)) }
                    }}>{c}</button>
                ))}
              </div>
              {r && <div className="retour on"><Retour ok={r.ok} texte={r.ok ? choix.bravo : choix.oups} /></div>}
            </div>
          )
        })}
        <Bouton id="go-page" son="go" disabled={!tout} style={{ minHeight: 52 }} onClick={suite}>Ouvrir la page du carnet</Bouton>
      </div>
    </section>
  )
}

export function EcranPage() {
  const { parcours, etapeCourante: i, s } = useApp()
  useEffect(() => bip('pop'), [])
  if (!parcours) return null
  const e = parcours.etapes[i]
  const indice = (s.age === 'Lycée' && e.lycee?.indice) || e.page.indice
  return (
    <section className="scr on" id="page">
      <Entete titre="Carnet de Ferdinand" retour="etape" />
      <div className="ct" style={{ gap: 12, background: '#e9dcc3' }}>
        <FeuilleCarnet e={e} i={i} lettre={false} />
        <div className="bd-postit" style={{ margin: '0 6px', padding: 0 }}>
          <Ecoute texte={'Indice de Ferdinand : ' + indice}><b className="bd-titre" style={{ fontSize: 18, display: 'block' }}>Indice de Ferdinand</b>{indice}</Ecoute>
        </div>
        <Bouton vers="jeu" son="go" id="go-jeu">Résoudre l’énigme</Bouton>
      </div>
    </section>
  )
}

export function EcranJeu() {
  const { parcours, etapeCourante: i, s, reussirEtape, aller } = useApp()
  const [retour, setRetour] = useState<{ ok: boolean; texte?: string } | null>(null)
  const essais = useRef(0)
  if (!parcours) return null
  const e = parcours.etapes[i]
  const j = (s.age === 'Lycée' && e.lycee?.jeu) || e.jeu
  const Jeu = JEUX[j.t]
  const gagne = () => {
    bip('ok')
    setRetour({ ok: true })
    setTimeout(() => { reussirEtape(i); aller('tampon') }, 1100)
  }
  const rate = (aide?: string) => {
    essais.current++
    bip('non')
    const a = 'aide' in j ? j.aide : undefined
    setRetour({ ok: false, texte: aide ?? (!difficile(s.age) && essais.current >= 2 && a ? 'Indice : ' + a : 'Encore un essai ! Relis l’indice de Ferdinand.') })
  }
  return (
    <section className="scr on" id="jeu">
      <Entete titre={'Énigme · ' + j.titre} retour="page" />
      <div className="ct" style={{ gap: 12 }}>
        <div className="bd-bulle" style={{ padding: 0 }}><Ecoute texte={j.consigne} /></div>
        <div id="jeu-zone" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* @ts-expect-error : chaque jeu reçoit sa propre forme de données */}
          <Jeu j={j} age={s.age} gagne={gagne} rate={rate} essais={essais} />
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: 12, minHeight: 44 }}>{retour && <Retour ok={retour.ok} texte={retour.texte} grand />}</div>
      </div>
    </section>
  )
}

export function Tampon() {
  const { parcours, fait, aller } = useApp()
  useEffect(() => bip('stamp'), [])
  if (!parcours) return null
  const i = Math.max(0, fait - 1)
  const e = parcours.etapes[i]
  const fin = fait >= parcours.etapes.length
  return (
    <section className="scr on" id="tampon">
      <Entete titre="Page retrouvée !" />
      <div className="ct" style={{ alignItems: 'center', textAlign: 'center', gap: 12 }}>
        <div style={{ marginTop: 6 }}><span className="bd-eclat"><span className="bd-onom">BRAVO !</span></span></div>
        <div className="bd-vignette bd-scotch" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '12px 14px' }}>
          <div className="bd-tampon slam">{e.nom.replace('Pierre ', 'PIERRE ').toUpperCase()}<small>Étape {i + 1}</small></div>
          <div className="pg-lettre slam" id="tp-lettre" style={{ animationDelay: '.35s' }}>{e.page.lettre}</div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <span className="lg">Le mot secret du carnet</span>
          <div className="mot-secret">{[...parcours.motSecret].map((c, k) => <span key={k} className={k < fait ? 'ok' : ''}>{k < fait ? c : ''}</span>)}</div>
        </div>
        {fin && (
          <div className="feuille" style={{ padding: 14, alignSelf: 'stretch' }}>
            <p className="main" style={{ margin: 0, fontSize: 26, lineHeight: '30px' }}>« {parcours.phraseFinale} »</p>
            <p className="main" style={{ margin: '6px 0 0', fontSize: 20, textAlign: 'right' }}>— Ferdinand</p>
          </div>
        )}
        <div style={{ alignSelf: 'stretch', textAlign: 'left', background: 'var(--blanc-papier)', border: '2px solid var(--encre)', borderRadius: '12px 6px 10px 5px' }}><Ecoute texte={e.defi} /></div>
        {!fin && <div className="bd-postit" style={{ textAlign: 'left', alignSelf: 'stretch', margin: '0 6px' }}><div className="bd-titre">Indice pour l’étape {i + 2}</div>{e.suite}</div>}
        <Bouton id="suivante" son="go" style={{ alignSelf: 'stretch' }} onClick={() => aller(fin ? 'fin' : 'plan')}>{fin ? 'Voir la fin du parcours' : 'Étape suivante'}</Bouton>
      </div>
    </section>
  )
}
