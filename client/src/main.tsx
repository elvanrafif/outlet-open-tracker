import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { PageTransitionProvider } from './components/PageTransition';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PageTransitionProvider>
        <App />
      </PageTransitionProvider>
    </BrowserRouter>
  </StrictMode>,
)
