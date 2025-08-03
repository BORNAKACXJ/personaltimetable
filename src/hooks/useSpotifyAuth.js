import { useState, useEffect } from 'react'

// Spotify API configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback'
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email'
].join(' ')

export function useSpotifyAuth() {
  const [user, setUser] = useState(null)
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token')
    const tokenExpiry = localStorage.getItem('spotify_token_expiry')
    
    if (token && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
      setIsAuthenticated(true)
      fetchUserProfile()
    } else if (token) {
      // Token expired, clear it
      localStorage.removeItem('spotify_access_token')
      localStorage.removeItem('spotify_token_expiry')
      localStorage.removeItem('spotify_refresh_token')
    }
  }, [])

  const login = () => {
    // Debug logging
    console.log('SPOTIFY_CLIENT_ID:', SPOTIFY_CLIENT_ID)
    console.log('SPOTIFY_REDIRECT_URI:', SPOTIFY_REDIRECT_URI)
    console.log('SPOTIFY_SCOPES:', SPOTIFY_SCOPES)
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}&show_dialog=true`
    console.log('Authorization URL:', authUrl)
    
    window.location.href = authUrl
  }

  const logout = () => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_token_expiry')
    localStorage.removeItem('spotify_refresh_token')
    setUser(null)
    setTopTracks([])
    setTopArtists([])
    setIsAuthenticated(false)
  }

  const getAccessToken = async (code) => {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + import.meta.env.VITE_SPOTIFY_CLIENT_SECRET)
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_REDIRECT_URI
        })
      })

      const data = await response.json()
      
      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token)
        localStorage.setItem('spotify_token_expiry', (Date.now() + data.expires_in * 1000).toString())
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token)
        }
        setIsAuthenticated(true)
        return data.access_token
      } else {
        throw new Error('Failed to get access token')
      }
    } catch (error) {
      console.error('Error getting access token:', error)
      throw error
    }
  }

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + import.meta.env.VITE_SPOTIFY_CLIENT_SECRET)
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      })

      const data = await response.json()
      
      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token)
        localStorage.setItem('spotify_token_expiry', (Date.now() + data.expires_in * 1000).toString())
        return data.access_token
      } else {
        throw new Error('Failed to refresh access token')
      }
    } catch (error) {
      console.error('Error refreshing access token:', error)
      logout()
      throw error
    }
  }

  const getValidAccessToken = async () => {
    const token = localStorage.getItem('spotify_access_token')
    const tokenExpiry = localStorage.getItem('spotify_token_expiry')
    
    if (token && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
      return token
    } else {
      return await refreshAccessToken()
    }
  }

  const fetchUserProfile = async () => {
    try {
      const token = await getValidAccessToken()
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return userData
      } else {
        throw new Error('Failed to fetch user profile')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError(error.message)
    }
  }

  const fetchTopTracks = async (timeRange = 'medium_term', limit = 50) => {
    try {
      setLoading(true)
      const token = await getValidAccessToken()
      const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTopTracks(data.items)
        return data.items
      } else {
        throw new Error('Failed to fetch top tracks')
      }
    } catch (error) {
      console.error('Error fetching top tracks:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchTopArtists = async (timeRange = 'medium_term', limit = 50) => {
    try {
      setLoading(true)
      const token = await getValidAccessToken()
      const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTopArtists(data.items)
        return data.items
      } else {
        throw new Error('Failed to fetch top artists')
      }
    } catch (error) {
      console.error('Error fetching top artists:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await fetchUserProfile()
      await fetchTopTracks()
      await fetchTopArtists()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle callback from Spotify OAuth
  const handleCallback = async (code) => {
    try {
      setLoading(true)
      setError(null)
      
      await getAccessToken(code)
      await fetchUserData()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    topTracks,
    topArtists,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchUserData,
    handleCallback,
    fetchTopTracks,
    fetchTopArtists
  }
} 