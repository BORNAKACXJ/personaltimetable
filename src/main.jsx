import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ConfigCheck from './components/ConfigCheck.jsx'

console.log('main.jsx: Starting app initialization')
console.log('main.jsx: Environment variables check:', {
  VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SPOTIFY_CLIENT_ID: !!import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  VITE_SPOTIFY_CLIENT_SECRET: !!import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
  VITE_SPOTIFY_REDIRECT_URI: !!import.meta.env.VITE_SPOTIFY_REDIRECT_URI
})

const rootElement = document.getElementById('root')
console.log('main.jsx: Root element found:', !!rootElement)

if (rootElement) {
  const root = createRoot(rootElement)
  console.log('main.jsx: React root created')
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <ConfigCheck>
          <App />
        </ConfigCheck>
      </ErrorBoundary>
    </StrictMode>,
  )
  console.log('main.jsx: App rendered')
} else {
  console.error('main.jsx: Root element not found!')
}
