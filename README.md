# Hit the City - Personal Timetable

A React-based festival timetable application that connects to Supabase to display festival days, times, acts, and artist information.

## Features

- **Real-time Data**: Connected to Supabase for live festival data
- **Responsive Design**: Works on desktop and mobile devices
- **Multiple Views**: Timeline and list view for different ways to browse acts
- **Artist Information**: Detailed artist profiles and information
- **Day Navigation**: Easy switching between festival days

## Tech Stack

- **Frontend**: React 18 with Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with existing design system
- **Icons**: Font Awesome

## Database Schema

The application expects the following tables in your Supabase database:

### `festival_days`
- `id` (int, primary key)
- `name` (text) - e.g., "Friday 29 Augustus"
- `date` (date) - e.g., "2025-08-29"

### `times`
- `id` (int, primary key)
- `time` (time) - e.g., "14:00:00"

### `acts`
- `id` (int, primary key)
- `name` (text) - act name
- `start_time` (time) - start time
- `end_time` (time) - end time
- `stage_name` (text) - stage name
- `festival_day_id` (int, foreign key to festival_days.id)
- `artist_id` (int, foreign key to artists.id)

### `artists`
- `id` (int, primary key)
- `name` (text) - artist name
- `image_url` (text) - artist image URL
- `spotify_url` (text) - Spotify profile URL
- `genre` (text) - music genre
- `about` (text) - artist description

## Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file with your Supabase credentials

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── hooks/
│   └── useFestivalData.js    # Custom hook for fetching festival data
├── lib/
│   └── supabase.js          # Supabase client configuration
├── App.jsx                  # Main application component
└── App.css                  # Additional styles

public/
└── _assets/                 # Static assets (CSS, images, fonts)
    ├── main.css
    ├── timetable.css
    ├── artist--dialog.css
    └── _images/
        └── logo-hitthecity.png
```

## Development

The application uses React hooks to manage state and fetch data from Supabase. The main data flow is:

1. `useFestivalData` hook fetches data from Supabase
2. Data is processed and grouped by day and stage
3. Components render the data in either timeline or list view
4. Users can switch between days and views

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
