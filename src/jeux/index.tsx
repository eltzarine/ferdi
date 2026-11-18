/* Les mini-jeux. Chacun reçoit ses données (champ « jeu » de l'étape) et appelle gagne() ou rate(). */
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import type { Age, Jeu } from '../types'
import { bip } from '../lib/sons'
import { cibleTouchee, clavier, lettresDonnees, melanger, motSaisi, puzzleDepart, puzzleResolu, taillePuzzle } from '../lib/regles'
import { useApp } from '../etat'

type P<T extends Jeu['t']> = { j: Extract<Jeu, { t: T }>; age: Age; gagne: () => void; rate: (aide?: string) => void; essais: MutableRefObject<number> }

function Mot({ j, age, gagne, rate }: P<'mot'>) {
  const donnees = useMemo(() => lettresDonnees(j.mot, j.donne, age), [j, age])
  const touches = useMemo(() => clavier(j.mot, donnees, j.extra, age), [j, donnees, age])
  const nbVides = j.mot.length - donnees.size
  const [saisie, setSaisie] = useState<number[]>([])
  const [etat, setEtat] = useState<'' | 'ok' | 'faux'>('')
  useEffect(() => {
    if (saisie.length !== nbVides) return
    const m = motSaisi(j.mot, donnees, saisie.map((k) => touches[k]))
    if (m === j.mot) { setEtat('ok'); gagne() }
    else { setEtat('faux'); rate(); const t = setTimeout(() => { setEtat(''); setSaisie([]) }, 900); return () => clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saisie])
  let k = 0
  return (
    <>
      <div className={'bd-lettres' + (j.mot.length > 8 ? ' petit' : '') + (etat ? ' ' + etat : '')} id="slots">
        {[...j.mot].map((c, i) => {
          if (donnees.has(i)) return <span key={i} className="fixe">{c}</span>
          const s = saisie[k++]
          return <span key={i} className={s !== undefined ? 'pl' : ''}>{s !== undefined ? touches[s] : ''}</span>
        })}
      </div>
      <div className="clavier">
        {touches.map((l, i) => (
          <button key={i} data-i={i} className={saisie.includes(i) ? 'used' : ''} onClick={() => { if (saisie.length < nbVides && !saisie.includes(i)) { bip('tap'); setSaisie((s) => [...s, i]) } }}>{l}</button>
        ))}
        <button className="eff" style={{ gridColumn: 'span 5' }} onClick={() => { bip('tap'); setSaisie((s) => s.slice(0, -1)) }}>⌫ Effacer</button>
      </div>
    </>
  )
}

function Code({ j, gagne, rate }: P<'code'>) {
  const [v, setV] = useState('')
  const [etat, setEtat] = useState<'' | 'ok' | 'faux'>('')
  const touche = (k: string) => {
    bip('tap')
    if (k === '⌫') setV((x) => x.slice(0, -1))
    else if (k === 'OK') {
      if (v === j.code) { setEtat('ok'); gagne() }
      else { setEtat('faux'); rate(); setTimeout(() => { setEtat(''); setV('') }, 900) }
    } else if (v.length < j.code.length) setV((x) => x + k)
  }
  return (
    <>
      <div className="cadenas">
        <div className="bd-titre" style={{ fontSize: 20 }}>🔒 Cadenas</div>
        <div className={'bd-lettres' + (etat ? ' ' + etat : '')} id="code">{[...j.code].map((_, i) => <span key={i} className={v[i] ? 'pl' : ''}>{v[i] ?? ''}</span>)}</div>
      </div>
      <div className="clavier pave">{['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].map((k) => <button key={k} data-k={k} onClick={() => touche(k)}>{k}</button>)}</div>
    </>
  )
}

function Photo({ gagne }: P<'photo'>) {
  const { toast } = useApp()
  const v = useRef<HTMLVideoElement>(null)
  const flux = useRef<MediaStream | null>(null)
  const [img, setImg] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  useEffect(() => () => flux.current?.getTracks().forEach((t) => t.stop()), [])
  const ouvrir = async () => {
    try {
      flux.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      v.current!.srcObject = flux.current
      v.current!.play()
    } catch { toast('Appareil photo non disponible ici : touche « Prendre la photo »') }
  }
  const clic = () => {
    setFlash(true)
    bip('stamp')
    const x = v.current!
    if (flux.current && x.videoWidth) {
      const c = document.createElement('canvas')
      c.width = x.videoWidth
      c.height = x.videoHeight
      c.getContext('2d')!.drawImage(x, 0, 0)
      setImg(c.toDataURL('image/jpeg', 0.7))
      flux.current.getTracks().forEach((t) => t.stop())
      flux.current = null
    } else setImg('sites/vignettes/t_gaillard.jpg')
    setTimeout(gagne, 600)
  }
  return (
    <>
      <div className="bd-image" style={{ height: 300, position: 'relative', overflow: 'hidden', background: '#2e2925', color: '#e8dfd0' }}>
        <video className="cam" ref={v} playsInline muted />
        {img && <img className="cam" src={img} alt="Ta photo" />}
        {!img && !flux.current && <span style={{ position: 'relative', textAlign: 'center', padding: '0 24px' }}>Touche « Ouvrir l’appareil photo »</span>}
        <div className="viseur" style={{ width: 180, height: 120, margin: '-60px 0 0 -90px' }} />
        <div className={'flash' + (flash ? ' on' : '')} />
      </div>
      <button className="bd-btn ciel" onClick={ouvrir}>Ouvrir l’appareil photo</button>
      <button className="bd-btn" id="pclic" onClick={clic}>📸 Prendre la photo</button>
    </>
  )
}

function Cherche({ j, gagne }: P<'cherche'>) {
  const [trouves, setTrouves] = useState<string[]>([])
  const [marques, setMarques] = useState<{ x: number; y: number; ok: boolean; id: number }[]>([])
  const box = useRef<HTMLDivElement>(null)
  const clic = (ev: React.MouseEvent) => {
    const r = box.current!.getBoundingClientRect()
    const x = (ev.clientX - r.left) / r.width
    const y = (ev.clientY - r.top) / r.height
    const restantes = Object.keys(j.cibles).filter((k) => !trouves.includes(k))
    const hit = cibleTouchee(x, y, j.cibles, restantes, r.height / r.width)
    const id = Date.now()
    setMarques((m) => [...m, { x, y, ok: !!hit, id }])
    if (hit) {
      bip('ok')
      const t = [...trouves, hit]
      setTrouves(t)
      if (t.length === Object.keys(j.cibles).length) gagne()
    } else {
      bip('non')
      setTimeout(() => setMarques((m) => m.filter((k) => k.id !== id)), 600)
    }
  }
  return (
    <>
      <div className="row" style={{ justifyContent: 'center' }}>{Object.keys(j.cibles).map((k) => <span key={k} className={'bd-etiq' + (trouves.includes(k) ? ' vert' : '')}>{k}</span>)}</div>
      <div className="cherche" ref={box} onClick={clic}>
        <img src={j.img} alt="Gravure du jardin d’autrefois avec des buis cachés" />
        {marques.map((m) => <i key={m.id} className={'marque' + (m.ok ? ' ok' : '')} style={{ left: m.x * 100 + '%', top: m.y * 100 + '%' }} />)}
      </div>
      <span className="lg" style={{ textAlign: 'center' }}>Touche l’image à l’endroit où tu vois un buis taillé.</span>
    </>
  )
}

function Relie({ j, gagne, rate }: P<'relie'>) {
  const { toast } = useApp()
  const metiers = useMemo(() => melanger([...j.paires.map((p) => p[1]), ...j.intrus]), [j])
  const [sel, setSel] = useState<string | null>(null)
  const [ok, setOk] = useState<string[]>([])
  const [faux, setFaux] = useState('')
  const essais = useRef(0)
  return (
    <div className="relie">
      <div>{j.paires.map(([n, m]) => <button key={n} className={'bd-choix nom' + (ok.includes(n) ? ' ok' : sel === n ? ' sel' : '')} onClick={() => { if (!ok.includes(n)) { bip('tap'); setSel(n) } }}>{ok.includes(n) ? `${n} → ${m}` : n}</button>)}</div>
      <div>{metiers.map((m) => (
        <button key={m} className={'bd-choix met' + (j.paires.some((p) => p[1] === m && ok.includes(p[0])) ? ' ok' : faux === m ? ' faux' : '')} onClick={() => {
          if (!sel) { toast('Touche d’abord un nom !'); return }
          const p = j.paires.find((x) => x[0] === sel)!
          if (p[1] === m) { const o = [...ok, sel]; setOk(o); setSel(null); bip('ok'); if (o.length === j.paires.length) gagne() }
          else { setFaux(''); requestAnimationFrame(() => setFaux(m)); rate(essais.current++ >= 1 ? 'Indice : Le Nôtre dessinait les jardins.' : 'Pas ce métier-là !') }
        }}>{m}</button>
      ))}</div>
    </div>
  )
}

function Puzzle({ j, age, gagne }: P<'puzzle'>) {
  const n = taillePuzzle(age)
  const [ordre, setOrdre] = useState(() => puzzleDepart(n))
  const [sel, setSel] = useState<number | null>(null)
  const fini = puzzleResolu(ordre)
  const clic = (i: number) => {
    if (fini) return
    if (sel === null) { setSel(i); bip('tap'); return }
    const o = [...ordre]
    ;[o[sel], o[i]] = [o[i], o[sel]]
    setOrdre(o)
    setSel(null)
    bip('pop')
    if (puzzleResolu(o)) gagne()
  }
  return (
    <div className={'puzzle' + (fini ? ' fini' : '')} style={{ gridTemplateColumns: `repeat(${n},1fr)` }}>
      {ordre.map((v, i) => (
        <button key={i} data-i={i} data-v={v} className={sel === i ? 'sel' : ''} onClick={() => clic(i)}
          style={{ backgroundImage: `url(${j.img})`, backgroundSize: `${n * 100}% ${n * 100}%`, backgroundPosition: `${((v % n) / (n - 1)) * 100}% ${(Math.floor(v / n) / (n - 1)) * 100}%` }} />
      ))}
    </div>
  )
}

export const JEUX = { mot: Mot, code: Code, photo: Photo, cherche: Cherche, relie: Relie, puzzle: Puzzle }
