import React from 'react'
import './PrivacyPolicy.css'

function PrivacyPolicy() {
  return (
    <div className="privacy-policy">
      <div className="section__margin">
        <div className="privacy-policy__content">
          <h1>Privacy Policy</h1>
          
          <section id="privacy-policy">
  <h2>Privacy Policy</h2>

  <section>
    <p>For details on the terms of use for the Web App, please refer to our End User License Agreement (EULA).</p>
    <p>
      <strong>Effective Date:</strong> 20 08 2024
      <br />
       <strong>Last Updated:</strong> 25 08 2025
       </p>
  </section>

  <section>
    <p>VOF TENFOLD Technology (“Tenfold”, “we,” “us”) respects your privacy and is committed to protecting it. This Privacy Policy explains how we collect, use, and store your personal information when you use the Hit The City Personal Timetable web application (“Web App”).</p>
  </section>

  <section>
    <h2>Data Collection</h2>

    <h3>Data Retrieved via Spotify</h3>
    <p>When you log into the Web App using Spotify, we access the following information:</p>
    <ul>
      <li>Your top tracks and top artists for the last 12 months</li>
      <li>Your Spotify username and email address (used as identifiers to create your unique timetable)</li>
    </ul>

    <h3>Other Data</h3>
    <p>We do not collect any data outside of what is retrieved through the Spotify API.</p>
  </section>

  <section>
    <h2>Data Use</h2>

    <h3>Legal Basis</h3>
    <p>The legal basis for processing your data is your consent (Article 6(1)(a) GDPR), which you provide when logging in via Spotify.  
    For aggregated, anonymized insights, we rely on our legitimate interest in improving the festival experience (Article 6(1)(f) GDPR).</p>

    <h3>Purpose of Data Use</h3>
    <ul>
      <li>Generate a personalized timetable for the Hit The City festival</li>
      <li>Provide act recommendations every two hours based on your listening preferences</li>
    </ul>
    <p>Your data will not be used for marketing purposes.</p>

    <h3>Data Sharing</h3>
    <p>Your data is:</p>
    <ul>
      <li>Used to create an aggregated audience profile for the festival, processed at a general level and not traceable to individuals</li>
      <li>Not shared with third parties for any other purpose</li>
    </ul>
  </section>

  <section>
    <h2>Data Storage</h2>

    <h3>Duration of Storage</h3>
    <p>We store your Spotify data for up to 12 months. After this period, personally identifiable links—such as your Spotify username—will be removed, ensuring that the remaining data is fully anonymized.</p>

    <h3>Storage and Security</h3>
    <p>Your data is securely stored using Supabase Inc., protected by Supabase Services’ advanced security measures.  
    The servers of Supabase are located at Central EU (Frankfurt).</p>
  </section>

  <section>
    <h2>User Rights</h2>
    <ul>
      <li>You can disconnect your Spotify account from the Web App at any time.</li>
      <li>You have the right to access, correct, or delete your personal data, restrict or object to processing, and request data portability under the GDPR.</li>
    </ul>
    <p>To exercise these rights, contact us at: <a href="mailto:support@tenfold.technology">support@tenfold.technology</a>. Once we process your request, all associated data will be permanently deleted.</p>
  </section>

  <section>
    <h2>Cookies and Tracking</h2>
    <p>We do not use cookies or tracking technologies for advertising or marketing.</p>
    <p>We use Google Tag Manager only to:</p>
    <ul>
      <li>Monitor Web App usage patterns</li>
      <li>Determine when and where the Web App is being accessed for operational purposes</li>
    </ul>
  </section>

  <section>
    <h2>General Information</h2>
    <h3>Ownership</h3>
    <p>The Web App is operated by VOF TENFOLD Technology.</p>

    <h3>Contact Information</h3>
    <p>For privacy concerns, support, or data deletion requests, contact us at:
      <br />
    <a href="mailto:support@tenfold.technology">support@tenfold.technology</a></p>
  </section>

  <section>
    <h2>Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. Updates will be posted on this page with the "Last Updated" date.</p>
  </section>

  <section>
    <h2>Contact Us</h2>
    <p>By using the Web App, you agree to this Privacy Policy and acknowledge that your data will be used as outlined above.<br/>
    For any further questions, reach out to us at <a href="mailto:support@tenfold.technology">support@tenfold.technology</a>.</p>
  </section>
</section>
          
          <div className="privacy-policy__back">
            <a href="/" className="btn__type--link">
              ← Back to Hit The City Personal Timetable
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
