import { useState, useEffect, useRef } from 'react'
import { useCachedFestivalData } from './hooks/useCachedFestivalData'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'
import { useSpotifyRecommendations } from './hooks/useSpotifyRecommendations'
import { ArtistDialog } from './components/ArtistDialog'
import { TimelineView } from './components/TimelineView'
import { SpotifyCallback } from './components/SpotifyCallback'
import { Header } from './components/Header'
import { Api } from './pages/Api'
import { Cache } from './pages/Cache'
import { TestRecommendations } from './pages/TestRecommendations'
import { trackDayClick, trackViewChange, trackPageView, trackActPopup } from './utils/tracking'
import { isFavorited } from './utils/favorites'
import { Heart } from 'lucide-react'

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

function App() {
  // ALL HOOKS MUST BE CALLED IN THE SAME ORDER EVERY TIME
  // 1. Custom hooks first
  const { 
    data, 
    loading, 
    error, 
    refreshData, 
    clearCache 
  } = useCachedFestivalData()

  const { 
    user: spotifyUser, 
    topArtists, 
    topTracks,
    isAuthenticated: spotifyAuthenticated, 
    login: spotifyLogin, 
    logout: spotifyLogout,
    loading: spotifyLoading 
  } = useSpotifyAuth()

  const { 
    recommendations, 
    getRecommendations, 
    loading: recommendationsLoading 
  } = useSpotifyRecommendations()
  
  // 2. All useState hooks
  const [currentDay, setCurrentDay] = useState(0)
  const [currentView, setCurrentView] = useState('list')
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)

  // 3. All useEffect hooks
  useEffect(() => {
    // Track page view on app load
    trackPageView('Hit the City Timetable');
    
    // Function to setup sticky navigation
    const setupSticky = () => {
      const sentinel = document.querySelector('.sticky__helper');
      const sticky = document.querySelector('.timetable__nav');

      if (!sentinel || !sticky) {
        return false;
      }

      const handleScroll = () => {
        const sentinelRect = sentinel.getBoundingClientRect();
        
        if (sentinelRect.top < 88) {
          sticky.classList.add('pinned');
        } else {
          sticky.classList.remove('pinned');
        }
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll();
      
      return true;
    };

    if (!setupSticky()) {
      const delays = [100, 200, 500, 1000, 2000];
      delays.forEach((delay) => {
        setTimeout(() => {
          setupSticky();
        }, delay);
      });
    }

    return () => {
      const sticky = document.querySelector('.timetable__nav');
      if (sticky) {
        window.removeEventListener('scroll', () => {});
      }
    };
  }, []);

  useEffect(() => {
    console.log('App useEffect - spotifyAuthenticated:', spotifyAuthenticated)
    console.log('App useEffect - topArtists:', topArtists?.length || 0)
    console.log('App useEffect - topTracks:', topTracks?.length || 0)
    console.log('App useEffect - data:', !!data)
    console.log('App useEffect - data.days:', data?.days?.length || 0)
    
    if (spotifyAuthenticated && data && ((topArtists && topArtists.length > 0) || (topTracks && topTracks.length > 0))) {
      console.log('Calling getRecommendations with:', {
        topArtists: topArtists?.length || 0,
        topTracks: topTracks?.length || 0,
        festivalDays: data.days?.length || 0
      })
      console.log('Sample topArtists:', topArtists?.slice(0, 2))
      console.log('Sample topTracks:', topTracks?.slice(0, 2))
      getRecommendations(topArtists, topTracks, data)
    } else {
      console.log('Not calling getRecommendations because:', {
        spotifyAuthenticated,
        hasData: !!data,
        hasTopArtists: !!(topArtists && topArtists.length > 0),
        hasTopTracks: !!(topTracks && topTracks.length > 0)
      })
    }
  }, [spotifyAuthenticated, topArtists, topTracks, data])

  // 4. Route checking (after all hooks)
  const currentPath = window.location.pathname
  const isApiRoute = currentPath === '/api'
  const isCacheRoute = currentPath === '/cache'
  const isCallbackRoute = currentPath === '/callback'
  const isTestRecommendationsRoute = currentPath === '/test-recommendations'

  // 5. Conditional returns (after all hooks)
  if (isApiRoute) {
    return <Api />
  }

  if (isCacheRoute) {
    return <Cache />
  }

  if (isCallbackRoute) {
    return <SpotifyCallback />
  }

  if (isTestRecommendationsRoute) {
    return <TestRecommendations />
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading timetable...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error loading festival data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (!data || !data.festival) {
    return (
      <div className="error">
        <h2>No Festival Found</h2>
        <p>No current festival is configured. Please set up a festival in the database.</p>
      </div>
    )
  }

  // 6. Component logic (after all hooks and conditional returns)
  const festival = data.festival
  const edition = data.edition
  const days = data.days
  const currentDayData = days[currentDay] || { stages: [] }

  // Helper function to flatten time slot recommendations
  const getFlattenedRecommendations = () => {
    console.log('getFlattenedRecommendations called with recommendations:', recommendations)
    
    if (!recommendations || !Array.isArray(recommendations)) {
      console.log('No recommendations array found')
      return []
    }
    
    const flattened = []
    recommendations.forEach(dayRec => {
      console.log('Processing dayRec:', dayRec)
      if (dayRec.timeSlots) {
        dayRec.timeSlots.forEach(slot => {
          console.log('Processing slot:', slot)
          if (slot.acts) {
            slot.acts.forEach(act => {
              console.log('Processing act:', act)
              if (act.isRecommended && act.recommendation) {
                console.log('Adding recommendation:', act.recommendation)
                flattened.push(act.recommendation)
              }
            })
          }
        })
      }
    })
    
    // Remove duplicates based on Spotify ID (rec.artist.id from Spotify API)
    const unique = flattened.filter((rec, index, self) => 
      index === self.findIndex(r => r.artist.id === rec.artist.id)
    )
    
    console.log('Final flattened recommendations:', unique)
    return unique
  }

  const flattenedRecommendations = getFlattenedRecommendations()

  // Helper function to get recommendations for current day
  const getCurrentDayRecommendations = () => {
    console.log('getCurrentDayRecommendations called')
    console.log('Current day data:', currentDayData)
    console.log('Recommendations:', recommendations)
    
    if (!recommendations || !Array.isArray(recommendations)) {
      console.log('No recommendations array found for current day')
      return []
    }
    
    const currentDayRec = recommendations.find(dayRec => 
      dayRec.day && dayRec.day.date === currentDayData.date
    )
    
    console.log('Found current day rec:', currentDayRec)
    
    if (!currentDayRec) {
      console.log('No current day rec found')
      return []
    }
    
    const currentDayFlattened = []
    if (currentDayRec.timeSlots) {
      currentDayRec.timeSlots.forEach(slot => {
        console.log('Processing slot for current day:', slot)
        if (slot.acts) {
          slot.acts.forEach(act => {
            console.log('Processing act for current day:', act)
            if (act.isRecommended && act.recommendation) {
              console.log('Adding current day recommendation:', act.recommendation)
              currentDayFlattened.push(act.recommendation)
            }
          })
        }
      })
    }
    
    // Remove duplicates based on Spotify ID (rec.artist.id from Spotify API)
    const unique = currentDayFlattened.filter((rec, index, self) => 
      index === self.findIndex(r => r.artist.id === rec.artist.id)
    )
    
    console.log('Final current day recommendations:', unique)
    return unique
  }

  const currentDayRecommendations = getCurrentDayRecommendations()

  // Helper function to create 2-hour time slots
  const createTimeSlots = (startTime, endTime) => {
    const slots = []
    let currentTime = new Date(`2000-01-01T${startTime}:00`)
    const endDateTime = new Date(`2000-01-01T${endTime}:00`)
    
    // Handle overnight events (end time is before start time)
    if (endDateTime < currentTime) {
      endDateTime.setDate(endDateTime.getDate() + 1)
    }
    
    while (currentTime < endDateTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5)
      currentTime.setHours(currentTime.getHours() + 2)
      const slotEnd = currentTime.toTimeString().slice(0, 5)
      
      slots.push({
        start_time: slotStart,
        end_time: slotEnd,
        acts: []
      })
    }
    
    return slots
  }

  // Helper function to check if an act falls within a time slot
  const isActInTimeSlot = (act, slotStart, slotEnd) => {
    const actStart = act.start_time
    const actEnd = act.end_time
    
    // Convert times to minutes for easier comparison
    const slotStartMinutes = parseInt(slotStart.split(':')[0]) * 60 + parseInt(slotStart.split(':')[1])
    const slotEndMinutes = parseInt(slotEnd.split(':')[0]) * 60 + parseInt(slotEnd.split(':')[1])
    const actStartMinutes = parseInt(actStart.split(':')[0]) * 60 + parseInt(actStart.split(':')[1])
    const actEndMinutes = parseInt(actEnd.split(':')[0]) * 60 + parseInt(actEnd.split(':')[1])
    
    // Handle overnight acts
    if (actEndMinutes < actStartMinutes) {
      actEndMinutes += 24 * 60
    }
    if (slotEndMinutes < slotStartMinutes) {
      slotEndMinutes += 24 * 60
    }
    
    // Check if act overlaps with slot
    return actStartMinutes < slotEndMinutes && actEndMinutes > slotStartMinutes
  }

  const handleArtistClick = (act) => {
    if (act.artist) {
      // Find the day that contains this act
      const actDay = data?.days?.find(day => 
        day.stages?.some(stage => 
          stage.acts?.some(actInStage => actInStage.id === act.id)
        )
      )
      
      // Track the popup open
      trackActPopup(
        act.name, 
        act.stage_name, 
        `${act.start_time} - ${act.end_time}`,
        act.id,
        act.stage?.id,
        act.artist?.id
      );
      
      // Pass both artist and act data to include performance times, plus the day info
      setSelectedArtist({ 
        ...act.artist, 
        actData: act,
        dayData: actDay
      })
      setIsArtistDialogOpen(true)
    } else {
      console.log('No artist found for:', act)
    }
  }

  const closeArtistDialog = () => {
    setIsArtistDialogOpen(false)
    setSelectedArtist(null)
  }

  return (
    <div className="main__app">
      <Header />
      <header className="header__fixed bg--white">
        <div className="section__margin">
          <div className="festival__logo--header">
            <img src="/_assets/_images/logo-hitthecity.png" alt="Hit the City" />
          </div>
          <div className="header__title font__size--sub">
            {festival.name} - Timetable 2025
          </div>
          <div className="nav__type--header">
            <a 
              href="https://hitthecity-festival.nl/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav__home-link"
            >
              Go to Home
            </a>
          </div>
        </div>
      </header>

      <main className="timetable__main">
        <div className="section__margin">
          <div className="sticky__helper"></div>
          
          <div className="timetable__content">
            {/* Recommendations Summary */}
            {spotifyAuthenticated && flattenedRecommendations.length > 0 && (
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
            )}

            <div className="timetable__nav">
              <div className="timetable__nav--head">
                <nav className="nav__type--days">
                  {days.map((day, index) => (
                    <button
                      key={day.id}
                      className={`btn__day ${index === currentDay ? 'selected' : ''}`}
                      data-day-id={index}
                      onClick={() => {
                        setCurrentDay(index);
                        const dayName = new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        });
                        trackDayClick(dayName, day.date, day.id);
                      }}
                    >
                      <span>{new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </button>
                  ))}
                </nav>
                
                <button 
                  className={`btn__second btn__second--desktop ${currentView === 'list' ? 'active' : ''}`}
                  id="view-toggle"
                  onClick={() => {
                    const newView = currentView === 'timeline' ? 'list' : 'timeline';
                    setCurrentView(newView);
                    trackViewChange(newView);
                  }}
                >
                  <span>
                    <i className="fa-sharp fa-light fa-table-list" aria-hidden="true"></i> 
                    {currentView === 'timeline' ? 'list view' : 'timeline view'}
                  </span>
                </button>
              </div>
              
              <div className="timetable__nav--currentday font__size--head">
                <div className="timetable__nav--currentday-content">
                  <div className="timetable__nav--currentday-text">
                    {new Date(currentDayData.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  
                  {/* Mobile view toggle button */}
                  <button 
                    className={`btn__second btn__second--mobile ${currentView === 'list' ? 'active' : ''}`}
                    onClick={() => {
                      const newView = currentView === 'timeline' ? 'list' : 'timeline';
                      setCurrentView(newView);
                      trackViewChange(newView);
                    }}
                  >
                    <span>
                      <i className="fa-sharp fa-light fa-table-list" aria-hidden="true"></i> 
                      {currentView === 'timeline' ? 'list' : 'timeline'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`timetable__timeline ${currentView === 'timeline' ? '' : 'hidden'}`}>
              <TimelineView 
                currentDayData={{
                  day: currentDayData,
                  stages: currentDayData.stages || []
                }}
                recommendations={flattenedRecommendations}
                onArtistClick={handleArtistClick}
              />
            </div>

            <div className={`timetable__timelist ${currentView === 'list' ? 'active' : ''}`}>
              <div className="timetable__list" id="timetable__list">
                {currentDayData.stages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem',
                    color: '#666',
                    fontSize: '1.1rem'
                  }}>
                    No acts scheduled for this day
                  </div>
                ) : (
                  currentDayData.stages.map((stage, stageIndex) => (
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
                            const isRecommended = act.artist && act.artist.spotify_id && flattenedRecommendations.some(rec => {
                              // rec.artist.id is from Spotify API, act.artist.spotify_id is from Supabase
                              return rec.artist.id === act.artist.spotify_id
                            })
                            const recommendation = isRecommended ? flattenedRecommendations.find(rec => rec.artist.id === act.artist.spotify_id) : null
                            
                            // Debug logging
                            if (act.artist) {
                              console.log(`Checking act: ${act.name} (Supabase spotify_id: ${act.artist.spotify_id})`)
                              console.log(`Flattened recommendations count: ${flattenedRecommendations.length}`)
                              console.log(`Sample recommendation artist.id: ${flattenedRecommendations[0]?.artist?.id}`)
                              console.log(`Is recommended: ${isRecommended}`)
                              if (isRecommended) {
                                console.log(`Recommendation found:`, recommendation)
                              }
                            }
                            
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
                                onClick={() => handleArtistClick(act)}
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
                                <div className="list__act-time">{formatTimeForDisplay(act.start_time)} - {formatTimeForDisplay(act.end_time)}</div>
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
                  ))
                )}
              </div>
            </div>
            
            {/* PDF Download Link - positioned after both timetable views */}
            {currentDayData.pdf_download_link && (
              <div className="timetable__pdf-download">
                <a 
                  href={currentDayData.pdf_download_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn__pdf-download"
                >
                  <i className="fa-sharp fa-solid fa-download"></i>
                  {currentDayData.pdf_cta_text || 'Download PDF'}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="font__size--label">
        <div className="section__margin">
          <div className="footer__row--left">
            <a href="#" className="btn__type--link">
              Privacy policy
            </a>
          </div>
          <div className="footer__row--right">
            <a href="#" className="btn__type--link">
              User agreement
            </a>
          </div>
        </div>
      </footer>

      {/* Options Dialog */}
      {showOptionsDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowOptionsDialog(false)}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              margin: '0 0 16px 0',
              color: '#333',
              fontSize: '1.2em'
            }}>
              Options
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={spotifyLogout}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1em',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                Disconnect Spotify
              </button>
              
              <button 
                onClick={() => setShowOptionsDialog(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1em',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artist Dialog */}
                  <ArtistDialog 
              artist={selectedArtist} 
              isOpen={isArtistDialogOpen} 
              onClose={closeArtistDialog}
            />
    </div>
  )
}

export default App
