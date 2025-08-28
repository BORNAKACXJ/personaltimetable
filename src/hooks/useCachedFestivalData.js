import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useCachedFestivalData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFestivalData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current festival
      const { data: festival, error: festivalError } = await supabase
        .from('festivals')
        .select('*')
        .eq('is_current', true)
        .single()

      if (festivalError) {
        throw new Error(`Error fetching festival: ${festivalError.message}`)
      }

      if (!festival) {
        throw new Error('No current festival found')
      }

      // Get festival edition
      const { data: edition, error: editionError } = await supabase
        .from('festival_editions')
        .select('*')
        .eq('festival_id', festival.id)
        .eq('is_current', true)
        .single()

      if (editionError) {
        throw new Error(`Error fetching edition: ${editionError.message}`)
      }

      if (!edition) {
        throw new Error('No current edition found')
      }

      // Get festival days
      const { data: days, error: daysError } = await supabase
        .from('festival_days')
        .select('*')
        .eq('edition_id', edition.id)
        .order('date')

      if (daysError) {
        throw new Error(`Error fetching days: ${daysError.message}`)
      }

      // Get stages for each day
      const daysWithStages = await Promise.all(
        days.map(async (day) => {
          const { data: stages, error: stagesError } = await supabase
            .from('stages')
            .select('*')
            .eq('edition_id', edition.id)
            .order('name')

          if (stagesError) {
            throw new Error(`Error fetching stages: ${stagesError.message}`)
          }

          // Get acts for each stage
          const stagesWithActs = await Promise.all(
            stages.map(async (stage) => {
              const { data: acts, error: actsError } = await supabase
                .from('timetable_entries')
                .select(`
                  *,
                  acts (*),
                  artists (*)
                `)
                .eq('stage_id', stage.id)
                .eq('festival_day_id', day.id)
                .order('start_time')

              if (actsError) {
                throw new Error(`Error fetching acts: ${actsError.message}`)
              }

              return {
                ...stage,
                acts: acts || []
              }
            })
          )

          return {
            ...day,
            stages: stagesWithActs
          }
        })
      )

      const festivalData = {
        festival,
        edition,
        days: daysWithStages
      }

      // Cache the data
      localStorage.setItem('festival_data', JSON.stringify(festivalData))
      localStorage.setItem('festival_data_timestamp', Date.now().toString())

      setData(festivalData)
      return festivalData
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const clearCache = useCallback(() => {
    localStorage.removeItem('festival_data')
    localStorage.removeItem('festival_data_timestamp')
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem('festival_data')
        const cachedTimestamp = localStorage.getItem('festival_data_timestamp')

        if (cachedData && cachedTimestamp) {
          const age = Date.now() - parseInt(cachedTimestamp)
          if (age < CACHE_DURATION) {
            setData(JSON.parse(cachedData))
            setLoading(false)
            return
          }
        }

        // Fetch fresh data
        await fetchFestivalData()
      } catch (error) {
        setError(error.message)
        setLoading(false)
      }
    }

    loadData()
  }, [fetchFestivalData])

  return {
    data,
    loading,
    error,
    refetch: fetchFestivalData,
    clearCache
  }
} 