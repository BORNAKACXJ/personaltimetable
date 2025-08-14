# 🎵 Spotify Redirect URI Setup

## Overview

The application now automatically detects the environment and uses the appropriate Spotify redirect URI:

- **Development (localhost)**: `http://localhost:5173/callback`
- **Production (Netlify)**: `https://tenfold-mpt.netlify.app/callback`

## Spotify App Configuration

You need to configure **both redirect URIs** in your Spotify Developer Dashboard:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Go to "Settings"
4. Under "Redirect URIs", add:
   - `http://localhost:5173/callback`
   - `https://tenfold-mpt.netlify.app/callback`
5. Click "Save"

## How It Works

The application uses the `spotifyConfig.js` utility to:

1. **Detect Environment**: Checks `window.location.hostname` and `window.location.port`
2. **Select Redirect URI**: Automatically chooses the correct URI based on environment
3. **Log Configuration**: Provides detailed logging for debugging

## Testing

Use the debug panel in the app to verify the configuration:

1. Click "Check Configuration" in the Spotify debug panel
2. Verify the correct redirect URI is being used
3. Check the console for detailed configuration logs

## Environment Variables

The following environment variables are still used:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
```

The `VITE_SPOTIFY_REDIRECT_URI` is no longer needed as it's determined dynamically.

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure both URIs are added to your Spotify app
   - Check that the URIs match exactly (including protocol)

2. **Redirect not working on production**
   - Verify the Netlify URL is correct
   - Check that HTTPS is used for production

3. **Development vs Production confusion**
   - Use the debug panel to verify which environment is detected
   - Check the console logs for configuration details

### Debug Commands

```javascript
// Check current configuration
import { logSpotifyConfig } from './src/utils/spotifyConfig'
logSpotifyConfig()

// Get current redirect URI
import { getSpotifyRedirectUri } from './src/utils/spotifyConfig'
console.log('Current redirect URI:', getSpotifyRedirectUri())
```
