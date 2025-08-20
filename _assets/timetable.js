const timetable = document.getElementById('timetable');

// Day configuration with individual time ranges
const days = [
  { 
    id: 0, 
    date: "28 Aug", 
    fullDate: "Thursday 28 Augustus",
    startTime: "18:00",
    endTime: "23:00"
  },
  { 
    id: 1, 
    date: "29 Aug", 
    fullDate: "Friday 29 Augustus",
    startTime: "12:00",
    endTime: "03:00"
  },
  { 
    id: 2, 
    date: "30 Aug", 
    fullDate: "Saturday 30 Augustus",
    startTime: "12:00",
    endTime: "02:00"
  },
  { 
    id: 3, 
    date: "31 Aug", 
    fullDate: "Sunday 31 Augustus",
    startTime: "12:00",
    endTime: "22:00"
  }
];

let currentDay = 0; // Start with Thursday (index 0)
let currentView = 'list'; // 'timeline' or 'list'

// Utility: "12:00" → 720
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Utility: 720 → "12:00"
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Generate 15-minute interval time markers
function generateTimeMarkers(start, end, interval = 15) {
  const markers = [];
  let startMin = timeToMinutes(start);
  let endMin = timeToMinutes(end);

  if (endMin <= startMin) endMin += 24 * 60; // handle span over midnight

  for (let min = startMin; min <= endMin; min += interval) {
    markers.push(minutesToTime(min));
  }

  return markers;
}

