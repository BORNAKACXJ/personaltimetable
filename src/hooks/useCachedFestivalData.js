import { useState, useEffect } from 'react'
import { useFestivalData } from './useFestivalData'

// Cache storage
const CACHE_KEY = 'festival_data_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Helper function to get cached data
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      console.log('Using cached festival data')
      return data
    } else {
      console.log('Cache expired, fetching fresh data')
      localStorage.removeItem(CACHE_KEY)
      return null
    }
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

// Helper function to set cached data
const setCachedData = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    console.log('Festival data cached successfully')
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

export function useCachedFestivalData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use the same festival data hook as the main app
  const { 
    festival, 
    edition,
    festivalDays, 
    stages, 
    artists, 
    acts, 
    actArtists, 
    timetableEntries, 
    loading: festivalLoading, 
    error: festivalError,
    getActsByDayAndStage
  } = useFestivalData()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to get cached data first
        let festivalData = getCachedData()

        // Debug logging
        console.log('Cached hook state:', {
          hasCachedData: !!festivalData,
          festivalLoading,
          festivalError,
          hasFestival: !!festival,
          festivalDaysCount: festivalDays?.length || 0
        })

        // If no cached data and festival data is loaded, create structured data
        if (!festivalData && !festivalLoading && !festivalError && festival && festivalDays?.length > 0) {
          console.log('Fetching fresh festival data from API')
          
          // Get the acts data once to avoid infinite loops
          const actsByDay = getActsByDayAndStage()
          console.log('Acts by day:', actsByDay)
          
          // Structure the data as requested: day -> stage -> acts -> artist -> artist info
          festivalData = {
            festival: {
              id: festival.id,
              name: festival.name,
              description: festival.description
            },
            edition: edition ? {
              id: edition.id,
              name: edition.name,
              pdf_cta_text: edition.pdf_cta_text,
              pdf_download_link: edition.pdf_download_link
            } : null,
            days: festivalDays.map(day => {
              // Use the same logic as the main app to get acts for this day
              const dayData = actsByDay.find(d => d.day.id === day.id)
              
              return {
                id: day.id,
                name: day.name,
                date: day.date,
                start_time: day.start_time,
                end_time: day.end_time,
                pdf_cta_text: day.pdf_cta_text,
                pdf_download_link: day.pdf_download_link,
                stages: dayData ? dayData.stages.map(stage => ({
                  id: stage.name,
                  name: stage.name,
                  acts: stage.acts.map(act => ({
                    id: act.id,
                    name: act.name,
                    start_time: act.start_time,
                    end_time: act.end_time,
                    stage: {
                      id: stage.id,
                      name: stage.name
                    },
                    artist: act.artist ? {
                      id: act.artist.id,
                      name: act.artist.name,
                      spotify_id: act.artist.spotify_id,
                      image_url: act.artist.image_url,
                      spotify_url: act.artist.spotify_url,
                      genres: act.artist.genres,
                      popularity: act.artist.popularity,
                      followers: act.artist.followers,
                      about: act.artist.about,
                      bio: act.artist.bio,
                      social_links: act.artist.social_links,
                      youtube_embed: act.artist.youtube_embed
                    } : null
                  }))
                })) : []
              }
            })
          }
          
          // Cache the fresh data
          setCachedData(festivalData)
        }

        if (festivalData) {
          setData(festivalData)
        }
      } catch (err) {
        console.error('Error loading festival data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [festival, festivalDays, festivalLoading, festivalError])

  // Helper function to refresh data (clear cache and reload)
  const refreshData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear cache
      localStorage.removeItem(CACHE_KEY)
      
      // Force reload by setting data to null
      setData(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to clear cache
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    console.log('Cache cleared')
  }

  return {
    data,
    loading: loading || festivalLoading,
    error: error || festivalError,
    refreshData,
    clearCache
  }
} 