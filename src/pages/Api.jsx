import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Api() {
  const [artistsData, setArtistsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchArtistsData()
  }, [])

  const fetchArtistsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch artists data from external API
      const response = await fetch('https://mpt-api.netlify.app/api/artists')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setArtistsData(data)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (artistsData) {
      navigator.clipboard.writeText(JSON.stringify(artistsData, null, 2))
        .then(() => alert('JSON copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err))
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">API Data</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading artists data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">API Data</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
        <button 
          onClick={fetchArtistsData}
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
          <a href="/api" className="text-blue-800 font-semibold">API</a>
          <a href="/spotify-profiles" className="text-blue-600 hover:text-blue-800">Spotify Profiles</a>
          <a href="/artist-recommendations" className="text-blue-600 hover:text-blue-800">Artist Recommendations</a>
          <a href="/cache" className="text-blue-600 hover:text-blue-800">Cache</a>
          <a href="/test-recommendations" className="text-blue-600 hover:text-blue-800">Test Recommendations</a>
        </nav>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">API Data</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">API Endpoints</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="mb-2"><strong>External API Base URL:</strong> <code className="bg-gray-200 px-2 py-1 rounded">https://mpt-api.netlify.app</code></p>
          <p className="mb-2"><strong>Artists Endpoint:</strong> <code className="bg-gray-200 px-2 py-1 rounded">/api/artists</code></p>
          <p className="mb-2"><strong>Spotify Profiles:</strong> <code className="bg-gray-200 px-2 py-1 rounded">/api/spotify-profiles</code></p>
          <p className="mb-2"><strong>Artist Recommendations:</strong> <code className="bg-gray-200 px-2 py-1 rounded">/api/artist-recommendations/:profileId</code></p>
          <p className="text-sm text-gray-600">All endpoints are now served from the external API</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Artists Data</h2>
          <button 
            onClick={copyToClipboard}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Copy JSON
          </button>
        </div>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96">
          <pre className="text-sm">
            {JSON.stringify(artistsData, null, 2)}
          </pre>
        </div>
      </div>

      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <strong>Data Structure:</strong>
        <ul className="mt-2 list-disc list-inside">
          <li><strong>artists</strong>: Array of artist objects</li>
          <li><strong>spotify_id</strong>: Artist's Spotify ID</li>
          <li><strong>artist_name</strong>: Artist's name</li>
          <li><strong>relevant_artist</strong>: Object with heavy, medium, light arrays of related artists</li>
          <li><strong>genres</strong>: Array of artist genres</li>
        </ul>
      </div>
    </div>
  )
} 