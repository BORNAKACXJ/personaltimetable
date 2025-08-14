import { useState, useEffect } from 'react'
import { useCachedFestivalData } from '../hooks/useCachedFestivalData'

// Cache storage constants
const CACHE_KEY = 'festival_data_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export function Cache() {
  const { data, loading, error, refreshData, clearCache } = useCachedFestivalData()
  const [cacheInfo, setCacheInfo] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    // Get cache information
    const getCacheInfo = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (!cached) {
          setCacheInfo({
            exists: false,
            timestamp: null,
            age: null,
            isValid: false,
            size: 0
          })
          return
        }
        
        const { data, timestamp } = JSON.parse(cached)
        const now = Date.now()
        const age = now - timestamp
        const isValid = age < CACHE_DURATION
        const size = JSON.stringify(cached).length
        
        setCacheInfo({
          exists: true,
          timestamp,
          age,
          isValid,
          size,
          data: data ? {
            festival: data.festival,
            daysCount: data.days?.length || 0,
            totalActs: data.days?.reduce((total, day) => 
              total + (day.stages?.reduce((stageTotal, stage) => 
                stageTotal + (stage.acts?.length || 0), 0) || 0), 0) || 0
          } : null
        })
      } catch (error) {
        console.error('Error reading cache info:', error)
        setCacheInfo({
          exists: false,
          timestamp: null,
          age: null,
          isValid: false,
          size: 0,
          error: error.message
        })
      }
    }

    getCacheInfo()
    
    // Update cache info every 30 seconds
    const interval = setInterval(getCacheInfo, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleRefreshCache = async () => {
    setLastRefresh(new Date())
    await refreshData()
    // Update cache info after refresh
    setTimeout(() => {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { timestamp } = JSON.parse(cached)
        setCacheInfo(prev => ({
          ...prev,
          timestamp,
          age: Date.now() - timestamp,
          isValid: true
        }))
      }
    }, 1000)
  }

  const handleClearCache = () => {
    clearCache()
    setCacheInfo({
      exists: false,
      timestamp: null,
      age: null,
      isValid: false,
      size: 0
    })
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const formatAge = (age) => {
    if (!age) return 'N/A'
    const minutes = Math.floor(age / 60000)
    const seconds = Math.floor((age % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Cache Management</h1>
      <p>Manage the festival data cache</p>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Cache Status</h2>
        {cacheInfo ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <strong>Status:</strong> {cacheInfo.exists ? 'Exists' : 'Not found'}
            </div>
            <div>
              <strong>Valid:</strong> {cacheInfo.isValid ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Last Updated:</strong> {formatTime(cacheInfo.timestamp)}
            </div>
            <div>
              <strong>Age:</strong> {formatAge(cacheInfo.age)}
            </div>
            <div>
              <strong>Size:</strong> {formatSize(cacheInfo.size)}
            </div>
            {cacheInfo.data && (
              <>
                <div>
                  <strong>Festival:</strong> {cacheInfo.data.festival?.name || 'Unknown'}
                </div>
                <div>
                  <strong>Days:</strong> {cacheInfo.data.daysCount}
                </div>
                <div>
                  <strong>Total Acts:</strong> {cacheInfo.data.totalActs}
                </div>
              </>
            )}
            {cacheInfo.error && (
              <div style={{ color: 'red', gridColumn: '1 / -1' }}>
                <strong>Error:</strong> {cacheInfo.error}
              </div>
            )}
          </div>
        ) : (
          <p>Loading cache information...</p>
        )}
      </div>

      <div style={{ 
        background: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Cache Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleRefreshCache}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Cache'}
          </button>
          <button 
            onClick={handleClearCache}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Cache
          </button>
        </div>
        {lastRefresh && (
          <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
            Last refresh: {lastRefresh.toLocaleString()}
          </p>
        )}
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Cache Information</h2>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Cache duration: 5 minutes</li>
          <li>Cache key: <code>festival_data_cache</code></li>
          <li>Storage: Local Storage</li>
          <li>Auto-refresh: Every 30 seconds</li>
        </ul>
      </div>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#721c24'
        }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}

      {data && (
        <div style={{ 
          background: '#d1ecf1', 
          padding: '20px', 
          borderRadius: '8px'
        }}>
          <h2>Current Data</h2>
          <p><strong>Festival:</strong> {data.festival?.name}</p>
          <p><strong>Days:</strong> {data.days?.length || 0}</p>
          <p><strong>Total Acts:</strong> {
            data.days?.reduce((total, day) => 
              total + (day.stages?.reduce((stageTotal, stage) => 
                stageTotal + (stage.acts?.length || 0), 0) || 0), 0) || 0
          }</p>
        </div>
      )}
    </div>
  )
} 