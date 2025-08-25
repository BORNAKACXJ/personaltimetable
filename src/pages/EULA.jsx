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
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          
          <section>
            <h2>2. Description of Service</h2>
            <p>This application provides festival timetable services, including:</p>
            <ul>
              <li>Festival schedule viewing and navigation</li>
              <li>Personalized artist recommendations based on Spotify data</li>
              <li>Personal timetable creation and sharing</li>
              <li>Integration with Spotify music preferences</li>
            </ul>
          </section>
          
          <section>
            <h2>3. User Accounts and Responsibilities</h2>
            <p>When using our service, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>
          
          <section>
            <h2>4. Spotify Integration</h2>
            <p>Our service integrates with Spotify to provide personalized recommendations. By connecting your Spotify account, you:</p>
            <ul>
              <li>Grant us permission to access your Spotify profile and music preferences</li>
              <li>Understand that we use this data to generate festival recommendations</li>
              <li>Can disconnect your Spotify account at any time</li>
              <li>Agree to comply with Spotify's terms of service</li>
            </ul>
          </section>
          
          <section>
            <h2>5. Intellectual Property</h2>
            <p>The application and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          </section>
          
          <section>
            <h2>6. User Content</h2>
            <p>You retain ownership of any content you create using our service. By using our service, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display your content solely for the purpose of providing our services.</p>
          </section>
          
          <section>
            <h2>7. Prohibited Uses</h2>
            <p>You may not use our service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>
          </section>
          
          <section>
            <h2>8. Disclaimers</h2>
            <p>The service is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free.</p>
          </section>
          
          <section>
            <h2>9. Limitation of Liability</h2>
            <p>In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the service.</p>
          </section>
          
          <section>
            <h2>10. Termination</h2>
            <p>We may terminate or suspend your access to the service immediately, without prior notice, for any reason, including breach of this agreement.</p>
          </section>
          
          <section>
            <h2>11. Changes to Agreement</h2>
            <p>We reserve the right to modify this agreement at any time. We will notify users of any material changes by posting the new agreement on this page.</p>
          </section>
          
          <section>
            <h2>12. Contact Information</h2>
            <p>If you have any questions about this EULA, please contact us at:</p>
            <p>Email: legal@hitthecity.com</p>
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
