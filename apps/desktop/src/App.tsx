import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { ProfilePage } from './pages/ProfilePage'
import { EditProfilePage } from './pages/EditProfilePage'
import DiseaseManagement from './DiseaseManagement'
import './App.css'

function DashboardPage() {
  const { user } = useAuth()
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome, {user?.profile?.fullName || user?.email}!</h1>
        <p>You are logged in as a {user?.role}</p>
        <nav className="dashboard-nav">
          <a href="/profile" className="nav-link">View Profile</a>
          <a href="/profile/edit" className="nav-link">Edit Profile</a>
          <a href="/change-password" className="nav-link">Change Password</a>
        </nav>
      </div>
    </div>
  )
}

function UnauthorizedPage() {
  return (
    <div className="error-container">
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <a href="/dashboard" className="btn">Go to Dashboard</a>
    </div>
  )
}

function AppContent() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" /> : <RegisterPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
