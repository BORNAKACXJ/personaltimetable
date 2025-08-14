export function AppHeader() {
  return (
    <header className="header__fixed bg--white">
      <div className="section__margin">
        <div className="festival__logo--header">
          <img src="/_assets/_images/logo-hitthecity.png" alt="Hit the City" />
        </div>
        
        {/* Main Navigation Menu - Center */}
        <div className="nav navbar-nav navbar-main navbar-nav-first">
          <ul id="menu-hoofdmenu" className="menu-primary-inner menu-smart sm" role="menu" data-smartmenus-id="17551600275673013">
            <li role="menuitem" id="menu-item-3595" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-home menu-item-3595 menu-item-link">
              <a href="https://hitthecity-festival.nl/" className="cursor-init">Home</a>
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