// Sample data for all days
const allDaysData = {
  0: [ // Thursday 28 Aug (18:00-23:00)
    {
      name: "WILDLIVE",
      acts: [
        { name: "Opening Party", start: "18:00", end: "19:00" },
        { name: "Local DJs", start: "20:00", end: "21:00" },
        { name: "Late Night Vibes", start: "22:00", end: "23:00" }
      ]
    },
    {
      name: "STRAND",
      acts: [
        { name: "Beach Setup", start: "18:00", end: "19:00" },
        { name: "Sunset Session", start: "19:00", end: "21:00" },
        { name: "Evening Chill", start: "21:00", end: "23:00" }
      ]
    }
  ],
  1: [ // Friday 29 Aug - Original data
    {
      name: "WILDLIVE",
      acts: [
        { name: "Another Taste (live)", start: "14:00", end: "15:00" },
        { name: "Elephant", start: "16:00", end: "17:00" },
        { name: "Altin Gün", start: "00:00", end: "01:00" },
        { name: "Goldkimono", start: "20:00", end: "21:00" },
        { name: "SPRINTS", start: "22:00", end: "23:00" }
      ]
    },
    {
      name: "STRAND",
      acts: [
        { name: "Groefmeester K.", start: "12:00", end: "16:00" },
        { name: "Ezri Jade", start: "16:00", end: "18:00" },
        { name: "Rozaly", start: "18:00", end: "20:00" },
        { name: "Jennifer Loveless", start: "20:00", end: "22:00" },
        { name: "Moody Mehran", start: "00:00", end: "02:00" }
      ]
    },
    {
      name: "DE BAAN",
      acts: [
        { name: "Cocobolo", start: "13:00", end: "14:00" },
        { name: "Baby Berserk", start: "15:00", end: "16:00" },
        { name: "UTO", start: "17:00", end: "18:00" },
        { name: "King Hannah", start: "19:00", end: "20:00" },
        { name: "ELMER", start: "21:00", end: "21:45" },
        { name: "Girls To The Front", start: "22:45", end: "00:15" },
        { name: "DJ St. Paul", start: "00:15", end: "02:00" }
      ]
    },
    {
      name: "BUD X KAS",
      acts: [
        { name: "Polynation (live)", start: "14:30", end: "15:30" },
        { name: "Madalitso Band", start: "16:30", end: "17:30" },
        { name: "Milan W.", start: "18:30", end: "19:30" },
        { name: "Arp Frique & The Perpetual Singers", start: "20:30", end: "21:30" },
        { name: "Joep Beving & Maarten Vos", start: "22:30", end: "23:30" },
        { name: "Kiasmos Hybrid", start: "00:00", end: "02:00" }
      ]
    },
    {
      name: "VUURTOREN STRAND",
      acts: [
        { name: "Lucas Benjamin b2b Razzmic", start: "12:00", end: "14:00" },
        { name: "Dwaalgast", start: "14:00", end: "15:00" },
        { name: "Mirella Kroes", start: "15:00", end: "16:00" },
        { name: "Ascha b2b Suus", start: "16:00", end: "17:00" },
        { name: "Axefield", start: "17:00", end: "18:00" },
        { name: "INA b2b Passion DEEZ", start: "18:00", end: "19:00" },
        { name: "Nino Henning b2b Lamique", start: "19:00", end: "20:00" },
        { name: "Runningman", start: "20:00", end: "21:00" },
        { name: "EYCEE", start: "21:00", end: "22:00" },
        { name: "French II", start: "22:00", end: "23:00" }
      ]
    },
    {
      name: "RDKH",
      acts: [
        { name: "Radio De Koperen Hond", start: "12:00", end: "18:00" }
      ]
    }
  ],
  2: [ // Saturday 30 Aug (12:00-02:00)
    {
      name: "WILDLIVE",
      acts: [
        { name: "Morning Vibes", start: "12:00", end: "13:00" },
        { name: "Afternoon Delight", start: "15:00", end: "16:00" },
        { name: "Evening Stars", start: "19:00", end: "20:00" },
        { name: "Night Owls", start: "22:00", end: "23:00" },
        { name: "Late Night Special", start: "00:00", end: "01:00" },
        { name: "Early Morning", start: "01:00", end: "02:00" }
      ]
    },
    {
      name: "STRAND",
      acts: [
        { name: "Beach Morning", start: "12:00", end: "14:00" },
        { name: "Sand & Sound", start: "16:00", end: "18:00" },
        { name: "Ocean Beats", start: "20:00", end: "22:00" },
        { name: "Midnight Waves", start: "00:00", end: "02:00" }
      ]
    },
    {
      name: "DE BAAN",
      acts: [
        { name: "Track Masters", start: "13:00", end: "14:00" },
        { name: "Speed Demons", start: "15:00", end: "16:00" },
        { name: "Racing Hearts", start: "17:00", end: "18:00" },
        { name: "Finish Line", start: "19:00", end: "20:00" },
        { name: "Victory Lap", start: "21:00", end: "22:00" }
      ]
    },
    {
      name: "BUD X KAS",
      acts: [
        { name: "Garden Party", start: "14:00", end: "15:00" },
        { name: "Nature Sounds", start: "16:00", end: "17:00" },
        { name: "Outdoor Vibes", start: "18:00", end: "19:00" },
        { name: "Sunset Session", start: "20:00", end: "21:00" }
      ]
    }
  ],
  3: [ // Sunday 31 Aug (12:00-22:00)
    {
      name: "WILDLIVE",
      acts: [
        { name: "Sunday Brunch", start: "12:00", end: "13:00" },
        { name: "Lazy Afternoon", start: "15:00", end: "16:00" },
        { name: "Chill Vibes", start: "18:00", end: "19:00" },
        { name: "Closing Party", start: "20:00", end: "22:00" }
      ]
    },
    {
      name: "STRAND",
      acts: [
        { name: "Final Beach Day", start: "12:00", end: "14:00" },
        { name: "Last Sunset", start: "16:00", end: "18:00" },
        { name: "Goodbye Waves", start: "20:00", end: "22:00" }
      ]
    },
    {
      name: "DE BAAN",
      acts: [
        { name: "Final Lap", start: "13:00", end: "14:00" },
        { name: "Last Race", start: "15:00", end: "16:00" },
        { name: "Closing Ceremony", start: "17:00", end: "18:00" }
      ]
    },
    {
      name: "BUD X KAS",
      acts: [
        { name: "Farewell Garden", start: "14:00", end: "15:00" },
        { name: "Last Bloom", start: "16:00", end: "17:00" },
        { name: "Final Flowers", start: "18:00", end: "19:00" }
      ]
    }
  ]
};

