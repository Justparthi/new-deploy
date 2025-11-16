// client/src/main.jsx
import './polyfills.js'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import StateProvider from './Utils/StateProvider.jsx'
import DashboardStateProvider from './Utils/DashboardStateProvider.jsx'
import { AuthProvider } from './Utils/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StateProvider>
        <DashboardStateProvider>
          <App />
        </DashboardStateProvider>
      </StateProvider>
    </AuthProvider>
  </React.StrictMode>,
)