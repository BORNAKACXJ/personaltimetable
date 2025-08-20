import { useState } from 'react'
import './AppHeader.css'
import { UserProfileDialog } from './UserProfileDialog'
import { PersonalTimetableDialog } from './PersonalTimetableDialog'
import { ShareTimetableDialog } from './ShareTimetableDialog'
import { SettingsDialog } from './SettingsDialog'

export function AppHeader({ isPersonalTimetable, currentUserId, currentUserName, apiRecommendationsLoading, apiRecommendationsError }) {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isPersonalTimetableDialogOpen, setIsPersonalTimetableDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
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
            color: '#333',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {isPersonalTimetable ? (
              <span dangerouslySetInnerHTML={{
                __html: `Personal Timetable of <span style="color: var(--purpler);">${currentUserName}</span>`
              }} />
            ) : (
              'Hit The City Timetable'
            )}
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
              onClick={() => setIsShareDialogOpen(true)}
              className="nav__main--share"
            >
               <i class="fa-sharp fa-solid fa-share"></i>
              Share Timetable
            </button>
            
            <button
              onClick={() => setIsSettingsDialogOpen(true)}
              className="nav__main--settings"
            >
               <i class="fa-sharp fa-light fa-sliders"></i>
              Settings
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
      />

      {/* Share Timetable Dialog */}
      <ShareTimetableDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        userId={currentUserId}
        userName={currentUserName}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
        userId={currentUserId}
        userName={currentUserName}
      />
      </div>
      
    </header>
  )
}