// Global variables for current day's time range
let currentTimeMarkers = [];
let currentTotalColumns = 0;

// Function to get time markers for a specific day
function getTimeMarkersForDay(dayIndex) {
  const day = days[dayIndex];
  return generateTimeMarkers(day.startTime, day.endTime);
}

// Convert time to grid column index (1-based) for current day
function timeToColumnIndex(time) {
  const targetMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(days[currentDay].startTime);
  const adjustedTarget = (targetMinutes < startMinutes) ? targetMinutes + 1440 : targetMinutes;

  const timeMarkerMinutes = currentTimeMarkers.map(t => {
    const m = timeToMinutes(t);
    return (m < startMinutes) ? m + 1440 : m;
  });

  const index = timeMarkerMinutes.findIndex(m => m >= adjustedTarget);
  return (index === -1 ? timeMarkerMinutes.length - 1 : index) + 1;
}

function syncTimeMarkerLines() {
  const timeline = document.querySelector('.timetable__grid');
  const markers = document.querySelectorAll('.time-marker');

  const height = timeline.offsetHeight - 128;

  markers.forEach(marker => {
    marker.style.setProperty('--marker-line-height', `${height}px`);
  });
}

// Function to render timetable for a specific day
function renderTimetable(dayIndex) {
  // Add fade out animation to existing content
  const existingContent = timetable.querySelectorAll('.stage-name, .event-card, .time-marker-row');
  existingContent.forEach((el, index) => {
    el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
  });

  // Wait for fade out, then clear and render new content
  setTimeout(() => {
    // Clear all existing content
    existingContent.forEach(el => el.remove());

    // Update current day and time markers
    currentDay = dayIndex;
    currentTimeMarkers = getTimeMarkersForDay(dayIndex);
    currentTotalColumns = currentTimeMarkers.length;

    // Set grid template columns for new time range
    timetable.style.gridTemplateColumns = `repeat(${currentTotalColumns}, var(--timeline-grid-width))`;

    // Render new time marker row
    const timeRow = document.createElement('div');
    timeRow.className = 'time-marker-row';
    timeRow.style.display = 'contents';

    currentTimeMarkers.forEach(time => {
      const div = document.createElement('div');
      div.className = 'time-marker';

      // Add extra class if time ends in ":00" for hour markers
      if (time.endsWith(':00')) {
        div.classList.add('hour');
      } else if (time.endsWith(':15') || time.endsWith(':45')) {
        div.classList.add('quarter');
      }

      div.innerHTML = `<span>${time}</span>`;
      timeRow.appendChild(div);
    });

    timetable.appendChild(timeRow);

    // Get data for the selected day
    const stages = allDaysData[dayIndex] || [];

    // Render each stage and its events with staggered animations
    let currentRow = 2; // Row 1 = time markers

    stages.forEach((stage, stageIndex) => {
      const stageName = document.createElement('div');
      stageName.className = 'stage-name';
      stageName.innerHTML = `<span>${stage.name}</span>`;

      stageName.style.gridColumn = `1 / ${currentTotalColumns + 1}`;
      stageName.style.gridRow = currentRow++;
      stageName.style.animationDelay = `${stageIndex * 0.1}s`;
      timetable.appendChild(stageName);

      stage.acts.forEach((act, actIndex) => {
        const card = document.createElement('div');
        card.className = 'event-card';

        const startCol = timeToColumnIndex(act.start);
        const endCol = timeToColumnIndex(act.end);
        card.style.gridColumn = `${startCol} / ${endCol}`;
        card.style.gridRow = currentRow;
        card.style.animationDelay = `${(stageIndex * 0.1) + (actIndex * 0.05)}s`;

        card.innerHTML = `<div class="act__wrapper">
          <div class="act__info">
          <div class="act__name">${act.name}</div>
          <div class="act__time">${act.start} - ${act.end}</div>
        </div></div>`;

        // Add click handler for artist dialog
        card.addEventListener('click', () => {
          openArtistDialog(act.name);
        });

        timetable.appendChild(card);
      });

      currentRow++;
    });

    // Update current day display with animation
    const currentDayElement = document.querySelector('.timetable__nav--currentday');
    if (currentDayElement) {
      currentDayElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      currentDayElement.style.opacity = '0';
      currentDayElement.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        currentDayElement.textContent = days[dayIndex].fullDate;
        currentDayElement.style.opacity = '1';
        currentDayElement.style.transform = 'translateY(0)';
      }, 150);
    }

    // Update button states with animation
    const dayButtons = document.querySelectorAll('.btn__day');
    dayButtons.forEach((btn, index) => {
      if (index === dayIndex) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    // Sync time marker lines after rendering
    setTimeout(syncTimeMarkerLines, 300);
  }, 300);
}

