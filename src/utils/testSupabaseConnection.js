import { supabase } from '../lib/supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection by trying to access a table
    console.log('Testing basic connection...')
    const { data, error } = await supabase
      .from('spotify_profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
      return {
        success: false,
        error: error.message,
        details: error,
        suggestion: 'Make sure you have run the SQL script in Supabase and the tables exist'
      }
    }
    
    console.log('✅ Supabase connection successful')
    
    // Test if all required tables exist
    const tables = [
      'spotify_profiles',
      'user_top_tracks', 
      'user_top_artists',
      'user_sessions',
      'user_recommendations',
      'personal_timetables',
      'personal_timetable_entries'
    ]
    
    const tableTests = {}
    
    for (const table of tables) {
      try {
        console.log(`Testing table: ${table}`)
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        tableTests[table] = !tableError
        console.log(`${tableError ? '❌' : '✅'} ${table}: ${tableError ? 'Error' : 'OK'}`)
        
        if (tableError) {
          console.error(`Table ${table} error:`, tableError)
        }
      } catch (err) {
        tableTests[table] = false
        console.error(`❌ ${table}: Error`, err)
      }
    }
    
    // Test inserting a dummy record to spotify_profiles
    console.log('Testing insert capability...')
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('spotify_profiles')
        .insert({
          spotify_id: 'test_user_' + Date.now(),
          display_name: 'Test User',
          email: 'test@example.com'
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ Insert test failed:', insertError)
        tableTests.insertTest = false
      } else {
        console.log('✅ Insert test successful:', insertData)
        tableTests.insertTest = true
        
        // Clean up test data
        await supabase
          .from('spotify_profiles')
          .delete()
          .eq('spotify_id', insertData.spotify_id)
      }
    } catch (err) {
      console.error('❌ Insert test error:', err)
      tableTests.insertTest = false
    }
    
    const allTablesExist = Object.values(tableTests).every(test => test === true)
    
    return {
      success: allTablesExist,
      tables: tableTests,
      message: allTablesExist 
        ? '✅ Supabase connection and all tables working correctly' 
        : '❌ Some tables or operations are failing - check the console for details'
    }
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error)
    return {
      success: false,
      error: error.message,
      details: error,
      suggestion: 'Check your Supabase URL and API key configuration'
    }
  }
}
