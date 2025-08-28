import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TestRecommendations = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [topArtists, setTopArtists] = useState(null)
  const [topTracks, setTopTracks] = useState(null)
  const [userSpotifyArtists, setUserSpotifyArtists] = useState([])
  const [festivalArtists, setFestivalArtists] = useState([])
  const [relatedArtists, setRelatedArtists] = useState([])
  const [timetableEntries, setTimetableEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const [expandedSections, setExpandedSections] = useState({
    userArtists: false,
    festivalArtists: false,
    relatedArtists: false,
    timetableEntries: false,
    matches: false
  })

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token')
    setIsAuthenticated(!!token)
    
    if (token) {
      // Load cached data
      const cachedTopArtists = localStorage.getItem('spotify_top_artists')
      const cachedTopTracks = localStorage.getItem('spotify_top_tracks')
      
      if (cachedTopArtists) setTopArtists(JSON.parse(cachedTopArtists))
      if (cachedTopTracks) setTopTracks(JSON.parse(cachedTopTracks))
      
      // Load cached user artists data
      const cachedUserData = localStorage.getItem('user_spotify_artists_direct')
      const userTimestamp = localStorage.getItem('user_spotify_artists_timestamp')
      
      if (cachedUserData && userTimestamp) {
        const age = Date.now() - parseInt(userTimestamp)
        if (age < 60 * 60 * 1000) {
          setUserSpotifyArtists(JSON.parse(cachedUserData))
        }
      }
    }
  }, [])

  // Get unique Spotify IDs from user data
  const getUserSpotifyIds = () => {
    const ids = new Set()
    
    if (topArtists) {
      topArtists.forEach(artist => ids.add(artist.id))
    }
    
    if (topTracks) {
      topTracks.forEach(track => {
        if (track.artists && track.artists.length > 0) {
          ids.add(track.artists[0].id)
        }
      })
    }
    
    return Array.from(ids)
  }

  // Load user artists from cache or Spotify data
  const loadUserArtists = async () => {
    setLoading(true)
    
    // Try to load from cache first
    const cachedData = localStorage.getItem('user_spotify_artists_direct')
    const cachedTimestamp = localStorage.getItem('user_spotify_artists_timestamp')
    
    if (cachedData && cachedTimestamp) {
      const age = Date.now() - parseInt(cachedTimestamp)
      if (age < 24 * 60 * 60 * 1000) { // 24 hours
        const userArtists = JSON.parse(cachedData)
        setUserSpotifyArtists(userArtists)
        setLoading(false)
        return
      }
    }
    
    // Load from Spotify data if not authenticated or no data
    if (!isAuthenticated || !topArtists || !topTracks) {
      setLoading(false)
      return
    }
    
    // Combine top artists and track artists
    const userArtists = []
    
    // Add top artists
    topArtists.forEach(artist => {
      userArtists.push({
        name: artist.name,
        spotify_id: artist.id,
        source: 'top_artist'
      })
    })
    
    // Add track artists (avoid duplicates)
    const existingIds = new Set(userArtists.map(a => a.spotify_id))
    topTracks.forEach(track => {
      if (!existingIds.has(track.artists[0].id)) {
        userArtists.push({
          name: track.artists[0].name,
          spotify_id: track.artists[0].id,
          source: 'top_track'
        })
        existingIds.add(track.artists[0].id)
      }
    })
    
    setUserSpotifyArtists(userArtists)
    localStorage.setItem('user_spotify_artists_direct', JSON.stringify(userArtists))
    localStorage.setItem('user_spotify_artists_timestamp', Date.now().toString())
    
    setLoading(false)
  }

  // Load festival artists from Supabase
  const loadFestivalArtists = async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('❌ Error loading festival artists:', error)
        return
      }
      
      setFestivalArtists(data || [])
    } catch (error) {
      console.error('❌ Error loading festival artists:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load related artists from Supabase
  const loadRelatedArtists = async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('related_artists')
        .select('*')
        .order('spotify_id')
      
      if (error) {
        console.error('❌ Error loading related artists:', error)
        return
      }
      
      setRelatedArtists(data || [])
    } catch (error) {
      console.error('❌ Error loading related artists:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load timetable entries from Supabase for specific edition
  const loadTimetableEntries = async () => {
    setLoading(true)
    
    const editionId = 'a2a26ced-06df-47e2-9745-2b708f2d6a0a'
    
    try {
      const { data, error } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          artist:artists(name, spotify_id, genres)
        `)
        .eq('edition_id', editionId)
        .order('start_time')
      
      if (error) {
        console.error('❌ Error loading timetable entries:', error)
        return
      }
      
      setTimetableEntries(data || [])
    } catch (error) {
      console.error('❌ Error loading timetable entries:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create personal timetable based on user preferences
  const createPersonalTimetable = async () => {
    if (!userSpotifyArtists.length || !timetableEntries.length) {
      return
    }

    setLoading(true)
    
    const userSpotifyIds = new Set(userSpotifyArtists.map(a => a.spotify_id))
    const personalTimetable = []
    
    // Step 1: Direct matches (user artists match timetable acts)
    timetableEntries.forEach(entry => {
      if (entry.artist && entry.artist.spotify_id && userSpotifyIds.has(entry.artist.spotify_id)) {
        const userArtist = userSpotifyArtists.find(u => u.spotify_id === entry.artist.spotify_id)
        personalTimetable.push({
          type: 'direct',
          strength: 'high',
          userArtist: userArtist,
          timetableEntry: entry,
          score: 100,
          reason: `You listen to ${userArtist?.name} - they're performing!`,
          priority: 1
        })
      }
    })
    
    // Step 2: Related artist matches (timetable acts' related artists match user artists)
    timetableEntries.forEach(entry => {
      if (entry.artist && entry.artist.spotify_id) {
        const artistRelated = relatedArtists.filter(ra => ra.spotify_id === entry.artist.spotify_id)
        
        artistRelated.forEach(related => {
          if (userSpotifyIds.has(related.related_spotify_id)) {
            const userArtist = userSpotifyArtists.find(u => u.spotify_id === related.related_spotify_id)
            personalTimetable.push({
              type: 'related',
              strength: 'medium',
              userArtist: userArtist,
              timetableEntry: entry,
              score: 80,
              reason: `You listen to ${userArtist?.name} - ${entry.artist?.name} is similar!`,
              priority: 2
            })
          }
        })
      }
    })
    
    // Step 3: Genre matches (simplified - just check if genres overlap)
    timetableEntries.forEach(entry => {
      if (entry.artist && entry.artist.genres) {
        const entryGenres = entry.artist.genres.toLowerCase().split(',').map(g => g.trim())
        
        userSpotifyArtists.forEach(userArtist => {
          // For now, just add a basic genre match if we haven't already matched this artist
          const alreadyMatched = personalTimetable.some(pt => 
            pt.timetableEntry.artist.spotify_id === entry.artist.spotify_id
          )
          
          if (!alreadyMatched) {
            personalTimetable.push({
              type: 'genre',
              strength: 'low',
              userArtist: userArtist,
              timetableEntry: entry,
              score: 60,
              reason: `You might like ${entry.artist?.name} based on your music taste`,
              priority: 3
            })
          }
        })
      }
    })
    
    // Remove duplicates and sort by priority/score
    const uniqueTimetable = []
    const seenEntries = new Set()
    
    personalTimetable
      .sort((a, b) => a.priority - b.priority || b.score - a.score)
      .forEach(item => {
        const key = `${item.timetableEntry.id}-${item.userArtist.spotify_id}`
        if (!seenEntries.has(key)) {
          seenEntries.add(key)
          uniqueTimetable.push(item)
        }
      })
    
    setMatches(uniqueTimetable)
    setLoading(false)
  }

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Get strength color
  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'high': return '#22c55e'
      case 'medium': return '#f59e0b'
      case 'low': return '#ef4444'
      default: return '#6b7280'
    }
  }

  // Get strength emoji
  const getStrengthEmoji = (strength) => {
    switch (strength) {
      case 'high': return '🔥'
      case 'medium': return '⚡'
      case 'low': return '💡'
      default: return '❓'
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#1f2937' }}>
        🎵 Recommendation System Test
      </h1>

      {/* Always Visible Action Buttons */}
      <div style={{ 
        position: 'sticky', 
        top: '0', 
        backgroundColor: 'white', 
        padding: '20px 0', 
        borderBottom: '2px solid #e5e7eb',
        zIndex: 10,
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {isAuthenticated ? (
            <>
              <button 
                onClick={loadUserArtists}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading ? '#d1d5db' : '#1DB954',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '🔄 Loading...' : '👤 Load User Artists'}
              </button>
              
              <button 
                onClick={loadFestivalArtists}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading ? '#d1d5db' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '🔄 Loading...' : '🎪 Load Festival Artists'}
              </button>
              
              <button 
                onClick={loadRelatedArtists}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading ? '#d1d5db' : '#06b6d4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '🔄 Loading...' : '🔗 Load Related Artists'}
              </button>
              
                             <button 
                 onClick={loadTimetableEntries}
                 disabled={loading}
                 style={{
                   padding: '12px 24px',
                   backgroundColor: loading ? '#d1d5db' : '#10b981',
                   color: 'white',
                   border: 'none',
                   borderRadius: '8px',
                   cursor: loading ? 'not-allowed' : 'pointer',
                   fontSize: '14px',
                   fontWeight: 'bold'
                 }}
               >
                 {loading ? '🔄 Loading...' : '📅 Load Festival Timetable'}
               </button>
              
              <button 
                onClick={createPersonalTimetable}
                disabled={loading || !userSpotifyArtists.length || !timetableEntries.length}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading || !userSpotifyArtists.length || !timetableEntries.length ? '#d1d5db' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !userSpotifyArtists.length || !timetableEntries.length ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '🔄 Creating...' : '🎵 Create Personal Timetable'}
              </button>
            </>
          ) : (
            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
              <p style={{ margin: 0, color: '#92400e' }}>🔐 Please connect to Spotify first</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '12px', 
          border: '2px solid #0ea5e9',
          cursor: 'pointer'
        }} onClick={() => toggleSection('userArtists')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>👤 Your Spotify Artists</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>
                {userSpotifyArtists.length}
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                {expandedSections.userArtists ? 'Click to collapse' : 'Click to expand'}
              </p>
            </div>
            <div style={{ fontSize: '24px' }}>{expandedSections.userArtists ? '📂' : '📁'}</div>
          </div>
        </div>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fdf4ff', 
          borderRadius: '12px', 
          border: '2px solid #a855f7',
          cursor: 'pointer'
        }} onClick={() => toggleSection('festivalArtists')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#581c87' }}>🎪 Festival Artists</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#a855f7' }}>
                {festivalArtists.length}
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                {expandedSections.festivalArtists ? 'Click to collapse' : 'Click to expand'}
              </p>
            </div>
            <div style={{ fontSize: '24px' }}>{expandedSections.festivalArtists ? '📂' : '📁'}</div>
          </div>
        </div>

                 <div style={{ 
           padding: '20px', 
           backgroundColor: '#f0fdf4', 
           borderRadius: '12px', 
           border: '2px solid #10b981',
           cursor: 'pointer'
         }} onClick={() => toggleSection('relatedArtists')}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3 style={{ margin: '0 0 10px 0', color: '#064e3b' }}>🔗 Related Artists</h3>
               <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                 {relatedArtists.length}
               </p>
               <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                 {expandedSections.relatedArtists ? 'Click to collapse' : 'Click to expand'}
               </p>
             </div>
             <div style={{ fontSize: '24px' }}>{expandedSections.relatedArtists ? '📂' : '📁'}</div>
           </div>
         </div>

         <div style={{ 
           padding: '20px', 
           backgroundColor: '#fef7ed', 
           borderRadius: '12px', 
           border: '2px solid #f97316',
           cursor: 'pointer'
         }} onClick={() => toggleSection('timetableEntries')}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3 style={{ margin: '0 0 10px 0', color: '#7c2d12' }}>📅 Festival Timetable</h3>
               <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>
                 {timetableEntries.length}
               </p>
               <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                 {expandedSections.timetableEntries ? 'Click to collapse' : 'Click to expand'}
               </p>
             </div>
             <div style={{ fontSize: '24px' }}>{expandedSections.timetableEntries ? '📂' : '📁'}</div>
           </div>
         </div>

                 <div style={{ 
           padding: '20px', 
           backgroundColor: '#fef2f2', 
           borderRadius: '12px', 
           border: '2px solid #ef4444',
           cursor: 'pointer'
         }} onClick={() => toggleSection('matches')}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3 style={{ margin: '0 0 10px 0', color: '#7f1d1d' }}>🎵 Personal Timetable</h3>
               <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                 {matches.length}
               </p>
               <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                 {expandedSections.matches ? 'Click to collapse' : 'Click to expand'}
               </p>
             </div>
             <div style={{ fontSize: '24px' }}>{expandedSections.matches ? '📂' : '📁'}</div>
           </div>
         </div>
      </div>

      {/* Expandable Sections */}
      
      {/* User Artists Section */}
      {expandedSections.userArtists && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#0c4a6e', borderBottom: '2px solid #0ea5e9', paddingBottom: '10px' }}>
            👤 Your Spotify Artists ({userSpotifyArtists.length})
          </h2>
          {userSpotifyArtists.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {userSpotifyArtists.map(artist => (
                <div key={artist.id} style={{ 
                  padding: '15px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>{artist.name}</h3>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '4px 8px', 
                      borderRadius: '12px',
                      backgroundColor: artist.source === 'top_artists' ? '#dbeafe' : '#fef3c7',
                      color: artist.source === 'top_artists' ? '#1e40af' : '#92400e'
                    }}>
                      {artist.source === 'top_artists' ? '🎵 Top Artist' : '🎧 Track Artist'} #{artist.rank}
                    </span>
                  </div>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#6b7280' }}>ID: {artist.spotify_id}</p>
                  {artist.genres && artist.genres.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {artist.genres.slice(0, 3).map((genre, index) => (
                          <span key={index} style={{ 
                            backgroundColor: '#e8f5e8', 
                            padding: '2px 6px', 
                            borderRadius: '8px', 
                            fontSize: '10px',
                            border: '1px solid #4caf50'
                          }}>
                            {genre}
                          </span>
                        ))}
                        {artist.genres.length > 3 && (
                          <span style={{ fontSize: '10px', color: '#6b7280' }}>
                            +{artist.genres.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
              <p style={{ margin: 0, color: '#92400e' }}>No user artists loaded yet. Click "Load User Artists" above.</p>
            </div>
          )}
        </div>
      )}

      {/* Festival Artists Section */}
      {expandedSections.festivalArtists && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#581c87', borderBottom: '2px solid #a855f7', paddingBottom: '10px' }}>
            🎪 Festival Artists ({festivalArtists.length})
          </h2>
          {festivalArtists.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {festivalArtists.map(artist => (
                <div key={artist.id} style={{ 
                  padding: '15px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#1f2937' }}>{artist.name}</h3>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#6b7280' }}>
                    {artist.spotify_id ? `Spotify ID: ${artist.spotify_id}` : 'No Spotify ID'}
                  </p>
                  {artist.genres && artist.genres.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {artist.genres.slice(0, 3).map((genre, index) => (
                          <span key={index} style={{ 
                            backgroundColor: '#f3e8ff', 
                            padding: '2px 6px', 
                            borderRadius: '8px', 
                            fontSize: '10px',
                            border: '1px solid #a855f7'
                          }}>
                            {genre}
                          </span>
                        ))}
                        {artist.genres.length > 3 && (
                          <span style={{ fontSize: '10px', color: '#6b7280' }}>
                            +{artist.genres.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', backgroundColor: '#f3e8ff', borderRadius: '8px', border: '1px solid #c084fc' }}>
              <p style={{ margin: 0, color: '#581c87' }}>No festival artists loaded yet. Click "Load Festival Artists" above.</p>
            </div>
          )}
        </div>
      )}

             {/* Related Artists Section */}
       {expandedSections.relatedArtists && (
         <div style={{ marginBottom: '30px' }}>
           <h2 style={{ color: '#064e3b', borderBottom: '2px solid #10b981', paddingBottom: '10px' }}>
             🔗 Related Artists ({relatedArtists.length})
           </h2>
           {relatedArtists.length > 0 ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
               {relatedArtists.map(related => (
                 <div key={`${related.artist_id}-${related.spotify_id}`} style={{ 
                   padding: '12px', 
                   border: '1px solid #e5e7eb', 
                   borderRadius: '8px',
                   backgroundColor: 'white'
                 }}>
                   <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                     {related.spotify_id}
                   </p>
                   <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                     Related to: {festivalArtists.find(a => a.id === related.artist_id)?.name || 'Unknown'}
                   </p>
                 </div>
               ))}
             </div>
           ) : (
             <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
               <p style={{ margin: 0, color: '#064e3b' }}>No related artists loaded yet. Click "Load Related Artists" above.</p>
             </div>
           )}
         </div>
       )}

               {/* Timetable Entries Section */}
        {expandedSections.timetableEntries && (
                   <div style={{ marginBottom: '30px' }}>
           <h2 style={{ color: '#7c2d12', borderBottom: '2px solid #f97316', paddingBottom: '10px' }}>
             📅 Festival Timetable ({timetableEntries.length} acts)
           </h2>
            {timetableEntries.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
                {timetableEntries.map(entry => {
                  // Find related artists for this timetable entry
                  const entryRelatedArtists = relatedArtists.filter(ra => ra.artist_id === entry.artist_id)
                  const userRelatedMatches = entryRelatedArtists.filter(ra => 
                    userSpotifyArtists.some(ua => ua.spotify_id === ra.spotify_id)
                  )
                  
                  return (
                    <div key={entry.id} style={{ 
                      padding: '15px', 
                      border: userRelatedMatches.length > 0 ? '2px solid #f59e0b' : '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      backgroundColor: userRelatedMatches.length > 0 ? '#fef7ed' : 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
                          {entry.artist?.name || 'Unknown Artist'}
                        </h3>
                        <span style={{ 
                          fontSize: '12px', 
                          padding: '4px 8px', 
                          borderRadius: '12px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e'
                        }}>
                          {entry.start_time} - {entry.end_time}
                        </span>
                      </div>
                      
                      <div style={{ 
                        padding: '6px 10px', 
                        backgroundColor: '#f0fdf4', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#064e3b',
                        marginBottom: '8px'
                      }}>
                        📅 {entry.day} | 🎪 {entry.stage}
                      </div>
                      
                      {entry.artist?.spotify_id && (
                        <p style={{ margin: '5px 0', fontSize: '12px', color: '#6b7280' }}>
                          Spotify ID: {entry.artist.spotify_id}
                        </p>
                      )}
                      
                      {/* Show related artists that match user's Spotify artists */}
                      {userRelatedMatches.length > 0 && (
                        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#92400e' }}>
                            🔗 Related to your artists ({userRelatedMatches.length}):
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {userRelatedMatches.map((related, index) => {
                              const userArtist = userSpotifyArtists.find(ua => ua.spotify_id === related.spotify_id)
                              return (
                                <span key={index} style={{ 
                                  backgroundColor: '#fef3c7', 
                                  padding: '4px 8px', 
                                  borderRadius: '8px', 
                                  fontSize: '11px',
                                  border: '1px solid #f59e0b',
                                  fontWeight: 'bold'
                                }}>
                                  {userArtist?.name || related.spotify_id}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Show all related artists */}
                      {entryRelatedArtists.length > 0 && (
                        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>
                            🔗 All related artists ({entryRelatedArtists.length}):
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {entryRelatedArtists.slice(0, 5).map((related, index) => (
                              <span key={index} style={{ 
                                backgroundColor: '#f3f4f6', 
                                padding: '2px 6px', 
                                borderRadius: '6px', 
                                fontSize: '10px',
                                border: '1px solid #d1d5db'
                              }}>
                                {related.spotify_id}
                              </span>
                            ))}
                            {entryRelatedArtists.length > 5 && (
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                +{entryRelatedArtists.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {entry.artist?.genres && entry.artist.genres.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>
                            🎵 Genres:
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {entry.artist.genres.slice(0, 5).map((genre, index) => (
                              <span key={index} style={{ 
                                backgroundColor: '#fef7ed', 
                                padding: '2px 6px', 
                                borderRadius: '8px', 
                                fontSize: '10px',
                                border: '1px solid #f97316'
                              }}>
                                {genre}
                              </span>
                            ))}
                            {entry.artist.genres.length > 5 && (
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                +{entry.artist.genres.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '20px', backgroundColor: '#fef7ed', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                <p style={{ margin: 0, color: '#7c2d12' }}>No timetable entries loaded yet. Click "Load Timetable" above.</p>
              </div>
            )}
          </div>
        )}

             {/* Personal Timetable Section */}
       {expandedSections.matches && (
         <div style={{ marginBottom: '30px' }}>
           <h2 style={{ color: '#7f1d1d', borderBottom: '2px solid #ef4444', paddingBottom: '10px' }}>
             🎵 Your Personal Timetable ({matches.length} acts)
           </h2>
           {matches.length > 0 ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
               {matches.map((match, index) => (
                 <div key={index} style={{ 
                   padding: '15px', 
                   border: '2px solid',
                   borderColor: getStrengthColor(match.strength),
                   borderRadius: '8px',
                   backgroundColor: 'white',
                   position: 'relative'
                 }}>
                   <div style={{ 
                     position: 'absolute', 
                     top: '-10px', 
                     left: '15px', 
                     backgroundColor: 'white',
                     padding: '0 8px',
                     fontSize: '12px',
                     fontWeight: 'bold',
                     color: getStrengthColor(match.strength)
                   }}>
                     {getStrengthEmoji(match.strength)} {match.strength.toUpperCase()} ({match.score}pts)
                   </div>
                   
                   <div style={{ marginTop: '10px' }}>
                     <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1f2937' }}>
                       {match.timetableEntry?.artist?.name || 'Unknown Artist'}
                     </h3>
                     
                     <div style={{ 
                       padding: '8px 12px', 
                       backgroundColor: '#f0fdf4', 
                       borderRadius: '6px',
                       fontSize: '14px',
                       color: '#064e3b',
                       marginBottom: '10px',
                       fontWeight: 'bold'
                     }}>
                       📅 {match.timetableEntry?.day} at {match.timetableEntry?.start_time} | 🎪 {match.timetableEntry?.stage}
                     </div>
                     
                     <p style={{ margin: '8px 0', fontSize: '14px', color: '#374151', fontStyle: 'italic' }}>
                       {match.reason}
                     </p>
                     
                     {match.type === 'genre' && match.sharedGenres && (
                       <div style={{ marginTop: '10px' }}>
                         <p style={{ margin: '5px 0', fontSize: '12px', color: '#6b7280' }}>Shared genres:</p>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                           {match.sharedGenres.map((genre, idx) => (
                             <span key={idx} style={{ 
                               backgroundColor: '#fef3c7', 
                               padding: '2px 6px', 
                               borderRadius: '6px', 
                               fontSize: '10px',
                               border: '1px solid #f59e0b'
                             }}>
                               {genre}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
               <p style={{ margin: 0, color: '#7f1d1d' }}>No personal timetable created yet. Load data and click "Create Personal Timetable" above.</p>
             </div>
           )}
         </div>
       )}
    </div>
  )
}

export { TestRecommendations } 