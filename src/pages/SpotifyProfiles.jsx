import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function SpotifyProfiles() {
  const [profiles, setProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('https://mpt-api.netlify.app/api/spotify-profiles')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfileData = async (profileId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`https://mpt-api.netlify.app/api/spotify-profiles/${profileId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setProfileData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId)
    fetchProfileData(profileId)
  }

  const copyToClipboard = () => {
    if (profileData) {
      navigator.clipboard.writeText(JSON.stringify(profileData, null, 2))
        .then(() => alert('JSON copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err))
    }
  }

  if (loading && !profiles.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Spotify Profiles</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading profiles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Spotify Profiles</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
        <button 
          onClick={fetchProfiles}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          <a href="/" className="text-blue-600 hover:text-blue-800">← Back to Timetable</a>
          <a href="/api" className="text-blue-600 hover:text-blue-800">API</a>
          <a href="/spotify-profiles" className="text-blue-800 font-semibold">Spotify Profiles</a>
          <a href="/artist-recommendations" className="text-blue-600 hover:text-blue-800">Artist Recommendations</a>
          <a href="/cache" className="text-blue-600 hover:text-blue-800">Cache</a>
          <a href="/test-recommendations" className="text-blue-600 hover:text-blue-800">Test Recommendations</a>
        </nav>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Spotify Profiles</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Select Profile</h2>
            
            {profiles.length === 0 ? (
              <p className="text-gray-500">No profiles found</p>
            ) : (
              <div className="space-y-2">
                {profiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile.id)}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      selectedProfile === profile.id
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{profile.display_name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{profile.spotify_id}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Data */}
        <div className="lg:col-span-2">
          {profileData ? (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Profile Data</h2>
                  <button 
                    onClick={copyToClipboard}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Copy JSON
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Profile Info</h3>
                    <p><strong>Name:</strong> {profileData.profile.display_name || 'Unknown'}</p>
                    <p><strong>Spotify ID:</strong> {profileData.profile.spotify_id}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Summary</h3>
                    <p><strong>Top Artists:</strong> {profileData.topArtists.length}</p>
                    <p><strong>Top Tracks:</strong> {profileData.topTracks.length}</p>
                    <p><strong>Unique Artists:</strong> {profileData.uniqueSpotifyIds.combined.length}</p>
                    <p><strong>Genres:</strong> {profileData.allGenres.length}</p>
                  </div>
                </div>
              </div>

              {/* Unique Spotify IDs */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Unique Spotify IDs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">From Top Artists ({profileData.uniqueSpotifyIds.fromTopArtists.length})</h4>
                    <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                      {profileData.uniqueSpotifyIds.fromTopArtists.map(id => (
                        <div key={id} className="text-sm font-mono text-gray-600">{id}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">From Top Tracks ({profileData.uniqueSpotifyIds.fromTopTracks.length})</h4>
                    <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                      {profileData.uniqueSpotifyIds.fromTopTracks.map(id => (
                        <div key={id} className="text-sm font-mono text-gray-600">{id}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Combined ({profileData.uniqueSpotifyIds.combined.length})</h4>
                    <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                      {profileData.uniqueSpotifyIds.combined.map(id => (
                        <div key={id} className="text-sm font-mono text-gray-600">{id}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">All Genres ({profileData.allGenres.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.allGenres.map(genre => (
                    <span key={genre} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Raw JSON */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Raw JSON Data</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96">
                  <pre className="text-sm">
                    {JSON.stringify(profileData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500 text-center">Select a profile to view data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
