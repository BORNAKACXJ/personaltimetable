import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFestivalData() {
  const [festival, setFestival] = useState(null)
  const [festivalDays, setFestivalDays] = useState([])
  const [stages, setStages] = useState([])
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

      // Get current festival
      const { data: festivalData, error: festivalError } = await supabase
        .from('festivals')
        .select('*')
        .eq('status', 'current')
        .single()

      if (festivalError) throw festivalError

      if (!festivalData) {
        throw new Error('No current festival found')
      }

      setFestival(festivalData)

      // Fetch all related data for the festival
      const festivalId = festivalData.id

      // Fetch festival days
      const { data: daysData, error: daysError } = await supabase
        .from('festival_days')
        .select('*')
        .eq('festival_id', festivalId)
        .order('date')

      if (daysError) throw daysError

      // Fetch stages
      const { data: stagesData, error: stagesError } = await supabase
        .from('stages')
        .select('*')
        .eq('festival_id', festivalId)
        .order('name')

      if (stagesError) throw stagesError

      // Fetch artists
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .eq('festival_id', festivalId)
        .order('name')

      if (artistsError) throw artistsError

      // Fetch acts
      const { data: actsData, error: actsError } = await supabase
        .from('acts')
        .select('*')
        .eq('festival_id', festivalId)
        .order('name')

      if (actsError) throw actsError

      // Fetch timetable entries with all related data
      const { data: entriesData, error: entriesError } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          acts (
            *,
            act_artists (
              *,
              artists (*)
            )
          ),
          stages (*),
          festival_days (*)
        `)
        .eq('festival_id', festivalId)
        .order('start_time')

      if (entriesError) throw entriesError

      setFestivalDays(daysData || [])
      setStages(stagesData || [])
      setArtists(artistsData || [])
      setActs(actsData || [])
      setTimetableEntries(entriesData || [])

    } catch (err) {
      console.error('Error fetching festival data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get acts grouped by day and stage
  const getActsByDayAndStage = () => {
    const actsByDay = festivalDays.map(day => {
      const dayEntries = timetableEntries.filter(entry => entry.day_id === day.id)
      const actsByStage = {}
      
      dayEntries.forEach(entry => {
        const stageName = entry.stages?.name || 'Unknown Stage'
        if (!actsByStage[stageName]) {
          actsByStage[stageName] = []
        }
        
        // Get primary artist for this act
        const primaryArtist = entry.acts?.act_artists?.find(aa => aa.is_primary)?.artists
        const actName = primaryArtist?.name || entry.acts?.name || 'Unknown Artist'
        
        actsByStage[stageName].push({
          id: entry.id,
          name: actName,
          start_time: entry.start_time,
          end_time: entry.end_time,
          artist: primaryArtist,
          act: entry.acts,
          stage: entry.stages
        })
      })
      
      return {
        day,
        stages: Object.entries(actsByStage).map(([stageName, stageActs]) => ({
          name: stageName,
          acts: stageActs.sort((a, b) => a.start_time.localeCompare(b.start_time))
        }))
      }
    })

    return actsByDay
  }

  // Helper function to get artist data by name
  const getArtistByName = (artistName) => {
    return artists.find(artist => artist.name === artistName) || null
  }

  // Helper function to get all artists for an act
  const getArtistsForAct = (actId) => {
    return acts
      .filter(act => act.id === actId)
      .flatMap(act => act.act_artists || [])
      .map(aa => aa.artists)
      .filter(Boolean)
  }

  return {
    festival,
    festivalDays,
    stages,
    artists,
    acts,
    timetableEntries,
    loading,
    error,
    refetch: fetchFestivalData,
    getActsByDayAndStage,
    getArtistByName,
    getArtistsForAct
  }
} 