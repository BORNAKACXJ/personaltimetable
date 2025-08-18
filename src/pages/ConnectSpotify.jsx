import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getSpotifyRedirectUri, getSpotifyClientId, logSpotifyConfig } from '../utils/spotifyConfig'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import './ConnectSpotify.css'

export default function ConnectSpotify() {
  const [step, setStep] = useState('connect') // connect, success, data, loading, complete
  const [spotifyUser, setSpotifyUser] = useState(null)
  const [topArtists, setTopArtists] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [profileId, setProfileId] = useState(null)

  // Spotify OAuth configuration
  const CLIENT_ID = getSpotifyClientId()
  const REDIRECT_URI = getSpotifyRedirectUri() // This will be http://localhost:5173/callback
  const SCOPES = 'user-top-read'

  // Use existing Spotify auth hook (handles token exchange and fetching)
  const {
    user: authUser,
    topArtists: authTopArtists,
    topTracks: authTopTracks,
    isAuthenticated,
    loading: authLoading,
    error: authError,
    login,
    handleCallback: authHandleCallback,
    fetchTopArtists: fetchTopArtistsHook,
    fetchTopTracks: fetchTopTracksHook
  } = useSpotifyAuth()

  // Check if user already has a personal timetable
  const checkExistingProfile = async (spotifyId) => {
    try {
      const { data, error } = await supabase
        .from('spotify_profiles')
        .select('id')
        .eq('spotify_id', spotifyId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing profile:', error)
        return null
      }

      return data?.id || null
    } catch (err) {
      console.error('Error checking existing profile:', err)
      return null
    }
  }

  useEffect(() => {
    // Log configuration on component mount
    console.log('🎵 ConnectSpotify Component Mounted')
    logSpotifyConfig()
    
    // Check if we're returning from Spotify OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      console.error('Spotify OAuth Error:', error)
      setError('Spotify authorization failed: ' + error)
      setStep('connect')
    } else if (code) {
      console.log('Spotify OAuth Code received:', code)
      authHandleCallback(code)
    } else {
      // If no code or error, we're on the initial connect page
      console.log('On initial connect page - no OAuth callback detected')
    }
  }, [])

  // Sync local UI state with hook state after auth
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  useEffect(() => {
    if (isAuthenticated && authUser) {
      // Always show the success step with user's data after auth
      if (!spotifyUser) {
        setSpotifyUser(authUser)
      }
      if (authTopArtists && authTopArtists.length) {
        setTopArtists(authTopArtists.slice(0, 5))
      }
      if (authTopTracks && authTopTracks.length) {
        setTopTracks(authTopTracks.slice(0, 5))
      }
      if ((authTopArtists && authTopArtists.length) || (authTopTracks && authTopTracks.length)) {
        setStep('success')
      } else {
        // If not loaded yet, fetch minimal lists
        Promise.all([
          fetchTopArtistsHook('short_term', 5),
          fetchTopTracksHook('short_term', 5)
        ]).then(([artists, tracks]) => {
          setTopArtists((artists || []).slice(0, 5))
          setTopTracks((tracks || []).slice(0, 5))
          setStep('success')
        }).catch(() => {})
      }
    }
  }, [isAuthenticated, authUser, authTopArtists, authTopTracks, fetchTopArtistsHook, fetchTopTracksHook])

  // Deprecated local handler removed; auth is handled via useSpotifyAuth

  const connectSpotify = () => {
    // Log current Spotify configuration for debugging
    logSpotifyConfig()
    
    // Validate required configuration
    if (!CLIENT_ID) {
      setError('Spotify Client ID is not configured. Please check your environment variables.')
      return
    }
    
    // Delegate to shared auth hook (uses user-top-read scope internally)
    login()
  }

  const createPersonalTimetable = async () => {
    try {
      setLoading(true)
      setError(null)
      setStep('loading')

      // If user already has a profile, use it; otherwise create one
      let newProfileId = await checkExistingProfile(authUser?.id || spotifyUser?.id)
      if (!newProfileId) {
        // Generate a unique profile ID
        newProfileId = crypto.randomUUID()

        // Save profile to Supabase
        const { error: profileError } = await supabase
          .from('spotify_profiles')
          .insert({
            id: newProfileId,
            spotify_id: (authUser?.id || spotifyUser?.id),
            display_name: (authUser?.display_name || spotifyUser?.display_name)
          })

        if (profileError) {
          throw new Error(`Failed to save profile: ${profileError.message}`)
        }

        // Save top artists
        if (topArtists.length > 0) {
          const artistsToInsert = topArtists.map(artist => ({
            spotify_profile_id: newProfileId,
            spotify_artist_id: artist.id,
            genres: artist.genres || []
          }))

          const { error: artistsError } = await supabase
            .from('user_top_artists')
            .insert(artistsToInsert)

          if (artistsError) {
            throw new Error(`Failed to save top artists: ${artistsError.message}`)
          }
        }

        // Save top tracks
        if (topTracks.length > 0) {
          const tracksToInsert = topTracks.map(track => ({
            spotify_profile_id: newProfileId,
            artist_spotify_id: track.artists[0]?.id
          }))

          const { error: tracksError } = await supabase
            .from('user_top_tracks')
            .insert(tracksToInsert)

          if (tracksError) {
            throw new Error(`Failed to save top tracks: ${tracksError.message}`)
          }
        }
      }

      setProfileId(newProfileId)
      setStep('complete')

      // Redirect to personal timetable after a short delay
      setTimeout(() => {
        window.location.href = `/t/${newProfileId}`
      }, 2000)

    } catch (err) {
      setError(err.message)
      setStep('success')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'connect':
        return (
          <div className="connect-step">
            <h2>Connect Your Spotify Account</h2>
            <p>To create your personal timetable, we need to connect to your Spotify account to see your music preferences.</p>
            <button 
              onClick={connectSpotify}
              disabled={loading}
              className="spotify-connect-btn"
            >
              {loading ? 'Connecting...' : '🎵 Connect with Spotify'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        )

      case 'success':
        return (
          <div className="success-step">
            <h2>Successfully Connected!</h2>
            <p>We've successfully connected to your Spotify account.</p>
            
            <div className="user-data">
              <h3>Your Top 5 Artists</h3>
              <div className="artists-list">
                {topArtists.map((artist, index) => (
                  <div key={artist.id} className="artist-item">
                    <img src={artist.images[0]?.url} alt={artist.name} />
                    <div>
                      <h4>{index + 1}. {artist.name}</h4>
                      <p>{artist.genres?.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3>Your Top 5 Tracks</h3>
              <div className="tracks-list">
                {topTracks.map((track, index) => (
                  <div key={track.id} className="track-item">
                    <img src={track.album.images[0]?.url} alt={track.name} />
                    <div>
                      <h4>{index + 1}. {track.name}</h4>
                      <p>{track.artists[0]?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={createPersonalTimetable}
              className="create-timetable-btn"
            >
              Yes, let's create personal timetable
            </button>
          </div>
        )

      case 'loading':
        return (
          <div className="loading-step">
            <h2>Creating Your Personal Timetable</h2>
            <div className="loading-spinner"></div>
            <p>Saving your music preferences and generating recommendations...</p>
          </div>
        )

      case 'complete':
        return (
          <div className="complete-step">
            <h2>🎉 Personal Timetable Created!</h2>
            <p>Your personal timetable has been created successfully!</p>
            <p>Redirecting you to your personalized experience...</p>
            <div className="profile-id">
              <strong>Profile ID:</strong> {profileId}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="connect-spotify-page">
      <div className="container">
        <div className="header">
          <a href="/" className="back-link">← Back to Timetable</a>
          <h1>Create Your Personal Timetable</h1>
        </div>

        <div className="content">
          {renderStep()}
          
          {/* Debug Section */}
          <div className="debug-section" style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>🔧 Debug Information</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              <p><strong>Client ID:</strong> {CLIENT_ID ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Redirect URI:</strong> {REDIRECT_URI}</p>
              <p><strong>Scopes:</strong> {SCOPES}</p>
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>Current Path:</strong> {window.location.pathname}</p>
              <p><strong>Environment:</strong> {window.location.hostname === 'localhost' ? 'Development' : 'Production'}</p>
              <p><strong>OAuth Code:</strong> {new URLSearchParams(window.location.search).get('code') ? '✅ Present' : '❌ Not present'}</p>
              <p><strong>OAuth Error:</strong> {new URLSearchParams(window.location.search).get('error') ? '❌ ' + new URLSearchParams(window.location.search).get('error') : '✅ None'}</p>
            </div>
            <button 
              onClick={() => {
                console.log('🎵 Manual Debug Log:')
                logSpotifyConfig()
                console.log('CLIENT_ID:', CLIENT_ID)
                console.log('REDIRECT_URI:', REDIRECT_URI)
              }}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Log to Console
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
