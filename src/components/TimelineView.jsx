import { useState, useEffect, useRef } from 'react'

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
        const stageRow = stageIndex * 2 + 2 // Row 1 = time markers, then stage name, then acts
        
        return [
          // Stage name
          <div 
            key={`stage-${stage.name}`}
            className="stage-name"
            style={{
              gridArea: `${stageRow} / 1 / auto / ${totalColumns + 1}`,
              animationDelay: `${stageIndex * 0.1}s`
            }}
          >
            <span>{stage.name}</span>
          </div>,
          
          // Stage acts
          ...stage.acts.map((act, actIndex) => {
            const startCol = timeToColumnIndex(act.start_time, timeRange.start, timeMarkers)
            const endCol = timeToColumnIndex(act.end_time, timeRange.start, timeMarkers)
            const actsRow = stageRow + 1

            // Check if this act is recommended - match Spotify API 'id' with Supabase 'spotify_id'
            const isRecommended = act.artist && act.artist.spotify_id && recommendations.some(rec => {
              // rec.artist.id is from Spotify API, act.artist.spotify_id is from Supabase
              return rec.artist.id === act.artist.spotify_id
            })
            const recommendation = isRecommended ? recommendations.find(rec => rec.artist.id === act.artist.spotify_id) : null

            return (
              <div
                key={act.id}
                className={`event-card ${isRecommended ? 'event-card--recommended' : ''}`}
                style={{
                  gridArea: `${actsRow} / ${startCol} / auto / ${endCol}`,
                  animationDelay: `${(stageIndex * 0.1) + (actIndex * 0.05)}s`,
                  cursor: 'pointer',
                  backgroundColor: isRecommended ? '#e8f5e8' : undefined,
                  border: isRecommended ? '2px solid #1DB954' : undefined,
                  boxShadow: isRecommended ? '0 2px 8px rgba(29, 185, 84, 0.3)' : undefined
                }}
                onClick={() => onArtistClick(act)}
              >
                <div className="act__wrapper">
                  <div className="act__info">
                    <div className="act__name">
                      {act.name}
                      {isRecommended && (
                        <span style={{ 
                          fontSize: '0.7em', 
                          color: '#1DB954', 
                          marginLeft: '4px',
                          fontWeight: 'bold'
                        }}>
                          ★
                        </span>
                      )}
                    </div>
                    <div className="act__time">{act.start_time} - {act.end_time}</div>
                    {isRecommended && recommendation && (
                      <div style={{ 
                        fontSize: '0.7em', 
                        color: '#666', 
                        fontStyle: 'italic',
                        marginTop: '2px'
                      }}>
                        {recommendation.reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ]
      }).flat()}
    </div>
  )
} 