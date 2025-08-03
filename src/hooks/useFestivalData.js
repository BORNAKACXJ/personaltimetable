import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFestivalData() {
  const [festivalDays, setFestivalDays] = useState([])
  const [times, setTimes] = useState([])
  const [acts, setActs] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFestivalData()
  }, [])

  const fetchFestivalData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch festival days
      const { data: daysData, error: daysError } = await supabase
        .from('festival_days')
        .select('*')
        .order('date')

      if (daysError) throw daysError

      // Fetch times
      const { data: timesData, error: timesError } = await supabase
        .from('times')
        .select('*')
        .order('time')

      if (timesError) throw timesError

      // Fetch acts
      const { data: actsData, error: actsError } = await supabase
        .from('acts')
        .select(`
          *,
          festival_days!inner(*),
          artists!inner(*)
        `)
        .order('start_time')

      if (actsError) throw actsError

      // Fetch artists
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .order('name')

      if (artistsError) throw artistsError

      setFestivalDays(daysData || [])
      setTimes(timesData || [])
      setActs(actsData || [])
      setArtists(artistsData || [])

    } catch (err) {
      console.error('Error fetching festival data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    festivalDays,
    times,
    acts,
    artists,
    loading,
    error,
    refetch: fetchFestivalData
  }
} 