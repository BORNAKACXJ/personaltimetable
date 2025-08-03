import React from 'react'

function App() {
  console.log('🎵 App component rendering...')
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🎵 TEST - App Component is Working!</h1>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <p>If you can see this, React is working!</p>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '20px', 
        margin: '20px 0', 
        borderRadius: '8px',
        border: '2px solid #333'
      }}>
        <h3>🔍 Debug Info</h3>
        <p><strong>React Version:</strong> {React.version}</p>
        <p><strong>Component Rendered:</strong> ✅ Yes</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
      </div>
      
      <button 
        onClick={() => alert('Button click works!')}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Button Click
      </button>
    </div>
  )
}

export default App
