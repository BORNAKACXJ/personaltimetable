-- New tables for Spotify user data and personal timetables
-- Copy this into your Supabase SQL editor

-- Create spotify_profiles table for Spotify user profiles
CREATE TABLE IF NOT EXISTS spotify_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id text UNIQUE NOT NULL,
  display_name text,
  email text,
  image_url text,
  country text,
  product text,
  followers integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_top_tracks table
CREATE TABLE IF NOT EXISTS user_top_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_profile_id uuid REFERENCES spotify_profiles(id) ON DELETE CASCADE,
  spotify_track_id text NOT NULL,
  track_name text NOT NULL,
  artist_name text NOT NULL,
  artist_spotify_id text NOT NULL,
  album_name text,
  album_image_url text,
  popularity integer,
  time_range text NOT NULL CHECK (time_range IN ('short_term', 'medium_term', 'long_term')),
  rank_position integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(spotify_profile_id, spotify_track_id, time_range)
);

-- Create user_top_artists table
CREATE TABLE IF NOT EXISTS user_top_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_profile_id uuid REFERENCES spotify_profiles(id) ON DELETE CASCADE,
  spotify_artist_id text NOT NULL,
  artist_name text NOT NULL,
  image_url text,
  genres text[],
  popularity integer,
  followers integer,
  time_range text NOT NULL CHECK (time_range IN ('short_term', 'medium_term', 'long_term')),
  rank_position integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(spotify_profile_id, spotify_artist_id, time_range)
);

-- Create user_sessions table for tracking user activity
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_profile_id uuid REFERENCES spotify_profiles(id) ON DELETE CASCADE,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create user_recommendations table for storing generated recommendations
CREATE TABLE IF NOT EXISTS user_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_profile_id uuid REFERENCES spotify_profiles(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('direct_match', 'related_artist', 'similar_genre')),
  score numeric(3,2) DEFAULT 0.0,
  reason text,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(spotify_profile_id, artist_id, recommendation_type)
);

-- Create personal_timetables table for user's saved timetable preferences
CREATE TABLE IF NOT EXISTS personal_timetables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_profile_id uuid REFERENCES spotify_profiles(id) ON DELETE CASCADE,
  festival_id uuid REFERENCES festivals(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Timetable',
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create personal_timetable_entries table for individual acts in personal timetables
CREATE TABLE IF NOT EXISTS personal_timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_timetable_id uuid REFERENCES personal_timetables(id) ON DELETE CASCADE,
  act_id uuid REFERENCES acts(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  stage_id uuid REFERENCES stages(id) ON DELETE CASCADE,
  day_id uuid REFERENCES festival_days(id) ON DELETE CASCADE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text,
  priority integer DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(personal_timetable_id, act_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spotify_profiles_spotify_id ON spotify_profiles(spotify_id);
CREATE INDEX IF NOT EXISTS idx_user_top_tracks_spotify_profile_id ON user_top_tracks(spotify_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_top_tracks_time_range ON user_top_tracks(time_range);
CREATE INDEX IF NOT EXISTS idx_user_top_artists_spotify_profile_id ON user_top_artists(spotify_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_top_artists_time_range ON user_top_artists(time_range);
CREATE INDEX IF NOT EXISTS idx_user_sessions_spotify_profile_id ON user_sessions(spotify_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_spotify_profile_id ON user_recommendations(spotify_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_artist_id ON user_recommendations(artist_id);
CREATE INDEX IF NOT EXISTS idx_personal_timetables_spotify_profile_id ON personal_timetables(spotify_profile_id);
CREATE INDEX IF NOT EXISTS idx_personal_timetables_festival_id ON personal_timetables(festival_id);
CREATE INDEX IF NOT EXISTS idx_personal_timetable_entries_timetable_id ON personal_timetable_entries(personal_timetable_id);
CREATE INDEX IF NOT EXISTS idx_personal_timetable_entries_act_id ON personal_timetable_entries(act_id);

-- Enable Row Level Security
ALTER TABLE spotify_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_top_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_top_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_timetable_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data (allow all operations for now - we'll secure this later)
CREATE POLICY "Allow all operations on spotify_profiles" ON spotify_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_top_tracks" ON user_top_tracks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_top_artists" ON user_top_artists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_recommendations" ON user_recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on personal_timetables" ON personal_timetables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on personal_timetable_entries" ON personal_timetable_entries FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_spotify_profiles_updated_at BEFORE UPDATE ON spotify_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personal_timetables_updated_at BEFORE UPDATE ON personal_timetables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personal_timetable_entries_updated_at BEFORE UPDATE ON personal_timetable_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
