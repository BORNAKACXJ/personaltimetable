# Spotify Redirect URI Setup

## Overview
This document explains how to configure the Spotify redirect URIs for the Hit The City Festival timetable application.

## Redirect URIs

The application uses different redirect URIs depending on the environment:

- **Development (localhost)**: `http://localhost:5173/callback`
- **Production (New Domain)**: `https://timetable.hitthecity-festival.nl/callback`

## Spotify Developer Dashboard Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your application
3. Click on "Edit Settings"
4. In the "Redirect URIs" section, add:
   - `http://localhost:5173/callback`
   - `https://timetable.hitthecity-festival.nl/callback`
5. Click "Save"

## Environment Variables

Make sure your environment variables are set correctly:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
```

The `VITE_SPOTIFY_REDIRECT_URI` is no longer needed as it's determined dynamically.

## Testing

1. **Development**: Run `npm run dev` and test on `http://localhost:5173`
2. **Production**: Deploy and test on `https://timetable.hitthecity-festival.nl`

## Troubleshooting

If you encounter redirect URI mismatch errors:

1. Verify the exact redirect URI in your Spotify app settings
2. Check that the domain matches exactly (including protocol and path)
3. Ensure there are no trailing slashes or extra characters
4. Clear browser cache and try again
