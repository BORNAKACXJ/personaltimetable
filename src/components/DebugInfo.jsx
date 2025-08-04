import React from 'react'

const DebugInfo = ({ data, loading, error, spotifyAuthenticated, spotifyLoading }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Debug Info</h4>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Error: {error ? 'true' : 'false'}</div>
      <div>Data: {data ? 'true' : 'false'}</div>
      <div>Spotify Auth: {spotifyAuthenticated ? 'true' : 'false'}</div>
      <div>Spotify Loading: {spotifyLoading ? 'true' : 'false'}</div>
      <div>Festival Name: {data?.festival?.name || 'N/A'}</div>
      <div>Days Count: {data?.days?.length || 0}</div>
      <div>Env Vars:</div>
      <div>SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</div>
      <div>SPOTIFY_CLIENT_ID: {import.meta.env.VITE_SPOTIFY_CLIENT_ID ? 'Set' : 'Missing'}</div>
    </div>
  )
}

export default DebugInfo 