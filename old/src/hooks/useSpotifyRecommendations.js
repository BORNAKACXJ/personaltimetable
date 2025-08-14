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
      
      console.log('User top artist IDs:', userArtistIds)
      console.log('User top track artist IDs:', userTrackArtistIds)
      console.log('All user artist IDs:', allUserArtistIds)
      console.log('Valid artist IDs:', validArtistIds)
      console.log('Invalid IDs removed:', allUserArtistIds.filter(id => !validArtistIds.includes(id)))

      if (validArtistIds.length === 0) {
        console.log('No valid Spotify IDs found, skipping recommendations')
        setRecommendations([])
        return []
      }

      // Query the related_artists table to find matches
      console.log('Making Supabase query with validArtistIds:', validArtistIds)
      
      // Try to make the query in smaller batches to avoid URL length issues
      const batchSize = 10
      let allRelatedArtists = []
      
      for (let i = 0; i < validArtistIds.length; i += batchSize) {
        const batch = validArtistIds.slice(i, i + batchSize)
        console.log(`Querying batch ${Math.floor(i/batchSize) + 1} with IDs:`, batch)
        
        const { data: batchRelatedArtists, error: batchError } = await supabase
          .from('related_artists')
          .select(`
            id,
            artist_id,
            spotify_id,
            name,
            image_url,
            genres,
            created_at
          `)
          .in('spotify_id', batch)

        if (batchError) {
          console.error(`Error fetching batch ${Math.floor(i/batchSize) + 1}:`, batchError)
          throw new Error(`Error fetching related artists batch: ${batchError.message}`)
        }
        
        allRelatedArtists = [...allRelatedArtists, ...(batchRelatedArtists || [])]
      }

      console.log('All related artists found:', allRelatedArtists)
      console.log('Sample related artist structure:', allRelatedArtists[0])

      // Also check for direct matches (artists that are in the festival)
      let allDirectMatches = []
      
      for (let i = 0; i < validArtistIds.length; i += batchSize) {
        const batch = validArtistIds.slice(i, i + batchSize)
        console.log(`Querying direct matches batch ${Math.floor(i/batchSize) + 1} with IDs:`, batch)
        
        const { data: batchDirectMatches, error: batchError } = await supabase
          .from('artists')
          .select('*')
          .in('spotify_id', batch)

        if (batchError) {
          console.error(`Error fetching direct matches batch ${Math.floor(i/batchSize) + 1}:`, batchError)
          throw new Error(`Error fetching direct matches batch: ${batchError.message}`)
        }
        
        allDirectMatches = [...allDirectMatches, ...(batchDirectMatches || [])]
      }

      console.log('All direct matches found:', allDirectMatches)
      console.log('Sample direct match structure:', allDirectMatches[0])

      // Create a map of all potential recommendations
      const allPotentialRecommendations = new Map()

      // Add direct matches (user's top artists that are performing)
      allDirectMatches.forEach(artist => {
        allPotentialRecommendations.set(artist.id, {
          type: 'direct_match',
          artist: artist,
          score: 1.0,
          reason: 'You listen to this artist frequently'
        })
      })

      // Add related artist matches
      // First, get all festival artists to find related matches
      let allFestivalArtists = []
      
      if (festivalData && festivalData.days) {
        festivalData.days.forEach(day => {
          day.stages?.forEach(stage => {
            stage.acts?.forEach(act => {
              if (act.artist) {
                allFestivalArtists.push(act.artist)
              }
            })
          })
        })
        
        // Remove duplicates based on id
        allFestivalArtists = allFestivalArtists.filter((artist, index, self) => 
          index === self.findIndex(a => a.id === artist.id)
        )
      }
      
      console.log('All festival artists found:', allFestivalArtists.length)
      console.log('Sample festival artist:', allFestivalArtists[0])

      // Now process related artists
      allRelatedArtists.forEach(related => {
        // Find the festival artist that has this related artist
        const festivalArtist = allFestivalArtists.find(artist => artist.id === related.artist_id)
        
        if (festivalArtist) {
          const existing = allPotentialRecommendations.get(festivalArtist.id)
          const newScore = 0.8 // Default similarity score
          
          if (!existing || newScore > existing.score) {
            allPotentialRecommendations.set(festivalArtist.id, {
              type: 'related_artist',
              artist: festivalArtist,
              score: newScore,
              reason: `Similar to ${validArtistIds.includes(related.spotify_id) ? 
                (topArtists?.find(a => a.id === related.spotify_id)?.name || 
                 topTracks?.find(t => t.artists[0].id === related.spotify_id)?.artists[0].name || 
                 related.name) : related.name}`
            })
          }
        }
      })

      // Convert to array and sort by score
      const allRecommendations = Array.from(allPotentialRecommendations.values())
        .sort((a, b) => b.score - a.score)

      console.log('All potential recommendations:', allRecommendations)
      console.log('All recommendations sample:', allRecommendations.slice(0, 2))
      console.log('All recommendations count:', allRecommendations.length)
      
      if (allRecommendations.length > 0) {
        console.log('First recommendation structure:', {
          type: allRecommendations[0].type,
          artistName: allRecommendations[0].artist.name,
          artistId: allRecommendations[0].artist.id,
          artistSpotifyId: allRecommendations[0].artist.spotify_id,
          score: allRecommendations[0].score,
          reason: allRecommendations[0].reason
        })
      }

      // Now create time slot recommendations
      console.log('About to create time slot recommendations with:', {
        allRecommendationsCount: allRecommendations.length,
        festivalData: !!festivalData,
        festivalDays: festivalData?.days?.length || 0
      })
      
      const timeSlotRecommendations = await createTimeSlotRecommendations(allRecommendations, festivalData)

      console.log('Time slot recommendations:', timeSlotRecommendations)
      console.log('Time slot recommendations length:', timeSlotRecommendations.length)
      
      setRecommendations(timeSlotRecommendations)
      
      // Debug: Log the structure of recommendations
      console.log('=== RECOMMENDATIONS DEBUG ===')
      console.log('Final recommendations structure:', timeSlotRecommendations)
      if (timeSlotRecommendations.length > 0) {
        console.log('First day recommendations:', timeSlotRecommendations[0])
        if (timeSlotRecommendations[0].timeSlots) {
          console.log('First day time slots:', timeSlotRecommendations[0].timeSlots)
          if (timeSlotRecommendations[0].timeSlots.length > 0) {
            console.log('First time slot:', timeSlotRecommendations[0].timeSlots[0])
            if (timeSlotRecommendations[0].timeSlots[0].acts) {
              console.log('First time slot acts:', timeSlotRecommendations[0].timeSlots[0].acts)
              const recommendedActs = timeSlotRecommendations[0].timeSlots[0].acts.filter(act => act.isRecommended)
              console.log('Recommended acts in first time slot:', recommendedActs)
            }
          }
        }
      }
      console.log('=== END RECOMMENDATIONS DEBUG ===')
      
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
    console.log('createTimeSlotRecommendations called with:', {
      allRecommendationsCount: allRecommendations.length,
      festivalDataExists: !!festivalData,
      festivalDays: festivalData?.days?.length || 0
    })
    
    if (!festivalData || !festivalData.days || allRecommendations.length === 0) {
      console.log('Early return from createTimeSlotRecommendations because:', {
        noFestivalData: !festivalData,
        noDays: !festivalData?.days,
        noRecommendations: allRecommendations.length === 0
      })
      return []
    }

    const timeSlotRecommendations = []

    // Process each day
    for (const day of festivalData.days) {
      console.log('Processing day:', day.date)
      const daySlots = []
      
      // Create 2-hour time slots for this day
      const timeSlots = createTimeSlots(day.start_time, day.end_time)
      console.log('Created time slots:', timeSlots.length)
      
      // For each time slot, find acts and ensure at least one recommendation
      for (const slot of timeSlots) {
        const slotActs = []
        const recommendedActs = []
        
        // Find all acts in this time slot
        for (const stage of day.stages || []) {
          for (const act of stage.acts || []) {
            if (isActInTimeSlot(act, slot.start_time, slot.end_time)) {
              const isRecommended = act.artist && act.artist.spotify_id && allRecommendations.some(rec => rec.artist.id === act.artist.spotify_id)
              const recommendation = isRecommended 
                ? allRecommendations.find(rec => rec.artist.id === act.artist.spotify_id)
                : null

              const actWithRecommendation = {
                ...act,
                stage: stage.name,
                isRecommended,
                recommendation
              }

              slotActs.push(actWithRecommendation)
              
              if (isRecommended) {
                recommendedActs.push(actWithRecommendation)
                console.log('Found recommended act:', act.name, 'with spotify_id:', act.artist.spotify_id)
              }
            }
          }
        }

        console.log(`Slot ${slot.start_time}-${slot.end_time}: ${slotActs.length} acts, ${recommendedActs.length} recommended`)

        // If no recommendations in this slot, find the best available recommendation
        if (recommendedActs.length === 0 && slotActs.length > 0) {
          // Find the act with the highest score from our recommendations
          let bestAct = null
          let bestScore = 0

          for (const act of slotActs) {
            if (act.artist && act.artist.spotify_id) {
              // Check if this artist is related to any of our recommendations
              const relatedRecommendation = allRecommendations.find(rec => 
                rec.artist.id === act.artist.spotify_id
              )
              
              if (relatedRecommendation && relatedRecommendation.score > bestScore) {
                bestScore = relatedRecommendation.score
                bestAct = {
                  ...act,
                  isRecommended: true,
                  recommendation: relatedRecommendation
                }
              }
            }
          }

          // If we found a good match, mark it as recommended
          if (bestAct) {
            const actIndex = slotActs.findIndex(a => a.id === bestAct.id)
            if (actIndex !== -1) {
              slotActs[actIndex] = bestAct
              console.log('Marked best act as recommended:', bestAct.name)
            }
          }
        }

        daySlots.push({
          ...slot,
          acts: slotActs,
          hasRecommendations: slotActs.some(act => act.isRecommended)
        })
      }

      timeSlotRecommendations.push({
        day: day,
        timeSlots: daySlots
      })
    }

    console.log('Final timeSlotRecommendations:', timeSlotRecommendations)
    return timeSlotRecommendations
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