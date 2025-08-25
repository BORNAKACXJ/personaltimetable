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
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, connect your Spotify account, or use our services.</p>
            
            <h3>1.1 Personal Information</h3>
            <ul>
              <li>Spotify profile information (display name, profile picture)</li>
              <li>Your music preferences and listening history</li>
              <li>Festival timetable preferences and recommendations</li>
            </ul>
            
            <h3>1.2 Usage Information</h3>
            <ul>
              <li>How you interact with our app</li>
              <li>Pages you visit and features you use</li>
              <li>Device information and browser type</li>
            </ul>
          </section>
          
          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our festival timetable services</li>
              <li>Generate personalized artist recommendations</li>
              <li>Connect you with your Spotify music preferences</li>
              <li>Share your personal timetable with others (when you choose to)</li>
              <li>Analyze usage patterns to improve our app</li>
            </ul>
          </section>
          
          <section>
            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>When you choose to share your timetable publicly</li>
            </ul>
          </section>
          
          <section>
            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>
          
          <section>
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Disconnect your Spotify account</li>
              <li>Opt out of data collection</li>
            </ul>
          </section>
          
          <section>
            <h2>6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>Email: privacy@hitthecity.com</p>
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
