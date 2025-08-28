import { useState, useEffect, useCallback } from 'react'
import { RecommendationEngine } from '../utils/recommendationEngine'

export function useRecommendations(spotifyProfileId, festivalId) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastGenerated, setLastGenerated] = useState(null)

  const recommendationEngine = new RecommendationEngine()

  // Load existing recommendations
  const loadRecommendations = useCallback(async () => {
    if (!spotifyProfileId || !festivalId) return

    try {
      setLoading(true)
      setError(null)
      
      const data = await recommendationEngine.getRecommendations(spotifyProfileId, festivalId)
      setRecommendations(data)
    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [spotifyProfileId, festivalId])

  // Generate new recommendations
  const generateRecommendations = useCallback(async () => {
    if (!spotifyProfileId || !festivalId) {
      setError('Missing spotifyProfileId or festivalId')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const data = await recommendationEngine.generateRecommendations(spotifyProfileId, festivalId)
      
      setRecommendations(data)
      setLastGenerated(new Date())
      
      return data
    } catch (err) {
      console.error('Error generating recommendations:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [spotifyProfileId, festivalId])

  // Refresh recommendations (regenerate)
  const refreshRecommendations = useCallback(async () => {
    return await generateRecommendations()
  }, [generateRecommendations])

  // Clear recommendations
  const clearRecommendations = useCallback(() => {
    setRecommendations([])
    setError(null)
    setLastGenerated(null)
  }, [])

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  return {
    recommendations,
    loading,
    error,
    lastGenerated,
    loadRecommendations,
    generateRecommendations,
    refreshRecommendations,
    clearRecommendations
  }
}
