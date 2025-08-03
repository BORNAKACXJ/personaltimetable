import { useState, useEffect, useCallback } from 'react'

// Spotify API configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback'
const SPOTIFY_SCOPES = [
  'user-top-read'       // Access to user's top artists and tracks
].join(' ')

export function useSpotifyAuth() {
  const [user, setUser] = useState(null)
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isExchangingToken, setIsExchangingToken] = useState(false)

  // Load Spotify data from localStorage
  const loadSpotifyDataFromStorage = useCallback(() => {
    try {
      // Load top tracks
      const storedTracks = localStorage.getItem('spotify_top_tracks')
      const tracksTimestamp = localStorage.getItem('spotify_top_tracks_timestamp')
      if (storedTracks && tracksTimestamp) {
        const tracksAge = Date.now() - parseInt(tracksTimestamp)
        // Cache for 24 hours
        if (tracksAge < 24 * 60 * 60 * 1000) {
          setTopTracks(JSON.parse(storedTracks))
        }
      }

      // Load top artists
      const storedArtists = localStorage.getItem('spotify_top_artists')
      const artistsTimestamp = localStorage.getItem('spotify_top_artists_timestamp')
      if (storedArtists && artistsTimestamp) {
        const artistsAge = Date.now() - parseInt(artistsTimestamp)
        // Cache for 24 hours
        if (artistsAge < 24 * 60 * 60 * 1000) {
          setTopArtists(JSON.parse(storedArtists))
        }
      }

      // Load user profile
      const storedUser = localStorage.getItem('spotify_user_profile')
      const userTimestamp = localStorage.getItem('spotify_user_profile_timestamp')
      if (storedUser && userTimestamp) {
        const userAge = Date.now() - parseInt(userTimestamp)
        // Cache for 24 hours
        if (userAge < 24 * 60 * 60 * 1000) {
          setUser(JSON.parse(storedUser))
        }
      }
    } catch (error) {
      console.error('Error loading Spotify data from storage:', error)
    }
  }, [])

  const login = () => {
    // Debug logging
    console.log('SPOTIFY_CLIENT_ID:', SPOTIFY_CLIENT_ID)
    console.log('SPOTIFY_REDIRECT_URI:', SPOTIFY_REDIRECT_URI)
    console.log('SPOTIFY_SCOPES:', SPOTIFY_SCOPES)
    
    // Validate required environment variables
    if (!SPOTIFY_CLIENT_ID) {
      console.error('SPOTIFY_CLIENT_ID is not set')
      setError('Spotify Client ID is not configured')
      return
    }
    
    if (!import.meta.env.VITE_SPOTIFY_CLIENT_SECRET) {
      console.error('VITE_SPOTIFY_CLIENT_SECRET is not set')
      setError('Spotify Client Secret is not configured')
      return
    }
    
    // Clear any existing tokens to start fresh
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_token_expiry')
    localStorage.removeItem('spotify_refresh_token')
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}&show_dialog=true`
    console.log('Authorization URL:', authUrl)
    
    // Clear any previous errors
    setError(null)
    
    window.location.href = authUrl
  }

  const logout = () => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_token_expiry')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_top_tracks')
    localStorage.removeItem('spotify_top_tracks_timestamp')
    localStorage.removeItem('spotify_top_artists')
    localStorage.removeItem('spotify_top_artists_timestamp')
    localStorage.removeItem('spotify_user_profile')
    localStorage.removeItem('spotify_user_profile_timestamp')
    setUser(null)
    setTopTracks([])
    setTopArtists([])
    setIsAuthenticated(false)
  }

  const getAccessToken = useCallback(async (code) => {
    try {
      console.log('Getting access token with code:', code)
      console.log('Client ID:', SPOTIFY_CLIENT_ID)
      console.log('Client Secret exists:', !!import.meta.env.VITE_SPOTIFY_CLIENT_SECRET)
      console.log('Redirect URI:', SPOTIFY_REDIRECT_URI)
      
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

      console.log('Token response status:', response.status)
      const data = await response.json()
      console.log('Token response data:', data)
      
      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token)
        localStorage.setItem('spotify_token_expiry', (Date.now() + data.expires_in * 1000).toString())
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token)
        }
        setIsAuthenticated(true)
        return data.access_token
      } else {
        console.error('No access token in response:', data)
        throw new Error(`Failed to get access token: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error getting access token:', error)
      throw error
    }
  }, [])

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('spotify_refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

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
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token)
        }
        return data.access_token
      } else {
        throw new Error('Failed to refresh access token')
      }
    } catch (error) {
      console.error('Error refreshing access token:', error)
      // Clear invalid tokens
      localStorage.removeItem('spotify_access_token')
      localStorage.removeItem('spotify_token_expiry')
      localStorage.removeItem('spotify_refresh_token')
      setIsAuthenticated(false)
      throw error
    }
  }, [])

  const getValidAccessToken = useCallback(async () => {
    const token = localStorage.getItem('spotify_access_token')
    const expiry = localStorage.getItem('spotify_token_expiry')
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token
    }
    
    const refreshToken = localStorage.getItem('spotify_refresh_token')
    if (refreshToken) {
      return await refreshAccessToken()
    }
    
    throw new Error('No valid access token available')
  }, [refreshAccessToken])

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = await getValidAccessToken()
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        // Save to localStorage
        localStorage.setItem('spotify_user_profile', JSON.stringify(data))
        localStorage.setItem('spotify_user_profile_timestamp', Date.now().toString())
        return data
      } else {
        throw new Error('Failed to fetch user profile')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError(error.message)
      return null
    }
  }, [getValidAccessToken])

  const fetchTopTracks = useCallback(async (timeRange = 'medium_term', limit = 50) => {
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
        // Save to localStorage
        localStorage.setItem('spotify_top_tracks', JSON.stringify(data.items))
        localStorage.setItem('spotify_top_tracks_timestamp', Date.now().toString())
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
  }, [getValidAccessToken])

  const fetchTopArtists = useCallback(async (timeRange = 'medium_term', limit = 50) => {
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
        // Save to localStorage
        localStorage.setItem('spotify_top_artists', JSON.stringify(data.items))
        localStorage.setItem('spotify_top_artists_timestamp', Date.now().toString())
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
  }, [getValidAccessToken])

  const fetchUserData = useCallback(async () => {
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
  }, [fetchUserProfile, fetchTopTracks, fetchTopArtists])

  // Handle callback from Spotify OAuth
  const handleCallback = useCallback(async (code) => {
    // Prevent multiple simultaneous token exchanges
    if (isExchangingToken) {
      console.log('Token exchange already in progress, skipping')
      return
    }
    
    try {
      setIsExchangingToken(true)
      setLoading(true)
      setError(null)
      
      console.log('Handling callback with code:', code)
      
      // Check if we already have a valid token
      const existingToken = localStorage.getItem('spotify_access_token')
      const tokenExpiry = localStorage.getItem('spotify_token_expiry')
      
      if (existingToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        console.log('Already have valid token, skipping token exchange')
        setIsAuthenticated(true)
        await fetchUserData()
        return
      }
      
      const token = await getAccessToken(code)
      console.log('Got access token:', token ? 'SUCCESS' : 'FAILED')
      
      if (token) {
        await fetchUserData()
      }
    } catch (error) {
      console.error('HandleCallback error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
      setIsExchangingToken(false)
    }
  }, [isExchangingToken, fetchUserData, getAccessToken])

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token')
    const tokenExpiry = localStorage.getItem('spotify_token_expiry')
    
    if (token && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
      setIsAuthenticated(true)
      // Load cached data first
      loadSpotifyDataFromStorage()
      // Then fetch fresh data
      fetchUserData()
    } else if (token) {
      // Token expired, clear it
      localStorage.removeItem('spotify_access_token')
      localStorage.removeItem('spotify_token_expiry')
      localStorage.removeItem('spotify_refresh_token')
    }
  }, [fetchUserData, loadSpotifyDataFromStorage])

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