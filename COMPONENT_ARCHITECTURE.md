# Component Architecture

## Overview

The application has been refactored into modular components to improve maintainability and follow the single responsibility principle. The main workflow follows these steps:

1. **User connects via Spotify** → `SpotifyAuth` component
2. **Shows top tracks and saves to Supabase** → User data is handled in `SpotifyAuth` and saved via hooks
3. **Makes recommendations** → `RecommendationsPanel` component

## Component Structure

### Main Components

#### `App.jsx` (Main Container)
- **Purpose**: Main application container and state management
- **Responsibilities**: 
  - Orchestrates all components
  - Manages global state (current day, view, selected artist)
  - Handles routing for special pages
  - Coordinates data flow between components

#### `SpotifyAuth.jsx`
- **Purpose**: Handles Spotify authentication and user profile display
- **Responsibilities**:
  - Spotify login/logout functionality
  - Displays user profile when authenticated
  - Shows top tracks from user's listening history
  - Provides authentication status to parent components

#### `RecommendationsPanel.jsx`
- **Purpose**: Displays personalized recommendations based on Spotify data
- **Responsibilities**:
  - Shows recommendations for current day
  - Displays all recommendations with clickable tags
  - Handles recommendation interactions
  - Shows loading states and empty states

#### `TimetableNavigation.jsx`
- **Purpose**: Handles day selection and view toggling
- **Responsibilities**:
  - Day navigation buttons
  - View toggle (list/timeline)
  - Current day display
  - Tracking user interactions

#### `TimetableList.jsx`
- **Purpose**: Renders the list view of the timetable
- **Responsibilities**:
  - Displays acts organized by stage
  - Shows recommended acts with special styling
  - Handles act sorting and time formatting
  - Manages act click interactions

#### `AppHeader.jsx`
- **Purpose**: Festival header and navigation
- **Responsibilities**:
  - Festival logo and branding
  - Main navigation menu
  - Social media links
  - Mobile navigation

### Existing Components (Unchanged)

#### `ArtistDialog.jsx`
- **Purpose**: Modal dialog for artist details
- **Responsibilities**:
  - Displays detailed artist information
  - Shows performance times and stage info
  - Handles artist interactions

#### `TimelineView.jsx`
- **Purpose**: Timeline visualization of the timetable
- **Responsibilities**:
  - Visual timeline representation
  - Stage-based layout
  - Time-based act positioning

#### `SpotifyCallback.jsx`
- **Purpose**: Handles Spotify OAuth callback
- **Responsibilities**:
  - Processes OAuth response
  - Redirects user back to main app

## Data Flow

```
App.jsx (Main State)
├── SpotifyAuth (Authentication State)
├── RecommendationsPanel (Recommendations State)
├── TimetableNavigation (UI State)
├── TimetableList (Display Logic)
└── TimelineView (Display Logic)
```

## Key Benefits

1. **Separation of Concerns**: Each component has a single, well-defined responsibility
2. **Reusability**: Components can be easily reused or modified independently
3. **Maintainability**: Smaller, focused components are easier to debug and maintain
4. **Testability**: Individual components can be tested in isolation
5. **Performance**: Components can be optimized independently

## Workflow Implementation

### 1. User connects via Spotify
- `SpotifyAuth` component handles the authentication flow
- Uses `useSpotifyAuth` hook for Spotify API integration
- Saves user data to Supabase via the hook

### 2. Shows top tracks and saves to Supabase
- User's top tracks are displayed in `SpotifyAuth` component
- Data is automatically saved to Supabase through the authentication hook
- User profile information is shown when authenticated

### 3. Makes recommendations
- `RecommendationsPanel` component displays personalized recommendations
- Uses `useSpotifyRecommendations` hook to generate recommendations
- Shows recommendations for current day and all days
- Clickable tags allow users to view artist details

## Styling

Each component has its own CSS file for modular styling:
- `SpotifyAuth.css` - Authentication and user profile styles
- Component-specific styles are scoped to their respective components

## Future Enhancements

1. **Component Testing**: Add unit tests for each component
2. **Performance Optimization**: Implement React.memo for components that don't need frequent re-renders
3. **Accessibility**: Add ARIA labels and keyboard navigation
4. **Internationalization**: Prepare components for multi-language support
