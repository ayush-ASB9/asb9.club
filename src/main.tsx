import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import CohortApplication from './CohortApplication'
import './index.css'

// The cohort application lives on application.asb9.club, with /apply as a fallback on any host.
const isApplication = window.location.hostname.startsWith('application.') || /^\/apply$/.test(window.location.pathname)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isApplication ? <CohortApplication /> : <App />}
  </React.StrictMode>,
)
