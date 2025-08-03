import { useEffect, useState } from 'react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'

export function SpotifyCallback() {
  const { handleCallback, loading, error } = useSpotifyAuth()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')

        if (error) {
          console.error('Spotify OAuth error:', error)
          
          // Handle specific Spotify errors
          if (error === 'invalid_scope') {
            setStatus('Error: Invalid scope requested. Please check your Spotify app configuration.')
          } else if (error === 'invalid_client') {
            setStatus('Error: Invalid client ID. Please check your Spotify app configuration.')
          } else if (error === 'invalid_redirect_uri') {
            setStatus('Error: Invalid redirect URI. Please check your Spotify app configuration.')
          } else {
            setStatus(`Error: ${error}`)
          }
          return
        }

        if (!code) {
          setStatus('No authorization code received')
          return
        }

        setStatus('Connecting to Spotify...')
        await handleCallback(code)
        setStatus('Success! Redirecting...')

        // Redirect back to main page after successful authentication
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)

      } catch (err) {
        console.error('Error processing callback:', err)
        setStatus(`Error: ${err.message}`)
      }
    }

    processCallback()
  }, [handleCallback])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'monospace'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #1DB954',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>Connecting to Spotify</h2>
        <p>{status}</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'monospace'
      }}>
        <h2>Connection Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h2>Spotify Connected!</h2>
      <p>{status}</p>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        backgroundColor: '#1DB954',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <span style={{ color: 'white', fontSize: '24px' }}>✓</span>
      </div>
    </div>
  )
} 