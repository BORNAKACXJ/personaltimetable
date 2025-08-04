# Deployment Guide for Hit The City

## Environment Variables Required

This application requires the following environment variables to be set in your Netlify deployment:

### Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Spotify Configuration
- `VITE_SPOTIFY_CLIENT_ID` - Your Spotify App Client ID
- `VITE_SPOTIFY_CLIENT_SECRET` - Your Spotify App Client Secret
- `VITE_SPOTIFY_REDIRECT_URI` - Your Spotify redirect URI (optional, defaults to localhost)

## How to Set Environment Variables on Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add each environment variable:
   - Click **Add variable**
   - Enter the variable name (e.g., `VITE_SUPABASE_URL`)
   - Enter the variable value
   - Click **Save**
5. Repeat for all required variables
6. Redeploy your site

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** for `VITE_SUPABASE_URL`
4. Copy the **anon public** key for `VITE_SUPABASE_ANON_KEY`

## Getting Your Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or select an existing one
3. Copy the **Client ID** for `VITE_SPOTIFY_CLIENT_ID`
4. Click **Show Client Secret** and copy it for `VITE_SPOTIFY_CLIENT_SECRET`
5. Add your Netlify domain to the **Redirect URIs** in your Spotify app settings

## Troubleshooting

If the app still doesn't load after setting environment variables:

1. Check the browser console for any error messages
2. Verify that all environment variables are set correctly
3. Make sure your Spotify redirect URI matches your Netlify domain
4. Redeploy the site after adding environment variables

## Local Development

For local development, create a `.env` file in the root directory with the same environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
``` 