# 🎵 Spotify Setup Guide - Fix "INVALID_CLIENT" Error

## The Problem
You're getting "INVALID_CLIENT: Invalid client" because the Spotify Client ID is not properly configured.

## Step-by-Step Solution

### 1. Create a Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in the details:
   - **App name**: "Personal Timetable" (or any name you prefer)
   - **App description**: "Personal festival timetable with Spotify recommendations"
   - **Website**: `http://localhost:5173` (for development)
   - **Redirect URIs**: 
     - `http://localhost:5173/callback`
   - **API/SDKs**: Web API
4. Click "Save"

### 2. Get Your Credentials
After creating the app, you'll see:
- **Client ID**: A long string like `abc123def456ghi789...`
- **Client Secret**: Another long string (keep this secret!)

### 3. Create Environment File
Create a `.env` file in your project root (same level as `package.json`):

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**Replace** `your_client_id_here` and `your_client_secret_here` with your actual credentials from step 2.

### 4. Restart Development Server
After creating the `.env` file:
```bash
npm run dev
```

### 5. Test the Connection
1. Go to `http://localhost:5173`
2. Click "🎵 Connect with Spotify" in the header
3. You should now be redirected to Spotify's authorization page

## Troubleshooting

### If you still get "INVALID_CLIENT":
1. **Double-check the Client ID**: Make sure you copied it exactly from Spotify Dashboard
2. **Check the .env file**: Ensure it's in the project root and has no extra spaces
3. **Restart the dev server**: Environment variables only load when the server starts
4. **Check browser console**: Look for any error messages

### If you get "Invalid redirect URI":
1. **Add the redirect URI** to your Spotify app:
   - `http://localhost:5173/callback`
2. **Save the changes** in Spotify Dashboard
3. **Wait a few minutes** for changes to propagate

### Development Mode Issues:
If your Spotify app is in "Development Mode":
1. Go to your app settings in Spotify Dashboard
2. Add your email address as a user
3. Or switch to "Production Mode" (requires Spotify review)

## Example .env File
```env
VITE_SPOTIFY_CLIENT_ID=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
VITE_SPOTIFY_CLIENT_SECRET=xyz987wvu654tsr321qpo098nml654kji321hgf654edc987ba
```

## Next Steps
Once the connection works:
1. You'll be redirected to Spotify to authorize
2. After authorization, you'll see your top artists and tracks
3. Click "Yes, let's create personal timetable"
4. Your data will be saved and you'll get a personal timetable URL

## Need Help?
- Check the browser console for detailed error messages
- Verify your Spotify app configuration
- Make sure your .env file is in the correct location
- Restart the development server after making changes
