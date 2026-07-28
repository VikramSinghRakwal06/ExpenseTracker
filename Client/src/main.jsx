import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.jsx'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import AntdThemeProvider from './components/AntdThemeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AntdThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AntdThemeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
