import { supabase } from '../lib/supabase'

export class RecommendationEngine {
  constructor() {
    this.directMatchScore = 1.0
    this.relatedArtistScore = 0.8
    this.topArtistBonus = 0.2
    this.topTrackBonus = 0.1
  }

  // Generate recommendations for a user based on their Spotify data
  async generateRecommendations(spotifyProfileId, festivalId) {
    try {
      console.log(`🎯 Generating recommendations for user ${spotifyProfileId} at festival ${festivalId}`)
      
      // Get user's top artists and tracks
      const userData = await this.getUserSpotifyData(spotifyProfileId)
      if (!userData.topArtists.length && !userData.topTracks.length) {
        console.log('No user data available for recommendations')
        return []
      }

      // Get all festival artists
      const festivalArtists = await this.getFestivalArtists(festivalId)
      if (!festivalArtists.length) {
        console.log('No festival artists found')
        return []
      }

      // Get timetable entries for this festival
      const timetableEntries = await this.getTimetableEntries(festivalId)
      if (!timetableEntries.length) {
        console.log('No timetable entries found')
        return []
      }

      // Generate recommendations
      const recommendations = await this.matchUserWithFestival(
        userData, 
        festivalArtists, 
        timetableEntries
      )

      // Save recommendations to database
      await this.saveRecommendations(spotifyProfileId, recommendations)

      console.log(`✅ Generated ${recommendations.length} recommendations`)
      return recommendations

    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw error
    }
  }

  // Get user's top artists and tracks from Spotify data
  async getUserSpotifyData(spotifyProfileId) {
    try {
      // Get top artists
      const { data: topArtists, error: artistsError } = await supabase
        .from('user_top_artists')
        .select('*')
        .eq('spotify_profile_id', spotifyProfileId)
        .order('rank_position', { ascending: true })

      if (artistsError) {
        console.error('Error fetching top artists:', artistsError)
        throw artistsError
      }

      // Get top tracks
      const { data: topTracks, error: tracksError } = await supabase
        .from('user_top_tracks')
        .select('*')
        .eq('spotify_profile_id', spotifyProfileId)
        .order('rank_position', { ascending: true })

      if (tracksError) {
        console.error('Error fetching top tracks:', tracksError)
        throw tracksError
      }

      console.log(`📊 User data: ${topArtists.length} top artists, ${topTracks.length} top tracks`)
      
      return {
        topArtists: topArtists || [],
        topTracks: topTracks || []
      }
    } catch (error) {
      console.error('Error getting user Spotify data:', error)
      throw error
    }
  }

  // Get all artists for a festival
  async getFestivalArtists(festivalId) {
    try {
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .eq('festival_id', festivalId)

      if (error) {
        console.error('Error fetching festival artists:', error)
        throw error
      }

      console.log(`🎭 Found ${artists.length} festival artists`)
      return artists || []
    } catch (error) {
      console.error('Error getting festival artists:', error)
      throw error
    }
  }

  // Get timetable entries for a festival
  async getTimetableEntries(festivalId) {
    try {
      const { data: entries, error } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          artists (*),
          acts (*),
          stages (*),
          festival_days (*)
        `)
        .eq('festival_id', festivalId)

      if (error) {
        console.error('Error fetching timetable entries:', error)
        throw error
      }

      console.log(`📅 Found ${entries.length} timetable entries`)
      
      // Debug: Check if artists data is properly joined
      if (entries && entries.length > 0) {
        const sampleEntry = entries[0]
        console.log('Sample timetable entry:', {
          id: sampleEntry.id,
          artist_id: sampleEntry.artist_id,
          artist_name: sampleEntry.artists?.name,
          artist_spotify_id: sampleEntry.artists?.spotify_id,
          start_time: sampleEntry.start_time,
          end_time: sampleEntry.end_time
        })
      }
      
      return entries || []
    } catch (error) {
      console.error('Error getting timetable entries:', error)
      throw error
    }
  }

  // Match user data with festival artists and generate recommendations
  async matchUserWithFestival(userData, festivalArtists, timetableEntries) {
    const recommendations = []
    const processedArtists = new Set()

    // Create maps for quick lookup
    const userArtistMap = new Map()
    const userTrackArtistMap = new Map()

    // Build user artist maps
    userData.topArtists.forEach((artist, index) => {
      userArtistMap.set(artist.spotify_artist_id, {
        ...artist,
        rank: index + 1,
        isTopArtist: true
      })
    })

    userData.topTracks.forEach((track, index) => {
      if (!userTrackArtistMap.has(track.artist_spotify_id)) {
        userTrackArtistMap.set(track.artist_spotify_id, {
          spotify_artist_id: track.artist_spotify_id,
          artist_name: track.artist_name,
          rank: index + 1,
          isTopTrackArtist: true
        })
      }
    })

    // Check for direct matches
    for (const festivalArtist of festivalArtists) {
      if (!festivalArtist.spotify_id) {
        console.log(`⚠️ Festival artist ${festivalArtist.name} has no spotify_id`)
        continue
      }

      console.log(`🔍 Checking festival artist: ${festivalArtist.name} (spotify_id: ${festivalArtist.spotify_id})`)

      let score = 0
      let reason = ''
      let recommendationType = ''

      // Check if user has this artist in top artists
      const userArtist = userArtistMap.get(festivalArtist.spotify_id)
      if (userArtist) {
        score = this.directMatchScore + this.topArtistBonus
        reason = `Direct match with your #${userArtist.rank} top artist: ${userArtist.artist_name}`
        recommendationType = 'direct_match'
        console.log(`🎯 Direct match found: ${festivalArtist.name} (${userArtist.artist_name}) - Score: ${score}`)
      }
      // Check if user has this artist in top tracks
      else {
        const userTrackArtist = userTrackArtistMap.get(festivalArtist.spotify_id)
        if (userTrackArtist) {
          score = this.directMatchScore + this.topTrackBonus
          reason = `Direct match with artist from your #${userTrackArtist.rank} top track: ${userTrackArtist.artist_name}`
          recommendationType = 'direct_match'
          console.log(`🎯 Direct match found: ${festivalArtist.name} (${userTrackArtist.artist_name}) - Score: ${score}`)
        }
      }

      // If we found a direct match, add recommendation
      if (score > 0) {
        const timetableEntry = timetableEntries.find(entry => entry.artist_id === festivalArtist.id)
        if (timetableEntry) {
          console.log(`✅ Found timetable entry for ${festivalArtist.name}: ${timetableEntry.start_time} - ${timetableEntry.end_time}`)
          recommendations.push({
            artist_id: festivalArtist.id,
            artist_name: festivalArtist.name,
            recommendation_type: recommendationType,
            score: Math.min(score, 1.0), // Cap at 1.0
            reason,
            timetable_entry: timetableEntry
          })
          processedArtists.add(festivalArtist.id)
        } else {
          console.log(`❌ No timetable entry found for ${festivalArtist.name}`)
        }
      } else {
        console.log(`❌ No match found for ${festivalArtist.name}`)
      }
    }