// Function to render list view for a specific day
function renderList(dayIndex) {
  const listContainer = document.getElementById('timetable__list');
  
  // Clear existing content
  listContainer.innerHTML = '';
  
  // Get data for the selected day
  const stages = allDaysData[dayIndex] || [];
  
  // Render each stage and its acts
  stages.forEach((stage, stageIndex) => {
    const stageElement = document.createElement('div');
    stageElement.className = 'list__stage';
    stageElement.style.opacity = '0';
    stageElement.style.transform = 'translateY(20px)';
    stageElement.style.animationDelay = `${stageIndex * 0.1}s`;
    
    stageElement.innerHTML = `
      <div class="list__stage-name">${stage.name}</div>
      <div class="list__acts">
        ${stage.acts.map((act, actIndex) => `
          <div class="list__act" style="animation-delay: ${(stageIndex * 0.1) + (actIndex * 0.05)}s" data-artist="${act.name}">
            <div class="list__act-name">${act.name}</div>
            <div class="list__act-time">${act.start} - ${act.end}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Add click handlers to list acts
    const listActs = stageElement.querySelectorAll('.list__act');
    listActs.forEach(actElement => {
      actElement.addEventListener('click', () => {
        const artistName = actElement.getAttribute('data-artist');
        openArtistDialog(artistName);
      });
    });
    
    listContainer.appendChild(stageElement);
    
    // Animate in
    setTimeout(() => {
      stageElement.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      stageElement.style.opacity = '1';
      stageElement.style.transform = 'translateY(0)';
    }, 50);
  });
  
  // Update current day display
  const currentDayElement = document.querySelector('.timetable__nav--currentday');
  if (currentDayElement) {
    currentDayElement.textContent = days[dayIndex].fullDate;
  }
  
  // Update button states
  const dayButtons = document.querySelectorAll('.btn__day');
  dayButtons.forEach((btn, index) => {
    if (index === dayIndex) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

// Function to toggle between timeline and list view
function toggleView() {
  const viewToggle = document.getElementById('view-toggle');
  const timelineContainer = document.querySelector('.timetable__timeline');
  const listContainer = document.querySelector('.timetable__timelist');
  
  if (currentView === 'timeline') {
    // Switch to list view
    currentView = 'list';
    viewToggle.querySelector('span').innerHTML = '<i class="fa-sharp fa-light fa-table-list"></i> List view';
    viewToggle.classList.add('active');
    timelineContainer.classList.add('hidden');
    listContainer.classList.add('active');
    renderList(currentDay);
  } else {
    // Switch to timeline view
    currentView = 'timeline';
    viewToggle.querySelector('span').innerHTML = '<i class="fa-sharp fa-regular fa-bars-staggered"></i> Timeline view';
    viewToggle.classList.remove('active');
    timelineContainer.classList.remove('hidden');
    listContainer.classList.remove('active');
    renderTimetable(currentDay);
  }
}

// Function to handle day button clicks
function handleDayClick(dayIndex) {
  currentDay = dayIndex;
  if (currentView === 'timeline') {
    renderTimetable(dayIndex);
  } else {
    renderList(dayIndex);
  }
}

// Initialize day navigation
function initializeDayNavigation() {
  const dayButtons = document.querySelectorAll('.btn__day');
  
  dayButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dayId = parseInt(btn.getAttribute('data-day-id'));
      handleDayClick(dayId);
    });
  });
  
  // Initialize view toggle
  const viewToggle = document.getElementById('view-toggle');
  viewToggle.addEventListener('click', toggleView);
}

