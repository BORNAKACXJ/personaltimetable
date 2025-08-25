import React from 'react'
import './EULA.css'

function EULA() {
  return (
    <div className="eula">
      <div className="section__margin">
        <div className="eula__content">
          <h1>End User License Agreement (EULA)</h1>
          
          <section id="eula">
  <h2>End User License Agreement (EULA)</h2>

  <section>
    <h2>Reference</h2>
    <p>For details on how we collect and handle your data, please refer to our <a href="/privacy-policy">Privacy Policy</a>.</p>
    <p><strong>Effective Date:</strong> 20 08 2024<br />
       <strong>Last Updated:</strong> 25 08 2025</p>
  </section>

  <section>
    <h2>Introduction</h2>
    <p>This End User License Agreement (“Agreement”) is a legal agreement between you (“User”) and VOF TENFOLD technology (“Tenfold,” “we,” or “us”) governing the use of the “Hit The City Personal Timetable” web application (“Web App”).</p>
    <p>By checking the box in the Web App, you agree to the terms of this Agreement. If you do not agree, do not use the Web App.</p>
  </section>

  <section>
    <h2>License Grant</h2>
    <p>We grant you a limited, non-exclusive, non-transferable, revocable license to use the Web App for personal, non-commercial purposes. This license is subject to your compliance with this Agreement.</p>
  </section>

  <section>
    <h2>Application Features</h2>
    <ul>
      <li>Creates a personal timetable for the "Hit The City" festival based on your Spotify top tracks, genres, and artists, in line with <a href="https://developer.spotify.com/terms">Spotify’s API requirements</a>.</li>
      <li>Provides a personalized music experience by matching your listening preferences with festival acts.</li>
      <li>Generates a shareable link for your personal timetable.</li>
    </ul>
  </section>

  <section>
    <h2>Age Restrictions</h2>
    <p>The Web App is intended for users with an active Spotify account. By using the Web App, you confirm you are 18 or older or meet the age requirements under applicable laws. We do not knowingly collect data from users under 16.</p>
  </section>

  <section>
    <h2>Data Collection and Use</h2>
    <p>The Web App collects the following data through the Spotify API and according to the Privacy Policy:</p>
    <ul>
      <li>Top tracks and artists from the past 12 months</li>
      <li>Top genres, derived from tracks and artists</li>
      <li>Spotify username and Spotify user ID (used only to identify timetables in the database)</li>
    </ul>
    <p>We also use aggregated data to create an overall profile of festival visitors. This analysis is not linked to individual users.</p>
    <p>Timetables remain anonymous unless you share your unique link. Data is stored for up to six months. All processing adheres to Spotify’s API policies. You may disconnect anytime and request deletion of your data.</p>
  </section>

  <section>
    <h2>User-Generated Content</h2>
    <p>Users receive a unique shareable link to their timetable. By sharing this link, you are responsible for its distribution and consequences.</p>
  </section>

  <section>
    <h2>Restrictions</h2>
    <ul>
      <li>Do not reverse engineer, decompile, or disassemble the Web App.</li>
      <li>Do not use the Web App for unlawful purposes.</li>
      <li>Do not violate Spotify’s terms of use.</li>
      <li>Do not share, distribute, or sell any part of the Web App without authorization.</li>
    </ul>
  </section>

  <section>
    <h2>Prohibited Actions</h2>
    <ul>
      <li>Do not modify or create derivative works based on the Spotify Platform, Service, or Content.</li>
      <li>Do not reverse-engineer or otherwise reduce the Spotify Platform, Service, or Content to source code.</li>
    </ul>
  </section>

  <section>
    <h2>Support and Maintenance</h2>
    <p>For support, feedback, or deletion requests, email <a href="mailto:support@tenfold.technology">support@tenfold.technology</a>. We aim to respond within 48 hours.</p>
  </section>

  <section>
    <h2>Disclaimer of Warranties</h2>
    <p>The Web App is provided “as is” without warranties of any kind. We make no guarantees regarding Spotify’s platform or services. All implied warranties, including merchantability and fitness for purpose, are disclaimed.</p>
  </section>

  <section>
    <h2>Limitation of Liability</h2>
    <p>The Web App suggests acts based on your listening behavior, but your festival experience is your responsibility. We are not liable for:</p>
    <ul>
      <li>Disappointment with recommendations</li>
      <li>Incidents during the festival (alcohol, violence, drugs, or other activities)</li>
      <li>Direct, indirect, or incidental damages from use of the Web App</li>
      <li>Unexpectedly becoming a huge fan of a recommended act (we’d count that as a win!)</li>
    </ul>
  </section>

  <section>
    <h2>Termination</h2>
    <p>We may suspend or terminate access to the Web App if you breach this Agreement. You may terminate your use at any time.</p>
  </section>

  <section>
    <h2>Third-Party Beneficiary</h2>
    <p>You acknowledge that Spotify is a third-party beneficiary of this Agreement and may enforce its terms directly against you.</p>
  </section>

  <section>
    <h2>Governing Law</h2>
    <p>This Agreement is governed by the laws of the Netherlands. Disputes will be resolved in Dutch courts.</p>
  </section>

  <section>
    <h2>Acceptance of Agreement</h2>
    <p>By using the Web App, you confirm that you have read, understood, and agree to this Agreement.</p>
  </section>
</section>

          
          <div className="eula__back">
            <a href="/" className="btn__type--link">
              ← Back to Hit The City Personal Timetable
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EULA
