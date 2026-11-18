import { FournisseurApp, useApp } from './etat'
import { Accueil, Histoire, Profil, Splash } from './ecrans/debut'
import { FicheLieu } from './ecrans/lieux'
import { Carte } from './ecrans/carte'
import { EcranEtape, EcranJeu, EcranPage, Plan, Scan, Tampon } from './ecrans/parcours'
import { Carnet, Certificat, Fin, Parent } from './ecrans/fin'
import { BandeauMiseAJour } from './pwa/BandeauMiseAJour'
import type { Ecran } from './types'

const ECRANS: Record<Ecran, () => React.ReactNode> = {
  splash: Splash, histoire: Histoire, accueil: Accueil, profil: Profil, carte: Carte, lieu: FicheLieu,
  plan: Plan, scan: Scan, etape: EcranEtape, page: EcranPage, jeu: EcranJeu, tampon: Tampon,
  fin: Fin, certificat: Certificat, carnet: Carnet, parent: Parent,
}

function Ecrans() {
  const { ecran, etapeCourante, messageToast, feuille, fermerFeuille } = useApp()
  const E = ECRANS[ecran]
  return (
    <div id="app" data-ecran={ecran}>
      {/* la clé remonte l'écran à chaque changement (animations, état des jeux remis à zéro) */}
      <E key={ecran + '-' + etapeCourante} />
      <div className={'voile' + (feuille ? ' on' : '')} onClick={fermerFeuille} />
      <div className={'sheet' + (feuille ? ' on' : '')} role="dialog" aria-modal={!!feuille}>
        {feuille}
        {feuille && <button className="bd-btn second" onClick={fermerFeuille}>Fermer</button>}
      </div>
      <div id="toast" className={messageToast ? 'on' : ''} role="status">{messageToast}</div>
      <BandeauMiseAJour />
    </div>
  )
}

export default function App() {
  return (
    <FournisseurApp>
      <Ecrans />
    </FournisseurApp>
  )
}
