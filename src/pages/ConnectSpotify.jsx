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
  const [selectedHeadline, setSelectedHeadline] = useState('')
  const [generatedSummary, setGeneratedSummary] = useState('')

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

      // TEMPORARILY COMMENTED OUT FOR STYLING WORK
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

      // TEMPORARY: Just stay on loading step for styling work
      console.log('Loading step reached - staying here for styling work')

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
          <div className="step__wrapper connect-step">
            <div className='font__size--headline'>Connect Your Spotify Account</div>
            <div className="generated__summary font__size--body">Hit The City is here! With 100+ emerging and established live acts, there is so much to see and to discover. But where to go? To help you a little bit, we created a tool that gives you personal advice based on your music taste.

Connect with Spotify to create your timetable. Let's go!</div>
            <button 
              onClick={connectSpotify}
              disabled={loading}
              className="spotify-connect-btn"
            >
              <img src="/_assets/_images/spotify_icon.svg" alt="Spotify" />
              {loading ? 'Connecting...' : 'Connect with Spotify'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        )

      case 'success':
        // Generate personalized headline based on top artists (only once)
        if (!selectedHeadline) {
          const artist01 = topArtists[0]?.name || '';
          const artist02 = topArtists[1]?.name || '';
          const artist03 = topArtists[2]?.name || '';
          const artist04 = topArtists[3]?.name || '';

          const headlines = [
            `Ah.. also a huge ${artist01} lover?`,
            `Oeh.. hello big ${artist01} fan!`,
            `I see.. you are that ${artist01} fan!`
          ];

          const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
          const generatedSummary = `Let's find some of that and also some ${artist02}, ${artist03} and ${artist04} energy at HtC 2025`;
          
          setSelectedHeadline(randomHeadline);
          setGeneratedSummary(generatedSummary);
        }

        return (

          <div className='step__wrapper success-step'>
          
            
            <div className='font__size--headline'>{selectedHeadline}</div>
            <div className="generated__summary font__size--body">{generatedSummary}</div>
            
           

            <button 
              onClick={createPersonalTimetable}
              className="create-timetable-btn"
            >
              Create your personal timetable
            </button>
          
          </div>
        )

      case 'loading':
        return (

          <div className='step__wrapper loading-step'>
            <div className="loading-spinner"></div>
            <div className='font__size--headline'>We are working on it!</div>
            <div className="generated__summary font__size--body">This can take<br />
							up to 20 seconds..<br />
							<br />
							Please don't<br />
							close this page</div>
            
            
          </div>
        )

      case 'complete':
        return (
          <div className="step__wrapper complete-step">
            <div className='font__size--headline'>Done!</div>
            <div className="generated__summary font__size--body">Your personal timetable has been created successfully!</div>
           
            <button 
              onClick={() => window.location.href = `/t/${profileId}`}
              className="create-timetable-btn"
            >
              Go to My Personal Timetable
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="connect-spotify-page">
      <div className="container">
        <div className="header__onboarding">
          <div className="header__onboarding--title">LET’S CREATE YOUR PERSONAL TIMETABLE</div>
         
        </div>

        <div className="content">
          {renderStep()}

          <div className="onboarding__footer">
            <a href="/" className="back__link">Back to Timetable</a>
          </div>
          
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
