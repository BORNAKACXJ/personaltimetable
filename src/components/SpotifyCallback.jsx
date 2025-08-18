import { useEffect, useState, useRef } from 'react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'

export function SpotifyCallback() {
  const { handleCallback, loading, error } = useSpotifyAuth()
  const [status, setStatus] = useState('Processing...')
  const hasProcessed = useRef(false)

  useEffect(() => {
    const processCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) {
        console.log('Callback already processed, skipping')
        return
      }
      
      hasProcessed.current = true
      
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')

        if (error) {
          console.error('Spotify OAuth error:', error)
          
          // Handle specific Spotify errors
          if (error === 'invalid_scope') {
            setStatus('Error: Invalid scope requested. The scope "user-top-read" is required. Please check your Spotify app configuration.')
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
        try {
          await handleCallback(code)
          setStatus('Success! Redirecting...')
        } catch (error) {
          console.error('Callback error:', error)
          setStatus(`Error: ${error.message}`)
          return
        }

        // Redirect to ConnectSpotify page to show top artists/tracks
        setTimeout(() => {
          window.location.href = '/connect-spotify'
        }, 2000)

      } catch (err) {
        console.error('Error processing callback:', err)
        setStatus(`Error: ${err.message}`)
      }
    }

    processCallback()
  }, []) // Remove handleCallback from dependencies since we're using useRef to prevent multiple executions

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
          onClick={() => window.location.href = '/connect-spotify'}
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
          Continue to Spotify Setup
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
      <button 
        onClick={() => window.location.href = '/connect-spotify'}
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
        Continue to Spotify Setup
      </button>
    </div>
  )
} 