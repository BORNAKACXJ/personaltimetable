import { supabase } from '../lib/supabase'

export async function checkRLSPolicies() {
  try {
    console.log('🔍 Checking RLS policies...')
    
    // Try to get policy information by attempting operations
    const testResults = {}
    
    // Test spotify_profiles
    try {
      const { data, error } = await supabase
        .from('spotify_profiles')
        .select('*')
        .limit(1)
      
      testResults.spotify_profiles = {
        select: !error,
        error: error?.message
      }
    } catch (err) {
      testResults.spotify_profiles = {
        select: false,
        error: err.message
      }
    }
    
    // Test user_top_artists
    try {
      const { data, error } = await supabase
        .from('user_top_artists')
        .select('*')
        .limit(1)
      
      testResults.user_top_artists = {
        select: !error,
        error: error?.message
      }
    } catch (err) {
      testResults.user_top_artists = {
        select: false,
        error: err.message
      }
    }
    
    // Test insert with minimal data
    try {
      const testData = {
        spotify_id: 'test_rls_' + Date.now(),
        display_name: 'Test RLS',
        followers: 0
      }
      
      const { data, error } = await supabase
        .from('spotify_profiles')
        .insert(testData)
        .select()
        .single()
      
      testResults.spotify_profiles.insert = !error
      testResults.spotify_profiles.insertError = error?.message
      
      // Clean up
      if (data) {
        await supabase
          .from('spotify_profiles')
          .delete()
          .eq('spotify_id', testData.spotify_id)
      }
    } catch (err) {
      testResults.spotify_profiles.insert = false
      testResults.spotify_profiles.insertError = err.message
    }
    
    console.log('RLS Policy Check Results:', testResults)
    return testResults
    
  } catch (error) {
    console.error('Error checking RLS policies:', error)
    return { error: error.message }
  }
}
