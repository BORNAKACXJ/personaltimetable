import { useState } from 'react'
import './AppHeader.css'
import { UserProfileDialog } from './UserProfileDialog'

export function AppHeader({ isPersonalTimetable, currentUserId, currentUserName, apiRecommendationsLoading, apiRecommendationsError }) {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  return (
    <header className="header__fixed bg--white">
      <div className="section__margin">
        <div className="festival__logo--header">
          <img src="/_assets/_images/logo-hitthecity.png" alt="Hit the City" />
        </div>
        
        {/* Center Title */}
        <div className="nav navbar-nav navbar-main navbar-nav-first">
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333'
          }}>
            {isPersonalTimetable ? 'My Personal Timetable' : 'Hit The City Timetable'}
          </div>
        </div>
        
        
        
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
          <a 
            href="/connect-spotify" 
            className="nav__main--spotify"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0px 16px',
              borderRadius: '40px',
              color: 'white',
              backgroundColor: '#1DB954',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(29, 185, 84, 0.25)'
            }}
          >
            <img src="/_assets/_images/spotify_icon.svg" alt="Spotify" style={{ width: '20px', height: '20px' }} />
            Connect with Spotify
          </a>
        )}
      </div>
      
      {/* User Profile Dialog */}
      <UserProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        userId={currentUserId}
        currentUserName={currentUserName}
      />
    </header>
  )
}
