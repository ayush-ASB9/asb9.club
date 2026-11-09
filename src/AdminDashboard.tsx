import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [applications, setApplications] = useState([])
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
        setIsAuthenticated(true)
        setError('')
      } else {
        setError('Invalid admin token')
      }
    } catch (e) {
      setError('Failed to fetch applications')
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        fontFamily: 'monospace', 
        padding: '40px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#fff' 
      }}>
        <h2 style={{ marginBottom: '20px' }}>ASB9 Admin</h2>
        <input 
          type="password" 
          placeholder="Admin Token" 
          value={token} 
          onChange={(e) => setToken(e.target.value)}
          style={{ 
            padding: '10px', 
            width: '300px', 
            marginBottom: '10px', 
            border: '1px solid #ccc',
            fontFamily: 'monospace'
          }} 
        />
        <button 
          onClick={fetchApplications}
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer', 
            backgroundColor: '#000', 
            color: '#fff', 
            border: 'none',
            fontFamily: 'monospace'
          }}
        >
          Enter
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    )
  }

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '40px', 
      backgroundColor: '#fff',
      color: '#000' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>Waitlist Applications</h1>
        <button 
          onClick={() => { setIsAuthenticated(false); setToken(''); }} 
          style={{ padding: '5px 10px', cursor: 'pointer', fontFamily: 'monospace' }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Signal</th>
              <th style={{ padding: '12px' }}>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', color: '#666' }}>{new Date(app.submitted_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{app.name}</td>
                <td style={{ padding: '12px' }}>{app.email}</td>
                <td style={{ padding: '12px', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{app.signal}</td>
                <td style={{ padding: '12px', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{app.contribution}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && <p style={{ textAlign: 'center', marginTop: '40px' }}>No applications yet.</p>}
      </div>
    </div>
  )
}
