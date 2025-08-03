import { useState } from 'react'
import { useFestivalData } from './hooks/useFestivalData'
import { ArtistDialog } from './components/ArtistDialog'
import './App.css'

function App() {
  const { 
    festival, 
    festivalDays, 
    stages, 
    artists, 
    acts, 
    timetableEntries, 
    loading, 
    error, 
    getActsByDayAndStage, 
    getArtistByName 
  } = useFestivalData()
  
  const [currentDay, setCurrentDay] = useState(0)
  const [currentView, setCurrentView] = useState('list')
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false)

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

  if (!festival) {
    return (
      <div className="error">
        <h2>No Festival Found</h2>
        <p>No current festival is configured. Please set up a festival in the database.</p>
      </div>
    )
  }

  // Get acts grouped by day and stage
  const actsByDay = getActsByDayAndStage()
  const currentDayData = actsByDay[currentDay] || { day: {}, stages: [] }

  const handleArtistClick = (artistName) => {
    const artist = getArtistByName(artistName)
    if (artist) {
      setSelectedArtist(artist)
      setIsArtistDialogOpen(true)
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
          </div>
        </div>
      </header>

      <main className="timetable__main">
        <div className="section__margin">
          <div className="sticky__helper"></div>
          
          <div className="timetable__nav">
            <div className="timetable__nav--head">
              <nav className="nav__type--days">
                {festivalDays.map((day, index) => (
                  <button
                    key={day.id}
                    className={`btn__day ${index === currentDay ? 'selected' : ''}`}
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
                className="btn__second"
                onClick={() => setCurrentView(currentView === 'timeline' ? 'list' : 'timeline')}
              >
                <span>
                  {currentView === 'timeline' ? 'List view' : 'Timeline view'}
                </span>
              </button>
            </div>
            
            <div className="timetable__nav--currentday font__size--head">
              {currentDayData.day.name || 'Loading...'}
            </div>
          </div>

          {currentView === 'timeline' ? (
            <div className="timetable__timeline">
              <div className="timetable__grid">
                {/* Timeline view implementation */}
                <div className="timeline-placeholder">
                  <h3>Timeline View</h3>
                  <p>Timeline view will be implemented here</p>
                  <div className="timeline-data-preview">
                    <h4>Current Day Data:</h4>
                    <pre>{JSON.stringify(currentDayData, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="timetable__timelist">
              <div className="timetable__list">
                {currentDayData.stages.map((stage, stageIndex) => (
                  <div key={stage.name} className="list__stage">
                    <div className="list__stage-name">{stage.name}</div>
                    <div className="list__acts">
                      {stage.acts.map((act, actIndex) => (
                        <div 
                          key={act.id} 
                          className="list__act"
                          onClick={() => handleArtistClick(act.name)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="list__act-name">
                            {act.name}
                          </div>
                          <div className="list__act-time">
                            {act.start_time} - {act.end_time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
