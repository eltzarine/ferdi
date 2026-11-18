/* Fiche du lieu. */
import { useApp } from '../etat'
import { Bouton, Ecoute, Entete } from '../ui/commun'
import { bip } from '../lib/sons'

export function FicheLieu() {
  const { parcours, s, maj, toast } = useApp()
  if (!parcours) return null
  const vu = s.visites.includes(parcours.id)
  return (
    <section className="scr on" id="lieu">
      <Entete titre={parcours.nom} retour />
      <div className="ct">
        <div className="bd-image plein" style={{ height: 199, flex: 'none' }}><img src={parcours.fiche.image} alt={'Collage : ' + parcours.nom} /></div>
        <div className="row"><span className="bd-etiq vert">Jeu disponible</span><span className="bd-etiq">{parcours.accueil.duree}</span><span className="bd-etiq corail">{parcours.accueil.ages}</span></div>
        <div className="bd-bulle" style={{ padding: 0 }}><Ecoute texte={parcours.fiche.bulle} /></div>
        <div className="bd-vignette bd-scotch" style={{ marginTop: 12 }}><span className="bd-titre" style={{ fontSize: 20 }}>Ouverture 2026</span><p className="p" style={{ fontSize: 16, lineHeight: '22px' }}>{parcours.fiche.ouverture}</p></div>
        <Bouton vers="plan" son="go" id="lancer">Lancer le parcours</Bouton>
        <Bouton className="second" onClick={() => { const v = vu ? s.visites.filter((x) => x !== parcours.id) : [...s.visites, parcours.id]; maj({ visites: v }); bip(vu ? 'tap' : 'ok'); if (!vu) toast('Ajouté à ton carnet : « Visité »') }}>
          {vu ? '✓ Tu y es allé' : 'J’y suis allé'}
        </Bouton>
      </div>
    </section>
  )
}
