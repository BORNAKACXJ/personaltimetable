import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Spotify API configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-top-read'

export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [topArtists, setTopArtists] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tokenExchangeInProgress, setTokenExchangeInProgress] = useState(false)

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token')
    const tokenExpiry = localStorage.getItem('spotify_token_expiry')
    
    if (token && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
      setIsAuthenticated(true)
      fetchUserData()
    }
  }, [])

  // Generate authorization URL
  const getAuthorizationUrl = useCallback(() => {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,
      state: Math.random().toString(36).substring(7)
    })
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`
  }, [])

  // Exchange authorization code for access token
  const exchangeCodeForToken = useCallback(async (code) => {
    if (tokenExchangeInProgress) {
      return null
    }

    setTokenExchangeInProgress(true)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_REDIRECT_URI
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to exchange code for token')
      }

      // Store token and expiry
      const expiryTime = new Date().getTime() + (data.expires_in * 1000)
      localStorage.setItem('spotify_access_token', data.access_token)
      localStorage.setItem('spotify_refresh_token', data.refresh_token)
      localStorage.setItem('spotify_token_expiry', expiryTime.toString())

      setIsAuthenticated(true)
      return data.access_token
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
      setTokenExchangeInProgress(false)
    }
  }, [tokenExchangeInProgress])

  // Refresh access token
  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to refresh token')
      }

      // Update stored token and expiry
      const expiryTime = new Date().getTime() + (data.expires_in * 1000)
      localStorage.setItem('spotify_access_token', data.access_token)
      localStorage.setItem('spotify_token_expiry', expiryTime.toString())

      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token)
      }

      return data.access_token
    } catch (error) {
      setError(error.message)
      throw error
    }
  }, [])

  // Get valid access token (refresh if needed)
  const getValidToken = useCallback(async () => {
    const token = localStorage.getItem('spotify_access_token')
    const tokenExpiry = localStorage.getItem('spotify_token_expiry')
    
    if (!token) {
      throw new Error('No access token available')
    }

    if (new Date().getTime() >= parseInt(tokenExpiry)) {
      return await refreshToken()
    }

    return token
  }, [refreshToken])

  // Save user profile to Supabase
  const saveUserProfile = useCallback(async (userProfile) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('spotify_profiles')
        .select('*')
        .eq('spotify_id', userProfile.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from('spotify_profiles')
          .update({
            display_name: userProfile.display_name,
            email: userProfile.email,
            country: userProfile.country,
            product: userProfile.product,
            images: userProfile.images,
            updated_at: new Date().toISOString()
          })
          .eq('spotify_id', userProfile.id)
          .select()
          .single()

        if (updateError) throw updateError
        return updatedProfile
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('spotify_profiles')
          .insert({
            spotify_id: userProfile.id,
            display_name: userProfile.display_name,
            email: userProfile.email,
            country: userProfile.country,
            product: userProfile.product,
            images: userProfile.images
          })
          .select()
          .single()

        if (insertError) throw insertError
        return newProfile
      }
    } catch (error) {
      console.error('Error saving user profile:', error)
      throw error
    }
  }, [])

  // Save top tracks to Supabase
  const saveTopTracks = useCallback(async (spotifyProfileId, tracks) => {
    try {
      // Delete existing top tracks
      await supabase
        .from('spotify_top_tracks')
        .delete()
        .eq('spotify_profile_id', spotifyProfileId)

      // Insert new top tracks
      const tracksData = tracks.map((track, index) => ({
        spotify_profile_id: spotifyProfileId,
        spotify_id: track.id,
        name: track.name,
        artist_name: track.artists[0].name,
        artist_spotify_id: track.artists[0].id,
        album_name: track.album.name,
        album_spotify_id: track.album.id,
        rank: index + 1,
        popularity: track.popularity
      }))

      const { data: savedTracks, error } = await supabase
        .from('spotify_top_tracks')
        .insert(tracksData)
        .select()

      if (error) throw error
      return savedTracks
    } catch (error) {
      console.error('Error saving top tracks:', error)
      throw error
    }
  }, [])

  // Save top artists to Supabase
  const saveTopArtists = useCallback(async (spotifyProfileId, artists) => {
    try {
      // Delete existing top artists
      await supabase
        .from('spotify_top_artists')
        .delete()
        .eq('spotify_profile_id', spotifyProfileId)

      // Insert new top artists
      const artistsData = artists.map((artist, index) => ({
        spotify_profile_id: spotifyProfileId,
        spotify_id: artist.id,
        name: artist.name,
        artist_name: artist.name,
        genres: artist.genres,
        rank: index + 1,
        popularity: artist.popularity,
        images: artist.images
      }))

      const { data: savedArtists, error } = await supabase
        .from('spotify_top_artists')
        .insert(artistsData)
        .select()

      if (error) throw error
      return savedArtists
    } catch (error) {
      console.error('Error saving top artists:', error)
      throw error
    }
  }, [])

  // Fetch user data from Spotify
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await getValidToken()

      // Fetch user profile
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const userProfile = await profileResponse.json()
      const savedProfile = await saveUserProfile(userProfile)
      setUser(savedProfile)

      // Fetch top tracks
      const tracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json()
        await saveTopTracks(savedProfile.id, tracksData.items)
        setTopTracks(tracksData.items)
      }

      // Fetch top artists
      const artistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=short_term', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (artistsResponse.ok) {
        const artistsData = await artistsResponse.json()
        await saveTopArtists(savedProfile.id, artistsData.items)
        setTopArtists(artistsData.items)
      }

    } catch (error) {
      setError(error.message)
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }, [getValidToken, saveUserProfile, saveTopTracks, saveTopArtists])

  // Handle callback with authorization code
  const handleCallback = useCallback(async (code) => {
    try {
      setLoading(true)
      setError(null)

      const token = await exchangeCodeForToken(code)
      if (token) {
        await fetchUserData()
      }
    } catch (error) {
      setError(error.message)
      console.error('Error handling callback:', error)
    }
  }, [exchangeCodeForToken, fetchUserData])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_token_expiry')
    setIsAuthenticated(false)
    setUser(null)
    setTopArtists([])
    setTopTracks([])
    setError(null)
  }, [])

  return {
    isAuthenticated,
    user,
    topArtists,
    topTracks,
    loading,
    error,
    getAuthorizationUrl,
    handleCallback,
    logout,
    fetchUserData
  }
} 