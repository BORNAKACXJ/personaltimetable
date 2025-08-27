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
          <a href="https://hitthecity-festival.nl/">
          <img src="/_assets/_images/logo-hitthecity.png" alt="Hit the City" />
          </a>
        </div>


        {/* Conditional Navigation/Title */}
        {isPersonalTimetable ? (
          // Show timetable title when there's a personal timetable
          <div className="nav__main--title">
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#333',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <span dangerouslySetInnerHTML={{
                __html: `Timetable of <span style="color: var(--purpler);">${currentUserName}</span>`
              }} />
            </div>
          </div>
        ) : (
          // Show main navigation menu when there's no personal timetable
          <div className="nav navbar-nav navbar-main navbar-nav-first">
            <ul id="menu-hoofdmenu" className="menu-primary-inner menu-smart sm" role="menu" data-smartmenus-id="17551600275673013">
              {/* <li role="menuitem" id="menu-item-3595" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-home menu-item-3595 menu-item-link">
                <a href="https://hitthecity-festival.nl/" className="cursor-init">Home</a>
              </li> */}
              <li role="menuitem" id="menu-item-3589" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3589 menu-item-link">
                <a href="timetable.hitthecity-festival.nl" className="cursor-init">Timetable</a>
              </li>
              <li role="menuitem" id="menu-item-3589" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3589 menu-item-link">
                <a href="https://hitthecity-festival.nl/line-up/" className="cursor-init">Line up</a>
              </li>
              <li role="menuitem" id="menu-item-101" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-101 menu-item-link">
                <a href="https://hitthecity-festival.nl/venues/" className="cursor-init">Venues</a>
              </li>
              <li role="menuitem" id="menu-item-104" className="menu-item menu-item-type-post_type menu-item-object-page current-menu-item page_item page-item-86 current_page_item menu-item-104 active menu-item-link">
                <a href="https://hitthecity-festival.nl/news/" className="cursor-init">News</a>
              </li>
              <li role="menuitem" id="menu-item-3080" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3080 menu-item-link">
                <a href="https://hitthecity-festival.nl/getting-there/" className="cursor-init">Getting there</a>
              </li>
              <li role="menuitem" id="menu-item-3099" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3099 menu-item-link">
                <a href="https://hitthecity-festival.nl/faq/" className="cursor-init">FAQ</a>
              </li>
              <li role="menuitem" id="menu-item-833" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-833 menu-item-link">
                <a href="https://hitthecity-festival.nl/about-us/" className="cursor-init">About us</a>
              </li>
            </ul>
          </div>
        )}
        
        
        <div className="nav__main--right">
        {/* User Info / Spotify Connect - Right */}
        {isPersonalTimetable ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            
            
            {/* <button
              onClick={() => window.location.href = 'https://hitthecity-festival.nl/'}
              className="nav__main--share"
            >
               
              Home
            </button> */}
            
            <button
              onClick={() => setIsShareDialogOpen(true)}
              className="nav__main--share"
            >
               <i className="fa-sharp fa-solid fa-share"></i>
              Share <span>Timetable</span>
            </button>
            
            <button
              onClick={() => setIsSettingsDialogOpen(true)}
              className="nav__main--settings"
            >
               <i class="fa-sharp fa-light fa-sliders"></i>
              <span>Your</span> profile
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
            <span>Create your personal timetable</span>
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
