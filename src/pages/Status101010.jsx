import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Status101010.css'

export default function Status101010() {
  const [stats, setStats] = useState({
    spotifyProfiles: 0,
    personalTimetables: 0,
    timetableEntries: 0,
    artists: 0,
    stages: 0,
    festivalDays: 0,
    recommendations: 0,
    userTopArtists: 0,
    userTopTracks: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all statistics in parallel
      const [
        { count: spotifyProfiles },
        { count: personalTimetables },
        { count: timetableEntries },
        { count: artists },
        { count: stages },
        { count: festivalDays },
        { count: recommendations },
        { count: userTopArtists },
        { count: userTopTracks }
      ] = await Promise.all([
        supabase.from('spotify_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('personal_timetables').select('*', { count: 'exact', head: true }),
        supabase.from('timetable_entries').select('*', { count: 'exact', head: true }),
        supabase.from('artists').select('*', { count: 'exact', head: true }),
        supabase.from('stages').select('*', { count: 'exact', head: true }),
        supabase.from('festival_days').select('*', { count: 'exact', head: true }),
        supabase.from('user_recommendations').select('*', { count: 'exact', head: true }),
        supabase.from('user_top_artists').select('*', { count: 'exact', head: true }),
        supabase.from('user_top_tracks').select('*', { count: 'exact', head: true })
      ])

      setStats({
        spotifyProfiles: spotifyProfiles || 0,
        personalTimetables: personalTimetables || 0,
        timetableEntries: timetableEntries || 0,
        artists: artists || 0,
        stages: stages || 0,
        festivalDays: festivalDays || 0,
        recommendations: recommendations || 0,
        userTopArtists: userTopArtists || 0,
        userTopTracks: userTopTracks || 0
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="status-page">
        <div className="status-content">
          <h1>101010</h1>
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="status-page">
        <div className="status-content">
          <h1>101010</h1>
          <div className="error">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="status-page">
      <div className="status-content">
        <h1>101010</h1>
        
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Personal Timetables</div>
            <div className="stat-value">{stats.spotifyProfiles}</div>
          </div>
          
          {/* <div className="stat-item">
            <div className="stat-label">Personal Timetables</div>
            <div className="stat-value">{stats.personalTimetables}</div>
          </div> */}
          
          {/* <div className="stat-item">
            <div className="stat-label">Timetable Entries</div>
            <div className="stat-value">{stats.timetableEntries}</div>
          </div> */}
          
          {/* <div className="stat-item">
            <div className="stat-label">Artists</div>
            <div className="stat-value">{stats.artists}</div>
          </div> */}
          
          {/* <div className="stat-item">
            <div className="stat-label">Stages</div>
            <div className="stat-value">{stats.stages}</div>
          </div> */}
          
          {/* <div className="stat-item">
            <div className="stat-label">Festival Days</div>
            <div className="stat-value">{stats.festivalDays}</div>
          </div> */}
          
          {/* <div className="stat-item">
            <div className="stat-label">Recommendations</div>
            <div className="stat-value">{stats.recommendations}</div>
          </div> */}
{/*           
          <div className="stat-item">
            <div className="stat-label">User Top Artists</div>
            <div className="stat-value">{stats.userTopArtists}</div>
          </div> */}
          
          {/* <div className="stat-item">
            <div className="stat-label">User Top Tracks</div>
            <div className="stat-value">{stats.userTopTracks}</div>
          </div> */}
        </div>
        
        <div className="timestamp">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
}
