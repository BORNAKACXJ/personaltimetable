// Database schema documentation for Hit the City Festival
// This file contains the expected database structure

/*
Database Schema:

festivals:
  - id: string (uuid)
  - name: string
  - description: string | null
  - status: 'current' | 'archived'
  - created_at: string
  - updated_at: string

festival_days:
  - id: string (uuid)
  - festival_id: string (uuid)
  - name: string
  - date: string (YYYY-MM-DD)
  - start_time: string (HH:MM)
  - end_time: string (HH:MM)
  - created_at: string
  - updated_at: string

stages:
  - id: string (uuid)
  - festival_id: string (uuid)
  - name: string
  - description: string | null
  - created_at: string
  - updated_at: string

artists:
  - id: string (uuid)
  - festival_id: string (uuid)
  - spotify_id: string | null
  - name: string
  - image_url: string | null
  - spotify_url: string | null
  - genres: string[] | null
  - popularity: number | null
  - followers: number | null
  - about: string | null
  - created_at: string
  - updated_at: string

acts:
  - id: string (uuid)
  - festival_id: string (uuid)
  - name: string
  - description: string | null
  - created_at: string
  - updated_at: string

act_artists:
  - id: string (uuid)
  - act_id: string (uuid)
  - artist_id: string (uuid)
  - role: string
  - is_primary: boolean
  - created_at: string

timetable_entries:
  - id: string (uuid)
  - act_id: string (uuid)
  - stage_id: string (uuid)
  - day_id: string (uuid)
  - festival_id: string (uuid)
  - start_time: string (HH:MM)
  - end_time: string (HH:MM)
  - created_at: string
  - updated_at: string
*/ 