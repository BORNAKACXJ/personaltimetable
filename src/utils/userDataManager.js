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

  // Save user sharing preferences (autosave) - directly to spotify_profiles
  static async saveSharingPreferences(userId, shareDisplayName, shareEmail) {
    try {
      console.log('Saving sharing preferences for user:', userId)
      console.log('Sharing preferences:', { shareDisplayName, shareEmail })

      // Update the spotify_profiles table directly with sharing preferences using the UUID
      const { data, error } = await supabase
        .from('spotify_profiles')
        .update({
          display_name: shareDisplayName,
          email: shareEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId) // Use the UUID directly
        .select()
        .single()

      if (error) {
        console.error('Error updating sharing preferences:', error)
        throw error
      }

      console.log('Sharing preferences saved to spotify_profiles:', data)
      return data
    } catch (error) {
      console.error('Error saving sharing preferences:', error)
      throw error
    }
  }

  // Get user sharing preferences from spotify_profiles
  static async getSharingPreferences(userId) {
    try {
      console.log('Getting sharing preferences for user:', userId)

      // Get sharing preferences directly from spotify_profiles using the UUID
      const { data: profile, error } = await supabase
        .from('spotify_profiles')
        .select('display_name, email')
        .eq('id', userId) // Use the UUID directly
        .single()

      if (error) {
        console.error('Error getting sharing preferences:', error)
        throw error
      }

      console.log('Retrieved sharing preferences:', profile)
      return {
        share_display_name: profile?.display_name || '',
        share_email: profile?.email || ''
      }
    } catch (error) {
      console.error('Error getting sharing preferences:', error)
      throw error
    }
  }
}
