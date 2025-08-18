export function AppHeader({ isPersonalTimetable, currentUserId, currentUserName, apiRecommendationsLoading, apiRecommendationsError }) {
  return (
    <header className="header__fixed bg--white">
      <div className="section__margin">
        <div className="festival__logo--header">
          <img src="/_assets/_images/logo-hitthecity.png" alt="Hit the City" />
        </div>
        
        {/* Personal Timetable Indicator - Center */}
        {isPersonalTimetable ? (
          <div className="nav navbar-nav navbar-main navbar-nav-first">
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6, #C4B5FD)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
              minWidth: '200px'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '2px' }}>
                Personal Timetable
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                {currentUserName ? `User: ${currentUserName}` : `User ID: ${currentUserId}`}
              </div>
              {apiRecommendationsLoading && (
                <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                  Loading...
                </div>
              )}
              {apiRecommendationsError && (
                <div style={{ fontSize: '0.7rem', marginTop: '4px', color: '#FECACA' }}>
                  Error: {apiRecommendationsError}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Connect with Spotify - Center */
          <div className="nav navbar-nav navbar-main navbar-nav-first">
            <a 
              href="/connect-spotify" 
              style={{
                background: 'linear-gradient(135deg, #1DB954, #1ed760)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(29, 185, 84, 0.25)',
                minWidth: '200px',
                display: 'inline-block'
              }}
            >
              🎵 Connect with Spotify
            </a>
          </div>
                )}
        
        {/* Mobile-only Home Link */}
        <div className="nav__mobile-home">
          <a href="https://hitthecity-festival.nl/" className="nav__mobile-home-link">Go to Home</a>
        </div>
        
        {/* Social Icons - Right */}
        <ul className="menu-smart sm menu-icons menu-smart-social" role="menu" data-smartmenus-id="17551600275681838">
          <li role="menuitem" className="menu-item-link social-icon social-124702">
            <a href="https://www.facebook.com/hitthecity" className="social-menu-link cursor-init" role="button" target="_blank">
              <i className="fa fa-facebook" role="presentation"></i>
            </a>
          </li>
          <li role="menuitem" className="menu-item-link social-icon social-461359">
            <a href="https://www.instagram.com/hitthecity.festival/" className="social-menu-link cursor-init" role="button" target="_blank">
              <i className="fa fa-instagram" role="presentation"></i>
            </a>
          </li>
          <li role="menuitem" className="menu-item-link social-icon social-609829">
            <a href="https://open.spotify.com/playlist/2gLSUZTTVgiR4wgmqJAJPg?si=777cc8b187b14a40" className="social-menu-link cursor-init" role="button" target="_blank">
              <i className="fa fa-spotify" role="presentation"></i>
            </a>
          </li>
          <li role="menuitem" className="menu-item-link social-icon social-122047">
            <a href="https://timesquare.app.link/khPMjMyJ6jb?_p=c21530dc990261eee31c86e3e0b4" className="social-menu-link cursor-init" role="button" target="_blank">
              <i className="fa fa-text-width" role="presentation"></i>
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