// Initialize the app
function initializeApp() {
  // Initialize day navigation
  initializeDayNavigation();

  // Set initial view to list and render
  currentView = 'list';
  const viewToggle = document.getElementById('view-toggle');
  const timelineContainer = document.querySelector('.timetable__timeline');
  const listContainer = document.querySelector('.timetable__timelist');
  
  // Update button text and classes
  viewToggle.querySelector('span').innerHTML = '<i class="fa-sharp fa-light fa-table-list"></i> list view';
  viewToggle.classList.add('active');
  timelineContainer.classList.add('hidden');
  listContainer.classList.add('active');
  
  // Render initial list view for current day
  renderList(currentDay);
}

const sentinel = document.querySelector('.sticky__helper');
const sticky = document.querySelector('.timetable__nav');

const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.boundingClientRect.top < 88) {
      // Sentinel has scrolled past the sticky threshold
      //console.log('Sticky is active');
      sticky.classList.add('pinned');
    } else {
      //console.log('Sticky is inactive');
      sticky.classList.remove('pinned');
    }
  },
  {
    rootMargin: '-88px 0px 0px 0px',
    threshold: 0
  }
);

observer.observe(sentinel);

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Run sync on load and resize
window.addEventListener('load', syncTimeMarkerLines);
window.addEventListener('resize', syncTimeMarkerLines);

