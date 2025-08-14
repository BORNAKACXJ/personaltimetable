import { useState } from 'react'
import { logSpotifyConfig, getSpotifyRedirectUri, getSpotifyClientId } from '../utils/spotifyConfig'

export function SpotifyDebug() {
  const [debugInfo, setDebugInfo] = useState({})

  const checkSpotifyConfig = () => {
    // Log detailed configuration
    logSpotifyConfig()
    
    const config = {
      clientId: getSpotifyClientId(),
      clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET ? 'SET' : 'NOT SET',
      redirectUri: getSpotifyRedirectUri(),
      scopes: ['user-top-read'].join(' '),
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      environment: window.location.hostname === 'localhost' ? 'Development' : 'Production'
    }
    
    setDebugInfo(config)
    console.log('Spotify Debug Info:', config)
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      margin: '20px 0',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      <h3>Spotify Configuration Debug</h3>
      <button 
        onClick={checkSpotifyConfig}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Check Configuration
      </button>
      
      {Object.keys(debugInfo).length > 0 && (
        <div>
          <h4>Configuration Details:</h4>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          <h4>Common Issues & Solutions:</h4>
          <ul style={{ textAlign: 'left' }}>
            <li><strong>Environment:</strong> {debugInfo.environment} - Redirect URI: {debugInfo.redirectUri}</li>
            <li><strong>Redirect URI Mismatch:</strong> The redirect URI in your Spotify app must exactly match: {debugInfo.redirectUri}</li>
            <li><strong>Client ID/Secret:</strong> Verify these are correct in your Spotify Developer Dashboard</li>
            <li><strong>App Status:</strong> Ensure your Spotify app is not in "Development Mode" or add your email as a user</li>
          </ul>
          
          <h4>Spotify App Configuration:</h4>
          <p>Make sure your Spotify app has these redirect URIs configured:</p>
          <ul style={{ textAlign: 'left' }}>
            <li><code>http://localhost:5173/callback</code> (for development)</li>
            <li><code>https://tenfold-mpt.netlify.app/callback</code> (for production)</li>
          </ul>
        </div>
      )}
    </div>
  )
} 