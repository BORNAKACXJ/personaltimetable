import { useState, useEffect, useCallback } from 'react'
import { X, Share2, Copy, Check } from 'lucide-react'
import { UserDataManager } from '../utils/userDataManager'
import './ShareTimetableDialog.css'

export function ShareTimetableDialog({ isOpen, onClose, userId, userName }) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailConsent, setEmailConsent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Autosave function with debouncing
  const autosavePreferences = useCallback(async (displayName, emailAddress, consent) => {
    if (!userId) return
    
    setIsSaving(true)
    setSaveStatus('Saving...')
    
    try {
      await UserDataManager.saveSharingPreferences(userId, displayName, emailAddress, consent)
      setSaveStatus('Saved!')
      setTimeout(() => setSaveStatus(''), 2000)
    } catch (error) {
      console.error('Error autosaving preferences:', error)
      setSaveStatus('Save failed')
      setTimeout(() => setSaveStatus(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }, [userId])

  // Load saved preferences when dialog opens
  const loadSavedPreferences = useCallback(async () => {
    if (!userId) return
    
    try {
      const preferences = await UserDataManager.getSharingPreferences(userId)
      if (preferences) {
        setName(preferences.share_display_name || '')
        setEmail(preferences.share_email || '')
        setEmailConsent(preferences.email_consent || false)
      }
    } catch (error) {
      console.error('Error loading saved preferences:', error)
    }
  }, [userId])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Load saved preferences when dialog opens
      loadSavedPreferences()
      setCopied(false)
      // Generate share link
      setShareLink(`${window.location.origin}/t/${userId}`)
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
  }, [isOpen, userId, loadSavedPreferences])

  // Debounced autosave effect
  useEffect(() => {
    if (!userId || (!name && !email)) return
    
    const timeoutId = setTimeout(() => {
      autosavePreferences(name, email, emailConsent)
    }, 1000) // 1 second delay
    
    return () => clearTimeout(timeoutId)
  }, [name, email, emailConsent, userId, autosavePreferences])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Please fill in both name and email')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Save profile to Supabase
      const { data: profile, error: profileError } = await supabase
        .from('spotify_profiles')
        .insert({
          display_name: name.trim(),
          email: email.trim(),
          spotify_id: `shared_${Date.now()}` // Generate a unique ID for shared profiles
        })
        .select()
        .single()

      if (profileError) {
        throw new Error(`Failed to save profile: ${profileError.message}`)
      }

      setProfile(profile)
      setStep('success')
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className={`share-timetable-dialog ${isOpen ? 'active' : ''}`}>
      <div className="share-timetable-dialog__overlay" onClick={onClose}></div>
      
      <div className="share-timetable-dialog__content">
        <div className="share-timetable-dialog__header">
          <div className="share-timetable-dialog__title-section">
            
            <div className="share-timetable-dialog__title-actions">
              <h2>Share Your Timetable</h2>
              <button 
                className="share-timetable-dialog__close" 
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="share-timetable-dialog__body">
          <div className="share-timetable-dialog__description">
            <p>
              Share your Personal Hit The City 2025 timetable with friends!
              Optional you can add your name to personalize it even more.
              Your preferences will be automatically saved.
            </p>
          </div>

          <div className="share-timetable-dialog__form">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="share-name" className="form-label">Display Name</label>
              <input
                type="text"
                id="share-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                className="form-input"
              />
            </div>

            {/* Email Field - HIDDEN FOR NOW */}
            {/* <div className="form-group">
              <label htmlFor="share-email" className="form-label">Email</label>
              <input
                type="email"
                id="share-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-input"
              />
            </div> */}

            {/* Email Consent Checkbox - HIDDEN FOR NOW */}
            {/* <div className="form-group">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={emailConsent}
                    onChange={(e) => setEmailConsent(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    Yes, you can use my email to send me updates about recommended artists and new festivals
                  </span>
                </label>
              </div>
            </div> */}

            {/* Autosave Status */}
            {saveStatus && (
              <div className={`autosave-status ${isSaving ? 'saving' : saveStatus === 'Saved!' ? 'saved' : 'error'}`}>
                {saveStatus}
              </div>
            )}

            {/* Share Link Section */}
            <div className="share-link-section">
              <label className="form-label">Share Link</label>
              <div className="share-link-container">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="form-input share-link-input"
                />
                <button 
                  className="copy-button"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {copied && (
                <div className="copy-feedback">
                  Link copied to clipboard!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* <div className="share-timetable-dialog__footer">
          <button 
            className="share-timetable-dialog__cancel" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="share-timetable-dialog__save" 
            onClick={handleSaveProfile}
          >
            Save & Share
          </button>
        </div> */}
      </div>
    </div>
  )
}
