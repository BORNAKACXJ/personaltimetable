import { useState, useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import { isFavorited } from '../utils/favorites'
import './TimelineView.css'

// Utility: "12:00" → 720
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

// Utility: 720 → "12:00"
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Generate 30-minute interval time markers
function generateTimeMarkers(start, end, interval = 30) {
  const markers = []
  let startMin = timeToMinutes(start)
  let endMin = timeToMinutes(end)

  if (endMin <= startMin) endMin += 24 * 60 // handle span over midnight

  for (let min = startMin; min <= endMin; min += interval) {
    markers.push(minutesToTime(min))
  }

  return markers
}

// Convert time to grid column index (1-based) for current day
function timeToColumnIndex(time, startTime, timeMarkers) {
  const targetMinutes = timeToMinutes(time)
  const startMinutes = timeToMinutes(startTime)
  const adjustedTarget = (targetMinutes < startMinutes) ? targetMinutes + 1440 : targetMinutes

  const timeMarkerMinutes = timeMarkers.map(t => {
    const m = timeToMinutes(t)
    return (m < startMinutes) ? m + 1440 : m
  })

  const index = timeMarkerMinutes.findIndex(m => m >= adjustedTarget)
  return (index === -1 ? timeMarkerMinutes.length - 1 : index) + 1
}

// Format time to display format (remove seconds if present)
function formatTimeForDisplay(timeStr) {
  if (!timeStr) return ''
  // If time is in format "HH:MM:SS", convert to "HH:MM"
  if (timeStr.includes(':') && timeStr.split(':').length === 3) {
    return timeStr.substring(0, 5)
  }
  return timeStr
}

// Check if two acts overlap in time
function actsOverlap(act1, act2) {
  const start1 = timeToMinutes(act1.start_time)
  const end1 = timeToMinutes(act1.end_time)
  const start2 = timeToMinutes(act2.start_time)
  const end2 = timeToMinutes(act2.end_time)
  
  // Handle overnight acts
  const adjustedEnd1 = end1 < start1 ? end1 + 24 * 60 : end1
  const adjustedEnd2 = end2 < start2 ? end2 + 24 * 60 : end2
  const adjustedStart1 = start1
  const adjustedStart2 = start2
  
  return adjustedStart1 < adjustedEnd2 && adjustedStart2 < adjustedEnd1
}

// Organize acts into rows to avoid overlaps
function organizeActsIntoRows(acts) {
  if (!acts || acts.length === 0) return []
  
  const rows = []
  
  acts.forEach(act => {
    let placed = false
    let rowIndex = 0
    
    // Try to place the act in an existing row
    while (rowIndex < rows.length && !placed) {
      const row = rows[rowIndex]
      const hasOverlap = row.some(existingAct => actsOverlap(act, existingAct))
      
      if (!hasOverlap) {
        row.push(act)
        placed = true
      } else {
        rowIndex++
      }
    }
    
    // If couldn't place in existing rows, create a new row
    if (!placed) {
      rows.push([act])
    }
  })
  
  return rows
}

export function TimelineView({ currentDayData, recommendations = [], onArtistClick }) {
  const [timeMarkers, setTimeMarkers] = useState([])
  const [totalColumns, setTotalColumns] = useState(0)
  const timelineRef = useRef(null)

  // Use the festival day's start and end times
  const getTimeRange = () => {
    if (!currentDayData.day || !currentDayData.day.start_time || !currentDayData.day.end_time) {
      return { start: "12:00", end: "02:00" }
    }

    return { 
      start: currentDayData.day.start_time, 
      end: currentDayData.day.end_time 
    }
  }

  useEffect(() => {
    const timeRange = getTimeRange()
    const markers = generateTimeMarkers(timeRange.start, timeRange.end)
    setTimeMarkers(markers)
    setTotalColumns(markers.length)
  }, [currentDayData])

  useEffect(() => {
    const syncTimeMarkerLines = () => {
      if (timelineRef.current) {
        const timeline = timelineRef.current
        const markers = timeline.querySelectorAll('.time-marker')
        const height = timeline.offsetHeight - 128

        markers.forEach(marker => {
          marker.style.setProperty('--marker-line-height', `${height}px`)
        })
      }
    }

    // Sync on mount and resize
    syncTimeMarkerLines()
    window.addEventListener('resize', syncTimeMarkerLines)
    
    return () => {
      window.removeEventListener('resize', syncTimeMarkerLines)
    }
  }, [timeMarkers])

  if (!currentDayData.stages || currentDayData.stages.length === 0) {
    return (
      <div className="timetable__grid" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '200px',
        color: '#666'
      }}>
        <div>No acts scheduled for this day</div>
      </div>
    )
  }

  const timeRange = getTimeRange()

  return (
    <div 
      className="timetable__grid" 
      id="timetable"
      ref={timelineRef}
      style={{ 
        gridTemplateColumns: `repeat(${totalColumns}, var(--timeline-grid-width))` 
      }}
    >
      {/* Time marker row */}
      <div className="time-marker-row" style={{ display: 'contents' }}>
        {timeMarkers.map((time, index) => (
          <div 
            key={time}
            className={time.endsWith(':00') ? 'time-marker hour' : 'time-marker '}
            style={{ '--marker-line-height': '496px' }}
          >
            <span>{time}</span>
          </div>
        ))}
      </div>

      {/* Stages and events - no wrapper div */}
      {currentDayData.stages.map((stage, stageIndex) => {
        // Organize acts into rows to handle overlaps
        const actRows = organizeActsIntoRows(stage.acts)
        const totalActRows = actRows.length
        
        // Calculate starting row for this stage
        let currentStageRow = stageIndex * 2 + 2 // Row 1 = time markers, then stage name, then acts
        
        // If previous stages had multiple act rows, adjust the starting row
        for (let i = 0; i < stageIndex; i++) {
          const prevStage = currentDayData.stages[i]
          const prevActRows = organizeActsIntoRows(prevStage.acts)
          currentStageRow += prevActRows.length
        }
        
        const stageElements = []
        
        // Add stage name
        stageElements.push(
          <div 
            key={`stage-${stage.name}`}
            className="stage-name"
            style={{
              gridArea: `${currentStageRow} / 1 / auto / ${totalColumns + 1}`,
              animationDelay: `${stageIndex * 0.1}s`
            }}
          >
            <span>{stage.name}</span>
          </div>
        )
        
        // Add acts organized in rows
        actRows.forEach((actRow, rowIndex) => {
          const actsRow = currentStageRow + 1 + rowIndex
          
          actRow.forEach((act, actIndex) => {
            const startCol = timeToColumnIndex(act.start_time, timeRange.start, timeMarkers)
            const endCol = timeToColumnIndex(act.end_time, timeRange.start, timeMarkers)

            // Check if this act is recommended - match API recommendation structure
            const isRecommended = act.artist && act.artist.spotify_id && recommendations.some(rec => {
              return rec.artist.spotify_id === act.artist.spotify_id
            })
            const recommendation = isRecommended ? recommendations.find(rec => rec.artist.spotify_id === act.artist.spotify_id) : null

            // Get CSS class based on match type
            const getMatchTypeClass = (matchType) => {
              switch (matchType) {
                case 'direct':
                  return 'match__type--direct'
                case 'related':
                  return 'match__type--relevant-artist'
                case 'genre':
                  return 'match__type--genre'
                case 'genre_light':
                  return 'match__type--genre-light'
                default:
                  return 'match__type--nomatch'
              }
            }

            // Get indicator class based on match type
            const getIndicatorClass = (matchType) => {
              switch (matchType) {
                case 'direct':
                  return 'match-indicator match-indicator--direct'
                case 'related':
                  return 'match-indicator match-indicator--relevant-artist'
                case 'genre':
                  return 'match-indicator match-indicator--genre'
                case 'genre_light':
                  return 'match-indicator match-indicator--genre-light'
                default:
                  return 'match-indicator'
              }
            }

            // Get details class based on match type
            const getDetailsClass = (matchType) => {
              switch (matchType) {
                case 'direct':
                  return 'match-details match-details--direct'
                case 'related':
                  return 'match-details match-details--relevant-artist'
                case 'genre':
                  return 'match-details match-details--genre'
                case 'genre_light':
                  return 'match-details match-details--genre-light'
                default:
                  return 'match-details match-details--nomatch'
              }
            }

                                        stageElements.push(
                <div
                  key={act.id}
                  className={`event-card ${isRecommended ? 'event-card--recommended' : ''}`}
                  style={{
                    gridArea: `${actsRow} / ${startCol} / auto / ${endCol}`,
                    animationDelay: `${(stageIndex * 0.1) + (actIndex * 0.05)}s`,
                    cursor: 'pointer'
                  }}
                  onClick={() => onArtistClick(act)}
                >
                  <div className="act__wrapper">
                    <div 
                      className={`act__info ${recommendation ? getMatchTypeClass(recommendation.matchType) : 'match__type--nomatch'}`}
                    >
                    <div className="act__name">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isFavorited(act) && (
                          <Heart 
                            size={14} 
                            fill="#ff4757" 
                            color="#ff4757"
                            style={{ flexShrink: 0 }}
                          />
                        )}
                        <span>{act.name}</span>
                        {isRecommended && recommendation && (
                          <span className={getIndicatorClass(recommendation.matchType)}>
                            {recommendation.matchType === 'direct' ? '★' :
                             recommendation.matchType === 'related' ? '◆' :
                             recommendation.matchType === 'genre' ? '●' :
                             recommendation.matchType === 'genre_light' ? '○' : '•'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="act__time">{formatTimeForDisplay(act.start_time)} - {formatTimeForDisplay(act.end_time)}</div>
                    {isRecommended && recommendation && (
                      <div className={`match-details ${getDetailsClass(recommendation.matchType)}`}>
                        {recommendation.matchType === 'direct' ? 'Direct match' :
                         recommendation.matchType === 'related' ? 'Related artist' :
                         recommendation.matchType === 'genre' ? 'Genre match' :
                         recommendation.matchType === 'genre_light' ? 'Genre light match' : 'Recommended'}
                        {recommendation.matchScore > 0 && ` (${recommendation.matchScore}pts)`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        })
        
        return stageElements
      }).flat()}
    </div>
  )
} 