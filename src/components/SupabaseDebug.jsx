import { useState } from 'react'
import { testSupabaseConnection } from '../utils/testSupabaseConnection'
import { UserDataManager } from '../utils/userDataManager'
import { verifySupabaseSetup } from '../utils/verifySupabaseSetup'
import { checkRLSPolicies } from '../utils/checkRLSPolicies'

export function SupabaseDebug() {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runConnectionTest = async () => {
    setLoading(true)
    try {
      const result = await testSupabaseConnection()
      setTestResult(result)
      console.log('Connection test completed:', result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: error
      })
      console.error('Connection test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const testProfileInsert = async () => {
    setLoading(true)
    try {
      const testUser = {
        id: 'test_user_' + Date.now(),
        display_name: 'Test User',
        email: 'test@example.com',
        images: [{ url: 'https://example.com/image.jpg' }],
        country: 'US',
        product: 'premium',
        followers: { href: null, total: 100 }
      }

      console.log('Testing profile insert with:', testUser)
      const result = await UserDataManager.saveSpotifyProfile(testUser)
      setTestResult({
        success: true,
        message: 'Profile insert test successful',
        data: result
      })
      console.log('Profile insert test successful:', result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: error
      })
      console.error('Profile insert test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const runVerification = async () => {
    setLoading(true)
    try {
      const result = await verifySupabaseSetup()
      setTestResult(result)
      console.log('Verification completed:', result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: error
      })
      console.error('Verification failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPolicies = async () => {
    setLoading(true)
    try {
      const result = await checkRLSPolicies()
      setTestResult({
        success: true,
        message: 'RLS Policy check completed',
        data: result
      })
      console.log('RLS Policy check completed:', result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: error
      })
      console.error('RLS Policy check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔧 Supabase Debug Panel</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runConnectionTest}
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button 
          onClick={testProfileInsert}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Testing...' : 'Test Profile Insert'}
        </button>
        
        <button 
          onClick={runVerification}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Verifying...' : 'Verify Setup'}
        </button>
        
        <button 
          onClick={checkPolicies}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Checking...' : 'Check RLS Policies'}
        </button>
      </div>

      {testResult && (
        <div style={{
          padding: '15px',
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: testResult.success ? '#155724' : '#721c24'
        }}>
          <h4>{testResult.success ? '✅ Success' : '❌ Error'}</h4>
          <p><strong>Message:</strong> {testResult.message || testResult.error}</p>
          
          {testResult.tables && (
            <div>
              <strong>Table Status:</strong>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                {Object.entries(testResult.tables).map(([table, status]) => (
                  <li key={table}>
                    {status ? '✅' : '❌'} {table}: {status ? 'OK' : 'Error'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {testResult.data && (
            <div>
              <strong>Data:</strong>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}
          
          {testResult.details && (
            <div>
              <strong>Details:</strong>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
