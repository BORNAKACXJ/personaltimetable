import { supabase } from '../lib/supabase'

export class UserDataManager {
  // Save or update Spotify user profile
  static async saveSpotifyProfile(spotifyUser) {
    try {
      console.log('Saving Spotify profile for user:', spotifyUser.id)
      console.log('Profile data:', {
        id: spotifyUser.id,
        display_name: spotifyUser.display_name,
        email: spotifyUser.email,
        followers: spotifyUser.followers
      })

      const { data: existingProfile, error: fetchError } = await supabase
        .from('spotify_profiles')
        .select('*')
        .eq('spotify_id', spotifyUser.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing profile:', fetchError)
        throw fetchError
      }

      const profileData = {
        spotify_id: spotifyUser.id,
        display_name: spotifyUser.display_name,
        email: spotifyUser.email,
        image_url: spotifyUser.images?.[0]?.url,
        country: spotifyUser.country,
        product: spotifyUser.product,
        followers: typeof spotifyUser.followers === 'object' ? spotifyUser.followers?.total || 0 : spotifyUser.followers || 0,
        updated_at: new Date().toISOString()
      }

      console.log('Processed profile data:', profileData)

      let result
      if (existingProfile) {
        console.log('Updating existing profile')
        // Update existing profile
        const { data, error } = await supabase
          .from('spotify_profiles')
          .update(profileData)
          .eq('spotify_id', spotifyUser.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating profile:', error)
          throw error
        }
        result = data
      } else {
        console.log('Inserting new profile')
        // Insert new profile
        const { data, error } = await supabase
          .from('spotify_profiles')
          .insert(profileData)
          .select()
          .single()

        if (error) {
          console.error('Error inserting profile:', error)
          console.error('Profile data that failed:', profileData)
          throw error
        }
        result = data
      }

      console.log('Spotify profile saved to Supabase:', result)
      return result
    } catch (error) {
      console.error('Error saving Spotify profile:', error)
      throw error
    }
  }

  // Save user's top tracks
  static async saveTopTracks(spotifyUserId, tracks, timeRange = 'medium_term') {
    try {
      // First, get the profile ID from spotify_id
      const { data: profile, error: profileError } = await supabase
        .from('spotify_profiles')
        .select('id')
        .eq('spotify_id', spotifyUserId)
        .single()

      if (profileError) {
        console.error('Error getting profile ID:', profileError)
        throw profileError
      }

      const spotifyProfileId = profile.id

      // First, delete existing tracks for this user and time range
      const { error: deleteError } = await supabase
        .from('user_top_tracks')
        .delete()
        .eq('spotify_profile_id', spotifyProfileId)
        .eq('time_range', timeRange)

      if (deleteError) {
        console.error('Error deleting existing tracks:', deleteError)
        throw deleteError
      }

      // Prepare track data
      const tracksData = tracks.map((track, index) => ({
        spotify_profile_id: spotifyProfileId,
        spotify_track_id: track.id,
        track_name: track.name,
        artist_name: track.artists[0].name,
        artist_spotify_id: track.artists[0].id,
        album_name: track.album.name,
        album_image_url: track.album.images?.[0]?.url,
        popularity: track.popularity,
        time_range: timeRange,
        rank_position: index + 1
      }))

      // Insert new tracks
      const { data, error } = await supabase
        .from('user_top_tracks')
        .insert(tracksData)
        .select()

      if (error) {
        console.error('Error saving top tracks:', error)
        throw error
      }

      console.log(`Saved ${data.length} top tracks to Supabase`)
      return data
    } catch (error) {
      console.error('Error saving top tracks:', error)
      throw error
    }
  }

