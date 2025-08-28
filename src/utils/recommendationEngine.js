import { supabase } from '../lib/supabase'

export class RecommendationEngine {
  constructor() {
    this.directMatchScore = 1.0
  }

  // Generate recommendations for a user at a specific festival
  async generateRecommendations(spotifyProfileId, festivalId) {
    try {
      // Get user data
      const userData = await this.getUserData(spotifyProfileId)
      if (!userData) {
        return []
      }

      // Get festival artists
      const festivalArtists = await this.getFestivalArtists(festivalId)
      if (!festivalArtists || festivalArtists.length === 0) {
        return []
      }

      // Get timetable entries
      const timetableEntries = await this.getTimetableEntries(festivalId)
      if (!timetableEntries || timetableEntries.length === 0) {
        return []
      }

      // Match user data with festival artists and generate recommendations
      const recommendations = await this.matchUserWithFestival(userData, festivalArtists, timetableEntries)

      // Save recommendations to database
      await this.saveRecommendations(spotifyProfileId, festivalId, recommendations)

      return recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw error
    }
  }

  // Get user data from Spotify profiles
  async getUserData(spotifyProfileId) {
    try {
      const { data: profile, error } = await supabase
        .from('spotify_profiles')
        .select('*')
        .eq('id', spotifyProfileId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      if (!profile) {
        return null
      }

      // Get top artists and tracks
      const { data: topArtists, error: artistsError } = await supabase
        .from('spotify_top_artists')
        .select('*')
        .eq('spotify_profile_id', spotifyProfileId)
        .order('rank')

      const { data: topTracks, error: tracksError } = await supabase
        .from('spotify_top_tracks')
        .select('*')
        .eq('spotify_profile_id', spotifyProfileId)
        .order('rank')

      if (artistsError || tracksError) {
        console.error('Error fetching user data:', artistsError || tracksError)
        return null
      }

      return {
        profile,
        topArtists: topArtists || [],
        topTracks: topTracks || []
      }
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  }

  // Get festival artists
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
      
      return entries || []
    } catch (error) {
      console.error('Error getting timetable entries:', error)
      throw error
    }
  }

  // Match user data with festival artists and generate recommendations
  async matchUserWithFestival(userData, festivalArtists, timetableEntries) {
    const recommendations = []
    const userTopArtists = userData.topArtists || []
    const userTopTracks = userData.topTracks || []

    // Create a map of user's favorite artists by Spotify ID for quick lookup
    const userArtistMap = new Map()
    userTopArtists.forEach(artist => {
      if (artist.spotify_id) {
        userArtistMap.set(artist.spotify_id, artist)
      }
    })

    // Create a map of user's favorite track artists by Spotify ID
    const userTrackArtistMap = new Map()
    userTopTracks.forEach(track => {
      if (track.artist_spotify_id) {
        userTrackArtistMap.set(track.artist_spotify_id, track)
      }
    })

    // Process each festival artist
    for (const festivalArtist of festivalArtists) {
      if (!festivalArtist.spotify_id) {
        continue
      }

      let bestScore = 0
      let bestMatch = null
      let matchType = null

      // Check for direct matches with user's top artists
      const userArtist = userArtistMap.get(festivalArtist.spotify_id)
      if (userArtist) {
        const score = this.directMatchScore * (1 - (userArtist.rank - 1) * 0.1) // Higher rank = higher score
        if (score > bestScore) {
          bestScore = score
          bestMatch = userArtist
          matchType = 'direct_artist'
        }
      }

      // Check for direct matches with user's top track artists
      const userTrackArtist = userTrackArtistMap.get(festivalArtist.spotify_id)
      if (userTrackArtist) {
        const score = this.directMatchScore * 0.9 * (1 - (userTrackArtist.rank - 1) * 0.1) // Slightly lower than direct artist match
        if (score > bestScore) {
          bestScore = score
          bestMatch = userTrackArtist
          matchType = 'direct_track'
        }
      }

      // Find timetable entry for this artist
      const timetableEntry = timetableEntries.find(entry => 
        entry.artist_id === festivalArtist.id
      )

      if (bestScore > 0 && timetableEntry) {
        recommendations.push({
          spotify_profile_id: userData.profile.id,
          festival_id: festivalArtist.festival_id,
          artist_id: festivalArtist.id,
          timetable_entry_id: timetableEntry.id,
          match_type: matchType,
          score: bestScore,
          reason: `You listen to ${bestMatch.artist_name || bestMatch.track_name} - they're performing!`,
          created_at: new Date().toISOString()
        })
      }
    }

    // Check for related artist matches
    const relatedMatches = await this.findRelatedArtistMatches(userData, festivalArtists, timetableEntries)
    recommendations.push(...relatedMatches)

    // Sort by score (highest first) and limit to top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 50) // Limit to top 50 recommendations
  }

