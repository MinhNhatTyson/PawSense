import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PawLogo } from '../components/PawLogo'
import { Sidebar } from '../components/Sidebar'

export function EditProfilePage() {
  const { user, updateProfile, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  const [fullName, setFullName]               = useState(user?.profile?.fullName || '')
  const [phone, setPhone]                     = useState(user?.profile?.phone || '')
  const [clinicName, setClinicName]           = useState(user?.profile?.clinicName || '')
  const [address, setAddress]                 = useState(user?.profile?.address || '')
  const [specialization, setSpecialization]   = useState(user?.profile?.specialization || '')

  if (!user) return <div className="loading-screen">Loading…</div>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await updateProfile({
        fullName:       fullName || undefined,
        phone:          phone || undefined,
        clinicName:     clinicName || undefined,
        address:        address || undefined,
        specialization: specialization || undefined,
      })
      setSuccess('Profile updated successfully!')
      setTimeout(() => navigate('/profile'), 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="main-content">
        <div className="page-header animate-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
            <Link to="/profile" className="btn btn-ghost" style={{ width: 'auto', padding: '6px 10px' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </Link>
          </div>
          <h1 className="page-title">Edit Profile</h1>
          <p className="page-subtitle">Update your personal and professional details</p>
        </div>

        <div className="form-card animate-in animate-in-delay-1">
          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Personal information</div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  disabled={isLoading}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84 90 000 0000"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Clinic Street, Ho Chi Minh City"
                disabled={isLoading}
              />
            </div>

            {user.role === 'VET' && (
              <>
                <div className="form-section-title">Clinic details</div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="clinicName">Clinic / Organization</label>
                    <input
                      id="clinicName"
                      type="text"
                      className="form-input"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="City Animal Hospital"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="specialization">Specialization</label>
                    <input
                      id="specialization"
                      type="text"
                      className="form-input"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Feline Medicine"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }}>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', flex: 1 }} disabled={isLoading}>
                {isLoading && <span className="spinner" />}
                {isLoading ? 'Saving…' : 'Save changes'}
              </button>
              <Link to="/profile" className="btn btn-secondary" style={{ width: 'auto' }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}