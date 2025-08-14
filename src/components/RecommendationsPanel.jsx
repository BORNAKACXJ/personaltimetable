import { useSpotifyRecommendations } from '../hooks/useSpotifyRecommendations'
import { Star, Music } from 'lucide-react'

export function RecommendationsPanel({ 
  topArtists, 
  topTracks, 
  festivalData, 
  currentDayData,
  onArtistClick 
}) {
  const { 
    recommendations, 
    getRecommendations, 
    loading: recommendationsLoading 
  } = useSpotifyRecommendations()

  // Helper function to flatten time slot recommendations
  const getFlattenedRecommendations = () => {
    if (!recommendations || !Array.isArray(recommendations)) {
      return []
    }
    
    const flattened = []
    recommendations.forEach(dayRec => {
      if (dayRec.timeSlots) {
        dayRec.timeSlots.forEach(slot => {
          if (slot.acts) {
            slot.acts.forEach(act => {
              if (act.isRecommended && act.recommendation) {
                flattened.push(act.recommendation)
              }
            })
          }
        })
      }
    })
    
    // Remove duplicates based on Spotify ID
    const unique = flattened.filter((rec, index, self) => 
      index === self.findIndex(r => r.artist.id === rec.artist.id)
    )
    
    return unique
  }

  // Helper function to get recommendations for current day
  const getCurrentDayRecommendations = () => {
    if (!recommendations || !Array.isArray(recommendations)) {
      return []
    }
    
    const currentDayRec = recommendations.find(dayRec => 
      dayRec.day && dayRec.day.date === currentDayData.date
    )
    
    if (!currentDayRec) {
      return []
    }
    
    const currentDayFlattened = []
    if (currentDayRec.timeSlots) {
      currentDayRec.timeSlots.forEach(slot => {
        if (slot.acts) {
          slot.acts.forEach(act => {
            if (act.isRecommended && act.recommendation) {
              currentDayFlattened.push(act.recommendation)
            }
          })
        }
      })
    }
    
    // Remove duplicates based on Spotify ID
    const unique = currentDayFlattened.filter((rec, index, self) => 
      index === self.findIndex(r => r.artist.id === rec.artist.id)
    )
    
    return unique
  }

  const flattenedRecommendations = getFlattenedRecommendations()
  const currentDayRecommendations = getCurrentDayRecommendations()

  if (recommendationsLoading) {
    return (
      <div className="recommendations-loading">
        <div className="loading-spinner"></div>
        <p>Generating recommendations...</p>
      </div>
    )
  }

  if (!topArtists || topArtists.length === 0) {
    return null
  }

  if (flattenedRecommendations.length === 0) {
    return (
      <div className="recommendations-empty">
        <div className="recommendations-empty-content">
          <Music size={32} color="#666" />
          <p>No recommendations found based on your listening history</p>
        </div>
      </div>
    )
  }

  return (
    <div className="recommendations-summary">
      <div className="recommendations-header">
        <Star size={20} color="#1DB954" />
        <h3 className="recommendations-title">
          Your Recommendations ({flattenedRecommendations.length} artists)
        </h3>
      </div>
      
      {/* Show recommendations for current day */}
      {currentDayRecommendations.length > 0 && (
        <div className="current-day-recommendations">
          <div className="current-day-header">
            Playing today ({currentDayRecommendations.length}):
          </div>
          <div className="recommendations-tags">
            {currentDayRecommendations.map((rec) => (
              <div 
                key={rec.artist.id} 
                className="recommendation-tag current-day"
                onClick={() => {
                  const act = currentDayData.stages
                    .flatMap(stage => stage.acts)
                    .find(act => act.artist && act.artist.spotify_id === rec.artist.id)
                  if (act && onArtistClick) {
                    onArtistClick(act)
                  }
                }}
              >
                {rec.artist.name}
                <span className="recommendation-tag-icon">
                  {rec.type === 'direct_match' ? '★' : '♪'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All recommendations */}
      <div className="all-recommendations">
        <div className="recommendations-tags">
          {flattenedRecommendations.slice(0, 8).map((rec) => (
            <div 
              key={rec.artist.id} 
              className="recommendation-tag"
              onClick={() => {
                const act = currentDayData.stages
                  .flatMap(stage => stage.acts)
                  .find(act => act.artist && act.artist.spotify_id === rec.artist.id)
                if (act && onArtistClick) {
                  onArtistClick(act)
                }
              }}
            >
              {rec.artist.name}
              <span className="recommendation-tag-icon">
                {rec.type === 'direct_match' ? '★' : '♪'}
              </span>
            </div>
          ))}
          {flattenedRecommendations.length > 8 && (
            <div className="recommendations-more">
              +{flattenedRecommendations.length - 8} more
            </div>
          )}
        </div>
      </div>
      
      <div className="recommendations-subtitle">
        Based on your Spotify listening history • Click any artist to see details
      </div>
    </div>
  )
}
