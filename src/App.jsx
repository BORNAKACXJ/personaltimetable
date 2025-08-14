import { useState, useEffect, useRef } from 'react'
import { useCachedFestivalData } from './hooks/useCachedFestivalData'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'
import { useRecommendations } from './hooks/useRecommendations'
import { ArtistDialog } from './components/ArtistDialog'
import { TimelineView } from './components/TimelineView'
import { SpotifyCallback } from './components/SpotifyCallback'
import { SpotifyAuth } from './components/SpotifyAuth'
import { RecommendationsPanel } from './components/RecommendationsPanel'
import { TimetableNavigation } from './components/TimetableNavigation'
import { TimetableList } from './components/TimetableList'
import { AppHeader } from './components/AppHeader'
import { Api } from './pages/Api'
import { Cache } from './pages/Cache'
import { TestRecommendations } from './pages/TestRecommendations'
import { trackPageView, trackActPopup } from './utils/tracking'

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
    generateRecommendations, 
    loading: recommendationsLoading,
    error: recommendationsError,
    totalCount: recommendationsCount,
    directMatchCount,
    relatedArtistCount
  } = useRecommendations(spotifyUser?.id, data?.festival?.id)
  
  // 2. All useState hooks
  const [currentDay, setCurrentDay] = useState(0)
  const [currentView, setCurrentView] = useState('list')
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false)

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
    console.log('App useEffect - spotifyUser?.id:', spotifyUser?.id)
    console.log('App useEffect - data?.festival?.id:', data?.festival?.id)
    
    if (spotifyAuthenticated && spotifyUser?.id && data?.festival?.id && 
        ((topArtists && topArtists.length > 0) || (topTracks && topTracks.length > 0))) {
      console.log('🎯 Generating recommendations with:', {
        spotifyUserId: spotifyUser.id,
        festivalId: data.festival.id,
        topArtists: topArtists?.length || 0,
        topTracks: topTracks?.length || 0
      })
      generateRecommendations()
    } else {
      console.log('Not generating recommendations because:', {
        spotifyAuthenticated,
        hasSpotifyUserId: !!spotifyUser?.id,
        hasFestivalId: !!data?.festival?.id,
        hasTopArtists: !!(topArtists && topArtists.length > 0),
        hasTopTracks: !!(topTracks && topTracks.length > 0)
      })
    }
  }, [spotifyAuthenticated, spotifyUser?.id, data?.festival?.id, topArtists, topTracks, generateRecommendations])

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
    
    recommendations.forEach(recommendation => {
      if (recommendation.timetable_entry) {
        const entry = recommendation.timetable_entry
        flattened.push({
          ...recommendation,
          startTime: entry.start_time,
          endTime: entry.end_time,
          stage: entry.stages,
          day: entry.festival_days,
          act: entry.acts,
          artist: entry.artists
        })
      }
    })
    
    console.log('Final flattened recommendations:', flattened)
    return flattened
  }

  const flattenedRecommendations = getFlattenedRecommendations()

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
      <AppHeader />

      <main className="timetable__main">
        <div className="section__margin">
          <div className="sticky__helper"></div>
          
          <div className="timetable__content">
            {/* Spotify Authentication & User Profile */}
            <SpotifyAuth />

            {/* Recommendations Panel */}
            {spotifyAuthenticated && (
              <RecommendationsPanel 
                topArtists={topArtists}
                topTracks={topTracks}
                recommendations={flattenedRecommendations}
                recommendationsCount={recommendationsCount}
                directMatchCount={directMatchCount}
                relatedArtistCount={relatedArtistCount}
                recommendationsLoading={recommendationsLoading}
                recommendationsError={recommendationsError}
                festivalData={data}
                currentDayData={currentDayData}
                onArtistClick={handleArtistClick}
              />
            )}

            {/* Timetable Navigation */}
            <TimetableNavigation 
              days={days}
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
              currentView={currentView}
              setCurrentView={setCurrentView}
            />

            {/* Timeline View */}
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

            {/* List View */}
            <div className={`timetable__timelist ${currentView === 'list' ? 'active' : ''}`}>
              <TimetableList 
                currentDayData={currentDayData}
                recommendations={flattenedRecommendations}
                onArtistClick={handleArtistClick}
              />
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
