// Simple test script to check Supabase related_artists table
// Run with: node test-supabase.js

// You'll need to set these environment variables or replace with actual values
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gcrgokyyeahltyieyugm.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...')
  console.log('URL:', SUPABASE_URL)
  console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...')
  
  try {
    // Test 1: Basic query
    console.log('\n📊 Test 1: Basic query to related_artists...')
    const response1 = await fetch(`${SUPABASE_URL}/rest/v1/related_artists?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response1.ok) {
      console.error('❌ Error:', response1.status, response1.statusText)
      const errorText = await response1.text()
      console.error('Error details:', errorText)
      return
    }
    
    const data1 = await response1.json()
    console.log('✅ Success! Sample data:', data1)
    console.log('📊 Records found:', data1.length)
    
    // Test 2: Count total records
    console.log('\n📊 Test 2: Counting total records...')
    const response2 = await fetch(`${SUPABASE_URL}/rest/v1/related_artists?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    })
    
    if (response2.ok) {
      const count = response2.headers.get('content-range')
      console.log('📊 Total records (from header):', count)
    }
    
    // Test 3: Get sample artist_ids
    console.log('\n📊 Test 3: Sample artist_ids...')
    const response3 = await fetch(`${SUPABASE_URL}/rest/v1/related_artists?select=artist_id&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response3.ok) {
      const data3 = await response3.json()
      console.log('📊 Sample artist_ids:', data3)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testSupabase() 