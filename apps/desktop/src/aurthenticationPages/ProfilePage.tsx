import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { PawLogo } from '../components/PawLogo'
import { Sidebar } from '../components/Sidebar'

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
      <Sidebar />

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