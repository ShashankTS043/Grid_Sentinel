import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App1 from './App1' // <--- CHANGED: Imports from App1

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App1 />  {/* <--- CHANGED: Renders the App1 component */}
  </StrictMode>,
)