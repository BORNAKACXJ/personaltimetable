import { useState, useEffect } from 'react'
import './TimetableNavigation.css'
import { trackDayClick, trackViewChange } from '../utils/tracking'

export function TimetableNavigation({ 
  days, 
  currentDay, 
  setCurrentDay, 
  currentView, 
  setCurrentView,
  showOnlyRecommended,
  setShowOnlyRecommended,
  isPersonalTimetable
}) {
  const currentDayData = days[currentDay] || { stages: [] }
  


  // Auto-switch view based on screen orientation (mobile only)
  useEffect(() => {
    const handleOrientationChange = () => {
      // Only apply auto-switching on mobile devices (width <= 768px)
      if (window.innerWidth <= 768) {
        const isLandscape = window.innerWidth > window.innerHeight
        if (isLandscape && currentView === 'list') {
          setCurrentView('timeline')
        } else if (!isLandscape && currentView === 'timeline') {
          setCurrentView('list')
        }
      }
    }

    // Listen for orientation changes and window resize
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    // Initial check
    handleOrientationChange()

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [currentView, setCurrentView])

  const handleDayClick = (index) => {
    setCurrentDay(index)
    const dayName = new Date(days[index].date).toLocaleDateString('en-US', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    trackDayClick(dayName, days[index].date, days[index].id)
  }

  const handleViewToggle = () => {
    const newView = currentView === 'timeline' ? 'list' : 'timeline'
    setCurrentView(newView)
    trackViewChange(newView)
  }

  return (
    <div className="timetable__nav">
      <div className="timetable__nav--head">
        <nav className="nav__type--days">
          {days.map((day, index) => (
            <button
              key={day.id}
              className={`btn__day ${index === currentDay ? 'selected' : ''}`}
              data-day-id={index}
              onClick={() => handleDayClick(index)}
            >
              <span>
                {new Date(day.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </button>
          ))}
        </nav>
        
        <div className="timetable__nav--controls">
          {/* Toggle Buttons */}

          
          
          {isPersonalTimetable && (
          <div className="timetable__toggle">
            <button
              className="btn__second active"
              id="filter-toggle"
              onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
            >
              <span>{showOnlyRecommended ? 'Show all' : 'Show my recommendations'}</span>
            </button>
          </div>
          )}          
          <button 
            className={`btn__second btn__second--desktop ${currentView === 'list' ? 'active' : ''}`}
            id="view-toggle"
            onClick={handleViewToggle}
          >
            <span>
              <i className="fa-sharp fa-light fa-table-list" aria-hidden="true"></i> 
              {currentView === 'timeline' ? 'list view' : 'timeline view'}
            </span>
          </button>
        </div>
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
          
          {/* Mobile controls */}
          <div className="timetable__nav--mobile-controls" style={{ display: 'flex', gap: '0px', alignItems: 'center' }}>
            {/* Mobile filter toggle button */}
            {isPersonalTimetable && (
            <div className="timetable__toggle--mobile" style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn__second btn__second--mobile active"
                onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
              >
                <span>{showOnlyRecommended ? 'Show all' : 'Show recommendations'}</span>
              </button>
            </div>
            )}
            <div className="mobile--turn-screen">
            <i class="fa-sharp fa-solid fa-arrow-rotate-right"></i> Turn for timetable view
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