// Artist data with detailed information
const artistData = {
  "Another Taste (live)": {
    name: "ANOTHER TASTE",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example1",
    genre: "Electronic",
    recommendation: "Based on your love for experimental electronic music",
    about: "Another Taste is a groundbreaking electronic duo known for their innovative live performances that blend traditional instruments with cutting-edge technology. Their unique sound has been described as 'where classical meets the future.'",
    venue: "WILDLIVE",
    date: "Friday 29 Augustus",
    startTime: "14:00",
    endTime: "15:00"
  },
  "Elephant": {
    name: "ELEPHANT",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example2",
    genre: "Indie Rock",
    recommendation: "Based on your indie rock preferences",
    about: "Elephant brings raw energy and powerful vocals to the stage. Their indie rock sound has captivated audiences worldwide with emotionally charged performances and unforgettable melodies.",
    venue: "WILDLIVE",
    date: "Friday 29 Augustus",
    startTime: "16:00",
    endTime: "17:00"
  },
  "Altin Gün": {
    name: "ALTIN GÜN",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example3",
    genre: "Turkish Psychedelic",
    recommendation: "Based on your world music interests",
    about: "Altin Gün is a Turkish psychedelic rock band that reimagines traditional Turkish folk music with modern psychedelic rock elements. Their unique fusion creates an immersive musical experience.",
    venue: "WILDLIVE",
    date: "Friday 29 Augustus",
    startTime: "00:00",
    endTime: "01:00"
  },
  "Goldkimono": {
    name: "GOLDKIMONO",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example4",
    genre: "Alternative Pop",
    recommendation: "Based on your alternative music taste",
    about: "Goldkimono creates atmospheric alternative pop that transports listeners to otherworldly realms. Their ethereal soundscapes and haunting vocals have earned them critical acclaim.",
    venue: "WILDLIVE",
    date: "Friday 29 Augustus",
    startTime: "20:00",
    endTime: "21:00"
  },
  "SPRINTS": {
    name: "SPRINTS",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example5",
    genre: "Post-Punk",
    recommendation: "Based on your punk rock preferences",
    about: "SPRINTS delivers high-energy post-punk with raw intensity and powerful lyrics. Their dynamic performances and infectious energy make them a must-see live act.",
    venue: "WILDLIVE",
    date: "Friday 29 Augustus",
    startTime: "22:00",
    endTime: "23:00"
  },
  "Groefmeester K.": {
    name: "GROEFMEESTER K.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example6",
    genre: "Electronic",
    recommendation: "Based on your electronic music taste",
    about: "Groefmeester K. is a master of electronic soundscapes, creating immersive beats that move both body and soul. His innovative approach to electronic music has made him a festival favorite.",
    venue: "STRAND",
    date: "Friday 29 Augustus",
    startTime: "12:00",
    endTime: "16:00"
  },
  "Ezri Jade": {
    name: "EZRI JADE",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example7",
    genre: "Alternative R&B",
    recommendation: "Based on your R&B preferences",
    about: "Ezri Jade brings soulful vocals and innovative production to create a unique blend of alternative R&B. Her powerful voice and emotional depth resonate with audiences worldwide.",
    venue: "STRAND",
    date: "Friday 29 Augustus",
    startTime: "16:00",
    endTime: "18:00"
  },
  "Rozaly": {
    name: "ROZALY",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example8",
    genre: "Pop",
    recommendation: "Based on your pop music taste",
    about: "Rozaly creates infectious pop melodies with meaningful lyrics that connect with listeners on a deep level. Her charismatic stage presence and vocal talent make her performances unforgettable.",
    venue: "STRAND",
    date: "Friday 29 Augustus",
    startTime: "18:00",
    endTime: "20:00"
  },
  "Jennifer Loveless": {
    name: "JENNIFER LOVELESS",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example9",
    genre: "House",
    recommendation: "Based on your house music preferences",
    about: "Jennifer Loveless is a rising star in the house music scene, known for her infectious beats and ability to get crowds moving. Her energetic performances create an electric atmosphere.",
    venue: "STRAND",
    date: "Friday 29 Augustus",
    startTime: "20:00",
    endTime: "22:00"
  },
  "Moody Mehran": {
    name: "MOODY MEHRAN",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example10",
    genre: "Techno",
    recommendation: "Based on your techno music taste",
    about: "Moody Mehran delivers dark, atmospheric techno that takes listeners on a journey through sound. His deep, hypnotic beats create an immersive experience that's perfect for late-night dancing.",
    venue: "STRAND",
    date: "Friday 29 Augustus",
    startTime: "00:00",
    endTime: "02:00"
  },
  "Cocobolo": {
    name: "COCOBOLO",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example11",
    genre: "Latin Pop",
    recommendation: "Based on your world music interests",
    about: "Cocobolo brings vibrant Latin rhythms and infectious energy to the stage. Their fusion of traditional Latin music with modern pop creates an irresistible dance experience.",
    venue: "DE BAAN",
    date: "Friday 29 Augustus",
    startTime: "13:00",
    endTime: "14:00"
  },
  "King Hannah": {
    name: "KING HANNAH",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example12",
    genre: "Alternative Rock",
    recommendation: "Based on your alternative rock preferences",
    about: "King Hannah creates atmospheric alternative rock with haunting vocals and cinematic soundscapes. Their music transports listeners to otherworldly realms.",
    venue: "DE BAAN",
    date: "Friday 29 Augustus",
    startTime: "19:00",
    endTime: "20:00"
  },
  "Polynation (live)": {
    name: "POLYNATION",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example13",
    genre: "Electronic",
    recommendation: "Based on your electronic music taste",
    about: "Polynation delivers innovative electronic music with live instrumentation. Their unique blend of electronic and organic sounds creates an immersive musical experience.",
    venue: "BUD X KAS",
    date: "Friday 29 Augustus",
    startTime: "14:30",
    endTime: "15:30"
  },
  "Kiasmos Hybrid": {
    name: "KIASMOS HYBRID",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=face",
    spotifyUrl: "https://open.spotify.com/artist/example14",
    genre: "Minimal Techno",
    recommendation: "Based on your techno preferences",
    about: "Kiasmos Hybrid creates hypnotic minimal techno that builds and evolves throughout their performances. Their precise sound design and rhythmic complexity make for an unforgettable experience.",
    venue: "BUD X KAS",
    date: "Friday 29 Augustus",
    startTime: "00:00",
    endTime: "02:00"
  }
};

