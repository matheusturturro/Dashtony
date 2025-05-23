import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Testando se a variável do .env está funcionando
//console.log("Firebase API Key:", import.meta.env.VITE_FIREBASE_API_KEY)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
