import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Profile.css'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.profile?.avatar ? (
              <img src={user.profile.avatar} alt={user.profile?.fullName || 'Profile'} />
            ) : (
              <div className="avatar-placeholder">
                {(user.profile?.fullName?.charAt(0) || user.email.charAt(0)).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info-header">
            <h1>{user.profile?.fullName || 'User'}</h1>
            <p className="role-badge">{user.role}</p>
            <p className="email">{user.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{user.email}</span>
          </div>

          {user.profile?.phone && (
            <div className="detail-row">
              <span className="label">Phone:</span>
              <span className="value">{user.profile.phone}</span>
            </div>
          )}

          {user.profile?.address && (
            <div className="detail-row">
              <span className="label">Address:</span>
              <span className="value">{user.profile.address}</span>
            </div>
          )}

          {user.role === 'VET' && (
            <>
              {user.profile?.clinicName && (
                <div className="detail-row">
                  <span className="label">Clinic:</span>
                  <span className="value">{user.profile.clinicName}</span>
                </div>
              )}

              {user.profile?.specialization && (
                <div className="detail-row">
                  <span className="label">Specialization:</span>
                  <span className="value">{user.profile.specialization}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="profile-actions">
          <Link to="/profile/edit" className="btn btn-primary">
            Edit Profile
          </Link>
          <Link to="/change-password" className="btn btn-secondary">
            Change Password
          </Link>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
