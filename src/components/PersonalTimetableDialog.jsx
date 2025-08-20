import { useState, useEffect } from 'react'
import { X, Music, Heart, Users, Calendar, Star } from 'lucide-react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { getSpotifyRedirectUri, getSpotifyClientId, logSpotifyConfig } from '../utils/spotifyConfig'
import './PersonalTimetableDialog.css'

export function PersonalTimetableDialog({ isOpen, onClose, onCreateTimetable }) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Spotify OAuth configuration
  const CLIENT_ID = getSpotifyClientId()
  const REDIRECT_URI = getSpotifyRedirectUri()
  const SCOPES = 'user-top-read'

  // Use existing Spotify auth hook
  const { login } = useSpotifyAuth({ disableSupabaseSaving: true })

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
      // Reset agreement state when dialog opens
      setHasAgreedToTerms(false)
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

  const handleCreateTimetable = () => {
    if (!hasAgreedToTerms) {
      return // Don't proceed if terms not agreed
    }
    
    setLoading(true)
    setError(null)
    
    // Log current Spotify configuration for debugging
    logSpotifyConfig()
    
    // Validate required configuration
    if (!CLIENT_ID) {
      setError('Spotify Client ID is not configured. Please check your environment variables.')
      setLoading(false)
      return
    }
    
    try {
      // Initiate Spotify OAuth flow directly
      login()
      // Close dialog after initiating auth
      onClose()
    } catch (err) {
      setError('Failed to connect to Spotify. Please try again.')
      setLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className={`personal-timetable-dialog ${isOpen ? 'active' : ''}`}>
      <div className="personal-timetable-dialog__overlay" onClick={onClose}></div>
      
      <div className="personal-timetable-dialog__content">
        <div className="personal-timetable-dialog__header">
          <div className="personal-timetable-dialog__title-section">
            
            <div className="personal-timetable-dialog__title-actions">
              <h2>Connect to Spotify to create your personal timetable</h2>
              <button 
                className="personal-timetable-dialog__close" 
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="personal-timetable-dialog__body">
          <div className="personal-timetable-dialog__description">
            <p>
            Hit The City is here! With 88+ emerging and established live acts, there is so much to see and to discover. But where to go? To help you a little bit, we created a tool that gives you personal advice based on your music taste.
            <br /><br />
            Connect your Spotify and we'll build your personal timetable based on your last 6 months of listening.
            
            </p>
          </div>

          <div className="wrapper__connect">
          <div className="personal-timetable-dialog__agreement">
            <label className="agreement-checkbox">
              <input
                type="checkbox"
                checked={hasAgreedToTerms}
                onChange={(e) => setHasAgreedToTerms(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="agreement-text">
                I agree to the HTC {' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a href="/eula" target="_blank" rel="noopener noreferrer">
                  User Agreement (EULA)
                </a>
                .
              </span>
            </label>
          </div>

          <button 
            className={`nav__main--spotify huge ${!hasAgreedToTerms || loading ? 'disabled' : ''}`}
            onClick={handleCreateTimetable}
            disabled={!hasAgreedToTerms || loading}
          >
            <img src="/_assets/_images/spotify_icon.svg" alt="Spotify" />
            {loading ? 'Connecting...' : 'Connect to Spotify'}
          </button>
          
          {error && (
            <div className="error-message" style={{ 
              color: '#ef4444', 
              fontSize: '14px', 
              marginTop: '8px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

         </div>

          <div className="privacy__note">
            
          <span className="font__size--label">Disclaimer</span>
              
              Don’t worry, we’re not going to share your guilty pleasures!
              We’re asking Spotify to take a look at your profile to get a feeling what your music taste is.
              We won't share your personal data and we won’t send you any emails unless you opt in - we don’t like spam either!
             
            
          </div>
        </div>

        
      </div>
    </div>
  )
}
