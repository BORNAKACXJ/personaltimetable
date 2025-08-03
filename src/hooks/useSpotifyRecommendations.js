import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSpotifyRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get recommendations based on user's top artists
  const getRecommendations = useCallback(async (topArtists) => {
    if (!topArtists || topArtists.length === 0) {
      setRecommendations([])
      return []
    }

    try {
      setLoading(true)
      setError(null)

      // Extract Spotify IDs from user's top artists
      const userArtistIds = topArtists.map(artist => artist.id)
      
      console.log('User top artist IDs:', userArtistIds)

      // Query the related_artists table to find matches
      const { data: relatedArtists, error: relatedError } = await supabase
        .from('related_artists')
        .select(`
          *,
          artist:artists(
            id,
            name,
            spotify_id,
            image_url,
            spotify_url,
            genres,
            popularity,
            followers,
            about
          )
        `)
        .in('related_spotify_id', userArtistIds)

      if (relatedError) {
        throw new Error(`Error fetching related artists: ${relatedError.message}`)
      }

      console.log('Related artists found:', relatedArtists)

      // Also check for direct matches (artists that are in the festival)
      const { data: directMatches, error: directError } = await supabase
        .from('artists')
        .select('*')
        .in('spotify_id', userArtistIds)

      if (directError) {
        throw new Error(`Error fetching direct matches: ${directError.message}`)
      }

      console.log('Direct matches found:', directMatches)

      // Combine and process recommendations
      const allRecommendations = []

      // Add direct matches (user's top artists that are performing)
      directMatches.forEach(artist => {
        allRecommendations.push({
          type: 'direct_match',
          artist: artist,
          score: 1.0,
          reason: 'You listen to this artist frequently'
        })
      })

      // Add related artist matches
      relatedArtists.forEach(related => {
        if (related.artist) {
          allRecommendations.push({
            type: 'related_artist',
            artist: related.artist,
            score: related.similarity_score || 0.8,
            reason: `Similar to ${topArtists.find(a => a.id === related.related_spotify_id)?.name || 'an artist you like'}`
          })
        }
      })

      // Remove duplicates and sort by score
      const uniqueRecommendations = allRecommendations.reduce((acc, rec) => {
        const existing = acc.find(r => r.artist.id === rec.artist.id)
        if (!existing) {
          acc.push(rec)
        } else if (rec.score > existing.score) {
          // Replace with higher score
          const index = acc.indexOf(existing)
          acc[index] = rec
        }
        return acc
      }, [])

      // Sort by score (highest first)
      uniqueRecommendations.sort((a, b) => b.score - a.score)

      console.log('Final recommendations:', uniqueRecommendations)
      setRecommendations(uniqueRecommendations)
      return uniqueRecommendations

    } catch (error) {
      console.error('Error getting recommendations:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get recommendations for specific time slots
  const getTimeSlotRecommendations = useCallback(async (topArtists, actsByDay) => {
    const allRecommendations = await getRecommendations(topArtists)
    
    if (allRecommendations.length === 0) {
      return []
    }

    // Create a map of recommended artist IDs for quick lookup
    const recommendedArtistIds = new Set(allRecommendations.map(r => r.artist.id))

    // Process each day and time slot
    const timeSlotRecommendations = actsByDay.map(day => ({
      day: day.day,
      timeSlots: createTimeSlots(day.day.start_time, day.day.end_time).map(slot => {
        const slotActs = []
        
        day.stages.forEach(stage => {
          stage.acts.forEach(act => {
            if (isActInTimeSlot(act, slot.start_time, slot.end_time)) {
              const isRecommended = act.artist && recommendedArtistIds.has(act.artist.id)
              const recommendation = isRecommended 
                ? allRecommendations.find(r => r.artist.id === act.artist.id)
                : null

              slotActs.push({
                ...act,
                isRecommended,
                recommendation
              })
            }
          })
        })

        return {
          ...slot,
          acts: slotActs
        }
      })
    }))

    return timeSlotRecommendations
  }, [getRecommendations])

  // Helper function to create 2-hour time slots
  const createTimeSlots = (startTime, endTime) => {
    const slots = []
    let currentTime = new Date(`2000-01-01T${startTime}:00`)
    const endDateTime = new Date(`2000-01-01T${endTime}:00`)
    
    // Handle overnight events (end time is before start time)
    if (endDateTime < currentTime) {
      endDateTime.setDate(endDateTime.getDate() + 1)
    }
    
    while (currentTime < endDateTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5)
      currentTime.setHours(currentTime.getHours() + 2)
      const slotEnd = currentTime.toTimeString().slice(0, 5)
      
      slots.push({
        start_time: slotStart,
        end_time: slotEnd,
        acts: []
      })
    }
    
    return slots
  }

  // Helper function to check if an act falls within a time slot
  const isActInTimeSlot = (act, slotStart, slotEnd) => {
    const actStart = act.start_time
    const actEnd = act.end_time
    
    // Convert times to minutes for easier comparison
    const slotStartMinutes = parseInt(slotStart.split(':')[0]) * 60 + parseInt(slotStart.split(':')[1])
    const slotEndMinutes = parseInt(slotEnd.split(':')[0]) * 60 + parseInt(slotEnd.split(':')[1])
    const actStartMinutes = parseInt(actStart.split(':')[0]) * 60 + parseInt(actStart.split(':')[1])
    const actEndMinutes = parseInt(actEnd.split(':')[0]) * 60 + parseInt(actEnd.split(':')[1])
    
    // Handle overnight acts
    if (actEndMinutes < actStartMinutes) {
      actEndMinutes += 24 * 60
    }
    if (slotEndMinutes < slotStartMinutes) {
      slotEndMinutes += 24 * 60
    }
    
    // Check if act overlaps with slot
    return actStartMinutes < slotEndMinutes && actEndMinutes > slotStartMinutes
  }

  // Clear recommendations
  const clearRecommendations = useCallback(() => {
    setRecommendations([])
    setError(null)
  }, [])

  return {
    recommendations,
    loading,
    error,
    getRecommendations,
    getTimeSlotRecommendations,
    clearRecommendations
  }
} 