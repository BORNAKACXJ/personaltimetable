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
      console.log(`📋 Loaded ${data.length} existing recommendations`)
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
      
      console.log('🎯 Starting recommendation generation...')
      const data = await recommendationEngine.generateRecommendations(spotifyProfileId, festivalId)
      
      setRecommendations(data)
      setLastGenerated(new Date())
      
      console.log(`✅ Generated ${data.length} recommendations`)
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
    try {
      await generateRecommendations()
    } catch (err) {
      console.error('Error refreshing recommendations:', err)
      setError(err.message)
    }
  }, [generateRecommendations])

  // Load recommendations on mount or when dependencies change
  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  // Get recommendations by type
  const getRecommendationsByType = useCallback((type) => {
    return recommendations.filter(rec => rec.recommendation_type === type)
  }, [recommendations])

  // Get top recommendations (score >= 0.8)
  const getTopRecommendations = useCallback(() => {
    return recommendations.filter(rec => rec.score >= 0.8)
  }, [recommendations])

  // Get direct matches
  const getDirectMatches = useCallback(() => {
    return getRecommendationsByType('direct_match')
  }, [getRecommendationsByType])

  // Get related artist matches
  const getRelatedArtistMatches = useCallback(() => {
    return getRecommendationsByType('related_artist')
  }, [getRecommendationsByType])

  // Get recommendations for a specific day
  const getRecommendationsForDay = useCallback((dayId) => {
    return recommendations.filter(rec => 
      rec.timetable_entry?.festival_days?.id === dayId
    )
  }, [recommendations])

  // Get recommendations for a specific stage
  const getRecommendationsForStage = useCallback((stageId) => {
    return recommendations.filter(rec => 
      rec.timetable_entry?.stages?.id === stageId
    )
  }, [recommendations])

  return {
    // State
    recommendations,
    loading,
    error,
    lastGenerated,
    
    // Actions
    generateRecommendations,
    refreshRecommendations,
    loadRecommendations,
    
    // Filtered data
    getRecommendationsByType,
    getTopRecommendations,
    getDirectMatches,
    getRelatedArtistMatches,
    getRecommendationsForDay,
    getRecommendationsForStage,
    
    // Stats
    totalCount: recommendations.length,
    directMatchCount: getDirectMatches().length,
    relatedArtistCount: getRelatedArtistMatches().length,
    topRecommendationsCount: getTopRecommendations().length
  }
}
