import React from 'react'

const ConfigCheck = ({ children }) => {
  const missingVars = []
  
  if (!import.meta.env.VITE_SUPABASE_URL) {
    missingVars.push('VITE_SUPABASE_URL')
  }
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    missingVars.push('VITE_SUPABASE_ANON_KEY')
  }
  if (!import.meta.env.VITE_SPOTIFY_CLIENT_ID) {
    missingVars.push('VITE_SPOTIFY_CLIENT_ID')
  }
  if (!import.meta.env.VITE_SPOTIFY_CLIENT_SECRET) {
    missingVars.push('VITE_SPOTIFY_CLIENT_SECRET')
  }

  if (missingVars.length > 0) {
    console.log('Missing environment variables:', missingVars)
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        background: '#f8f9fa'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Configuration Required</h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            This application requires environment variables to be configured. The following variables are missing:
          </p>
          <ul style={{ 
            textAlign: 'left', 
            marginBottom: '20px',
            color: '#dc3545',
            fontWeight: 'bold'
          }}>
            {missingVars.map((varName, index) => (
              <li key={index}>{varName}</li>
            ))}
          </ul>
          <div style={{ 
            background: '#e9ecef', 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>How to fix:</h4>
            <ol style={{ margin: '0', paddingLeft: '20px', color: '#495057' }}>
              <li>Go to your Netlify dashboard</li>
              <li>Navigate to Site settings → Environment variables</li>
              <li>Add the missing environment variables</li>
              <li>Redeploy your site</li>
            </ol>
          </div>
          <p style={{ fontSize: '0.9em', color: '#6c757d', fontStyle: 'italic' }}>
            Note: Some features may not work without these environment variables, but the app will still load.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default ConfigCheck 