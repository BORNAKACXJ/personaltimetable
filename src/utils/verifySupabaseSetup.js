import { supabase } from '../lib/supabase'

export async function verifySupabaseSetup() {
  const results = {
    success: false,
    tables: {},
    policies: {},
    errors: []
  }

  try {
    console.log('🔍 Verifying Supabase setup...')

    // Test 1: Check if tables exist
    const tablesToCheck = [
      'spotify_profiles',
      'user_top_tracks', 
      'user_top_artists',
      'user_sessions',
      'user_recommendations',
      'personal_timetables',
      'personal_timetable_entries'
    ]

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          results.tables[tableName] = false
          results.errors.push(`Table ${tableName}: ${error.message}`)
          console.error(`❌ Table ${tableName} error:`, error)
        } else {
          results.tables[tableName] = true
          console.log(`✅ Table ${tableName} exists`)
        }
      } catch (err) {
        results.tables[tableName] = false
        results.errors.push(`Table ${tableName}: ${err.message}`)
        console.error(`❌ Table ${tableName} exception:`, err)
      }
    }

    // Test 2: Check if we can insert into spotify_profiles
    try {
      const testData = {
        spotify_id: 'test_verification_' + Date.now(),
        display_name: 'Test User',
        email: 'test@verification.com',
        followers: 0
      }

      const { data, error } = await supabase
        .from('spotify_profiles')
        .insert(testData)
        .select()
        .single()

      if (error) {
        results.errors.push(`Insert test failed: ${error.message}`)
        console.error('❌ Insert test failed:', error)
      } else {
        console.log('✅ Insert test successful:', data)
        
        // Clean up test data
        await supabase
          .from('spotify_profiles')
          .delete()
          .eq('spotify_id', testData.spotify_id)
      }
    } catch (err) {
      results.errors.push(`Insert test exception: ${err.message}`)
      console.error('❌ Insert test exception:', err)
    }

    // Determine overall success
    const allTablesExist = Object.values(results.tables).every(exists => exists)
    const hasNoErrors = results.errors.length === 0

    results.success = allTablesExist && hasNoErrors

    if (results.success) {
      results.message = '✅ All tables exist and insert operations work correctly'
    } else {
      results.message = `❌ Setup incomplete: ${results.errors.length} error(s) found`
    }

    console.log('🔍 Verification complete:', results)
    return results

  } catch (error) {
    console.error('❌ Verification failed:', error)
    return {
      success: false,
      message: `Verification failed: ${error.message}`,
      errors: [error.message]
    }
  }
}
