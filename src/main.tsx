import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/bd.css'
import './styles/miseajour.css'
import App from './App'
import { demarrer } from './pwa/miseAJour'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
demarrer()
