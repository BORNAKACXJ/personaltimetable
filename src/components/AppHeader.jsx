import { useState } from 'react'
import './AppHeader.css'
import { UserProfileDialog } from './UserProfileDialog'
import { PersonalTimetableDialog } from './PersonalTimetableDialog'

export function AppHeader({ isPersonalTimetable, currentUserId, currentUserName, apiRecommendationsLoading, apiRecommendationsError }) {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isPersonalTimetableDialogOpen, setIsPersonalTimetableDialogOpen] = useState(false)
  return (
    <header className="header__fixed bg--white">
      <div className="section__margin">
        <div className="festival__logo--header">
          <img src="/_assets/_images/logo-hitthecity.png" alt="Hit the City" />
        </div>
        
        {/* Center Title */}
        <div className="nav__main--title">
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333'
          }}>
            {isPersonalTimetable ? 'My Personal Timetable' : 'Hit The City Timetable'}
          </div>
        </div>
        
        
        <div className="nav__main--right">
        {/* User Info / Spotify Connect - Right */}
        {isPersonalTimetable ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => setIsProfileDialogOpen(true)}
              className="nav__main--usertimetable"
              
            >
              {currentUserName || `User: ${currentUserId}`}
            </button>
            {apiRecommendationsLoading && (
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Loading...
              </div>
            )}
            {apiRecommendationsError && (
              <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                Error
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setIsPersonalTimetableDialogOpen(true)}
            className="nav__main--spotify"
            style={{
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            <img src="/_assets/_images/spotify_icon.svg" alt="Spotify" style={{ width: '20px', height: '20px' }} />
            Create your personal timetable
          </button>
        )}
      </div>
      
      {/* User Profile Dialog */}
      <UserProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        userId={currentUserId}
        currentUserName={currentUserName}
      />

      {/* Personal Timetable Dialog */}
      <PersonalTimetableDialog
        isOpen={isPersonalTimetableDialogOpen}
        onClose={() => setIsPersonalTimetableDialogOpen(false)}
        onCreateTimetable={() => {
          setIsPersonalTimetableDialogOpen(false)
          window.location.href = '/connect-spotify'
        }}
      />
      </div>
      
    </header>
  )
}
