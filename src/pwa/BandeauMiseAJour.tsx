import { useEffect, useState } from 'react'
import { appliquer, ecouter } from './miseAJour'

/** Bandeau « Nouvelle version disponible » (même présentation que Midheim, aux couleurs de Ferdi). */
export function BandeauMiseAJour() {
  const [e, setE] = useState({ disponible: false, enCours: false })
  useEffect(() => ecouter(setE), [])
  if (!e.disponible) return null
  return (
    <div className="updbar" role="status" aria-live="polite">
      <div className="updbar-in">
        <span className="updbar-dot" aria-hidden="true" />
        <span className="updbar-txt">
          <b>Nouvelle version disponible.</b>
          Elle s’installera à la fin de l’étape, ou maintenant.
        </span>
        <button type="button" className="updbar-btn" aria-busy={e.enCours} onClick={appliquer}>
          {e.enCours ? 'Mise à jour…' : 'Mettre à jour'}
        </button>
      </div>
    </div>
  )
}
