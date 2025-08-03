import { useState, useEffect } from 'react'
import { useFestivalData } from '../hooks/useFestivalData'

export function Api() {
  const { 
    festival, 
    festivalDays, 
    stages, 
    artists, 
    acts, 
    actArtists, 
    timetableEntries, 
    loading, 
    error,
    getActsByDayAndStage 
  } = useFestivalData()

  const [apiData, setApiData] = useState(null)
  const [timeSlotsData, setTimeSlotsData] = useState(null)
  const [activeTab, setActiveTab] = useState('normal')

  // Helper function to create 2-hour time slots
  const createTimeSlots = (startTime, endTime) => {
    const slots = []
    let currentTime = new Date(`2000-01-01T${startTime}:00`)
    const endDateTime = new Date(`2000-01-01T${endTime}:00`)
    
    // Handle overnight events (end time is before start time)
    if (endDateTime < currentTime) {
      endDateTime.setDate(endDateTime.getDate() + 1)
    }
    
    while (currentTime < endDateTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5)
      currentTime.setHours(currentTime.getHours() + 2)
      const slotEnd = currentTime.toTimeString().slice(0, 5)
      
      slots.push({
        start_time: slotStart,
        end_time: slotEnd,
        acts: []
      })
    }
    
    return slots
  }

  // Helper function to check if an act falls within a time slot
  const isActInTimeSlot = (act, slotStart, slotEnd) => {
    const actStart = act.start_time
    const actEnd = act.end_time
    
    // Convert times to minutes for easier comparison
    const slotStartMinutes = parseInt(slotStart.split(':')[0]) * 60 + parseInt(slotStart.split(':')[1])
    let slotEndMinutes = parseInt(slotEnd.split(':')[0]) * 60 + parseInt(slotEnd.split(':')[1])
    const actStartMinutes = parseInt(actStart.split(':')[0]) * 60 + parseInt(actStart.split(':')[1])
    let actEndMinutes = parseInt(actEnd.split(':')[0]) * 60 + parseInt(actEnd.split(':')[1])
    
    // Handle overnight acts
    if (actEndMinutes < actStartMinutes) {
      actEndMinutes += 24 * 60
    }
    if (slotEndMinutes < slotStartMinutes) {
      slotEndMinutes += 24 * 60
    }
    
    // Check if act overlaps with slot
    return actStartMinutes < slotEndMinutes && actEndMinutes > slotStartMinutes
  }

  useEffect(() => {
    if (!loading && !error && festival) {
      // Get the acts data once to avoid infinite loops
      const actsByDay = getActsByDayAndStage()
      
      // Structure the data as requested: day -> stage -> acts -> artist -> artist info
      const structuredData = {
        festival: {
          id: festival.id,
          name: festival.name,
          description: festival.description
        },
        days: festivalDays.map(day => {
          const dayData = actsByDay.find(d => d.day.id === day.id)
          
          return {
            id: day.id,
            name: day.name,
            date: day.date,
            start_time: day.start_time,
            end_time: day.end_time,
            stages: dayData ? dayData.stages.map(stage => ({
              id: stage.name, // Using stage name as ID for now
              name: stage.name,
              acts: stage.acts.map(act => ({
                id: act.id,
                name: act.name,
                start_time: act.start_time,
                end_time: act.end_time,
                artist: act.artist ? {
                  id: act.artist.id,
                  name: act.artist.name,
                  spotify_id: act.artist.spotify_id,
                  image_url: act.artist.image_url,
                  spotify_url: act.artist.spotify_url,
                  genres: act.artist.genres,
                  popularity: act.artist.popularity,
                  followers: act.artist.followers,
                  about: act.artist.about,
                  bio: act.artist.bio,
                  social_links: act.artist.social_links,
                  youtube_embed: act.artist.youtube_embed
                } : null
              }))
            })) : []
          }
        })
      }

      setApiData(structuredData)

      // Create time slots data
      const timeSlotsStructuredData = {
        festival: {
          id: festival.id,
          name: festival.name,
          description: festival.description
        },
        days: festivalDays.map(day => {
          // Create 2-hour time slots for this day
          const timeSlots = createTimeSlots(day.start_time, day.end_time)
          
          // Get acts for this day
          const dayData = actsByDay.find(d => d.day.id === day.id)
          
          // Populate each time slot with acts
          timeSlots.forEach(slot => {
            if (dayData) {
              dayData.stages.forEach(stage => {
                stage.acts.forEach(act => {
                  if (isActInTimeSlot(act, slot.start_time, slot.end_time)) {
                    slot.acts.push({
                      id: act.id,
                      name: act.name,
                      start_time: act.start_time,
                      end_time: act.end_time,
                      stage: stage.name,
                      artist: act.artist ? {
                        id: act.artist.id,
                        name: act.artist.name,
                        spotify_id: act.artist.spotify_id,
                        image_url: act.artist.image_url,
                        spotify_url: act.artist.spotify_url,
                        genres: act.artist.genres,
                        popularity: act.artist.popularity,
                        followers: act.artist.followers,
                        about: act.artist.about,
                        bio: act.artist.bio,
                        social_links: act.artist.social_links,
                        youtube_embed: act.artist.youtube_embed
                      } : null
                    })
                  }
                })
              })
            }
          })
          
          return {
            id: day.id,
            name: day.name,
            date: day.date,
            start_time: day.start_time,
            end_time: day.end_time,
            time_slots: timeSlots
          }
        })
      }

      setTimeSlotsData(timeSlotsStructuredData)
    }
  }, [loading, error, festival, festivalDays])

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Festival API</h1>
        <p>Loading festival data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Festival API</h1>
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!apiData || !timeSlotsData) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Festival API</h1>
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Festival API</h1>
      <p>Two API endpoints available for festival data</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('normal')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'normal' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'normal' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Normal API
        </button>
        <button 
          onClick={() => setActiveTab('timed')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'timed' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'timed' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Time Slots API
        </button>
      </div>

      {activeTab === 'normal' ? (
        <div>
          <h2>Normal API</h2>
          <p>Endpoint: <code>/api</code></p>
          <p>Format: JSON</p>
          <p>Description: Acts grouped by day and stage</p>
          <hr />
          <h3>Data Structure:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(apiData, null, 2)}
          </pre>
          
          <hr />
          <h3>API Usage:</h3>
          <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
            <h4>Fetch Data:</h4>
            <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
{`fetch('/api')
  .then(response => response.json())
  .then(data => {
    console.log('Festival data:', data);
    // Access specific day
    const day1 = data.days[0];
    // Access specific stage
    const stage1 = day1.stages[0];
    // Access specific act
    const act1 = stage1.acts[0];
    // Access artist info
    const artist = act1.artist;
  });`}
            </pre>
            
            <h4>Data Structure:</h4>
            <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
{`{
  festival: { id, name, description },
  days: [
    {
      id, name, date, start_time, end_time,
      stages: [
        {
          id, name,
          acts: [
            {
              id, name, start_time, end_time,
              artist: {
                id, name, spotify_id, image_url, 
                spotify_url, genres, popularity, 
                followers, about, bio, social_links, 
                youtube_embed
              }
            }
          ]
        }
      ]
    }
  ]
}`}
            </pre>
          </div>
        </div>
      ) : (
        <div>
          <h2>Time Slots API</h2>
          <p>Endpoint: <code>/time-slots</code></p>
          <p>Format: JSON</p>
          <p>Description: Acts grouped by 2-hour time slots for each day</p>
          <hr />
          <h3>Data Structure:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(timeSlotsData, null, 2)}
          </pre>
          
          <hr />
          <h3>API Usage:</h3>
          <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
            <h4>Fetch Data:</h4>
            <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
{`fetch('/time-slots')
  .then(response => response.json())
  .then(data => {
    console.log('Time slots data:', data);
    // Access specific day
    const day1 = data.days[0];
    // Access specific time slot
    const slot1 = day1.time_slots[0];
    // Access acts in that slot
    const acts = slot1.acts;
    // Access artist info
    const artist = acts[0].artist;
  });`}
            </pre>
            
            <h4>Data Structure:</h4>
            <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
{`{
  festival: { id, name, description },
  days: [
    {
      id, name, date, start_time, end_time,
      time_slots: [
        {
          start_time, end_time,
          acts: [
            {
              id, name, start_time, end_time, stage,
              artist: {
                id, name, spotify_id, image_url, 
                spotify_url, genres, popularity, 
                followers, about, bio, social_links, 
                youtube_embed
              }
            }
          ]
        }
      ]
    }
  ]
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 