  // Save user's top artists
  static async saveTopArtists(spotifyUserId, artists, timeRange = 'medium_term') {
    try {
      console.log(`Saving ${artists.length} top artists for user ${spotifyUserId} (${timeRange})`)
      
      // First, get the profile ID from spotify_id
      const { data: profile, error: profileError } = await supabase
        .from('spotify_profiles')
        .select('id')
        .eq('spotify_id', spotifyUserId)
        .single()

      if (profileError) {
        console.error('Error getting profile ID:', profileError)
        throw profileError
      }

      const spotifyProfileId = profile.id
      console.log('Found spotify_profile_id:', spotifyProfileId)

      // First, delete existing artists for this user and time range
      const { error: deleteError } = await supabase
        .from('user_top_artists')
        .delete()
        .eq('spotify_profile_id', spotifyProfileId)
        .eq('time_range', timeRange)

      if (deleteError) {
        console.error('Error deleting existing artists:', deleteError)
        throw deleteError
      }

      console.log(`Deleted existing top artists for ${timeRange}`)

      // Prepare artist data
      const artistsData = artists.map((artist, index) => ({
        spotify_profile_id: spotifyProfileId,
        spotify_artist_id: artist.id,
        artist_name: artist.name,
        image_url: artist.images?.[0]?.url,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: typeof artist.followers === 'object' ? artist.followers?.total || 0 : artist.followers || 0,
        time_range: timeRange,
        rank_position: index + 1
      }))

      console.log('Prepared artists data:', artistsData.length, 'artists')
      console.log('Sample artist data:', artistsData[0])

      // Insert new artists - try one by one to identify the issue
      const results = []
      for (let i = 0; i < artistsData.length; i++) {
        const artistData = artistsData[i]
        console.log(`Inserting artist ${i + 1}/${artistsData.length}:`, artistData.artist_name)
        
        const { data, error } = await supabase
          .from('user_top_artists')
          .insert(artistData)
          .select()
          .single()

        if (error) {
          console.error(`Error inserting artist ${artistData.artist_name}:`, error)
          console.error('Artist data that failed:', artistData)
          throw error
        }

        results.push(data)
        console.log(`✅ Successfully inserted artist ${i + 1}:`, data.artist_name)
      }

      console.log(`Successfully saved ${results.length} top artists to Supabase`)
      return results
    } catch (error) {
      console.error('Error saving top artists:', error)
      throw error
    }
  }

  // Create a new personal timetable
  static async createPersonalTimetable(spotifyProfileId, festivalId, name = 'My Timetable', description = null) {
    try {
      const { data, error } = await supabase
        .from('personal_timetables')
        .insert({
          spotify_profile_id: spotifyProfileId,
          festival_id: festivalId,
          name,
          description,
          is_public: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating personal timetable:', error)
        throw error
      }

      console.log('Created personal timetable:', data)
      return data
    } catch (error) {
      console.error('Error creating personal timetable:', error)
      throw error
    }
  }

  // Add an act to personal timetable
  static async addActToTimetable(personalTimetableId, act, priority = 1, notes = null) {
    try {
      const { data, error } = await supabase
        .from('personal_timetable_entries')
        .insert({
          personal_timetable_id: personalTimetableId,
          act_id: act.id,
          artist_id: act.artist?.id,
          stage_id: act.stage?.id,
          day_id: act.day?.id,
          start_time: act.start_time,
          end_time: act.end_time,
          notes,
          priority,
          is_favorite: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding act to timetable:', error)
        throw error
      }

      console.log('Added act to personal timetable:', data)
      return data
    } catch (error) {
      console.error('Error adding act to timetable:', error)
      throw error
    }
  }

  // Get user's personal timetables
  static async getPersonalTimetables(spotifyProfileId) {
    try {
      const { data, error } = await supabase
        .from('personal_timetables')
        .select(`
          *,
          festival:festivals(name),
          entries:personal_timetable_entries(
            *,
            act:acts(name),
            artist:artists(name, spotify_id),
            stage:stages(name),
            day:festival_days(date)
          )
        `)
        .eq('spotify_profile_id', spotifyProfileId)

      if (error) {
        console.error('Error fetching personal timetables:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching personal timetables:', error)
      throw error
    }
  }

  // Save user session
  static async saveUserSession(spotifyProfileId, sessionData = {}) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          spotify_profile_id: spotifyProfileId,
          session_start: new Date().toISOString(),
          ip_address: sessionData.ipAddress,
          user_agent: sessionData.userAgent
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving user session:', error)
        throw error
      }

      console.log('Saved user session:', data)
      return data
    } catch (error) {
      console.error('Error saving user session:', error)
      throw error
    }
  }
}
