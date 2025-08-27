// Spotify configuration utilities
export function getSpotifyRedirectUri() {
  // Check if we're in development (localhost)
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '5173' ||
                     window.location.port === '3000'
  
  // Check if we're on Netlify or the new domain
  const isNetlify = window.location.hostname.includes('netlify.app') ||
                   window.location.hostname.includes('tenfold-mpt.netlify.app')
  
  // Check if we're on the new domain
  const isNewDomain = window.location.hostname.includes('hitthecity-festival.nl') ||
                     window.location.hostname.includes('timetable.hitthecity-festival.nl')
  
  if (isLocalhost) {
    // Development environment
    return 'http://localhost:5173/callback'
  } else if (isNewDomain) {
    // Production environment on new domain
    return 'https://timetable.hitthecity-festival.nl/callback'
  } else if (isNetlify) {
    // Production environment on Netlify (fallback)
    return 'https://tenfold-mpt.netlify.app/callback'
  } else {
    // Fallback to environment variable or default
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback'
  }
}

export function getSpotifyClientId() {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID
}

export function getSpotifyClientSecret() {
  return import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
}

// Log current configuration for debugging
export function logSpotifyConfig() {
  console.log('🎵 Spotify Configuration:')
  console.log('  Hostname:', window.location.hostname)
  console.log('  Port:', window.location.port)
  console.log('  Protocol:', window.location.protocol)
  console.log('  Full URL:', window.location.href)
  console.log('  Redirect URI:', getSpotifyRedirectUri())
  console.log('  Client ID:', getSpotifyClientId() ? '✅ Set' : '❌ Missing')
  console.log('  Client Secret:', getSpotifyClientSecret() ? '✅ Set' : '❌ Missing')
}
