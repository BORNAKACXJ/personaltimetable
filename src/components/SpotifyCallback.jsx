import React, { useState, useEffect } from 'react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import './SpotifyCallback.css'

export default function SpotifyCallback() {
  const [step, setStep] = useState('processing')
  const [error, setError] = useState(null)
  const [redirectUrl, setRedirectUrl] = useState(null)
  const [timeoutId, setTimeoutId] = useState(null)
  
  const { handleCallback, user, topArtists, topTracks, loading, error: authError } = useSpotifyAuth()

  useEffect(() => {
    // Get authorization code from URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    const state = urlParams.get('state')

    // Check if callback was already processed
    const processed = sessionStorage.getItem('spotify_callback_processed')
    if (processed) {
      setStep('redirecting')
      setRedirectUrl('/connect-spotify')
      return
    }

    // Mark as processed
    sessionStorage.setItem('spotify_callback_processed', 'true')

    if (error) {
      setStep('error')
      setError(`Spotify authorization failed: ${error}`)
      return
    }

    if (!code) {
      setStep('error')
      setError('No authorization code received from Spotify')
      return
    }

    // Process the callback
    const processCallback = async () => {
      try {
        setStep('processing')
        await handleCallback(code)
        setStep('success')
      } catch (err) {
        setStep('error')
        setError(err.message)
      }
    }

    processCallback()

    // Set timeout for automatic redirect
    const timeout = setTimeout(() => {
      if (step === 'processing') {
        setStep('timeout')
        setRedirectUrl('/connect-spotify')
      }
    }, 10000) // 10 seconds

    setTimeoutId(timeout)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [handleCallback, step, timeoutId])

  useEffect(() => {
    if (step === 'success' && user && topArtists && topTracks) {
      // Redirect to main app after successful authentication
      const redirectUrl = '/connect-spotify'
      setRedirectUrl(redirectUrl)
      setStep('redirecting')
      
      // Small delay to show success state
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 1000)
    }
  }, [step, user, topArtists, topTracks])

  useEffect(() => {
    if (redirectUrl && step === 'redirecting') {
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 1000)
    }
  }, [redirectUrl, step])

  useEffect(() => {
    if (authError) {
      setStep('error')
      setError(authError)
    }
  }, [authError])

  const getStepContent = () => {
    switch (step) {
      case 'processing':
        return {
          title: 'Connecting to Spotify...',
          message: 'Please wait while we connect your Spotify account.',
          icon: '🔄'
        }
      case 'success':
        return {
          title: 'Successfully Connected!',
          message: 'Your Spotify account has been connected successfully.',
          icon: '✅'
        }
      case 'error':
        return {
          title: 'Connection Failed',
          message: error || 'An error occurred while connecting to Spotify.',
          icon: '❌'
        }
      case 'timeout':
        return {
          title: 'Connection Timeout',
          message: 'The connection is taking longer than expected. Redirecting...',
          icon: '⏰'
        }
      case 'redirecting':
        return {
          title: 'Redirecting...',
          message: 'Taking you to the main application.',
          icon: '🚀'
        }
      default:
        return {
          title: 'Processing...',
          message: 'Please wait.',
          icon: '⏳'
        }
    }
  }

  const content = getStepContent()

  return (
    <div className="spotify-callback">
      <div className="callback-container">
        <div className="callback-icon">{content.icon}</div>
        <h1>{content.title}</h1>
        <p>{content.message}</p>
        
        {step === 'processing' && (
          <div className="loading-spinner"></div>
        )}
        
        {step === 'error' && (
          <div className="error-actions">
            <button 
              onClick={() => window.location.href = '/connect-spotify'}
              className="retry-button"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="home-button"
            >
              Go Home
            </button>
          </div>
        )}
        
        {step === 'timeout' && (
          <div className="timeout-actions">
            <button 
              onClick={() => window.location.href = redirectUrl}
              className="redirect-button"
            >
              Continue Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 