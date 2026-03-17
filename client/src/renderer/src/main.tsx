import './assets/styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SocketProvider } from './components/context/socket/SocketContext'
import { AuthProvider } from './components/context/authentication/AuthProvider'
import App from './App'

createRoot(document.getElementById('root') as HTMLDivElement).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
)
