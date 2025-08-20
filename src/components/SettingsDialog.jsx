import { useState, useEffect } from 'react'
import { X, Settings, LogOut, Music, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './SettingsDialog.css'

export function SettingsDialog({ isOpen, onClose, userId, userName }) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Load user data when dialog opens
      loadUserData()
      // Start staggered animation sequence
      setAnimationStep(0)
      const steps = [1, 2, 3, 4, 5, 6, 7, 8]
      steps.forEach((step, index) => {
        setTimeout(() => setAnimationStep(step), index * 10)
      })
    } else {
      setAnimationStep(0)
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [isOpen, userId])

  const loadUserData = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      // Get user's top tracks
      const { data: tracksData, error: tracksError } = await supabase
        .from('user_top_tracks')
        .select('*')
        .eq('spotify_profile_id', userId)
        .order('rank_position')
        .limit(5)

      if (tracksError) {
        console.error('Error loading top tracks:', tracksError)
      } else {
        setTopTracks(tracksData || [])
      }

      // Get user's top artists
      const { data: artistsData, error: artistsError } = await supabase
        .from('user_top_artists')
        .select('*')
        .eq('spotify_profile_id', userId)
        .order('rank_position')
        .limit(5)

      if (artistsError) {
        console.error('Error loading top artists:', artistsError)
      } else {
        setTopArtists(artistsData || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Spotify account? This will remove your personal timetable.')) {
      try {
        // Here you would typically delete the user's data from the database
        // For now, we'll just redirect to the main page
        window.location.href = '/'
      } catch (error) {
        console.error('Error disconnecting:', error)
      }
    }
  }

  if (!isVisible) return null

  return (
    <div className={`settings-dialog ${isOpen ? 'active' : ''}`}>
      <div className="settings-dialog__overlay" onClick={onClose}></div>
      
      <div className="settings-dialog__content">
        <div className="settings-dialog__header">
          <div className="settings-dialog__title-section">
            
            <div className="settings-dialog__title-actions">
              <h2>Your music taste</h2>
              <button 
                className="settings-dialog__close" 
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="settings-dialog__body">
          {/* User Info Section */}
          {/* <div className="settings-section">
            <h3 className="section-title">
              <User size={20} />
              Connected Spotify Account
            </h3>
            <div className="user-info">
              <p><strong>User ID:</strong> {userId}</p>
              <p><strong>Display Name:</strong> {userName || 'Not set'}</p>
            </div>
          </div> */}

         

          {/* Top Artists Section */}
          <div className="settings-section">
            <h3 className="section-title">
              
              Your Top 5 Artists
            </h3>
            {loading ? (
              <div className="loading-state">Loading your top artists...</div>
            ) : topArtists.length > 0 ? (
              <div className="artists-grid">
                {topArtists.map((artist, index) => (
                  <div key={artist.id} className="artist-card">
                    <div className="artist-image-container">
                      {artist.image_url ? (
                        <img 
                          src={artist.image_url} 
                          alt={artist.artist_name}
                          className="artist-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="artist-image-placeholder">
                        <User size={24} />
                      </div>
                    </div>
                    <div className="artist-card-info">
                      <span className="artist-rank">#{artist.rank_position}</span>
                      <span className="artist-name">{artist.artist_name}</span>
                      
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No top artists found</div>
            )}
          </div>

           {/* Top Tracks Section */}
           <div className="settings-section">
            <h3 className="section-title">
             
              Your Top 5 Tracks
            </h3>
            {loading ? (
              <div className="loading-state">Loading your top tracks...</div>
            ) : topTracks.length > 0 ? (
              <div className="tracks-list">
                {topTracks.map((track, index) => (
                  <div key={track.id} className="track-item">
                    <span className="track-rank">#{track.rank_position}</span>
                    <div className="track-info">
                      <span className="track-name">{track.track_name}</span>
                      <span className="track-artist">{track.artist_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No top tracks found</div>
            )}
          </div>

          {/* Disconnect Section */}
          <div className="settings-section danger-zone">
            <h3 className="section-title danger">
              <LogOut size={20} />
              Disconnect Spotify
            </h3>
            <div className="disconnect-section">
              <p>Disconnect your Spotify account and remove your personal timetable.</p>
              <button 
                className="disconnect-button"
                onClick={handleDisconnect}
              >
                <LogOut size={16} />
                Disconnect Spotify
              </button>
            </div>
          </div>
        </div>

        <div className="settings-dialog__footer">
          <button 
            className="settings-dialog__close-btn" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
