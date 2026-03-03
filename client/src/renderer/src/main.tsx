import './assets/styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('messages') as HTMLDivElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
