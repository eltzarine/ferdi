import type { CapacitorConfig } from '@capacitor/cli'

/* Version mobile : le même code React, emballé en appli iOS et Android.
   npx cap add ios / npx cap add android (quand on passera aux stores), puis npm run build && npx cap sync */
const config: CapacitorConfig = {
  appId: 'fr.ferdi.app',
  appName: 'Ferdi',
  webDir: 'dist',
  backgroundColor: '#1e1b18',
}

export default config
