// client/src/App.jsx
import Dashboard from './Components/Dashboard/Dashboard';
import Home from './Home/Home';
import Login from './Components/Auth/Login';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from './Utils/AuthContext';
import GeminiAPITester from './Components/geminiTest.jsx';
import TranscriptViewer from './Components/DisplayTranscript.jsx';

// In your routes


export default function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public route - redirect to home if already logged in */}
        <Route 
          path='/login' 
          element={currentUser ? <Navigate to="/" replace /> : <Login />} 
        />
        
        {/* Protected routes - require authentication */}
        <Route 
          path='/' 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/room/:roomId" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/test" element={<GeminiAPITester />} />
        <Route path="/transcripts" element={<TranscriptViewer />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}