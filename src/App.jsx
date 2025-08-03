import { useState, useEffect, useRef } from 'react'
import { useCachedFestivalData } from './hooks/useCachedFestivalData'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'
import { useSpotifyRecommendations } from './hooks/useSpotifyRecommendations'
import { ArtistDialog } from './components/ArtistDialog'
import { TimelineView } from './components/TimelineView'
import { SpotifyCallback } from './components/SpotifyCallback'
import { Api } from './pages/Api'
import { Cache } from './pages/Cache'

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

  // 3. All useEffect hooks
  useEffect(() => {
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
    if (spotifyAuthenticated && topArtists && topArtists.length > 0) {
      getRecommendations(topArtists)
    }
  }, [spotifyAuthenticated, topArtists])

  // 4. Route checking (after all hooks)
  const currentPath = window.location.pathname
  const isApiRoute = currentPath === '/api'
  const isCacheRoute = currentPath === '/cache'
  const isCallbackRoute = currentPath === '/callback'

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

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading festival data...</p>
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
  const days = data.days
  const currentDayData = days[currentDay] || { stages: [] }

  const handleArtistClick = (act) => {
    if (act.artist) {
      setSelectedArtist(act.artist)
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
      <header className="header__fixed bg--white">
        <div className="section__margin">
          <div className="festival__logo--header">
            <img src="/_assets/_images/logo-hitthecity.png" alt="Hit the City" />
          </div>
          <div className="header__title font__size--sub">
            {festival.name} - Personal Timetable 2025
          </div>
          <div className="nav__type--header">
            <button className="btn__second">
              <span>Options</span>
            </button>
            <button className="btn__second">
              <span>Share your timetable</span>
            </button>
            {spotifyAuthenticated ? (
              <button className="btn__second" onClick={spotifyLogout}>
                <span>Disconnect Spotify</span>
              </button>
            ) : (
              <button className="btn__second" onClick={spotifyLogin}>
                <span>Connect Spotify</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="timetable__main">
        <div className="section__margin">
          <div className="sticky__helper"></div>
          
          <div className="timetable__nav">
            <div className="timetable__nav--head">
              <nav className="nav__type--days">
                {days.map((day, index) => (
                  <button
                    key={day.id}
                    className={`btn__day ${index === currentDay ? 'selected' : ''}`}
                    data-day-id={index}
                    onClick={() => setCurrentDay(index)}
                  >
                    <span>{new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </button>
                ))}
              </nav>
              
              <button 
                className={`btn__second ${currentView === 'list' ? 'active' : ''}`}
                id="view-toggle"
                onClick={() => setCurrentView(currentView === 'timeline' ? 'list' : 'timeline')}
              >
                <span>
                  <i className="fa-sharp fa-light fa-table-list" aria-hidden="true"></i> 
                  {currentView === 'timeline' ? 'list view' : 'timeline view'}
                </span>
              </button>
            </div>
            
            <div className="timetable__nav--currentday font__size--head">
              {currentDayData.date ? (
                new Date(currentDayData.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })
              ) : (
                days[currentDay] ? 
                new Date(days[currentDay].date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long'
                }) : 'Loading...'
              )}
            </div>
          </div>

          <div className={`timetable__timeline ${currentView === 'timeline' ? '' : 'hidden'}`}>
            <TimelineView 
              currentDayData={{
                day: currentDayData,
                stages: currentDayData.stages || []
              }}
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
                        stage.acts.map((act, actIndex) => {
                          // Check if this act is recommended
                          const isRecommended = act.artist && recommendations.some(rec => rec.artist.id === act.artist.id)
                          const recommendation = isRecommended ? recommendations.find(rec => rec.artist.id === act.artist.id) : null
                          
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
                                {act.name}
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
                              <div className="list__act-time">{act.start_time} - {act.end_time}</div>
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
