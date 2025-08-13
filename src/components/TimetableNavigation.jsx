import React from 'react'
import { trackDayClick, trackViewChange } from '../utils/tracking'

export function TimetableNavigation({ 
  days, 
  currentDay, 
  setCurrentDay, 
  currentView, 
  setCurrentView 
}) {
  return (
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
            {new Date(days[currentDay]?.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
