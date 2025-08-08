import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

// Format time to display format (remove seconds if present)
function formatTimeForDisplay(timeStr) {
  if (!timeStr) return ''
  // If time is in format "HH:MM:SS", convert to "HH:MM"
  if (timeStr.includes(':') && timeStr.split(':').length === 3) {
    return timeStr.substring(0, 5)
  }
  return timeStr
}

export function ArtistDialog({ artist, isOpen, onClose, currentDayData }) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
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
              className="artist-dialog__image"
              style={{
                transform: animationStep >= 1 ? 'scale(1)' : 'scale(0.8)',
                opacity: animationStep >= 1 ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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
                style={{
                  transform: animationStep >= 2 ? 'translateY(0)' : 'translateY(20px)',
                  opacity: animationStep >= 2 ? 1 : 0,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {artist.name}
              </h2>
              {artist.spotify_url && (
                <a 
                  href={artist.spotify_url} 
                  className="artist-dialog__spotify-link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    transform: animationStep >= 3 ? 'translateY(0)' : 'translateY(20px)',
                    opacity: animationStep >= 3 ? 1 : 0,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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
          className="artist-dialog__about"
          style={{
            transform: animationStep >= 6 ? 'translateY(0)' : 'translateY(30px)',
            opacity: animationStep >= 6 ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <h3>ABOUT THIS ARTIST</h3>
          <p id="dialog-artist-about">
            {artist.bio || 'No description available for this artist.'}
          </p>
        </div>
        
        {/* Performance Times */}
        {artist.actData && (
          <div 
            style={{
              transform: animationStep >= 7 ? 'translateY(0)' : 'translateY(30px)',
              opacity: animationStep >= 7 ? 1 : 0,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              
             
              padding: '16px',
              
              
             
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            {/* Left side - Day and Stage */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '16px', 
                color: '#333', 
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                {currentDayData?.day?.date || 'Saturday 31 Augustus'}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#666'
              }}>
                {artist.actData.stage?.name || 'EFFENAAR KLEINE ZAAL'}
              </div>
            </div>
            
            {/* Right side - Times */}
            <div style={{ 
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <div style={{ 
                fontSize: '18px', 
                color: '#333', 
                fontWeight: 'bold',
                marginBottom: '2px'
              }}>
                {formatTimeForDisplay(artist.actData.start_time)}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#666'
              }}>
                {formatTimeForDisplay(artist.actData.end_time)}
              </div>
            </div>
          </div>
        )}
        
        {/* Followers section hidden */}
        
        <button 
          className="artist-dialog__close-btn" 
          onClick={onClose}
          style={{
            transform: animationStep >= 8 ? 'translateY(0)' : 'translateY(30px)',
            opacity: animationStep >= 8 ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          BACK TO TIMETABLE
        </button>
      </div>
    </div>
  )
} 