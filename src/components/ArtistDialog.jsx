import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function ArtistDialog({ artist, isOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
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
            <div className="artist-dialog__image">
              <img 
                src={artist.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face'} 
                alt={artist.name}
                id="dialog-artist-image"
              />
            </div>
            <div className="artist-dialog__name-section">
              <h2 id="dialog-artist-name">{artist.name}</h2>
              {artist.spotify_url && (
                <a href={artist.spotify_url} className="artist-dialog__spotify-link" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-spotify"></i>
                  LISTEN ON SPOTIFY
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="artist-dialog__recommendation">
          <div className="artist-dialog__recommendation-content">
            <div className="artist-dialog__album-art">
              <img 
                src={artist.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'} 
                alt="Artist"
              />
              <span>Artist Mix</span>
            </div>
            <div className="artist-dialog__genre-info">
              <span id="dialog-artist-genre">
                {artist.genres?.join(', ') || 'Various Genres'}
              </span>
              <div className="artist-dialog__spotify-badge">
                <i className="fa-brands fa-spotify"></i>
                {artist.popularity ? `POPULARITY: ${artist.popularity}/100` : 'ARTIST INFORMATION'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="artist-dialog__about">
          <h3>ABOUT THIS ARTIST</h3>
          <p id="dialog-artist-about">
            {artist.about || 'No description available for this artist.'}
          </p>
        </div>
        
        {artist.followers && (
          <div className="artist-dialog__stats">
            <div className="artist-dialog__stat">
              <span className="stat-label">Followers</span>
              <span className="stat-value">{artist.followers.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        <button className="artist-dialog__close-btn" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          BACK TO TIMETABLE
        </button>
      </div>
    </div>
  )
} 