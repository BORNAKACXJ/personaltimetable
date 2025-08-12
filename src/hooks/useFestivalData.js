import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Hardcoded IDs for your festival
const FESTIVAL_ID = '43bfaa91-3fab-4245-ae04-ba7e20e12fd0'
const EDITION_ID = 'a2a26ced-06df-47e2-9745-2b708f2d6a0a'

export function useFestivalData() {
  const [festival, setFestival] = useState(null)
  const [festivalDays, setFestivalDays] = useState([])
  const [stages, setStages] = useState([])
  const [stageDays, setStageDays] = useState([])
  const [artists, setArtists] = useState([])
  const [acts, setActs] = useState([])
  const [timetableEntries, setTimetableEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFestivalData()
  }, [])

  const fetchFestivalData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get festival by hardcoded ID
      const { data: festivalData, error: festivalError } = await supabase
        .from('festivals')
        .select('*')
        .eq('id', FESTIVAL_ID)
        .single()

      if (festivalError) {
        console.error('Festival error:', festivalError)
        // Continue without festival data if it doesn't exist
        setFestival({ id: FESTIVAL_ID, name: 'Hit the City 2025' })
      } else {
        setFestival(festivalData)
      }

      // Fetch festival days using edition_id
      const { data: daysData, error: daysError } = await supabase
        .from('festival_days')
        .select('*')
        .eq('edition_id', EDITION_ID)
        .order('date')

      if (daysError) {
        console.error('Error fetching festival days:', daysError)
        setFestivalDays([])
      } else {
        setFestivalDays(daysData || [])
      }

      // Fetch stages using edition_id
      const { data: stagesData, error: stagesError } = await supabase
        .from('stages')
        .select('*')
        .eq('edition_id', EDITION_ID)
        .order('order')

      if (stagesError) {
        console.error('Error fetching stages:', stagesError)
        setStages([])
      } else {
        setStages(stagesData || [])
      }

      // Fetch stage_days for ordering per day
      const { data: stageDaysData, error: stageDaysError } = await supabase
        .from('stage_days')
        .select('*')
        .order('order')

      if (stageDaysError) {
        console.error('Error fetching stage_days:', stageDaysError)
        setStageDays([])
      } else {
        setStageDays(stageDaysData || [])
      }

      // Fetch artists using edition_id
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .eq('edition_id', EDITION_ID)
        .order('name')

      if (artistsError) {
        console.error('Error fetching artists:', artistsError)
        setArtists([])
      } else {
        setArtists(artistsData || [])
      }

      // Fetch acts using edition_id
      const { data: actsData, error: actsError } = await supabase
        .from('acts')
        .select('*')
        .eq('edition_id', EDITION_ID)
        .order('name')

      if (actsError) {
        console.error('Error fetching acts:', actsError)
        setActs([])
      } else {
        setActs(actsData || [])
      }

      // Fetch timetable entries with artist information using edition_id
      const { data: entriesData, error: entriesError } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          artists (
            id,
            name,
            spotify_id,
            image_url,
            spotify_url,
            genres,
            popularity,
            followers,
            about,
            bio,
            social_links,
            youtube_embed
          )
        `)
        .eq('edition_id', EDITION_ID)
        .order('start_time')

      if (entriesError) {
        console.error('Error fetching timetable entries:', entriesError)
        setTimetableEntries([])
      } else {
        setTimetableEntries(entriesData || [])
      }

      console.log('Fetched data:', {
        festival: festivalData,
        days: daysData?.length || 0,
        stages: stagesData?.length || 0,
        stageDays: stageDaysData?.length || 0,
        artists: artistsData?.length || 0,
        acts: actsData?.length || 0,
        entries: entriesData?.length || 0
      })

    } catch (err) {
      console.error('Error fetching festival data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get stage order for a specific day
  const getStageOrderForDay = (dayId) => {
    const dayStageOrder = stageDays
      .filter(sd => sd.day_id === dayId)
      .sort((a, b) => a.order - b.order)
      .map(sd => sd.stage_id)
    
    return dayStageOrder
  }

  // Helper function to get acts grouped by day and stage
  const getActsByDayAndStage = () => {
    const actsByDay = festivalDays.map(day => {
      const dayEntries = timetableEntries.filter(entry => entry.day_id === day.id)
      
      const actsByStage = {}
      
      dayEntries.forEach(entry => {
        const stage = stages.find(s => s.id === entry.stage_id)
        const stageName = stage?.name || 'Unknown Stage'
        
        if (!actsByStage[stageName]) {
          actsByStage[stageName] = []
        }
        
        // Get the act for this entry (if needed)
        const act = acts.find(a => a.id === entry.act_id)
        
        // Get artist directly from the timetable entry
        const artist = entry.artists
        
        const actName = artist?.name || act?.name || 'Unknown Artist'
        
        actsByStage[stageName].push({
          id: entry.id,
          name: actName,
          start_time: entry.start_time,
          end_time: entry.end_time,
          artist: artist,
          act: act,
          stage: stage,
          artist_id: artist?.id || null
        })
      })
      
      // Get stage order for this specific day
      const stageOrderForDay = getStageOrderForDay(day.id)
      
      // If no stage_days data, fall back to stages order
      let orderedStages
      if (stageOrderForDay.length === 0) {
        orderedStages = stages
          .filter(stage => actsByStage[stage.name])
          .map(stage => ({
            name: stage.name,
            acts: actsByStage[stage.name].sort((a, b) => a.start_time.localeCompare(b.start_time))
          }))
      } else {
        // Create stages array in the correct order based on stage_days
        orderedStages = stageOrderForDay
          .map(stageId => {
            const stage = stages.find(s => s.id === stageId)
            return stage && actsByStage[stage.name] ? {
              name: stage.name,
              acts: actsByStage[stage.name].sort((a, b) => a.start_time.localeCompare(b.start_time))
            } : null
          })
          .filter(Boolean) // Remove null entries
      }
      
      return {
        day,
        stages: orderedStages
      }
    })

    return actsByDay
  }

  // Helper function to get artist data by ID
  const getArtistById = (artistId) => {
    return artists.find(artist => artist.id === artistId) || null
  }

  // Helper function to get artist data by name
  const getArtistByName = (artistName) => {
    return artists.find(artist => artist.name === artistName) || null
  }

  return {
    festival,
    festivalDays,
    stages,
    stageDays,
    artists,
    acts,
    timetableEntries,
    loading,
    error,
    refetch: fetchFestivalData,
    getActsByDayAndStage,
    getArtistById,
    getArtistByName
  }
} 