import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './UserProfileDialog.css'

export function UserProfileDialog({ isOpen, onClose, userId, currentUserName }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [copied, setCopied] = useState(false)

  // Load existing user data when dialog opens
  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile()
    }
  }, [isOpen, userId])

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('spotify_profiles')
        .select('display_name, email, status')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
        return
      }

      if (data) {
        setName(data.display_name || currentUserName || '')
        setEmail(data.email || '')
      } else {
        setName(currentUserName || '')
        setEmail('')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    }
  }

  const saveProfile = async () => {
    try {
      setLoading(true)
      setMessage('')
      setMessageType('')

      const { error } = await supabase
        .from('spotify_profiles')
        .upsert({
          id: userId,
          display_name: name.trim(),
          email: email.trim(),
          status: 'connected' // Ensure status is set to connected when saving
        })

      if (error) {
        throw error
      }

      setMessage('Profile updated successfully!')
      setMessageType('success')
    } catch (err) {
      console.error('Error saving profile:', err)
      setMessage('Failed to save profile. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const disconnectSpotify = async () => {
    if (!confirm('Are you sure you want to disconnect your Spotify account? Your personal timetable will be hidden but your data will be preserved.')) {
      return
    }

    try {
      setLoading(true)
      setMessage('')

      // Update user profile status to 'disconnected' instead of deleting
      const { error } = await supabase
        .from('spotify_profiles')
        .update({ status: 'disconnected' })
        .eq('id', userId)

      if (error) {
        throw error
      }

      setMessage('Spotify account disconnected successfully! Your data has been preserved.')
      setMessageType('success')
      
      // Close dialog and redirect to main timetable
      setTimeout(() => {
        onClose()
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      console.error('Error disconnecting Spotify:', err)
      setMessage('Failed to disconnect. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const copyTimetableLink = () => {
    const link = `${window.location.origin}/t/${userId}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const timetableLink = `${window.location.origin}/t/${userId}`

  if (!isOpen) return null

  return (
    <div className="user-profile-dialog-overlay" onClick={onClose}>
      <div className="user-profile-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>My Personal Timetable</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dialog-content">

          <div class="font__size--body">
            
              Make it more personal by adding your display name and email, don't worry we won't spam you.
            <br /><br />
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="font__size--label-form">Display Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              className="form-input"
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          {/* Timetable Link */}
          <div className="form-group">
            <label>Your Timetable Link</label>
            <div className="link-container">
              <input
                type="text"
                value={timetableLink}
                readOnly
                className="form-input link-input"
              />
              <button 
                onClick={copyTimetableLink}
                className="copy-button"
                disabled={copied}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <small className="help-text">Share this link with friends to show them your personal timetable</small>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="dialog-actions">
            
            
            <button
              onClick={disconnectSpotify}
              disabled={loading}
              className="disconnect-button"
            >
              {loading ? 'Disconnecting...' : 'Disconnect Spotify'}
            </button>

            <button
              onClick={saveProfile}
              disabled={loading}
              className="save-button"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
