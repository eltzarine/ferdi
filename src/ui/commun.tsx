/* Composants communs du design system BD. */
import { useState, type CSSProperties, type ReactNode } from 'react'
import { ICONES, type NomIcone } from '../lib/icones'
import { lire } from '../lib/voix'
import { bip, type Son } from '../lib/sons'
import { useApp } from '../etat'
import type { Ecran } from '../types'

export function Icone({ nom }: { nom: NomIcone }) {
  return <span style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: ICONES[nom] }} />
}

/** Texte que Ferdi lit à voix haute quand on touche « Écouter ». */
export function Ecoute({ texte, children, invite, question, style }: { texte: string; children?: ReactNode; invite?: boolean; question?: boolean; style?: CSSProperties }) {
  const { s, toast } = useApp()
  const [parle, setParle] = useState(false)
  const clic = () => {
    if (!s.voix || !lire(texte, setParle)) toast('🔊 « ' + texte + ' »')
  }
  return (
    <button className={'ecoute' + (parle ? ' parle' : '')} style={question ? { padding: 0, ...style } : style} onClick={clic} aria-label={'Écouter : ' + texte}>
      <span className={'spk' + (invite ? ' invite' : '')}>
        <Icone nom="SPK" />
        Écouter
      </span>
      <span className={question ? 'q' : undefined} style={{ flex: 1, textAlign: 'left' }}>
        {children ?? texte}
      </span>
    </button>
  )
}

export function Entete({ titre, retour, droite }: { titre: ReactNode; retour?: Ecran | true; droite?: ReactNode }) {
  const { aller, retour: precedent } = useApp()
  return (
    <header className="bd-bandeau">
      {retour && (
        <button aria-label="Retour" onClick={() => { bip('tap'); if (retour === true) precedent(); else aller(retour) }}>
          <Icone nom="BACK" />
        </button>
      )}
      <span className="bd-titre">{titre}</span>
      {droite}
    </header>
  )
}

export function BoutonSon() {
  const { s, maj, toast } = useApp()
  return (
    <button aria-label="Bruitages" style={{ opacity: s.sfx ? 1 : 0.4 }} onClick={() => { maj({ sfx: !s.sfx }); toast(s.sfx ? '🔇 Bruitages coupés' : '🔊 Bruitages activés') }}>
      <Icone nom="SND" />
    </button>
  )
}

export function Bouton({ children, vers, son = 'tap', className = '', ...p }: { children: ReactNode; vers?: Ecran; son?: Son } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { aller } = useApp()
  return (
    <button
      {...p}
      className={'bd-btn ' + className}
      onClick={(e) => {
        bip(son)
        if (p.onClick) p.onClick(e)
        else if (vers) aller(vers)
      }}
    >
      {children}
    </button>
  )
}

export function Nav({ actif }: { actif: 'carte' | 'carnet' | 'parent' }) {
  const { aller } = useApp()
  const liens: [Ecran, string, NomIcone][] = [['carte', 'Carte', 'MAP'], ['carnet', 'Carnet', 'BOOK'], ['parent', 'Parent', 'USER']]
  return (
    <nav className="bd-nav" aria-label="Navigation principale">
      {liens.map(([e, l, i]) => (
        <a key={e} className={e === actif ? 'on' : ''} onClick={() => { bip('tap'); aller(e) }}>
          <Icone nom={i} />
          <span>{l}</span>
        </a>
      ))}
    </nav>
  )
}

export function Cases({ n, total = 8, encours = true }: { n: number; total?: number; encours?: boolean }) {
  return (
    <div className="bd-cases">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < n ? 'ok' : encours && i === n ? 'encours' : ''} />
      ))}
    </div>
  )
}

/** Retour BRAVO / OUPS après une réponse ou une énigme. */
export function Retour({ ok, texte, grand }: { ok: boolean; texte?: string; grand?: boolean }) {
  return (
    <>
      <span className={'bd-onom' + (ok ? '' : ' oups')} style={grand ? { fontSize: 40, lineHeight: '40px' } : undefined}>
        {ok ? 'BRAVO !' : 'OUPS !'}
      </span>
      {texte && <span className={grand ? 'lg' : 'rt'} style={grand ? { maxWidth: 190 } : undefined}>{texte}</span>}
    </>
  )
}
