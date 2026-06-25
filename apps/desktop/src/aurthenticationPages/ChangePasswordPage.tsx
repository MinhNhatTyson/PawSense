import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PawLogo } from '../components/PawLogo'
import { Sidebar } from '../components/Sidebar'

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword]   = useState('')
  const [newPassword, setNewPassword]           = useState('')
  const [confirmPassword, setConfirmPassword]   = useState('')
  const [error, setError]                       = useState('')
  const [success, setSuccess]                   = useState('')
  const { changePassword, isLoading, user, logout } = useAuth()
  const navigate = useNavigate()

  const strength = newPassword.length === 0 ? 0
    : newPassword.length < 6 ? 1
    : newPassword.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength]
  const strengthColor = ['', 'var(--error)', 'var(--gold)', 'var(--success)'][strength]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password')
      return
    }

    try {
      await changePassword(currentPassword, newPassword)
      setSuccess('Password changed successfully! Redirecting…')
      setTimeout(() => navigate('/profile'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed')
    }
  }

  if (!user) return <div className="loading-screen">Loading…</div>

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
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Keep your account secure with a strong password</p>
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
            <div className="form-field animate-in animate-in-delay-1">
              <label className="form-label" htmlFor="current">Current password</label>
              <input
                id="current"
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="form-section-title animate-in animate-in-delay-2">New password</div>

            <div className="form-field animate-in animate-in-delay-2">
              <label className="form-label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              {newPassword && (
                <div style={{ marginTop: 8 }}>
                  <div className="password-strength">
                    <div className={`strength-bar ${strength >= 1 ? 'filled-' + (['','weak','ok','strong'][strength]) : ''}`} />
                    <div className={`strength-bar ${strength >= 2 ? 'filled-' + (['','weak','ok','strong'][strength]) : ''}`} />
                    <div className={`strength-bar ${strength >= 3 ? 'filled-strong' : ''}`} />
                  </div>
                  <span style={{ fontSize: 12, color: strengthColor, marginTop: 4, display: 'block' }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="form-field animate-in animate-in-delay-3">
              <label className="form-label" htmlFor="confirm">Confirm new password</label>
              <input
                id="confirm"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="new-password"
                style={confirmPassword && confirmPassword !== newPassword
                  ? { borderColor: 'var(--error)' }
                  : confirmPassword && confirmPassword === newPassword
                  ? { borderColor: 'var(--success)' }
                  : {}}
              />
              {confirmPassword && confirmPassword === newPassword && (
                <span style={{ fontSize: 12, color: 'var(--success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Passwords match
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }} className="animate-in animate-in-delay-4">
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', flex: 1 }} disabled={isLoading}>
                {isLoading && <span className="spinner" />}
                {isLoading ? 'Updating…' : 'Update password'}
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