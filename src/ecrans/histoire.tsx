/* Intro : l'histoire de Ferdi, chasseur d'Histoire, en 7 cartes. « Suivant » passe à la carte
   suivante, joue un bruitage et lit la réplique. Les voix ElevenLabs remplaceront la voix du navigateur. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useApp } from '../etat'
import { bip } from '../lib/sons'
import { arreter, lire, lireSuite } from '../lib/voix'
import { SCENES } from './histoireScenes'
import '../styles/intro.css'

type Replique = { qui: 'ferdi' | 'ferdinand'; texte: string }
type CarteHistoire = { dialogue: Replique; reaction?: string }

const CARTES: CarteHistoire[] = [
  { dialogue: { qui: 'ferdi', texte: 'Le grenier de Mamie Jo, c’est mon repaire. Ça sent la poussière… et les vieux secrets.' } },
  { dialogue: { qui: 'ferdi', texte: 'Un coffre que j’avais jamais vu… Et dedans, un carnet. Ferdinand Lemoine. Ferdinand, comme moi… c’est Papi !' } },
  {
    dialogue: { qui: 'ferdinand', texte: '« Si tu lis ces lignes, c’est que le carnet t’a trouvé. J’espère que c’est toi, mon petit Ferdinand. Toute ma vie, j’ai cherché un trésor : pas de l’or ni des bijoux, quelque chose de bien plus précieux, que l’Histoire a oublié. »' },
    reaction: 'Papi… chasseur de trésor ?!',
  },
  { dialogue: { qui: 'ferdinand', texte: '« Mes recherches m’ont mené dans plusieurs lieux. Dans chacun, j’ai découvert un indice. Je ne les ai pas écrits en clair : pour chaque lieu, je t’ai laissé une énigme et un dessin. »' } },
  {
    dialogue: { qui: 'ferdinand', texte: '« Résous l’énigme, observe bien, et tu trouveras l’indice sur place. Un indice seul ne dit rien. Réunis-les tous, et ils te mèneront au trésor. »' },
    reaction: 'Il a transformé sa quête en jeu de piste…',
  },
  {
    dialogue: { qui: 'ferdinand', texte: '« Ouvre l’œil, sois curieux, et n’oublie jamais : l’Histoire ne se raconte qu’à ceux qui la cherchent. »' },
    reaction: 'Cinq énigmes, cinq indices… un trésor !',
  },
  { dialogue: { qui: 'ferdi', texte: '' }, reaction: 'Je vais finir la quête de Papi. Tu viens avec moi ?' },
]

const Haut = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e1b18" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9v6h4l5 4V5L8 9H4z" fill="#fffdf8" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" />
  </svg>
)
const Fleche = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
)

/** Met la carte de 390 × 844 à l'échelle de l'écran disponible, centrée. */
function useEchelle() {
  const ref = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const calc = () => setK(Math.min(el.clientWidth / 390, el.clientHeight / 844))
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, k }
}

export function Histoire() {
  const { aller, apresHistoire, maj } = useApp()
  const [n, setN] = useState(0)
  const [parle, setParle] = useState<string | null>(null)
  const { ref, k } = useEchelle()
  const c = CARTES[n]
  const derniere = n === CARTES.length - 1
  /* réplique puis réaction, chacune avec sa voix (Ferdinand ou Ferdi) */
  const texteLu = (i: number) => {
    const x = CARTES[i]
    return [x.dialogue.texte, x.reaction ?? ''].filter(Boolean)
  }
  const ecouter = (id: string, texte: string) => lire(texte, (p) => setParle(p ? id : null))
  const raconter = (i: number) => lireSuite(texteLu(i), (p) => setParle(p ? 'd' + i : null))

  /* la première carte se lit dès l'ouverture (le joueur vient de toucher « Explorer ») */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { raconter(0); return () => arreter() }, [])

  const fin = () => { arreter(); maj({ histoireVue: true }); aller(apresHistoire) }
  const suivant = () => {
    if (derniere) { bip('go'); fin(); return }
    bip('pop')
    const i = n + 1
    setN(i)
    raconter(i)
  }

  return (
    <section className="scr on" id="histoire" style={{ padding: 0 }}>
      {/* zone sous la barre d'état de l'iPhone (heure, batterie) : la carte s'y met à l'échelle */}
      <div ref={ref} style={{ position: 'absolute', left: 0, right: 0, top: 'var(--haut, 0px)', bottom: 0 }}>
      <div
        className="ih-scr"
        style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${k})` }}
      >
        <div key={n} className="ih-scene" dangerouslySetInnerHTML={{ __html: SCENES[n] }} />
        <div className="ih-barre">
          <div className="ih-l">
            <span className="ih-lab">Intro · {n + 1} / {CARTES.length}</span>
            <button id="passer" className="ih-passer" onClick={() => { bip('tap'); fin() }}>Passer</button>
          </div>
          <div className="ih-prog">{CARTES.map((_, i) => <i key={i} className={i <= n ? 'ih-on' : ''} />)}</div>
        </div>
        <div className="ih-bas" key={'b' + n}>
          {c.dialogue.texte && (
            <div className={'ih-dia' + (c.dialogue.qui === 'ferdinand' ? ' ih-ferdinand' : '')}>
              <span className="ih-qui">{c.dialogue.qui === 'ferdinand' ? 'Ferdinand · voix' : 'Ferdi'}</span>
              <p>{c.dialogue.texte}</p>
              <button className={'ih-spk' + (parle === 'd' + n ? ' parle' : '')} aria-label="Écouter la réplique" onClick={() => { bip('tap'); ecouter('d' + n, c.dialogue.texte) }}><Haut /></button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
            {c.reaction ? (
              <button className="ih-rep" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer' }}
                onClick={() => { bip('tap'); ecouter('r' + n, c.reaction!) }} aria-label={'Écouter Ferdi : ' + c.reaction}>
                <img src="ferdi/ferdi_m1.png" alt="" />
                <span className="ih-bulle">{c.reaction}</span>
              </button>
            ) : <span />}
            {!derniere && <button id="suivant" className="ih-suivant" onClick={suivant}>Suivant <Fleche /></button>}
          </div>
          {derniere && <button id="suivant" className="ih-suivant ih-grand" onClick={suivant}>C’EST PARTI ! <Fleche /></button>}
        </div>
      </div>
      </div>
    </section>
  )
}
