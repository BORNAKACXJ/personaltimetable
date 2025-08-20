import { useEffect, useState, useRef } from 'react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { supabase } from '../lib/supabase'
import './SpotifyCallback.css'

export function SpotifyCallback() {
  const { handleCallback, loading, error, user: authUser, topArtists, topTracks } = useSpotifyAuth({ disableSupabaseSaving: true })
  const [status, setStatus] = useState('Processing...')
  const [currentStep, setCurrentStep] = useState('processing') // processing, success, error, ready
  const [user, setUser] = useState(null)
  const [callbackError, setCallbackError] = useState(null)
  const hasProcessed = useRef(false)

  useEffect(() => {
    const processCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) {
        console.log('🔄 Callback already processed, skipping')
        return
      }
      
      console.log('🚀 Starting callback processing...')
      hasProcessed.current = true
      
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')

        if (error) {
          console.error('Spotify OAuth error:', error)
          
          // Handle specific Spotify errors
          let errorMessage = ''
          if (error === 'invalid_scope') {
            errorMessage = 'Invalid scope requested. The scope "user-top-read" is required. Please check your Spotify app configuration.'
          } else if (error === 'invalid_client') {
            errorMessage = 'Invalid client ID. Please check your Spotify app configuration.'
          } else if (error === 'invalid_redirect_uri') {
            errorMessage = 'Invalid redirect URI. Please check your Spotify app configuration.'
          } else {
            errorMessage = `Spotify error: ${error}`
          }
          
          console.log('❌ Setting step to error:', errorMessage)
          setStatus(errorMessage)
          setCallbackError(errorMessage)
          setCurrentStep('error')
          return
        }

        if (!code) {
          const errorMsg = 'No authorization code received from Spotify'
          setStatus(errorMsg)
          setCallbackError(errorMsg)
          setCurrentStep('error')
          return
        }

        setStatus('Connecting to Spotify...')
        try {
          await handleCallback(code)
          console.log('✅ Spotify callback successful')
          setStatus('Successfully connected! Loading your data...')
          
          // Set a timeout to redirect even if data doesn't load
          setTimeout(() => {
            if (currentStep === 'processing') {
              console.log('⏰ Timeout reached, redirecting with available data')
              const userDataParam = user ? encodeURIComponent(JSON.stringify(user)) : ''
              const topArtistsParam = topArtists && topArtists.length > 0 ? encodeURIComponent(JSON.stringify(topArtists)) : ''
              const topTracksParam = topTracks && topTracks.length > 0 ? encodeURIComponent(JSON.stringify(topTracks)) : ''
              
              const redirectUrl = `/connect-spotify?step=success&user=${userDataParam}&artists=${topArtistsParam}&tracks=${topTracksParam}`
              console.log('🔄 Timeout redirect to:', redirectUrl)
              window.location.href = redirectUrl
            }
          }, 5000) // 5 second timeout
          
        } catch (error) {
          console.error('❌ Spotify callback error:', error)
          const errorMsg = `Authentication failed: ${error.message}`
          setStatus(errorMsg)
          setCallbackError(errorMsg)
          setCurrentStep('error')
          return
        }
        
        // TODO: Uncomment this when ready to enable direct personal timetable redirects
        /*
        // Check if user has a profile and redirect accordingly
        try {
          if (user?.id) {
            // Check if user already has a profile
            const { data: profile } = await supabase
              .from('spotify_profiles')
              .select('id')
              .eq('spotify_id', user.id)
              .single()

            if (profile?.id) {
              // User has a profile, redirect to their personal timetable
              setStatus('Redirecting to your personal timetable...')
              setTimeout(() => {
                window.location.href = `/t/${profile.id}`
              }, 2000)
            } else {
              // User doesn't have a profile, redirect to connect-spotify to create one
              setStatus('Redirecting to complete setup...')
              setTimeout(() => {
                window.location.href = '/connect-spotify'
              }, 2000)
            }
          } else {
            // Fallback to main page
            setStatus('Redirecting to timetable...')
            setTimeout(() => {
              window.location.href = '/'
            }, 2000)
          }
        } catch (profileError) {
          console.error('Error checking profile:', profileError)
          // Fallback to main page
          setStatus('Redirecting to timetable...')
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
        }
        */

      } catch (err) {
        console.error('Error processing callback:', err)
        setStatus(`Error: ${err.message}`)
      }
    }

    processCallback()
  }, []) // Remove handleCallback from dependencies since we're using useRef to prevent multiple executions

  // Debug step changes
  useEffect(() => {
    console.log('🎯 Step changed to:', currentStep)
  }, [currentStep])

  // Watch for data changes and redirect when ready
  useEffect(() => {
    console.log('🔍 Data change detected:', {
      currentStep,
      hasUser: !!user,
      userId: user?.id,
      userName: user?.display_name,
      topArtistsLength: topArtists?.length || 0,
      topTracksLength: topTracks?.length || 0,
      firstArtist: topArtists?.[0]?.name,
      firstTrack: topTracks?.[0]?.name
    })
    
    // Check if we have enough data to redirect
    const hasValidUser = user && user.id
    const hasAnyData = (topArtists && topArtists.length > 0) || (topTracks && topTracks.length > 0)
    
    if (currentStep === 'processing' && hasValidUser && hasAnyData) {
      console.log('🎯 Data loaded, redirecting to ConnectSpotify')
      console.log('🎯 User data:', user)
      console.log('🎯 Top artists:', topArtists?.length || 0)
      console.log('🎯 Top tracks:', topTracks?.length || 0)
      
      // Redirect to ConnectSpotify with success step and user data
      const userDataParam = encodeURIComponent(JSON.stringify(user))
      const topArtistsParam = topArtists && topArtists.length > 0 ? encodeURIComponent(JSON.stringify(topArtists)) : ''
      const topTracksParam = topTracks && topTracks.length > 0 ? encodeURIComponent(JSON.stringify(topTracks)) : ''
      
      const redirectUrl = `/connect-spotify?step=success&user=${userDataParam}&artists=${topArtistsParam}&tracks=${topTracksParam}`
      console.log('🔄 Redirecting to:', redirectUrl)
      window.location.href = redirectUrl
    } else if (currentStep === 'processing') {
      console.log('⏳ Still waiting for data:', {
        hasValidUser,
        hasAnyData,
        userExists: !!user,
        userId: user?.id
      })
    }
  }, [currentStep, user, topArtists, topTracks])



  const handleRetry = () => {
    window.location.href = '/'
  }

  // Processing Step
  if (currentStep === 'processing') {
    return (
      <div className="spotify-callback processing">
        <div className="callback-step">
          <h2>Processing Authorization</h2>
          <div className="status-info">
            <p>{status}</p>
          </div>
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error Step
  if (currentStep === 'error') {
    return (
      <div className="spotify-callback error">
        <div className="callback-step">
          <h2>Step 1: Authorization Failed</h2>
          <div className="status-info">
            <p className="error-message">{callbackError || status}</p>
          </div>
          <div className="step-actions">
            <button className="btn-retry" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }





  return null
} 