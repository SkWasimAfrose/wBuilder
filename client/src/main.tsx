import { createRoot } from 'react-dom/client'
import './index.css' // Global styles (Tailwind + Fonts)
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom' //


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
