import React from 'react'

export function Header() {
  return (
    <header className="header__fixed">
      <div className="section__margin">
        <div className="festival__logo--header">
          <img 
            src="/_assets/_images/logo-hitthecity.png" 
            alt="Hit the City Festival"
            style={{ width: '96px', height: 'auto' }}
          />
        </div>
        
        <div className="header__title">
          <h1>HIT THE CITY</h1>
        </div>
        
        <div className="nav__type--header">
          <a 
            href="https://hitthecity-festival.nl/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav__home-link"
          >
            Go to Home
          </a>
        </div>
      </div>
    </header>
  )
}
