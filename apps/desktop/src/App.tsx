import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './aurthenticationPages/LoginPage'
import { RegisterPage } from './aurthenticationPages/RegisterPage'
import { ChangePasswordPage } from './aurthenticationPages/ChangePasswordPage'
import { ProfilePage } from './aurthenticationPages/ProfilePage'
import { EditProfilePage } from './aurthenticationPages/EditProfilePage'
import { PawLogo } from './components/PawLogo'
import DiseaseManagement from './diseasePages/DiseaseManagement'
import SymptomManagement from './symptomPages/SymptomManagement'
import TreatmentManagement from './treatmentPages/TreatmentManagement'
import MedicineManagement from './medicinePages/MedicineManagement'
import './index.css'

// ── Dashboard Page (unchanged, keep the full existing component) ──
function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = (user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <PawLogo size={28} />
          <span className="sidebar-brand-name">Paw<span>Sense</span></span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Dashboard
          </Link>
          <Link to="/diseases" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Disease Library
          </Link>
          <Link to="/symptoms" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Symptom Library
          </Link>
          <Link to="/treatments" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Treatment Library
          </Link>
          <Link to="/medicines" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2h4a1 1 0 011 1v1H5V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="3" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 7v4M6 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Medicine Library
          </Link>
          <Link to="/profile" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            My Profile
          </Link>
          <Link to="/change-password" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Change Password
          </Link>
          <div style={{ flex: 1 }} />
          <button onClick={handleLogout} className="nav-item nav-danger">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.profile?.fullName || 'User'}</div>
          <div className="sidebar-user-role">{user?.role === 'VET' ? 'Veterinarian' : 'Pet Owner'}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header animate-in">
          <h1 className="page-title">
            Good morning,{' '}
            <span style={{ color: 'var(--green-sage)', fontStyle: 'italic' }}>
              {user?.profile?.fullName?.split(' ')[0] || 'Doctor'}
            </span>
          </h1>
          <p className="page-subtitle">Here's an overview of your PawSense workspace</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          {[
            { label: 'Disease Records', value: '—', icon: (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )},
            { label: 'Your Role', value: user?.role === 'VET' ? 'Veterinarian' : 'Pet Owner', icon: (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )},
            { label: 'Clinic', value: user?.profile?.clinicName || 'Not set', icon: (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 18v-5h6v5M1 8l9-6 9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )},
          ].map((stat) => (
            <div key={stat.label} className="animate-in animate-in-delay-1" style={{
              background: '#fff',
              border: '1px solid var(--warm-white)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--green-pale)',
                color: 'var(--green-forest)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 2 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-in animate-in-delay-2" style={{
          background: '#fff',
          border: '1px solid var(--warm-white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: 680,
        }}>
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 4 }}>
              Quick actions
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Navigate to the most common tasks</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            {[
              { to: '/diseases', label: 'Disease Library', description: 'Browse & manage disease records', icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )},
              { to: '/symptoms', label: 'Symptom Library', description: 'Browse & manage symptom records', icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9h10M9 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              )},
              {
                to: '/medicines',
                label: 'Medicine Library',
                description: 'Browse & manage medicine records',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M7 3h4a1 1 0 011 1v1H6V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/>
                    <rect x="3" y="5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 8v5M7 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ),
              },
              { to: '/profile', label: 'My Profile', description: 'View and update your details', icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 16c0-3.866 3.134-5 7-5s7 1.134 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )},
              { to: '/change-password', label: 'Change Password', description: 'Update your login credentials', icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="8" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )},
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--warm-white)',
                  textDecoration: 'none',
                  color: 'var(--text-body)',
                  transition: 'all 0.15s',
                  background: 'var(--ivory)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--green-sage)'
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--warm-white)'
                  e.currentTarget.style.background = 'var(--ivory)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--green-pale)',
                  color: 'var(--green-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 1 }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {action.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="animate-in animate-in-delay-3" style={{
          position: 'fixed', bottom: 32, right: 32,
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--green-pale)', border: '2px solid var(--green-sage)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500,
          color: 'var(--green-forest)', cursor: 'pointer', boxShadow: 'var(--shadow-md)',
        }}
          onClick={() => navigate('/profile')}
          title="Go to profile"
        >
          {initials}
        </div>
      </main>
    </div>
  )
}

function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream)', gap: 'var(--space-md)', fontFamily: 'var(--font-body)',
    }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text-primary)', fontWeight: 400 }}>
        Access Denied
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>You don't have permission to view this page.</p>
      <Link to="/dashboard" className="btn btn-primary" style={{ width: 'auto', marginTop: 8 }}>
        Go to Dashboard
      </Link>
    </div>
  )
}

function AppContent() {
  const { token, isInitializing } = useAuth()

  // Block rendering until auth state is resolved
  if (isInitializing) {
    return <div className="loading-screen">Loading…</div>
  }

  return (
    <Routes>
      {/* Protected library routes */}
      <Route
        path="/diseases"
        element={
          <ProtectedRoute>
            <DiseaseManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/symptoms"
        element={
          <ProtectedRoute>
            <SymptomManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/treatments"
        element={
          <ProtectedRoute>
            <TreatmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medicines"
        element={
          <ProtectedRoute>
            <MedicineManagement />
          </ProtectedRoute>
        }
      />
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
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App