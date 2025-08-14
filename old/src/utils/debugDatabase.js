import { supabase } from '../lib/supabase'

export async function debugDatabase() {
  console.log('🔍 Debugging database structure...')
  
  try {
    // Check specific tables we're interested in
    const tablesToCheck = ['festivals', 'festival_days', 'stages', 'artists', 'acts', 'timetable_entries', 'related_artists']
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table ${tableName}: ${error.message}`)
        } else {
          console.log(`✅ Table ${tableName}: ${data?.length || 0} rows`)
          if (data && data.length > 0) {
            console.log(`   Columns:`, Object.keys(data[0]))
          }
        }
      } catch (e) {
        console.log(`❌ Table ${tableName} not found or error:`, e.message)
      }
    }

    // Check for festival data specifically
    console.log('\n🎪 Checking for festival data...')
    
    // Try to find festivals
    try {
      const { data: festivals, error } = await supabase
        .from('festivals')
        .select('*')
        .limit(5)
      
      if (!error && festivals?.length > 0) {
        console.log('✅ Found festivals:', festivals.map(f => ({ id: f.id, name: f.name })))
      } else {
        console.log('❌ No festivals found or error:', error?.message)
      }
    } catch (e) {
      console.log('❌ Error checking festivals:', e.message)
    }

    // Try to find any data with our IDs
    const FESTIVAL_ID = '43bfaa91-3fab-4245-ae04-ba7e20e12fd0'
    const EDITION_ID = 'a2a26ced-06df-47e2-9745-2b708f2d6a0a'
    
    console.log(`\n🔍 Looking for data with Festival ID: ${FESTIVAL_ID}`)
    console.log(`🔍 Looking for data with Edition ID: ${EDITION_ID}`)
    
    // Check different tables for these IDs (only edition_id since that's what works)
    const tablesToSearch = ['festival_days', 'stages', 'artists', 'acts', 'timetable_entries']
    
    for (const tableName of tablesToSearch) {
      try {
        // Try edition_id (this is what works)
        const { data: editionData, error: editionError } = await supabase
          .from(tableName)
          .select('*')
          .eq('edition_id', EDITION_ID)
          .limit(1)
        
        if (!editionError && editionData?.length > 0) {
          console.log(`✅ Found data in ${tableName} with edition_id`)
        }
        
      } catch (e) {
        // Table might not exist or column might not exist
      }
    }
    
  } catch (error) {
    console.error('Error debugging database:', error)
  }
} 