import { useState } from 'react'
import { Heart } from 'lucide-react'
import { isFavorited } from '../utils/favorites'
import './TimelineView.css'

// Format time to display format (remove seconds if present)
function formatTimeForDisplay(timeStr) {
  if (!timeStr) return ''
  // If time is in format "HH:MM:SS", convert to "HH:MM"
  if (timeStr.includes(':') && timeStr.split(':').length === 3) {
    return timeStr.substring(0, 5)
  }
  return timeStr
}

// Convert time to minutes for sorting (handles overnight events)
function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Sort acts by start time (handles overnight events)
function sortActsByTime(acts) {
  return [...acts].sort((a, b) => {
    const aMinutes = timeToMinutes(a.start_time)
    const bMinutes = timeToMinutes(b.start_time)
    
    // Handle overnight events - if one act starts after midnight and the other before
    // We assume acts starting after midnight (like 01:00) should come after acts starting before midnight (like 23:00)
    if (aMinutes < 6 * 60 && bMinutes > 18 * 60) {
      // a is early morning (before 6 AM), b is evening (after 6 PM)
      return 1 // a comes after b
    } else if (aMinutes > 18 * 60 && bMinutes < 6 * 60) {
      // a is evening (after 6 PM), b is early morning (before 6 AM)
      return -1 // a comes before b
    } else {
      // Both acts are in the same time period (day or night)
      return aMinutes - bMinutes
    }
  })
}

export function TimetableList({ 
  currentDayData, 
  recommendations = [], 
  onArtistClick,
  showOnlyRecommended = true
}) {
  
  // Filter acts based on toggle state
  const filteredStages = showOnlyRecommended 
    ? currentDayData.stages.map(stage => ({
        ...stage,
        acts: stage.acts.filter(act => {
          // Only show acts that have a valid recommendation with colorClassification
          const hasValidRecommendation = act.artist && act.artist.spotify_id && recommendations.some(rec => 
            rec.artist.spotify_id === act.artist.spotify_id && rec.colorClassification && rec.recommended === true
          )
          return hasValidRecommendation
        })
      })).filter(stage => stage.acts.length > 0) // Only show stages with recommended acts
    : currentDayData.stages

  if (filteredStages.length === 0) {
    return (
      <div className="timetable-empty">
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: 'white',
          fontSize: '1.1rem'
        }}>
          {showOnlyRecommended ? 'No recommended acts for this day' : 'No acts scheduled for this day'}
        </div>
      </div>
    )
  }

  return (
    <div className="timetable__list" id="timetable__list">
              {filteredStages.map((stage, stageIndex) => (
        <div 
          key={stage.name} 
          className="list__stage"
          style={{
            opacity: 1,
            transform: 'translateY(0px)',
            animationDelay: `${stageIndex * 0.1}s`,
            transition: '0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="list__stage-name">{stage.name}</div>
          <div className="list__acts">
            {stage.acts.length === 0 ? (
              <div style={{ 
                padding: '1rem',
                color: '#999',
                fontStyle: 'italic'
              }}>
                No acts scheduled for this stage
              </div>
            ) : (
              sortActsByTime(stage.acts).map((act, actIndex) => {
                // Check if this act is recommended - match API recommendation structure
                const isRecommended = act.artist && act.artist.spotify_id && recommendations.some(rec => {
                  return rec.artist.spotify_id === act.artist.spotify_id
                })
                const recommendation = isRecommended ? recommendations.find(rec => rec.artist.spotify_id === act.artist.spotify_id) : null

                // Get CSS class based on match_type ONLY
                const getMatchTypeClass = (recommendation) => {
                  // If no recommendations are loaded (no personal timetable), don't apply any recommendation styling
                  if (recommendations.length === 0) {
                    return ''
                  }
                  
                  if (!recommendation || !recommendation.match_type) {
                    return 'match__type--nomatch'
                  }
                  
                  // Use ONLY match_type, ignore colorClassification
                  const matchType = recommendation.match_type || recommendation.matchType
                  
                  switch (matchType) {
                    case 'heavy':
                      return 'match__type--heavy'
                    case 'direct':
                      return 'match__type--direct'
                    case 'medium':
                      return 'match__type--medium'
                    case 'light':
                      return 'match__type--light'
                    case 'soft':
                      return 'match__type--soft'
                    default:
                      return 'match__type--nomatch'
                  }
                }

                // Get indicator class based on match type
                const getIndicatorClass = (recommendation) => {
                  const matchType = recommendation.match_type || recommendation.matchType
                  switch (matchType) {
                    case 'heavy':
                    case 'direct':
                      return 'match-indicator match-indicator--direct'
                    case 'medium':
                    case 'related':
                      return 'match-indicator match-indicator--relevant-artist'
                    case 'light':
                    case 'genre':
                      return 'match-indicator match-indicator--genre'
                    case 'soft':
                    case 'genre_light':
                      return 'match-indicator match-indicator--genre-light'
                    default:
                      return 'match-indicator'
                  }
                }

                // Get details class based on match type
                const getDetailsClass = (recommendation) => {
                  const matchType = recommendation.match_type || recommendation.matchType
                  switch (matchType) {
                    case 'heavy':
                    case 'direct':
                      return 'match-details--direct'
                    case 'medium':
                    case 'related':
                      return 'match-details--relevant-artist'
                    case 'light':
                    case 'genre':
                      return 'match-details--genre'
                    case 'soft':
                    case 'genre_light':
                      return 'match-details--genre-light'
                    default:
                      return 'match-details--nomatch'
                  }
                }
                
                return (
                  <div 
                    key={act.id} 
                    className={`list__act ${recommendation ? getMatchTypeClass(recommendation) : (recommendations.length > 0 ? 'match__type--nomatch' : '')}`}
                    style={{ 
                      animationDelay: `${(stageIndex * 0.1) + (actIndex * 0.05)}s`
                    }}
                    data-artist={act.name}
                    onClick={() => onArtistClick(act)}
                  >
                    <div className="list__act-name">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isFavorited(act) && (
                          <Heart 
                            size={16} 
                            fill="#ff4757" 
                            color="#ff4757"
                            style={{ flexShrink: 0 }}
                          />
                        )}
                        <span>{act.name}</span>
                        {isRecommended && recommendation && recommendations.length > 0 && (
                          <span className={getIndicatorClass(recommendation)}>
                            {(() => {
                              // Use ONLY the match_type from the API
                              const matchType = recommendation.match_type || recommendation.matchType
                              
                              if (matchType === 'heavy') {
                                return '★ Strong'
                              } else if (matchType === 'medium') {
                                return '◆ Related'
                              } else if (matchType === 'light') {
                                return '● Genre'
                              } else if (matchType === 'soft') {
                                return '● Genre'
                              } else {
                                return '● Genre'
                              }
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="list__act-time">
                      {formatTimeForDisplay(act.start_time)} - {formatTimeForDisplay(act.end_time)}
                    </div>
                    {isRecommended && recommendation && recommendations.length > 0 && (
                      <div className={`match-details ${getDetailsClass(recommendation)}`}>
                        {(() => {
                          // Use ONLY the match_type from the API
                          const matchType = recommendation.match_type || recommendation.matchType
                          
                          if (matchType === 'heavy') return 'Strong match'
                          if (matchType === 'medium') return 'Related artist'
                          if (matchType === 'light') return 'Genre match'
                          if (matchType === 'soft') return 'Genre match'
                          return 'Recommended'
                        })()}
                        {recommendation.matchScore > 0 && ` (${recommendation.matchScore}pts)`}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
