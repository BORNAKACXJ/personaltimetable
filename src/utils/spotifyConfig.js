// Spotify configuration utilities
export function getSpotifyRedirectUri() {
  // Check if we're in development (localhost)
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '5173' ||
                     window.location.port === '3000'
  
  // Check if we're on Netlify
  const isNetlify = window.location.hostname.includes('netlify.app') ||
                   window.location.hostname.includes('tenfold-mpt.netlify.app')
  
  if (isLocalhost) {
    // Development environment
    return 'http://localhost:5173/callback'
  } else if (isNetlify) {
    // Production environment on Netlify
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
