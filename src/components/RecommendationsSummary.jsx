import React from 'react'
import { Heart } from 'lucide-react'

export function RecommendationsSummary({ 
  spotifyAuthenticated, 
  flattenedRecommendations, 
  currentDayRecommendations, 
  currentDayData, 
  handleArtistClick,
  createTimeSlots,
  isActInTimeSlot,
  isFavorited
}) {
  if (!spotifyAuthenticated || flattenedRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations-summary">
      <div className="recommendations-header">
        <span className="recommendations-star">★</span>
        <h3 className="recommendations-title">
          Your Recommendations ({flattenedRecommendations.length} artists)
        </h3>
      </div>
      
      {/* Show recommendations for current day */}
      {currentDayRecommendations.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            fontSize: '0.9em', 
            color: '#1DB954', 
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            Playing today ({currentDayRecommendations.length}):
          </div>
          <div className="recommendations-tags">
            {currentDayRecommendations.map((rec) => (
              <div 
                key={rec.artist.id} 
                className="recommendation-tag"
                style={{ backgroundColor: '#f0fff0' }}
                onClick={() => {
                  const act = currentDayData.stages
                    .flatMap(stage => stage.acts)
                    .find(act => act.artist && act.artist.spotify_id === rec.artist.id)
                  if (act) {
                    handleArtistClick(act)
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

      {/* Time slot recommendations summary */}
      {(() => {
        const timeSlotSummary = []
        const timeSlots = createTimeSlots(currentDayData.start_time || '12:00', currentDayData.end_time || '02:00')
        
        timeSlots.forEach(slot => {
          const slotActs = currentDayData.stages.flatMap(stage => 
            stage.acts.filter(act => isActInTimeSlot(act, slot.start_time, slot.end_time))
          )
          const recommendedActs = slotActs.filter(act => 
            act.artist && act.artist.spotify_id && flattenedRecommendations.some(rec => rec.artist.id === act.artist.spotify_id)
          )
          
          if (recommendedActs.length > 0) {
            timeSlotSummary.push({
              time: `${slot.start_time}-${slot.end_time}`,
              count: recommendedActs.length,
              acts: recommendedActs
            })
          }
        })

        if (timeSlotSummary.length > 0) {
          return (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                fontSize: '0.9em', 
                color: '#1DB954', 
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                Recommended by time:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {timeSlotSummary.map((slot, index) => (
                  <div 
                    key={index}
                    style={{
                      background: 'white',
                      border: '1px solid #1DB954',
                      borderRadius: '12px',
                      padding: '3px 8px',
                      fontSize: '0.8em',
                      color: '#333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {slot.time} ({slot.count})
                  </div>
                ))}
              </div>
            </div>
          )
        }
        return null
      })()}
      
      <div className="recommendations-tags">
        {flattenedRecommendations.slice(0, 8).map((rec, index) => (
          <div 
            key={rec.artist.id} 
            className="recommendation-tag"
            onClick={() => {
              // Find the act for this artist and open the dialog
              const act = currentDayData.stages
                .flatMap(stage => stage.acts)
                .find(act => act.artist && act.artist.spotify_id === rec.artist.id)
              if (act) {
                handleArtistClick(act)
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
      
      <div className="recommendations-subtitle">
        Based on your Spotify listening history • Click any artist to see details
      </div>
    </div>
  )
}
