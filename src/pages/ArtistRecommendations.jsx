import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ArtistRecommendations() {
  const [profiles, setProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [festivalArtists, setFestivalArtists] = useState([])
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProfiles()
    fetchFestivalArtists()
  }, [])

  const fetchProfiles = async () => {
    try {
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

  const fetchFestivalArtists = async () => {
    try {
      const response = await fetch('https://mpt-api.netlify.app/api/artists')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setFestivalArtists(data.artists || [])
    } catch (err) {
      setError(err.message)
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

  const generateRecommendations = () => {
    if (!profileData || !festivalArtists.length) return

    const userSpotifyIds = profileData.uniqueSpotifyIds.combined
    const userGenres = profileData.allGenres

    // Define main genre categories
    const mainGenreCategories = {
      'Dance': ['dance', 'electronic', 'edm', 'house', 'techno', 'trance', 'drum and bass', 'dubstep', 'garage', 'uk garage', 'hard house', 'progressive trance', 'acid house', 'chicago house', 'french house', 'indie dance', 'dance pop', 'electropop', 'liquid funk', 'drumstep', 'jungle'],
      'Folk': ['folk', 'acoustic', 'folk pop', 'indie folk', 'acoustic pop', 'folk rock', 'soft rock', 'baroque pop', 'ambient folk', 'nl folk'],
      'Heavy': ['rock', 'metal', 'hardcore', 'punk', 'heavy alternative', 'hard rock', 'alternative metal', 'metalcore', 'deathcore', 'hardcore punk', 'punk rock', 'riot grrrl', 'indie punk', 'garage punk', 'grunge', 'grunge pop', 'noise rock', 'noise', 'noisecore', 'terror punk', 'grindcore', 'screamo', 'cyber metal', 'digital hardcore', 'industrial', 'industrial metal', 'industrial rock', 'art punk', 'egg punk', 'midwest emo', 'pop punk', 'skate punk', 'emo punk', 'stoner rock', 'acid rock', 'neo-psychedelic', 'psychedelic rock'],
      'Hiphop': ['hip hop', 'rap', 'dutch hip hop', 'dutch rap pop', 'conscious hip hop', 'alternative hip hop', 'experimental hip hop', 'political hip hop', 'grime', 'uk hip hop', 'drill', 'sexy drill', 'pop rap'],
      'Indie': ['indie', 'indie rock', 'indie pop', 'indie electronica', 'indie r&b', 'indie shoegaze', 'indie folk', 'indie dance', 'indie punk', 'indie alternative', 'nyc indie rock', 'irish indie', 'belgian indie', 'dutch indie', 'french indie pop', 'uk alternative pop', 'indietronica'],
      'Pop': ['pop', 'alternative pop', 'art pop', 'bedroom pop', 'dream pop', 'electroclash', 'french pop', 'hyperpop', 'glitchcore', 'experimental pop', 'ambient pop', 'synthpop', 'uk dance', 'pop r&b', 'pop soul', 'pop rock', 'power pop', 'psychedelic pop', 'surf rock', 'garage pop'],
      'R&B / Soul / Jazz': ['r&b', 'soul', 'jazz', 'neo soul', 'afro r&b', 'afro soul', 'afropop', 'gospel r&b', 'uk r&b', 'dutch r&b', 'britse r&b', 'indie r&b', 'pop soul', 'soul blues', 'neo-classical']
    }

    // Function to get main genre category for a specific genre
    const getMainGenreCategory = (genre) => {
      for (const [category, genres] of Object.entries(mainGenreCategories)) {
        if (genres.includes(genre.toLowerCase())) {
          return category
        }
      }
      return null
    }

    // Get user's main genre categories
    const userMainGenres = [...new Set(userGenres.map(genre => getMainGenreCategory(genre)).filter(Boolean))]

    const recommendations = festivalArtists.map(artist => {
      let matchType = 'none'
      let matchScore = 0
      let matchDetails = []

      // 1. Direct match check
      if (userSpotifyIds.includes(artist.spotify_id)) {
        matchType = 'direct'
        matchScore = 100
        matchDetails.push('Direct match with user\'s top artists/tracks')
      } else {
        // 2. Related artist check
        const allRelatedArtists = [
          ...artist.relevant_artist.heavy.map(ra => ({ ...ra, strength: 'heavy' })),
          ...artist.relevant_artist.medium.map(ra => ({ ...ra, strength: 'medium' })),
          ...artist.relevant_artist.light.map(ra => ({ ...ra, strength: 'light' }))
        ]

        const relatedMatches = allRelatedArtists.filter(ra => 
          userSpotifyIds.includes(ra.spotify_id)
        )

        if (relatedMatches.length > 0) {
          matchType = 'related'
          matchScore = relatedMatches.reduce((score, match) => {
            const strengthScore = match.strength === 'heavy' ? 80 : match.strength === 'medium' ? 60 : 40
            return Math.max(score, strengthScore)
          }, 0)
          matchDetails.push(`Related to ${relatedMatches.length} user artist(s): ${relatedMatches.map(m => `${m.artist_name} (${m.strength})`).join(', ')}`)
        } else {
          // 3. Genre match check
          const genreMatches = artist.genres.filter(genre => 
            userGenres.includes(genre)
          )

          if (genreMatches.length > 0) {
            matchType = 'genre'
            matchScore = Math.min(genreMatches.length * 20, 50) // Max 50 points for genre matches
            matchDetails.push(`Genre match: ${genreMatches.join(', ')}`)
          } else {
            // 4. Genre light match check (main genre categories)
            const artistMainGenres = [...new Set(artist.genres.map(genre => getMainGenreCategory(genre)).filter(Boolean))]
            const mainGenreMatches = artistMainGenres.filter(mainGenre => 
              userMainGenres.includes(mainGenre)
            )

            if (mainGenreMatches.length > 0) {
              matchType = 'genre_light'
              matchScore = Math.min(mainGenreMatches.length * 10, 30) // Max 30 points for main genre matches
              matchDetails.push(`Main genre match: ${mainGenreMatches.join(', ')}`)
            }
          }
        }
      }

      return {
        artist,
        matchType,
        matchScore,
        matchDetails,
        recommended: matchScore > 0
      }
    })

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore)

    setRecommendations({
      profile: profileData.profile,
      totalArtists: festivalArtists.length,
      recommendations: recommendations,
      summary: {
        direct: recommendations.filter(r => r.matchType === 'direct').length,
        related: recommendations.filter(r => r.matchType === 'related').length,
        genre: recommendations.filter(r => r.matchType === 'genre').length,
        genre_light: recommendations.filter(r => r.matchType === 'genre_light').length,
        none: recommendations.filter(r => r.matchType === 'none').length
      }
    })
  }

  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId)
    fetchProfileData(profileId)
  }

  const copyToClipboard = () => {
    if (recommendations) {
      navigator.clipboard.writeText(JSON.stringify(recommendations, null, 2))
        .then(() => alert('JSON copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err))
    }
  }

  useEffect(() => {
    if (profileData && festivalArtists.length > 0) {
      generateRecommendations()
    }
  }, [profileData, festivalArtists])

  if (loading && !profiles.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Artist Recommendations</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Artist Recommendations</h1>
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
          <a href="/spotify-profiles" className="text-blue-600 hover:text-blue-800">Spotify Profiles</a>
          <a href="/artist-recommendations" className="text-blue-800 font-semibold">Artist Recommendations</a>
          <a href="/cache" className="text-blue-600 hover:text-blue-800">Cache</a>
          <a href="/test-recommendations" className="text-blue-600 hover:text-blue-800">Test Recommendations</a>
        </nav>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Artist Recommendations</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

        {/* Recommendations */}
        <div className="lg:col-span-3">
          {recommendations ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Recommendations for {recommendations.profile.display_name}</h2>
                  <button 
                    onClick={copyToClipboard}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Copy JSON
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{recommendations.summary.direct}</div>
                    <div className="text-sm text-gray-600">Direct Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{recommendations.summary.related}</div>
                    <div className="text-sm text-gray-600">Related Artists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{recommendations.summary.genre}</div>
                    <div className="text-sm text-gray-600">Genre Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{recommendations.summary.genre_light}</div>
                    <div className="text-sm text-gray-600">Genre Light</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{recommendations.summary.none}</div>
                    <div className="text-sm text-gray-600">No Match</div>
                  </div>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">All Artists ({recommendations.totalArtists})</h3>
                
                <div className="space-y-4">
                  {recommendations.recommendations.map((rec, index) => (
                                         <div 
                       key={rec.artist.id} 
                       className={`p-4 rounded-lg border ${
                         rec.matchType === 'direct' ? 'bg-green-50 border-green-200' :
                         rec.matchType === 'related' ? 'bg-blue-50 border-blue-200' :
                         rec.matchType === 'genre' ? 'bg-yellow-50 border-yellow-200' :
                         rec.matchType === 'genre_light' ? 'bg-orange-50 border-orange-200' :
                         'bg-gray-50 border-gray-200'
                       }`}
                     >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{rec.artist.artist_name}</h4>
                                                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                               rec.matchType === 'direct' ? 'bg-green-200 text-green-800' :
                               rec.matchType === 'related' ? 'bg-blue-200 text-blue-800' :
                               rec.matchType === 'genre' ? 'bg-yellow-200 text-yellow-800' :
                               rec.matchType === 'genre_light' ? 'bg-orange-200 text-orange-800' :
                               'bg-gray-200 text-gray-800'
                             }`}>
                               {rec.matchType === 'direct' ? 'Direct Match' :
                                rec.matchType === 'related' ? 'Related Artist' :
                                rec.matchType === 'genre' ? 'Genre Match' :
                                rec.matchType === 'genre_light' ? 'Genre Light' : 'No Match'}
                             </span>
                            {rec.matchScore > 0 && (
                              <span className="text-sm text-gray-600">Score: {rec.matchScore}</span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            Spotify ID: {rec.artist.spotify_id}
                          </div>
                          
                          {rec.artist.genres.length > 0 && (
                            <div className="mb-2">
                              <div className="text-sm text-gray-600 mb-1">Genres:</div>
                              <div className="flex flex-wrap gap-1">
                                {rec.artist.genres.map(genre => (
                                  <span key={genre} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {rec.matchDetails.length > 0 && (
                            <div className="text-sm text-gray-700">
                              <strong>Match Details:</strong> {rec.matchDetails.join('; ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw JSON */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Raw JSON Data</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96">
                  <pre className="text-sm">
                    {JSON.stringify(recommendations, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500 text-center">Select a profile to generate recommendations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
