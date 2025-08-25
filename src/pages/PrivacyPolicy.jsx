import React from 'react'
import './PrivacyPolicy.css'

function PrivacyPolicy() {
  return (
    <div className="privacy-policy">
      <div className="section__margin">
        <div className="privacy-policy__content">
          <h1>Privacy Policy</h1>
          
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
          <section>
    <h2>How we protect your data</h2>
    <p>Your data is handled with modern security practices across hosting and storage.</p>
    <ul>
      <li>Data is stored in Supabase (on AWS infrastructure); servers may be located outside the EU.</li>
      <li>Frontend and backend are hosted on Netlify.</li>
      <li>All communication uses SSL/TLS encryption.</li>
      <li>Data is encrypted at rest and in transit.</li>
      <li>Database access is restricted and protected with two-factor authentication.</li>
      <li>Spotify access tokens are temporary and never stored.</li>
    </ul>
  </section>

  <section>
    <h2>If something goes wrong</h2>
    <p>In the event of a data breach, we act immediately to contain the issue and notify the responsible parties within 24 hours.</p>
  </section>
          
          <div className="privacy-policy__back">
            <a href="/" className="btn__type--link">
              ← Back to App
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
