import React, { useState } from 'react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { testSupabaseConnection } from '../utils/testSupabaseConnection'
import './SpotifyAuth.css'

export default function SpotifyAuth() {
  const [connectionTest, setConnectionTest] = useState(null)
  const { getAuthorizationUrl, loading, error } = useSpotifyAuth()

  const handleLogin = async () => {
    try {
      // Test Supabase connection before proceeding
      const result = await testSupabaseConnection()
      setConnectionTest(result)

      if (result.success) {
        // Proceed with Spotify login
        const authUrl = getAuthorizationUrl()
        window.location.href = authUrl
      } else {
        console.error('Supabase connection failed:', result.error)
      }
    } catch (error) {
      console.error('Error during login:', error)
      setConnectionTest({ success: false, error: error.message })
    }
  }

  return (
    <div className="spotify-auth">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Connect Your Spotify Account</h1>
          <p>Get personalized festival recommendations based on your music taste</p>
        </div>

        <div className="auth-content">
          {connectionTest && !connectionTest.success && (
            <div className="connection-error">
              <p>⚠️ Database connection failed. Please try again later.</p>
              <p className="error-details">{connectionTest.error}</p>
            </div>
          )}

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="spotify-login-button"
          >
            {loading ? 'Connecting...' : 'Connect with Spotify'}
          </button>

          {error && (
            <div className="auth-error">
              <p>Error: {error}</p>
            </div>
          )}

          <div className="auth-info">
            <h3>What we'll access:</h3>
            <ul>
              <li>Your top artists and tracks</li>
              <li>Your music preferences</li>
              <li>Your Spotify profile information</li>
            </ul>
            <p className="privacy-note">
              We only use this data to provide personalized festival recommendations. 
              We don't store your music listening history or share your data with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
