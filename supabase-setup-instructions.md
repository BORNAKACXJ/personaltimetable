# 🔧 Supabase Setup Instructions

## Step 1: Run the SQL Script

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `gcrgokyyeahltyieyugm`

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the SQL**
   - Copy the entire contents of `supabase-new-tables-fixed.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

## Step 2: Verify the Tables Were Created

After running the SQL, you should see:
- ✅ `spotify_profiles` table created
- ✅ `user_top_tracks` table created  
- ✅ `user_top_artists` table created
- ✅ `user_sessions` table created
- ✅ `user_recommendations` table created
- ✅ `personal_timetables` table created
- ✅ `personal_timetable_entries` table created

## Step 3: Check RLS Policies

In your Supabase dashboard:
1. Go to "Authentication" → "Policies"
2. You should see policies like:
   - "Allow all operations on spotify_profiles"
   - "Allow all operations on user_top_tracks"
   - etc.

## Step 4: Test in Your App

1. **Refresh your app**
2. **Click "Test Connection"** in the debug panel
3. **Click "Test Profile Insert"** in the debug panel

You should see:
```
✅ Success
Message: All tables accessible and insert test passed
```

## Troubleshooting

### If you get "table already exists" errors:
- This is fine! The `IF NOT EXISTS` clauses will skip existing tables

### If you get permission errors:
- Make sure you're logged into the correct Supabase account
- Check that you're in the right project

### If RLS policies are still blocking:
- Go to "Authentication" → "Policies"
- Delete any existing policies on these tables
- Re-run the SQL script

## Current Error Analysis

The error you're seeing:
```
new row violates row-level security policy for table "spotify_profiles"
```

This means either:
1. ❌ The SQL script hasn't been run yet
2. ❌ The RLS policies weren't created properly
3. ❌ There are conflicting policies

**Solution**: Run the SQL script in Supabase dashboard!
