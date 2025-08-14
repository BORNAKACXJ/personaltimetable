import { Star, Music, Target, Users } from 'lucide-react'

export function RecommendationsPanel({ 
  topArtists, 
  topTracks, 
  recommendations,
  recommendationsCount,
  directMatchCount,
  relatedArtistCount,
  recommendationsLoading,
  recommendationsError,
  festivalData, 
  currentDayData,
  onArtistClick 
}) {
  // Helper function to get recommendations for current day
  const getCurrentDayRecommendations = () => {
    if (!recommendations || !Array.isArray(recommendations)) {
      return []
    }
    
    return recommendations.filter(rec => 
      rec.day && rec.day.id === currentDayData.id
    )
  }

  const currentDayRecommendations = getCurrentDayRecommendations()

  if (recommendationsLoading) {
    return (
      <div className="recommendations-loading">
        <div className="loading-spinner"></div>
        <p>Generating recommendations...</p>
      </div>
    )
  }

  if (recommendationsError) {
    return (
      <div className="recommendations-error">
        <p>Error generating recommendations: {recommendationsError}</p>
      </div>
    )
  }

  if (!topArtists || topArtists.length === 0) {
    return null
  }

  if (!recommendations || recommendations.length === 0) {
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
          Your Recommendations ({recommendationsCount} artists)
        </h3>
        <div className="recommendations-stats">
          <span className="stat-item">
            <Target size={14} />
            {directMatchCount} direct matches
          </span>
          <span className="stat-item">
            <Users size={14} />
            {relatedArtistCount} related artists
          </span>
        </div>
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
                key={rec.artist_id} 
                className="recommendation-tag current-day"
                onClick={() => {
                  if (rec.artist && onArtistClick) {
                    onArtistClick({
                      ...rec.act,
                      artist: rec.artist,
                      stage: rec.stage,
                      start_time: rec.startTime,
                      end_time: rec.endTime
                    })
                  }
                }}
              >
                {rec.artist_name}
                <span className="recommendation-tag-icon">
                  {rec.recommendation_type === 'direct_match' ? '★' : '♪'}
                </span>
                <span className="recommendation-score">
                  {Math.round(rec.score * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All recommendations */}
      <div className="all-recommendations">
        <div className="recommendations-tags">
          {recommendations.slice(0, 8).map((rec) => (
            <div 
              key={rec.artist_id} 
              className="recommendation-tag"
              onClick={() => {
                if (rec.artist && onArtistClick) {
                  onArtistClick({
                    ...rec.act,
                    artist: rec.artist,
                    stage: rec.stage,
                    start_time: rec.startTime,
                    end_time: rec.endTime
                  })
                }
              }}
            >
              {rec.artist_name}
              <span className="recommendation-tag-icon">
                {rec.recommendation_type === 'direct_match' ? '★' : '♪'}
              </span>
              <span className="recommendation-score">
                {Math.round(rec.score * 100)}%
              </span>
            </div>
          ))}
          {recommendations.length > 8 && (
            <div className="recommendations-more">
              +{recommendations.length - 8} more
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
