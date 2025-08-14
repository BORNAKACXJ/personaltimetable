import { trackDayClick, trackViewChange } from '../utils/tracking'

export function TimetableNavigation({ 
  days, 
  currentDay, 
  setCurrentDay, 
  currentView, 
  setCurrentView 
}) {
  const currentDayData = days[currentDay] || { stages: [] }

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
            onClick={handleViewToggle}
          >
            <span>
              <i className="fa-sharp fa-light fa-table-list" aria-hidden="true"></i> 
              {currentView === 'timeline' ? 'list' : 'timeline'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
