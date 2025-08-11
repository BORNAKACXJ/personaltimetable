import { useState, useEffect } from 'react'
import { X, Heart } from 'lucide-react'
import './ArtistDialog.css'
import { isFavorited, toggleFavorite } from '../utils/favorites'
import { trackFavorite } from '../utils/tracking'

// Format time to display format (remove seconds if present)
function formatTimeForDisplay(timeStr) {
  if (!timeStr) return ''
  // If time is in format "HH:MM:SS", convert to "HH:MM"
  if (timeStr.includes(':') && timeStr.split(':').length === 3) {
    return timeStr.substring(0, 5)
  }
  return timeStr
}

// Format date to display format
function formatDateForDisplay(dateStr) {
  if (!dateStr) return 'Saturday 31 Augustus'
  
  try {
    const date = new Date(dateStr)
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }
    return date.toLocaleDateString('en-US', options)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Saturday 31 Augustus'
  }
}

// Truncate bio text for mobile
function truncateBio(bio, maxLength = 320) {
  if (!bio || bio.length <= maxLength) return bio
  return bio.substring(0, maxLength) + '...'
}

export function ArtistDialog({ artist, isOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [showFullBio, setShowFullBio] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [favoriteStatus, setFavoriteStatus] = useState(false)

  // Check favorite status when artist changes
  useEffect(() => {
    if (artist?.actData) {
      setFavoriteStatus(isFavorited(artist.actData))
    }
  }, [artist])

  const handleFavoriteToggle = () => {
    if (artist?.actData) {
      const newStatus = !favoriteStatus
      toggleFavorite(artist.actData)
      setFavoriteStatus(newStatus)
      
      // Track the favorite action
      trackFavorite(
        artist.actData.name, 
        artist.actData.stage_name, 
        newStatus,
        artist.actData.id,
        artist.actData.stage?.id,
        artist.actData.artist?.id
      )
    }
  }

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
      setShowFullBio(false) // Reset bio state when dialog opens
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
  }, [isOpen])

  if (!artist || !isVisible) return null

  return (
    <div className={`artist-dialog ${isOpen ? 'active' : ''}`}>
      <div className="artist-dialog__overlay" onClick={onClose}></div>
      <div className="artist-dialog__content">
        <div className="artist-dialog__header">
          <div className="artist-dialog__artist-info">
            <div 
              className={`artist-dialog__image artist-dialog__image--animate`}
              style={{
                transform: animationStep >= 1 ? 'scale(1)' : 'scale(0.8)',
                opacity: animationStep >= 1 ? 1 : 0
              }}
            >
              <img 
                src={artist.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face'} 
                alt={artist.name}
                id="dialog-artist-image"
              />
            </div>
            <div className="artist-dialog__name-section">
              <h2 
                id="dialog-artist-name"
                className="artist-dialog__name--animate"
                style={{
                  transform: animationStep >= 2 ? 'translateY(0)' : 'translateY(20px)',
                  opacity: animationStep >= 2 ? 1 : 0
                }}
              >
                {artist.name}
              </h2>
              {artist.spotify_url && (
                <a 
                  href={artist.spotify_url} 
                  className="artist-dialog__spotify-link artist-dialog__spotify--animate" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    transform: animationStep >= 3 ? 'translateY(0)' : 'translateY(20px)',
                    opacity: animationStep >= 3 ? 1 : 0
                  }}
                >
                  <i className="fa-brands fa-spotify"></i>
                  LISTEN ON SPOTIFY
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Recommendation section hidden */}
        
        <div 
          className="artist-dialog__about artist-dialog__about--animate"
          style={{
            transform: animationStep >= 6 ? 'translateY(0)' : 'translateY(30px)',
            opacity: animationStep >= 6 ? 1 : 0
          }}
        >
          <h3>ABOUT THIS ARTIST</h3>
          <div className={`artist-dialog__bio-container ${showFullBio ? 'artist-dialog__bio-container--expanded' : ''}`}>
            <p id="dialog-artist-about">
              {artist.bio || 'No description available for this artist.'}
            </p>
            {isMobile && artist.bio && artist.bio.length > 320 && !showFullBio && (
              <div className="artist-dialog__bio-fade">
                <button 
                  className="artist-dialog__show-more-btn"
                  onClick={() => setShowFullBio(true)}
                >
                  Show More
                </button>
              </div>
            )}
            {isMobile && artist.bio && artist.bio.length > 320 && showFullBio && (
              <button 
                className="artist-dialog__show-more-btn artist-dialog__show-more-btn--top"
                onClick={() => setShowFullBio(false)}
              >
                Show Less
              </button>
            )}
          </div>
        </div>
        
        {/* Performance Times */}
        {artist.actData && (
          <div 
            className="artist-dialog__performance-info artist-dialog__performance--animate"
            style={{
              transform: animationStep >= 7 ? 'translateY(0)' : 'translateY(30px)',
              opacity: animationStep >= 7 ? 1 : 0
            }}
          >
            {/* Left side - Day and Stage */}
            <div className="artist-dialog__performance-left">
              <div className="artist-dialog__performance-date">
                {formatDateForDisplay(artist.dayData?.date)}
              </div>
              <div className="artist-dialog__performance-stage">
                {artist.actData.stage?.name || 'EFFENAAR KLEINE ZAAL'}
              </div>
            </div>
            
            {/* Right side - Times */}
            <div className="artist-dialog__performance-right">
              <div className="artist-dialog__performance-start">
                {formatTimeForDisplay(artist.actData.start_time)}
              </div>
              <div className="artist-dialog__performance-end">
                {formatTimeForDisplay(artist.actData.end_time)}
              </div>
            </div>
          </div>
        )}
        
        {/* Followers section hidden */}
        
        <div className="artist-dialog__actions">
          <button 
            className={`artist-dialog__favorite-btn artist-dialog__favorite--animate ${favoriteStatus ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            style={{
              transform: animationStep >= 8 ? 'translateY(0)' : 'translateY(30px)',
              opacity: animationStep >= 8 ? 1 : 0
            }}
          >
            <Heart size={20} fill={favoriteStatus ? '#ff4757' : 'none'} />
            {favoriteStatus ? 'FAVORITED' : 'FAVORITE'}
          </button>
          
          <button 
            className="artist-dialog__close-btn artist-dialog__close--animate" 
            onClick={onClose}
            style={{
              transform: animationStep >= 8 ? 'translateY(0)' : 'translateY(30px)',
              opacity: animationStep >= 8 ? 1 : 0
            }}
          >
            BACK TO TIMETABLE
          </button>
        </div>
      </div>
    </div>
  )
} 