-- Migration: Add user_sharing_preferences table for autosaving sharing preferences

-- Create user_sharing_preferences table for storing autosaved sharing preferences
CREATE TABLE IF NOT EXISTS user_sharing_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_profile_id uuid REFERENCES spotify_profiles(id) ON DELETE CASCADE,
  share_display_name text,
  share_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(spotify_profile_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_sharing_preferences_spotify_profile_id ON user_sharing_preferences(spotify_profile_id);

-- Enable Row Level Security
ALTER TABLE user_sharing_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data (users can only access their own data)
CREATE POLICY "Users can view own sharing preferences" ON user_sharing_preferences FOR SELECT USING (spotify_profile_id IN (SELECT id FROM spotify_profiles WHERE spotify_id = auth.uid()::text));
CREATE POLICY "Users can insert own sharing preferences" ON user_sharing_preferences FOR INSERT WITH CHECK (spotify_profile_id IN (SELECT id FROM spotify_profiles WHERE spotify_id = auth.uid()::text));
CREATE POLICY "Users can update own sharing preferences" ON user_sharing_preferences FOR UPDATE USING (spotify_profile_id IN (SELECT id FROM spotify_profiles WHERE spotify_id = auth.uid()::text));

-- Create trigger for updated_at
CREATE TRIGGER update_user_sharing_preferences_updated_at BEFORE UPDATE ON user_sharing_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
