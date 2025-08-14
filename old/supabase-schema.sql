-- Hit the City Festival Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create festivals table
CREATE TABLE IF NOT EXISTS festivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create festival_days table
CREATE TABLE IF NOT EXISTS festival_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id uuid REFERENCES festivals(id) ON DELETE CASCADE,
  name text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stages table
CREATE TABLE IF NOT EXISTS stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id uuid REFERENCES festivals(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id uuid REFERENCES festivals(id) ON DELETE CASCADE,
  spotify_id text,
  name text NOT NULL,
  image_url text,
  spotify_url text,
  genres text[],
  popularity integer,
  followers integer,
  about text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create acts table
CREATE TABLE IF NOT EXISTS acts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id uuid REFERENCES festivals(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create act_artists junction table
CREATE TABLE IF NOT EXISTS act_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  act_id uuid REFERENCES acts(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  role text DEFAULT 'performer',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(act_id, artist_id)
);

-- Create timetable_entries table
CREATE TABLE IF NOT EXISTS timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  act_id uuid REFERENCES acts(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  stage_id uuid REFERENCES stages(id) ON DELETE CASCADE,
  day_id uuid REFERENCES festival_days(id) ON DELETE CASCADE,
  festival_id uuid REFERENCES festivals(id) ON DELETE CASCADE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create related_artists table for Spotify recommendations
CREATE TABLE IF NOT EXISTS related_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  related_spotify_id text NOT NULL,
  related_artist_name text NOT NULL,
  similarity_score numeric(3,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(artist_id, related_spotify_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_festival_days_festival_id ON festival_days(festival_id);
CREATE INDEX IF NOT EXISTS idx_stages_festival_id ON stages(festival_id);
CREATE INDEX IF NOT EXISTS idx_artists_festival_id ON artists(festival_id);
CREATE INDEX IF NOT EXISTS idx_acts_festival_id ON acts(festival_id);
CREATE INDEX IF NOT EXISTS idx_act_artists_act_id ON act_artists(act_id);
CREATE INDEX IF NOT EXISTS idx_act_artists_artist_id ON act_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_act_id ON timetable_entries(act_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_artist_id ON timetable_entries(artist_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_stage_id ON timetable_entries(stage_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_day_id ON timetable_entries(day_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_festival_id ON timetable_entries(festival_id);
CREATE INDEX IF NOT EXISTS idx_related_artists_artist_id ON related_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_related_artists_related_spotify_id ON related_artists(related_spotify_id);

-- Enable Row Level Security
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE act_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_artists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to festivals" ON festivals FOR SELECT USING (true);
CREATE POLICY "Allow public read access to festival_days" ON festival_days FOR SELECT USING (true);
CREATE POLICY "Allow public read access to stages" ON stages FOR SELECT USING (true);
CREATE POLICY "Allow public read access to artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Allow public read access to acts" ON acts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to act_artists" ON act_artists FOR SELECT USING (true);
CREATE POLICY "Allow public read access to timetable_entries" ON timetable_entries FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_festivals_updated_at BEFORE UPDATE ON festivals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_festival_days_updated_at BEFORE UPDATE ON festival_days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acts_updated_at BEFORE UPDATE ON acts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_act_artists_updated_at BEFORE UPDATE ON act_artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timetable_entries_updated_at BEFORE UPDATE ON timetable_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 