import { Heart } from 'lucide-react'
import { isFavorited } from '../utils/favorites'

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
  onArtistClick 
}) {
  if (currentDayData.stages.length === 0) {
    return (
      <div className="timetable-empty">
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: '#666',
          fontSize: '1.1rem'
        }}>
          No acts scheduled for this day
        </div>
      </div>
    )
  }

  return (
    <div className="timetable__list" id="timetable__list">
      {currentDayData.stages.map((stage, stageIndex) => (
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
                // Check if this act is recommended - match Spotify API 'id' with Supabase 'spotify_id'
                const isRecommended = act.artist && act.artist.spotify_id && recommendations.some(rec => {
                  // rec.artist.id is from Spotify API, act.artist.spotify_id is from Supabase
                  return rec.artist.id === act.artist.spotify_id
                })
                const recommendation = isRecommended ? recommendations.find(rec => rec.artist.id === act.artist.spotify_id) : null
                
                return (
                  <div 
                    key={act.id} 
                    className={`list__act ${isRecommended ? 'list__act--recommended' : ''}`}
                    style={{ 
                      animationDelay: `${(stageIndex * 0.1) + (actIndex * 0.05)}s`,
                      backgroundColor: isRecommended ? '#e8f5e8' : undefined,
                      borderLeft: isRecommended ? '4px solid #1DB954' : undefined
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
                        {isRecommended && (
                          <span style={{ 
                            fontSize: '0.8em', 
                            color: '#1DB954', 
                            marginLeft: '8px',
                            fontWeight: 'bold'
                          }}>
                            ★ RECOMMENDED
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="list__act-time">
                      {formatTimeForDisplay(act.start_time)} - {formatTimeForDisplay(act.end_time)}
                    </div>
                    {isRecommended && recommendation && (
                      <div style={{ 
                        fontSize: '0.8em', 
                        color: '#666', 
                        fontStyle: 'italic',
                        marginTop: '4px'
                      }}>
                        {recommendation.reason}
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
