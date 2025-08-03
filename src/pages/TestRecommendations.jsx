import { useState, useEffect } from 'react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { useCachedFestivalData } from '../hooks/useCachedFestivalData'
import { supabase } from '../lib/supabase'

export function TestRecommendations() {
  console.log('🎵 TestRecommendations component rendering...')
  
  // Add both hooks
  const { user: spotifyUser, topArtists, topTracks, isAuthenticated } = useSpotifyAuth()
  const { data: festivalData, loading: festivalLoading, error: festivalError } = useCachedFestivalData()
  
  const [testState, setTestState] = useState('Hello World')
  const [userSpotifyArtists, setUserSpotifyArtists] = useState([])
  const [allFestivalArtists, setAllFestivalArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingFestival, setLoadingFestival] = useState(false)
  const [matches, setMatches] = useState([])
  const [showMatches, setShowMatches] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)
  
  // Get user's Spotify IDs
  const getUserSpotifyIds = () => {
    const artistIds = topArtists ? topArtists.map(artist => artist.id) : []
    const trackArtistIds = topTracks ? topTracks.map(track => track.artists[0].id) : []
    const allIds = [...new Set([...artistIds, ...trackArtistIds])]
    return allIds
  }

  // Get all festival artists from festival data
  const getFestivalArtists = () => {
    if (!festivalData?.days) return []
    
    const allArtists = []
    festivalData.days.forEach(day => {
      day.stages?.forEach(stage => {
        stage.acts?.forEach(act => {
          if (act.artist) {
            allArtists.push(act.artist)
          }
        })
      })
    })
    
    // Remove duplicates based on id
    return allArtists.filter((artist, index, self) => 
      index === self.findIndex(a => a.id === artist.id)
    )
  }

  // Load festival artists with their related artists from Supabase
  const loadFestivalArtists = async () => {
    if (!festivalData) {
      console.log('❌ No festival data available')
      return
    }

    setLoadingFestival(true)
    console.log('🔄 Loading festival artists with related artists from Supabase...')
    
    const festivalArtists = getFestivalArtists()
    console.log('📊 Total festival artists found:', festivalArtists.length)
    
    const artistsWithRelated = []
    
    for (const artist of festivalArtists) {
      try {
        // Add sleep to avoid rate limiting (100ms between requests)
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const { data: relatedData, error } = await supabase
          .from('related_artists')
          .select('spotify_id')
          .eq('artist_id', artist.id)
        
        if (error) {
          console.error(`❌ Error for ${artist.name}:`, error)
        }
        
        const relatedSpotifyIds = relatedData ? relatedData.map(r => r.spotify_id) : []
        
        if (relatedSpotifyIds.length > 0) {
          console.log(`✅ ${artist.name}: ${relatedSpotifyIds.length} related artists`)
        } else {
          console.log(`❌ ${artist.name}: NO related artists (ID: ${artist.id})`)
        }
        
        artistsWithRelated.push({
          ...artist,
          relatedSpotifyIds: relatedSpotifyIds
        })
      } catch (error) {
        console.error(`❌ Error processing festival artist ${artist.name}:`, error)
      }
    }
    
    setAllFestivalArtists(artistsWithRelated)
    
    // Save to localStorage
    localStorage.setItem('festival_artists_with_related', JSON.stringify(artistsWithRelated))
    localStorage.setItem('festival_artists_timestamp', Date.now().toString())
    
    console.log('📊 All festival artists loaded and saved to localStorage:', artistsWithRelated.length)
    setLoadingFestival(false)
  }

  // Check for matches between user's Spotify artists and festival artists
  const checkMatches = async () => {
    if (userSpotifyArtists.length === 0 || allFestivalArtists.length === 0) {
      console.log('❌ Need both user artists and festival artists data')
      return
    }

    setLoadingMatches(true)
    setShowMatches(true)
    console.log('🔍 Checking for matches...')
    
    const foundMatches = []
    
    // Step 1: Direct matches (festival artist's related artists match user's Spotify artists)
    console.log('🔍 Step 1: Checking direct matches...')
    allFestivalArtists.forEach(festivalArtist => {
      const matchingUserIds = userSpotifyArtists.filter(userArtist => 
        festivalArtist.relatedSpotifyIds.includes(userArtist.spotify_id)
      )
      
      if (matchingUserIds.length > 0) {
        foundMatches.push({
          festivalArtist: festivalArtist,
          matchingUserArtists: matchingUserIds,
          matchCount: matchingUserIds.length,
          matchType: 'direct',
          reason: `Your Spotify artists directly match this festival artist's related artists`
        })
      }
    })
    
    // Step 2: Check if user's Spotify artists are directly in the festival
    console.log('🔍 Step 2: Checking if your Spotify artists are directly in the festival...')
    const directFestivalMatches = []
    
    userSpotifyArtists.forEach(userArtist => {
      const matchingFestivalArtist = allFestivalArtists.find(festivalArtist => 
        festivalArtist.spotify_id === userArtist.spotify_id
      )
      
      if (matchingFestivalArtist) {
        directFestivalMatches.push({
          festivalArtist: matchingFestivalArtist,
          userArtist: userArtist,
          matchType: 'direct_festival',
          reason: `You listen to this artist and they're performing at the festival!`
        })
      }
    })
    
    // Step 3: Check related artists of user's Spotify artists (if we have the data)
    console.log('🔍 Step 3: Checking related artists of your Spotify artists...')
    const userArtistRelatedMatches = []
    
    userSpotifyArtists.forEach(userArtist => {
      allFestivalArtists.forEach(festivalArtist => {
        if (userArtist.relatedSpotifyIds.includes(festivalArtist.spotify_id)) {
          userArtistRelatedMatches.push({
            festivalArtist: festivalArtist,
            userArtist: userArtist,
            matchType: 'related_to_user',
            reason: `This festival artist is related to your Spotify artist ${userArtist.name}`
          })
        }
      })
    })
    
    // Step 4: Check genre matches
    console.log('🔍 Step 4: Checking genre matches...')
    const genreMatches = []
    
    userSpotifyArtists.forEach(userArtist => {
      allFestivalArtists.forEach(festivalArtist => {
        if (userArtist.genres && festivalArtist.genres) {
          const commonGenres = userArtist.genres.filter(genre => 
            festivalArtist.genres.includes(genre)
          )
          
          if (commonGenres.length > 0) {
            genreMatches.push({
              festivalArtist: festivalArtist,
              userArtist: userArtist,
              matchType: 'genre',
              reason: `Shared genres: ${commonGenres.join(', ')}`,
              commonGenres: commonGenres
            })
          }
        }
      })
    })
    
    // Combine all matches and remove duplicates
    const allMatches = [
      ...foundMatches,
      ...directFestivalMatches,
      ...userArtistRelatedMatches,
      ...genreMatches
    ]
    
    // Remove duplicates based on festival artist ID and keep the best match type
    const uniqueMatches = []
    const seenFestivalArtistIds = new Set()
    
    allMatches.forEach(match => {
      const festivalArtistId = match.festivalArtist.id
      if (!seenFestivalArtistIds.has(festivalArtistId)) {
        seenFestivalArtistIds.add(festivalArtistId)
        uniqueMatches.push(match)
      } else {
        // If we already have this artist, update with better match type
        const existingIndex = uniqueMatches.findIndex(m => m.festivalArtist.id === festivalArtistId)
        if (existingIndex !== -1) {
          const existing = uniqueMatches[existingIndex]
          // Prioritize: direct_festival > direct > related_to_user > genre
          const priority = { 'direct_festival': 4, 'direct': 3, 'related_to_user': 2, 'genre': 1 }
          if (priority[match.matchType] > priority[existing.matchType]) {
            uniqueMatches[existingIndex] = match
          }
        }
      }
    })
    
    setMatches(uniqueMatches)
    setLoadingMatches(false)
    console.log('🎯 Total unique matches found:', uniqueMatches.length)
    console.log('📊 Match breakdown:', {
      direct: foundMatches.length,
      directFestival: directFestivalMatches.length,
      relatedToUser: userArtistRelatedMatches.length,
      genre: genreMatches.length,
      unique: uniqueMatches.length
    })
  }

  // Load related artists from Spotify API
  const loadRelatedArtists = async () => {
    if (!isAuthenticated || !topArtists || !topTracks) {
      console.log('❌ Not authenticated or no data available')
      return
    }

    setLoading(true)
    console.log('📊 Loading related artists from Spotify API...')
    
    const userArtists = []
    const allUserSpotifyIds = getUserSpotifyIds()
    
    console.log(`🎵 Processing ${allUserSpotifyIds.length} Spotify artists...`)
    
    // Process ALL user Spotify artists
    for (const spotifyId of allUserSpotifyIds) {
      try {
        // Add sleep to avoid rate limiting (200ms between requests)
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Get related artists from Spotify API
        const accessToken = localStorage.getItem('spotify_access_token')
        if (!accessToken) {
          console.error('❌ No Spotify access token found')
          continue
        }
        
        const response = await fetch(`https://api.spotify.com/v1/artists/${spotifyId}/related-artists`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        if (!response.ok) {
          console.error(`❌ Error fetching related artists for ${spotifyId}:`, response.status, response.statusText)
          continue
        }
        
        const relatedData = await response.json()
        const relatedSpotifyIds = relatedData.artists ? relatedData.artists.map(a => a.id) : []
        
        // Get artist details to get genres
        const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${spotifyId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        let genres = []
        if (artistResponse.ok) {
          const artistData = await artistResponse.json()
          genres = artistData.genres || []
        }
        
        // Get genres for related artists too
        const relatedArtistsWithGenres = []
        for (const relatedId of relatedSpotifyIds) {
          try {
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 50))
            
            const relatedArtistResponse = await fetch(`https://api.spotify.com/v1/artists/${relatedId}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            })
            
            if (relatedArtistResponse.ok) {
              const relatedArtistData = await relatedArtistResponse.json()
              relatedArtistsWithGenres.push({
                id: relatedId,
                name: relatedArtistData.name,
                genres: relatedArtistData.genres || []
              })
            }
          } catch (error) {
            console.error(`❌ Error fetching genres for related artist ${relatedId}:`, error)
          }
        }
        
        // Try to get artist name from topArtists or topTracks, or use ID as fallback
        let artistName = spotifyId
        if (topArtists) {
          const topArtist = topArtists.find(a => a.id === spotifyId)
          if (topArtist) artistName = topArtist.name
        }
        if (topTracks && artistName === spotifyId) {
          const topTrack = topTracks.find(t => t.artists[0].id === spotifyId)
          if (topTrack) artistName = topTrack.artists[0].name
        }
        
        const artistData = {
          id: spotifyId,
          name: artistName,
          spotify_id: spotifyId,
          relatedSpotifyIds: relatedSpotifyIds,
          relatedArtists: relatedArtistsWithGenres, // Add related artists with genres
          genres: genres, // Add genres to the artist data
          source: 'all_user_artists'
        }
        
        userArtists.push(artistData)
        
        if (relatedSpotifyIds.length > 0) {
          console.log(`✅ Artist ${artistName} (${spotifyId}): ${relatedSpotifyIds.length} related artists, ${genres.length} genres`)
          console.log(`📊 Related artists with genres: ${relatedArtistsWithGenres.length}/${relatedSpotifyIds.length} fetched`)
        } else {
          console.log(`❌ Artist ${artistName} (${spotifyId}): No related artists found, ${genres.length} genres`)
        }
      } catch (error) {
        console.error(`❌ Error processing artist ${spotifyId}:`, error)
      }
    }
    
    setUserSpotifyArtists(userArtists)
    
    // Save to localStorage
    localStorage.setItem('user_spotify_artists_with_related', JSON.stringify(userArtists))
    localStorage.setItem('user_spotify_artists_timestamp', Date.now().toString())
    
    console.log('📊 All user Spotify artists loaded and saved to localStorage:', userArtists.length)
    setLoading(false)
  }

  // Load cached data on component mount
  useEffect(() => {
    // Load cached user artists data
    const cachedUserData = localStorage.getItem('user_spotify_artists_with_related')
    const userTimestamp = localStorage.getItem('user_spotify_artists_timestamp')
    
    if (cachedUserData && userTimestamp) {
      const age = Date.now() - parseInt(userTimestamp)
      // Cache for 1 hour
      if (age < 60 * 60 * 1000) {
        console.log('📊 Loading cached user artists data...')
        setUserSpotifyArtists(JSON.parse(cachedUserData))
      }
    }

    // Load cached festival artists data
    const cachedFestivalData = localStorage.getItem('festival_artists_with_related')
    const festivalTimestamp = localStorage.getItem('festival_artists_timestamp')
    
    if (cachedFestivalData && festivalTimestamp) {
      const age = Date.now() - parseInt(festivalTimestamp)
      // Cache for 1 hour
      if (age < 60 * 60 * 1000) {
        console.log('📊 Loading cached festival artists data...')
        setAllFestivalArtists(JSON.parse(cachedFestivalData))
      }
    }
  }, [])
  
  useEffect(() => {
    console.log('🔄 useEffect triggered')
    console.log('🔍 Spotify auth state:', { isAuthenticated, hasTopArtists: !!topArtists, hasTopTracks: !!topTracks })
    console.log('🔍 Festival data state:', { hasFestivalData: !!festivalData, festivalLoading, festivalError })
    setTestState('Component loaded!')
  }, [isAuthenticated, topArtists, topTracks, festivalData, festivalLoading, festivalError])
  
  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1>Test Recommendations </h1>
      
      {/* User Spotify IDs Section */}
      <div style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h2>👤 Your Spotify IDs ({getUserSpotifyIds().length})</h2>
        {isAuthenticated ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {getUserSpotifyIds().map((spotifyId, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f0f0f0', 
                padding: '8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                border: '1px solid #ccc'
              }}>
                {spotifyId}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <p>Please connect your Spotify account to see your artist IDs.</p>
          </div>
        )}
      </div>

      {/* Load Related Artists Button */}
      {isAuthenticated && (
        <div style={{ marginBottom: '40px' }}>
          <button 
            onClick={loadRelatedArtists}
            disabled={loading}
            style={{
              padding: '15px 30px',
              backgroundColor: loading ? '#ccc' : '#1DB954',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginRight: '20px'
            }}
          >
            {loading ? '🔄 Loading Related Artists...' : '🎵 Load Related Artists from Spotify API'}
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            This will fetch related artists and their genres for all your Spotify artists with rate limiting.
          </p>
        </div>
      )}

      {/* User Artists with Related Artists Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2>👤 Your Spotify Artists with Related Artists ({userSpotifyArtists.length})</h2>
        {userSpotifyArtists.length > 0 ? (
          <div>
            {userSpotifyArtists.map(artist => (
              <div key={artist.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>{artist.name} - {artist.spotify_id}</h3>
                {artist.genres && artist.genres.length > 0 && (
                  <div>
                    <p><strong>Genres ({artist.genres.length}):</strong></p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                      {artist.genres.map((genre, index) => (
                        <span key={index} style={{ 
                          backgroundColor: '#e8f5e8', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px',
                          border: '1px solid #4caf50'
                        }}>
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p><strong>Related Artists ({artist.relatedSpotifyIds.length}):</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '10px' }}>
                  {artist.relatedArtists && artist.relatedArtists.length > 0 ? (
                    artist.relatedArtists.map(relatedArtist => (
                      <div key={relatedArtist.id} style={{ 
                        backgroundColor: '#f0f0f0', 
                        padding: '8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        border: '1px solid #ccc'
                      }}>
                        <div><strong>{relatedArtist.name}</strong></div>
                        <div style={{ fontSize: '10px', color: '#666' }}>{relatedArtist.id}</div>
                        {relatedArtist.genres && relatedArtist.genres.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Genres:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                              {relatedArtist.genres.slice(0, 3).map((genre, index) => (
                                <span key={index} style={{ 
                                  backgroundColor: '#e8f5e8', 
                                  padding: '2px 4px', 
                                  borderRadius: '8px', 
                                  fontSize: '9px',
                                  border: '1px solid #4caf50'
                                }}>
                                  {genre}
                                </span>
                              ))}
                              {relatedArtist.genres.length > 3 && (
                                <span style={{ fontSize: '9px', color: '#666' }}>
                                  +{relatedArtist.genres.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    artist.relatedSpotifyIds.map(relatedId => (
                      <div key={relatedId} style={{ 
                        backgroundColor: '#f0f0f0', 
                        padding: '8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        border: '1px solid #ccc'
                      }}>
                        {relatedId}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <p>No related artists loaded yet. Click the button above to load them from Spotify API.</p>
          </div>
        )}
      </div>

      {/* Check for Matches Button */}
      {userSpotifyArtists.length > 0 && allFestivalArtists.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <button 
            onClick={checkMatches}
            disabled={loadingMatches}
            style={{
              padding: '15px 30px',
              backgroundColor: loadingMatches ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loadingMatches ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loadingMatches ? '🔄 Checking Matches...' : '🎯 Check for Matches'}
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Find festival artists that match your Spotify listening data.
          </p>
        </div>
      )}

      {/* Matches Section */}
      {showMatches && (
        <div style={{ marginBottom: '40px' }}>
          <h2>🎯 Matches Found ({matches.length})</h2>
          {loadingMatches ? (
            <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
              <p>🔄 Checking for matches...</p>
            </div>
          ) : matches.length > 0 ? (
            <div>
              {matches.map((match, index) => (
                <div key={index} style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  border: '2px solid',
                  borderColor: match.matchType === 'direct_festival' ? '#28a745' : 
                             match.matchType === 'direct' ? '#007bff' : 
                             match.matchType === 'genre' ? '#6f42c1' : '#fd7e14',
                  borderRadius: '8px',
                  backgroundColor: match.matchType === 'direct_festival' ? '#d4edda' : 
                                 match.matchType === 'direct' ? '#d1ecf1' : 
                                 match.matchType === 'genre' ? '#f3e5f5' : '#fff3cd'
                }}>
                  <h3>{match.festivalArtist.name} - {match.festivalArtist.spotify_id}</h3>
                  <p><strong>Match Type:</strong> {match.matchType}</p>
                  <p><strong>Reason:</strong> {match.reason}</p>
                  
                  {/* Festival Artist Genres */}
                  {match.festivalArtist.genres && match.festivalArtist.genres.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p><strong>Festival Artist Genres:</strong></p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {match.festivalArtist.genres.map((genre, index) => (
                          <span key={index} style={{ 
                            backgroundColor: '#e3f2fd', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px',
                            border: '1px solid #2196f3'
                          }}>
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {match.matchingUserArtists && (
                    <div>
                      <p><strong>Matching Your Artists ({match.matchCount}):</strong></p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '10px' }}>
                        {match.matchingUserArtists.map(userArtist => (
                          <div key={userArtist.id} style={{ 
                            backgroundColor: '#f0f0f0', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            border: '1px solid #ccc'
                          }}>
                            {userArtist.name} - {userArtist.spotify_id}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.userArtist && (
                    <div>
                      <p><strong>Your Artist:</strong> {match.userArtist.name} - {match.userArtist.spotify_id}</p>
                      
                      {/* User Artist Genres */}
                      {match.userArtist.genres && match.userArtist.genres.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <p><strong>Your Artist Genres:</strong></p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {match.userArtist.genres.map((genre, index) => (
                              <span key={index} style={{ 
                                backgroundColor: '#e8f5e8', 
                                padding: '4px 8px', 
                                borderRadius: '12px', 
                                fontSize: '11px',
                                border: '1px solid #4caf50'
                              }}>
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {match.commonGenres && match.commonGenres.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <p><strong>Shared Genres:</strong></p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {match.commonGenres.map((genre, index) => (
                          <span key={index} style={{ 
                            backgroundColor: '#f3e5f5', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px',
                            border: '1px solid #6f42c1',
                            fontWeight: 'bold'
                          }}>
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
              <p>No matches found. Your Spotify data doesn't match any festival artists.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Load Festival Artists Button */}
      {festivalData && (
        <div style={{ marginBottom: '40px' }}>
          <button 
            onClick={loadFestivalArtists}
            disabled={loadingFestival}
            style={{
              padding: '15px 30px',
              backgroundColor: loadingFestival ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loadingFestival ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loadingFestival ? '🔄 Loading Festival Artists...' : '🎪 Load Festival Artists from Supabase'}
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            This will fetch related artists for all festival artists from the database with 100ms delays.
          </p>
        </div>
      )}

      {/* Festival Artists with Related Artists Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2>🎪 Festival Artists with Related Artists ({allFestivalArtists.length})</h2>
        {allFestivalArtists.length > 0 ? (
          <div>
            {allFestivalArtists.map(artist => (
              <div key={artist.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>{artist.name} - {artist.spotify_id}</h3>
                <p><strong>Database ID:</strong> {artist.id}</p>
                {artist.genres && artist.genres.length > 0 && (
                  <div>
                    <p><strong>Genres ({artist.genres.length}):</strong></p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                      {artist.genres.map((genre, index) => (
                        <span key={index} style={{ 
                          backgroundColor: '#e3f2fd', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px',
                          border: '1px solid #2196f3'
                        }}>
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p><strong>Related Artists ({artist.relatedSpotifyIds.length}):</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '10px' }}>
                  {artist.relatedSpotifyIds.map(relatedId => (
                    <div key={relatedId} style={{ 
                      backgroundColor: '#e3f2fd', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      border: '1px solid #2196f3'
                    }}>
                      {relatedId}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <p>No festival artists loaded yet. Click the button above to load them from Supabase.</p>
          </div>
        )}
      </div>
      
      {/* Debug Info */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔍 Debug Info</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Top Artists:</strong> {topArtists ? `✅ ${topArtists.length} artists` : '❌ Not loaded'}</p>
        <p><strong>Top Tracks:</strong> {topTracks ? `✅ ${topTracks.length} tracks` : '❌ Not loaded'}</p>
        <p><strong>User Spotify IDs:</strong> {getUserSpotifyIds().length}</p>
        <p><strong>User Artists with Related:</strong> {userSpotifyArtists.length}</p>
        <p><strong>Festival Data:</strong> {festivalData ? '✅ Loaded' : '❌ Not loaded'}</p>
        <p><strong>Festival Artists:</strong> {getFestivalArtists().length}</p>
        <p><strong>Festival Artists with Related:</strong> {allFestivalArtists.length}</p>
        <p><strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>Loading Festival:</strong> {loadingFestival ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>Matches Found:</strong> {matches.length}</p>
        <p><strong>Loading Matches:</strong> {loadingMatches ? '🔄 Yes' : '✅ No'}</p>
      </div>
    </div>
  )
} 