  // Find related artist matches
  async findRelatedArtistMatches(userData, festivalArtists, timetableEntries) {
    const relatedMatches = []
    const userArtistIds = userData.topArtists?.map(a => a.spotify_id).filter(Boolean) || []

    if (userArtistIds.length === 0) {
      return relatedMatches
    }

    try {
      // Get related artists for user's top artists
      const { data: relatedArtists, error } = await supabase
        .from('related_artists')
        .select('*')
        .in('spotify_id', userArtistIds)

      if (error) {
        console.error('Error fetching related artists:', error)
        return relatedMatches
      }

      // Create a map of related artist IDs
      const relatedArtistIds = new Set(relatedArtists?.map(ra => ra.related_spotify_id) || [])

      // Find festival artists that are related to user's favorites
      for (const festivalArtist of festivalArtists) {
        if (relatedArtistIds.has(festivalArtist.spotify_id)) {
          const relatedArtist = relatedArtists.find(ra => ra.related_spotify_id === festivalArtist.spotify_id)
          const userArtist = userData.topArtists.find(ua => ua.spotify_id === relatedArtist.spotify_id)
          
          if (relatedArtist && userArtist) {
            const timetableEntry = timetableEntries.find(entry => entry.artist_id === festivalArtist.id)
            
            if (timetableEntry) {
              relatedMatches.push({
                spotify_profile_id: userData.profile.id,
                festival_id: festivalArtist.festival_id,
                artist_id: festivalArtist.id,
                timetable_entry_id: timetableEntry.id,
                match_type: 'related_artist',
                score: 0.7 * (1 - (userArtist.rank - 1) * 0.1), // Lower score than direct matches
                reason: `You listen to ${userArtist.artist_name} - ${festivalArtist.name} is similar!`,
                created_at: new Date().toISOString()
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error finding related artist matches:', error)
    }

    return relatedMatches
  }

  // Save recommendations to database
  async saveRecommendations(spotifyProfileId, festivalId, recommendations) {
    try {
      // Delete existing recommendations for this user and festival
      const { error: deleteError } = await supabase
        .from('artist_recommendations')
        .delete()
        .eq('spotify_profile_id', spotifyProfileId)
        .eq('festival_id', festivalId)

      if (deleteError) {
        console.error('Error deleting existing recommendations:', deleteError)
      }

      // Insert new recommendations
      if (recommendations.length > 0) {
        const { error: insertError } = await supabase
          .from('artist_recommendations')
          .insert(recommendations)

        if (insertError) {
          console.error('Error inserting recommendations:', insertError)
        }
      }
    } catch (error) {
      console.error('Error saving recommendations:', error)
    }
  }

  // Get existing recommendations
  async getRecommendations(spotifyProfileId, festivalId) {
    try {
      const { data, error } = await supabase
        .from('artist_recommendations')
        .select(`
          *,
          artist:artists(*),
          timetable_entry:timetable_entries(*)
        `)
        .eq('spotify_profile_id', spotifyProfileId)
        .eq('festival_id', festivalId)
        .order('score', { ascending: false })

      if (error) {
        console.error('Error fetching recommendations:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return []
    }
  }
}
