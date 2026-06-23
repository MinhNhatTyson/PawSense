import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { PawLogo } from '../components/PawLogo'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return <div className="loading-screen">Loading…</div>

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = (user.profile?.fullName?.charAt(0) || user.email.charAt(0)).toUpperCase()

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <PawLogo size={28} />
          <span className="sidebar-brand-name">Paw<span>Sense</span></span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
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
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
          <Link to="/profile" className="nav-item active">
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
          <div className="sidebar-user-name">{user.profile?.fullName || 'User'}</div>
          <div className="sidebar-user-role">{user.role === 'VET' ? 'Veterinarian' : 'Pet Owner'}</div>
          <div className="sidebar-user-email">{user.email}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="page-header animate-in">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal and professional information</p>
        </div>

        <div className="profile-card animate-in animate-in-delay-1">
          {/* Avatar row */}
          <div className="profile-avatar-row">
            <div className="avatar-circle">
              {user.profile?.avatar
                ? <img src={user.profile.avatar} alt={user.profile?.fullName || 'Avatar'} />
                : initials
              }
            </div>
            <div className="profile-meta">
              <h3>{user.profile?.fullName || 'Your Name'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span className="role-pill">
                  {user.role === 'VET' ? 'Veterinarian' : 'Pet Owner'}
                </span>
                {user.profile?.specialization && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    · {user.profile.specialization}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="profile-detail-grid">
            <div className="detail-item">
              <span className="detail-item-label">Email</span>
              <span className="detail-item-value">{user.email}</span>
            </div>

            {user.profile?.phone && (
              <div className="detail-item">
                <span className="detail-item-label">Phone</span>
                <span className="detail-item-value">{user.profile.phone}</span>
              </div>
            )}

            {user.profile?.address && (
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-item-label">Address</span>
                <span className="detail-item-value">{user.profile.address}</span>
              </div>
            )}

            {user.role === 'VET' && user.profile?.clinicName && (
              <div className="detail-item">
                <span className="detail-item-label">Clinic / Organization</span>
                <span className="detail-item-value">{user.profile.clinicName}</span>
              </div>
            )}

            {user.role === 'VET' && user.profile?.specialization && (
              <div className="detail-item">
                <span className="detail-item-label">Specialization</span>
                <span className="detail-item-value">{user.profile.specialization}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="profile-actions-row">
            <Link to="/profile/edit" className="btn btn-primary" style={{ width: 'auto' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Edit Profile
            </Link>
            <Link to="/change-password" className="btn btn-secondary" style={{ width: 'auto' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Change Password
            </Link>
            <button onClick={handleLogout} className="btn btn-danger" style={{ width: 'auto' }}>
              Sign out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}