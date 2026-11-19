/* Les indices de la quête de Papi : un par lieu, réunis ils mènent au trésor. */
import { useApp } from '../etat'

/** Ordre de l'enquête de Ferdinand (carte de l'intro). */
const ENQUETE = ['rouen', 'gaillard', 'gaillon', 'giverny', 'bizy']

export function IndicesTresor() {
  const { lieux, s, parcours } = useApp()
  const trouves = ENQUETE.filter((id) => s.certificats.includes(id)).length
  return (
    <div className="tresor">
      <div className="tresor-titre"><span className="bd-titre">Indices vers le trésor</span><b>{trouves} / {ENQUETE.length}</b></div>
      <div className="tresor-cases">
        {ENQUETE.map((id) => {
          const l = lieux.find((x) => x.id === id)
          const ok = s.certificats.includes(id)
          return (
            <div key={id} className={'tresor-case' + (ok ? ' ok' : '')}>
              {l && <img src={l.vignette} alt="" />}
              <span>{ok && parcours?.id === id ? parcours.motSecret : ok ? '✓' : '?'}</span>
              <small>{l?.court ?? l?.nom ?? id}</small>
            </div>
          )
        })}
      </div>
    </div>
  )
}