// Create and manage the artist dialog
function createArtistDialog() {
  // Remove existing dialog if present
  const existingDialog = document.getElementById('artist-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  const dialog = document.createElement('div');
  dialog.id = 'artist-dialog';
  dialog.className = 'artist-dialog';
  dialog.innerHTML = `
    <div class="artist-dialog__overlay"></div>
    <div class="artist-dialog__content">
      <div class="artist-dialog__header">
        <div class="artist-dialog__artist-info">
          <div class="artist-dialog__image">
            <img src="" alt="Artist" id="dialog-artist-image">
          </div>
          <div class="artist-dialog__name-section">
            <h2 id="dialog-artist-name"></h2>
            <a href="#" class="artist-dialog__spotify-link" id="dialog-spotify-link">
              <i class="fa-brands fa-spotify"></i>
              LISTEN ON SPOTIFY
            </a>
          </div>
        </div>
      </div>
      
      <div class="artist-dialog__recommendation">
        <div class="artist-dialog__recommendation-content">
          <div class="artist-dialog__album-art">
            <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" alt="Album Art">
            <span>Art Pop Mix</span>
          </div>
          <div class="artist-dialog__genre-info">
            <span id="dialog-artist-genre"></span>
            <div class="artist-dialog__spotify-badge">
              <i class="fa-brands fa-spotify"></i>
              RELATED TO YOUR TOP GENRES
            </div>
          </div>
        </div>
      </div>
      
      <div class="artist-dialog__about">
        <h3>ABOUT THIS ARTIST</h3>
        <p id="dialog-artist-about"></p>
      </div>
      
      <div class="artist-dialog__event-details">
        <div class="artist-dialog__event-info">
          <span id="dialog-event-date"></span>
          <span id="dialog-event-venue"></span>
        </div>
        <div class="artist-dialog__event-times">
          <span id="dialog-event-start"></span>
          <span id="dialog-event-end"></span>
        </div>
      </div>
      
      <button class="artist-dialog__close-btn" id="dialog-close-btn">
        BACK TO TIMETABLE
      </button>
    </div>
  `;

  document.body.appendChild(dialog);

  // Add event listeners
  const overlay = dialog.querySelector('.artist-dialog__overlay');
  const closeBtn = dialog.querySelector('#dialog-close-btn');
  
  overlay.addEventListener('click', closeArtistDialog);
  closeBtn.addEventListener('click', closeArtistDialog);
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.classList.contains('active')) {
      closeArtistDialog();
    }
  });

  return dialog;
}

function openArtistDialog(artistName) {
  const artist = artistData[artistName];
  if (!artist) {
    console.warn(`No artist data found for: ${artistName}`);
    return;
  }

  const dialog = createArtistDialog();
  
  // Populate dialog with artist data
  dialog.querySelector('#dialog-artist-image').src = artist.image;
  dialog.querySelector('#dialog-artist-name').textContent = artist.name;
  dialog.querySelector('#dialog-spotify-link').href = artist.spotifyUrl;
  dialog.querySelector('#dialog-artist-genre').textContent = artist.genre;
  dialog.querySelector('#dialog-artist-about').textContent = artist.about;
  dialog.querySelector('#dialog-event-date').textContent = artist.date;
  dialog.querySelector('#dialog-event-venue').textContent = artist.venue;
  dialog.querySelector('#dialog-event-start').textContent = artist.startTime;
  dialog.querySelector('#dialog-event-end').textContent = artist.endTime;

  // Show dialog with animation
  setTimeout(() => {
    dialog.classList.add('active');
  }, 10);
}

function closeArtistDialog() {
  const dialog = document.getElementById('artist-dialog');
  if (dialog) {
    dialog.classList.remove('active');
    setTimeout(() => {
      dialog.remove();
    }, 300);
  }
}



