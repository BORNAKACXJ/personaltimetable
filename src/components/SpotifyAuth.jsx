import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { Heart, User, Music, Settings } from 'lucide-react'
import { testSupabaseConnection } from '../utils/testSupabaseConnection'
import { SupabaseDebug } from './SupabaseDebug'
import './SpotifyAuth.css'

export function SpotifyAuth({ onUserDataReady }) {
  const { 
    user: spotifyUser, 
    topArtists, 
    topTracks,
    isAuthenticated: spotifyAuthenticated, 
    login: spotifyLogin, 
    logout: spotifyLogout,
    loading: spotifyLoading 
  } = useSpotifyAuth()

  const handleLogin = async () => {
    // Test Supabase connection before login
    console.log('Testing Supabase connection before login...')
    const connectionTest = await testSupabaseConnection()
    console.log('Connection test result:', connectionTest)
    
    if (!connectionTest.success) {
      console.error('❌ Supabase connection failed:', connectionTest.message)
      alert('Database connection failed. Please check your Supabase configuration.')
      return
    }
    
    console.log('✅ Supabase connection successful, proceeding with login')
    await spotifyLogin()
  }

  const handleLogout = async () => {
    await spotifyLogout()
  }

  if (spotifyLoading) {
    return (
      <div className="spotify-auth-loading">
        <div className="loading-spinner"></div>
        <p>Connecting to Spotify...</p>
      </div>
    )
  }

  if (!spotifyAuthenticated) {
    return (
      <div className="spotify-auth-prompt">
        <div className="spotify-auth-content">
          <div className="spotify-auth-icon">
            <Music size={48} color="#1DB954" />
          </div>
          <h3>Connect with Spotify</h3>
          <p>Get personalized recommendations based on your listening history</p>
          <button 
            className="btn__spotify-login"
            onClick={handleLogin}
          >
            <i className="fa fa-spotify"></i>
            Connect Spotify Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="spotify-user-profile">
      {/* Debug panel - remove this after testing */}
      <SupabaseDebug />
      
      <div className="user-profile-header">
        <div className="user-info">
          {spotifyUser?.images?.[0]?.url ? (
            <img 
              src={spotifyUser.images[0].url} 
              alt={spotifyUser.display_name}
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              <User size={24} />
            </div>
          )}
          <div className="user-details">
            <h4>{spotifyUser?.display_name || 'Spotify User'}</h4>
            <p>Connected to Spotify</p>
          </div>
        </div>
        <button 
          className="btn__settings"
          onClick={handleLogout}
          title="Disconnect Spotify"
        >
          <Settings size={20} />
        </button>
      </div>
      
      {topTracks && topTracks.length > 0 && (
        <div className="user-top-tracks">
          <h5>Your Top Tracks</h5>
          <div className="top-tracks-list">
            {topTracks.slice(0, 5).map((track, index) => (
              <div key={track.id} className="top-track-item">
                <span className="track-number">{index + 1}</span>
                <div className="track-info">
                  <span className="track-name">{track.name}</span>
                  <span className="track-artist">{track.artists[0].name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
