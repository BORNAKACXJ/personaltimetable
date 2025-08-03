export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      festivals: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'current' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'current' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'current' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      festival_days: {
        Row: {
          id: string
          festival_id: string
          name: string
          date: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          name: string
          date: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          name?: string
          date?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
      stages: {
        Row: {
          id: string
          festival_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          festival_id: string
          spotify_id: string | null
          name: string
          image_url: string | null
          spotify_url: string | null
          genres: string[] | null
          popularity: number | null
          followers: number | null
          about: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          spotify_id?: string | null
          name: string
          image_url?: string | null
          spotify_url?: string | null
          genres?: string[] | null
          popularity?: number | null
          followers?: number | null
          about?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          spotify_id?: string | null
          name?: string
          image_url?: string | null
          spotify_url?: string | null
          genres?: string[] | null
          popularity?: number | null
          followers?: number | null
          about?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      acts: {
        Row: {
          id: string
          festival_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      act_artists: {
        Row: {
          id: string
          act_id: string
          artist_id: string
          role: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          act_id: string
          artist_id: string
          role?: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          act_id?: string
          artist_id?: string
          role?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      timetable_entries: {
        Row: {
          id: string
          act_id: string
          stage_id: string
          day_id: string
          festival_id: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          act_id: string
          stage_id: string
          day_id: string
          festival_id: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          act_id?: string
          stage_id?: string
          day_id?: string
          festival_id?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 