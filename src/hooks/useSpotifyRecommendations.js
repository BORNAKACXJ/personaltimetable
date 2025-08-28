import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSpotifyRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get recommendations based on user's top artists and tracks, ensuring coverage for every 2-hour time slot
  const getRecommendations = useCallback(async (topArtists, topTracks, festivalData) => {
    if ((!topArtists || topArtists.length === 0) && (!topTracks || topTracks.length === 0)) {
      setRecommendations([])
      return []
    }

    try {
      setLoading(true)
      setError(null)

      // Extract Spotify IDs from user's top artists and tracks
      const userArtistIds = topArtists ? topArtists.map(artist => artist.id) : []
      const userTrackArtistIds = topTracks ? topTracks.map(track => track.artists[0].id) : []
      
      // Combine all user's favorite artist IDs (remove duplicates)
      const allUserArtistIds = [...new Set([...userArtistIds, ...userTrackArtistIds])]
      
      // Validate Spotify IDs (they should be 22 characters long and contain only alphanumeric characters)
      const validArtistIds = allUserArtistIds.filter(id => {
        if (!id || typeof id !== 'string') return false
        if (id.length !== 22) return false
        if (!/^[A-Za-z0-9]+$/.test(id)) return false
        return true
      })

      if (validArtistIds.length === 0) {
        setRecommendations([])
        return []
      }

      // Query the related_artists table to find matches
      const batchSize = 50 // Supabase has a limit on query size
      const allRelatedArtists = []
      
      for (let i = 0; i < validArtistIds.length; i += batchSize) {
        const batch = validArtistIds.slice(i, i + batchSize)
        
        const { data: relatedArtists, error: relatedError } = await supabase
          .from('related_artists')
          .select('*')
          .in('spotify_id', batch)
        
        if (relatedError) {
          throw new Error(`Error fetching related artists: ${relatedError.message}`)
        }
        
        if (relatedArtists) {
          allRelatedArtists.push(...relatedArtists)
        }
      }
      
      // Query direct matches (user artists that are directly in the festival)
      const allDirectMatches = []
      
      for (let i = 0; i < validArtistIds.length; i += batchSize) {
        const batch = validArtistIds.slice(i, i + batchSize)
        
        const { data: directMatches, error: directError } = await supabase
          .from('artists')
          .select('*')
          .in('spotify_id', batch)
        
        if (directError) {
          throw new Error(`Error fetching direct matches: ${directError.message}`)
        }
        
        if (directMatches) {
          allDirectMatches.push(...directMatches)
        }
      }
      
      // Get all festival artists to check for related artist matches
      const { data: allFestivalArtists, error: festivalError } = await supabase
        .from('artists')
        .select('*')
      
      if (festivalError) {
        throw new Error(`Error fetching festival artists: ${festivalError.message}`)
      }
      
      // Combine all potential recommendations
      const allRecommendations = []
      
      // Add direct matches
      allDirectMatches.forEach(artist => {
        allRecommendations.push({
          artist: artist,
          match_type: 'direct',
          reason: `You listen to ${artist.name} - they're performing!`,
          score: 100
        })
      })
      
      // Add related artist matches
      allRelatedArtists.forEach(relatedArtist => {
        const festivalArtist = allFestivalArtists.find(fa => fa.spotify_id === relatedArtist.related_spotify_id)
        if (festivalArtist) {
          allRecommendations.push({
            artist: festivalArtist,
            match_type: 'related',
            reason: `You listen to ${relatedArtist.artist_name} - ${festivalArtist.name} is similar!`,
            score: 80
          })
        }
      })
      
      // Remove duplicates (keep highest score)
      const uniqueRecommendations = []
      const seenSpotifyIds = new Set()
      
      allRecommendations.forEach(rec => {
        if (!seenSpotifyIds.has(rec.artist.spotify_id)) {
          seenSpotifyIds.add(rec.artist.spotify_id)
          uniqueRecommendations.push(rec)
        } else {
          // If we've seen this artist before, keep the one with higher score
          const existingIndex = uniqueRecommendations.findIndex(existing => existing.artist.spotify_id === rec.artist.spotify_id)
          if (existingIndex !== -1 && rec.score > uniqueRecommendations[existingIndex].score) {
            uniqueRecommendations[existingIndex] = rec
          }
        }
      })
      
      // Now create time slot recommendations
      const timeSlotRecommendations = await createTimeSlotRecommendations(uniqueRecommendations, festivalData)
      
      setRecommendations(timeSlotRecommendations)
      
      return timeSlotRecommendations

    } catch (error) {
      console.error('Error getting recommendations:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Create time slot recommendations ensuring every 2-hour slot has at least one recommendation
  const createTimeSlotRecommendations = useCallback(async (allRecommendations, festivalData) => {
    if (!festivalData || !festivalData.days || allRecommendations.length === 0) {
      return []
    }

    const timeSlotRecommendations = []
    
    // Process each day
    festivalData.days.forEach(day => {
      // Create 2-hour time slots for this day
      const timeSlots = []
      const startHour = 12 // Start at noon
      const endHour = 24 // End at midnight
      
      for (let hour = startHour; hour < endHour; hour += 2) {
        const startTime = `${day.date}T${hour.toString().padStart(2, '0')}:00:00`
        const endTime = `${day.date}T${(hour + 2).toString().padStart(2, '0')}:00:00`
        
        timeSlots.push({
          start_time: startTime,
          end_time: endTime,
          acts: []
        })
      }
      
      // Get all acts for this day
      const dayActs = []
      day.stages.forEach(stage => {
        stage.acts.forEach(act => {
          dayActs.push({
            ...act,
            stage: stage
          })
        })
      })
      
      // Assign acts to time slots
      timeSlots.forEach(slot => {
        const slotActs = dayActs.filter(act => {
          const actStart = new Date(act.start_time)
          const actEnd = new Date(act.end_time)
          const slotStart = new Date(slot.start_time)
          const slotEnd = new Date(slot.end_time)
          
          return actStart < slotEnd && actEnd > slotStart
        })
        
        // Mark recommended acts
        const recommendedActs = slotActs.filter(act => {
          return allRecommendations.some(rec => rec.artist.spotify_id === act.artist.spotify_id)
        })
        
        // If no recommended acts in this slot, find the best act based on popularity or other criteria
        if (recommendedActs.length === 0 && slotActs.length > 0) {
          // For now, just pick the first act as the "best" one
          const bestAct = slotActs[0]
          bestAct.isRecommended = true
          bestAct.recommendationReason = "Popular act in this time slot"
          slotActs[0] = bestAct
        } else {
          // Mark all recommended acts
          recommendedActs.forEach(recAct => {
            recAct.isRecommended = true
            const recommendation = allRecommendations.find(rec => rec.artist.spotify_id === recAct.artist.spotify_id)
            recAct.recommendationReason = recommendation.reason
          })
        }
        
        slot.acts = slotActs
      })
      
      timeSlotRecommendations.push({
        date: day.date,
        timeSlots: timeSlots
      })
    })
    
    return timeSlotRecommendations
  }, [])

  return {
    recommendations,
    loading,
    error,
    getRecommendations
  }
} 