    // Check for related artists
    await this.findRelatedArtistMatches(
      userData, 
      festivalArtists, 
      timetableEntries, 
      recommendations, 
      processedArtists
    )

    // Sort by score (highest first)
    recommendations.sort((a, b) => b.score - a.score)

    return recommendations
  }

  // Find matches through related artists (festival artist's related artists matching user's artists)
  async findRelatedArtistMatches(userData, festivalArtists, timetableEntries, recommendations, processedArtists) {
    try {
      // Get all user's artist IDs (from both top artists and top tracks)
      const userArtistIds = new Set()
      userData.topArtists.forEach(artist => userArtistIds.add(artist.spotify_artist_id))
      userData.topTracks.forEach(track => userArtistIds.add(track.artist_spotify_id))

      // For each festival artist, check if they're related to any of user's artists
      for (const festivalArtist of festivalArtists) {
        if (processedArtists.has(festivalArtist.id) || !festivalArtist.spotify_id) continue

        // Check if this festival artist is related to any of user's artists
        const { data: relatedArtists, error } = await supabase
          .from('related_artists')
          .select('*')
          .eq('artist_id', festivalArtist.id)

        if (error) {
          console.error('Error fetching related artists:', error)
          continue
        }

        // Check if any of the related artists match user's artists
        for (const relatedArtist of relatedArtists || []) {
          if (userArtistIds.has(relatedArtist.related_spotify_id)) {
            const score = this.relatedArtistScore
            const reason = `Related to ${relatedArtist.related_artist_name} (similar to your top artists)`
            
            const timetableEntry = timetableEntries.find(entry => entry.artist_id === festivalArtist.id)
            if (timetableEntry) {
              recommendations.push({
                artist_id: festivalArtist.id,
                artist_name: festivalArtist.name,
                recommendation_type: 'related_artist',
                score: Math.min(score, 1.0),
                reason,
                timetable_entry: timetableEntry
              })
              processedArtists.add(festivalArtist.id)
              console.log(`🔗 Related artist match: ${festivalArtist.name} related to ${relatedArtist.related_artist_name}`)
              break // Only add once per artist
            }
          }
        }
      }
    } catch (error) {
      console.error('Error finding related artist matches:', error)
    }
  }

  // Save recommendations to database
  async saveRecommendations(spotifyProfileId, recommendations) {
    try {
      // Delete existing recommendations for this user
      const { error: deleteError } = await supabase
        .from('user_recommendations')
        .delete()
        .eq('spotify_profile_id', spotifyProfileId)

      if (deleteError) {
        console.error('Error deleting existing recommendations:', deleteError)
        throw deleteError
      }

      // Insert new recommendations
      const recommendationData = recommendations.map(rec => ({
        spotify_profile_id: spotifyProfileId,
        artist_id: rec.artist_id,
        recommendation_type: rec.recommendation_type,
        score: rec.score,
        reason: rec.reason
      }))

      if (recommendationData.length > 0) {
        const { error: insertError } = await supabase
          .from('user_recommendations')
          .insert(recommendationData)

        if (insertError) {
          console.error('Error inserting recommendations:', insertError)
          throw insertError
        }
      }

      console.log(`💾 Saved ${recommendationData.length} recommendations to database`)
    } catch (error) {
      console.error('Error saving recommendations:', error)
      throw error
    }
  }

  // Get recommendations for a user
  async getRecommendations(spotifyProfileId, festivalId) {
    try {
      const { data: recommendations, error } = await supabase
        .from('user_recommendations')
        .select(`
          *,
          artists (*),
          timetable_entries (
            *,
            acts (*),
            stages (*),
            festival_days (*)
          )
        `)
        .eq('spotify_profile_id', spotifyProfileId)
        .order('score', { ascending: false })

      if (error) {
        console.error('Error fetching recommendations:', error)
        throw error
      }

      return recommendations || []
    } catch (error) {
      console.error('Error getting recommendations:', error)
      throw error
    }
  }
}
