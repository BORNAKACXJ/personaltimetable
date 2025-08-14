# Spotify Integration Troubleshooting Guide

## "Illegal Scope" Error

If you're getting an "Illegal scope" error when trying to connect to Spotify, follow these steps:

### 1. Check Spotify App Configuration

Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and:

1. **Select your app**
2. **Go to "Edit Settings"**
3. **Add the redirect URI**: `http://localhost:5173/callback`
4. **Save the changes**

### 2. Verify App Status

- If your app is in "Development Mode":
  - Add your email address as a user in the app settings
  - Or switch to "Production Mode" (requires Spotify review)

### 3. Check Environment Variables

Make sure your `.env` file contains:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### 4. Verify Scopes

The app uses this scope:
- `user-top-read` - Access to user's top artists and tracks

### 5. Debug Steps

1. **Click "Debug Spotify" button** in the app to check configuration
2. **Check browser console** for any error messages
3. **Verify the authorization URL** is correctly formed

### 6. Common Issues

#### Redirect URI Mismatch
- The redirect URI in your Spotify app must exactly match: `http://localhost:5173/callback`
- No trailing slashes or extra characters

#### Development Mode
- If your app is in development mode, you must add your email as a user
- Go to your app settings → Users and add your email

#### Client ID/Secret Issues
- Verify the Client ID and Secret are correct
- Make sure they're from the right app in your dashboard

### 7. Testing

1. Clear your browser cache
2. Try in an incognito/private window
3. Check if the issue persists

### 8. Alternative Solutions

If the issue persists:

1. **Create a new Spotify app** in the developer dashboard
2. **Use the new Client ID and Secret**
3. **Update your `.env` file** with the new credentials
4. **Test the connection**

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Use the debug component in the app to verify configuration
3. Ensure your Spotify account has the necessary permissions
4. Try logging out and back into Spotify

## Support

If you continue to have issues, please provide:
- The exact error message
- Your Spotify app configuration (without sensitive data)
- Browser console logs
- Debug component output 