import { useState, useEffect } from 'react'
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
import CatBreedManagement from './catBreedPages/CatBreedManagement'
import { GoogleCallbackPage } from './aurthenticationPages/GoogleCallbackPage'
import { Sidebar } from './components/Sidebar'
import { GoogleSelectRolePage } from './aurthenticationPages/GoogleSelectRolePage'
import './index.css'


// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  diseases: number
  symptoms: number
  treatments: number
  medicines: number
}

// ── Animated stat card ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  loading,
  to,
  icon,
  delay = 0,
}: {
  label: string
  value: number
  loading: boolean
  to: string
  icon: React.ReactNode
  delay?: number
}) {
  return (
    <Link
      to={to}
      className="animate-in"
      style={{
        animationDelay: `${delay}s`,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        background: '#fff',
        border: '1.5px solid var(--warm-white)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        boxShadow: 'var(--shadow-sm)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--green-sage)'
        el.style.boxShadow = 'var(--shadow-md)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--warm-white)'
        el.style.boxShadow = 'var(--shadow-sm)'
        el.style.transform = 'translateY(0)'
      }}
    >
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
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-light)',
          marginBottom: 3,
        }}>
          {label}
        </div>
        <div
          className={loading ? '' : 'animate-count'}
          style={{
            fontSize: 22,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            color: loading ? 'var(--text-light)' : 'var(--text-primary)',
            letterSpacing: '-0.01em',
            minWidth: 24,
            transition: 'color 0.3s',
          }}
        >
          {loading ? '—' : value}
        </div>
      </div>
    </Link>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({ diseases: 0, symptoms: 0, treatments: 0, medicines: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        const token = localStorage.getItem('auth_token')
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

        const [d, s, t, m] = await Promise.all([
          fetch(`${API_URL}/diseases?take=1`, { headers }).then(r => r.json()),
          fetch(`${API_URL}/symptoms?take=1`, { headers }).then(r => r.json()),
          fetch(`${API_URL}/treatments?take=1`, { headers }).then(r => r.json()),
          fetch(`${API_URL}/medicines?take=1`, { headers }).then(r => r.json()),
        ])

        setStats({
          diseases: d.pagination?.total ?? 0,
          symptoms: s.pagination?.total ?? 0,
          treatments: t.pagination?.total ?? 0,
          medicines: m.pagination?.total ?? 0,
        })
      } catch {
        // silently show zeros on error
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = (user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()
  const firstName = user?.profile?.fullName?.split(' ')[0] || 'Doctor'

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <main className="main-content">
        {/* Header */}
        <div className="page-header animate-in" style={{ animationDelay: '0.05s' }}>
          <h1 className="page-title">
            Good morning,{' '}
            <span style={{ color: 'var(--green-sage)', fontStyle: 'italic' }}>
              {firstName}
            </span>
          </h1>
          <p className="page-subtitle">Here's an overview of your PawSense knowledge base</p>
        </div>

        {/* ── Stats grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}>
          <StatCard
            label="Disease Records"
            value={stats.diseases}
            loading={statsLoading}
            to="/diseases"
            delay={0.1}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
          <StatCard
            label="Symptom Records"
            value={stats.symptoms}
            loading={statsLoading}
            to="/symptoms"
            delay={0.16}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            }
          />
          <StatCard
            label="Treatment Protocols"
            value={stats.treatments}
            loading={statsLoading}
            to="/treatments"
            delay={0.22}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 10h8M10 6v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            }
          />
          <StatCard
            label="Medicine Records"
            value={stats.medicines}
            loading={statsLoading}
            to="/medicines"
            delay={0.28}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8 3h4a1 1 0 011 1v1H7V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="4" y="5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 9v5M8 11.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            }
          />
        </div>

        {/* ── Role info card ── */}
        <div
          className="animate-in"
          style={{
            animationDelay: '0.32s',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <div style={{
            background: '#fff',
            border: '1.5px solid var(--warm-white)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}>
            <div style={{
              width: 44, height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--green-pale)',
              color: 'var(--green-forest)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 3 }}>Your Role</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{user?.role === 'VET' ? 'Veterinarian' : 'Pet Owner'}</div>
            </div>
          </div>

          <div style={{
            background: '#fff',
            border: '1.5px solid var(--warm-white)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}>
            <div style={{
              width: 44, height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--green-pale)',
              color: 'var(--green-forest)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 18v-5h6v5M1 8l9-6 9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 3 }}>Clinic</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: user?.profile?.clinicName ? 'var(--text-primary)' : 'var(--text-light)', fontStyle: user?.profile?.clinicName ? 'normal' : 'italic' }}>
                {user?.profile?.clinicName || 'Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div
          className="animate-in"
          style={{
            animationDelay: '0.38s',
            background: '#fff',
            border: '1.5px solid var(--warm-white)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: 720,
          }}
        >
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 400,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}>
              Quick actions
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Jump to common tasks across your libraries
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            {[
              {
                to: '/diseases', label: 'Disease Library', description: 'Browse & manage disease records',
                icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                to: '/symptoms', label: 'Symptom Library', description: 'Browse & manage symptom records',
                icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M9 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/></svg>,
              },
              {
                to: '/treatments', label: 'Treatment Library', description: 'Browse treatment protocols',
                icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 9h8M9 5v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
              },
              {
                to: '/medicines', label: 'Medicine Library', description: 'Browse & manage medicine records',
                icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 3h4a1 1 0 011 1v1H6V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><rect x="3" y="5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M9 8v5M7 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              },
              {
                to: '/profile', label: 'My Profile', description: 'View and update your details',
                icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 16c0-3.866 3.134-5 7-5s7 1.134 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                to: '/change-password', label: 'Change Password', description: 'Update your login credentials',
                icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="8" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
            ].map((action, i) => (
              <Link
                key={action.to}
                to={action.to}
                className="animate-in"
                style={{
                  animationDelay: `${0.42 + i * 0.05}s`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--warm-white)',
                  textDecoration: 'none',
                  color: 'var(--text-body)',
                  background: 'var(--ivory)',
                  transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.18s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--green-sage)'
                  el.style.background = '#fff'
                  el.style.boxShadow = 'var(--shadow-sm)'
                  el.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--warm-white)'
                  el.style.background = 'var(--ivory)'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--green-pale)',
                  color: 'var(--green-forest)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'background 0.18s',
                }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{action.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Avatar FAB ── */}
        <div
          className="animate-scale-in"
          style={{
            animationDelay: '0.55s',
            position: 'fixed', bottom: 32, right: 32,
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--green-pale)',
            border: '2px solid var(--green-sage)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500,
            color: 'var(--green-forest)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onClick={() => navigate('/profile')}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1.08)'
            el.style.boxShadow = 'var(--shadow-lg)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1)'
            el.style.boxShadow = 'var(--shadow-md)'
          }}
          title="Go to profile"
        >
          {initials}
        </div>
      </main>
    </div>
  )
}

// ── Unauthorized ──────────────────────────────────────────────────────────────
function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream)', gap: 'var(--space-md)', fontFamily: 'var(--font-body)',
    }}>
      <h1 className="animate-in" style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text-primary)', fontWeight: 400 }}>
        Access Denied
      </h1>
      <p className="animate-in animate-in-delay-1" style={{ color: 'var(--text-muted)', fontSize: 15 }}>
        You don't have permission to view this page.
      </p>
      <Link to="/dashboard" className="btn btn-primary animate-in animate-in-delay-2" style={{ width: 'auto', marginTop: 8 }}>
        Go to Dashboard
      </Link>
    </div>
  )
}

// ── App shell ─────────────────────────────────────────────────────────────────
function AppContent() {
  const { token, isInitializing } = useAuth()

  if (isInitializing) {
    return <div className="loading-screen">Loading…</div>
  }

  return (
    <Routes>
      <Route path="/diseases" element={<ProtectedRoute><DiseaseManagement /></ProtectedRoute>} />
      <Route path="/symptoms" element={<ProtectedRoute><SymptomManagement /></ProtectedRoute>} />
      <Route path="/treatments" element={<ProtectedRoute><TreatmentManagement /></ProtectedRoute>} />
      <Route path="/medicines" element={<ProtectedRoute><MedicineManagement /></ProtectedRoute>} />
      <Route path="/cat-breeds" element={<ProtectedRoute><CatBreedManagement /></ProtectedRoute>} />
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />

      <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/auth/callback" element={<GoogleCallbackPage />} />
      <Route path="/auth/select-role" element={<GoogleSelectRolePage />} /> 
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