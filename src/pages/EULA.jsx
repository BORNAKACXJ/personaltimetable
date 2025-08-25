import React from 'react'
import './EULA.css'

function EULA() {
  return (
    <div className="eula">
      <div className="section__margin">
        <div className="eula__content">
          <h1>End User License Agreement (EULA)</h1>
          
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
          
          <section>
    <h2>Use of the service</h2>
    <p>You may use the app to generate a personal timetable based on your Spotify data. Spotify access is only established after you explicitly grant permission.</p>
  </section>

  <section>
    <h2>Data we handle</h2>
    <p>We process only the data needed to provide the service.</p>
    <ul>
      <li>Spotify ID and Spotify profile name</li>
      <li>Top artists (IDs), top tracks (IDs), and top genres</li>
      <li>Unique timetable ID and creation date</li>
    </ul>
    <p>We do not store your email address or Spotify password.</p>
  </section>

  <section>
    <h2>Purpose and limits</h2>
    <p>Your data is used solely to generate and store your timetable. We do not use it for commercial purposes, ads, or resale.</p>
  </section>

  <section>
    <h2>Data safety</h2>
    <p>Your data is encrypted, transmitted over secure connections, and stored in a protected database. Access is limited to authorized personnel.</p>
  </section>
          
          <div className="eula__back">
            <a href="/" className="btn__type--link">
              ← Back to App
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EULA
