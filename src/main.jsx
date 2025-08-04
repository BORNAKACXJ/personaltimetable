import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ConfigCheck from './components/ConfigCheck.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ConfigCheck>
        <App />
      </ConfigCheck>
    </ErrorBoundary>
  </StrictMode>,
)
