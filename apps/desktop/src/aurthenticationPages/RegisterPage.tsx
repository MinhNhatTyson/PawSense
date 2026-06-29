import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PawLogoLight } from '../components/PawLogo'

export function RegisterPage() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole]             = useState<'VET' | 'CUSTOMER'>('VET')
  const [fullName, setFullName]     = useState('')
  const [phone, setPhone]           = useState('')
  const [clinicName, setClinicName] = useState('')
  const [address, setAddress]       = useState('')
  const [specialization, setSpecialization] = useState('')
  const [error, setError]           = useState('')
  const { register, isLoading }     = useAuth()
  const navigate                    = useNavigate()

  // Simple password strength
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await register(email, password, role, {
        fullName:       fullName || undefined,
        phone:          phone || undefined,
        clinicName:     clinicName || undefined,
        address:        address || undefined,
        specialization: specialization || undefined,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <PawLogoLight size={40} />
            <span className="auth-brand-name">Paw<span>Sense</span></span>
          </div>
          <div className="auth-headline">
            <h1>
              Join a community of<br />
              <em>dedicated vets</em>
            </h1>
            <p>
              Set up your professional profile and gain access to PawSense's full suite of veterinary management tools.
            </p>
          </div>
        </div>

        <div className="auth-features">
          <div className="auth-feature-item">Complete in under 2 minutes</div>
          <div className="auth-feature-item">Veterinarian & pet owner accounts</div>
          <div className="auth-feature-item">Clinic profile setup included</div>
          <div className="auth-feature-item">HIPAA-conscious data handling</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right" style={{ alignItems: 'flex-start', overflowY: 'auto', paddingTop: 48, paddingBottom: 48 }}>
        <div className="auth-card animate-in" style={{ maxWidth: 480 }}>
          <div className="auth-card-header">
            <h2>Create account</h2>
            <p>Fill in your details to get started</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Account type */}
            <div className="form-field animate-in animate-in-delay-1">
              <label className="form-label">Account type</label>
              <div className="role-selector">
                <div className="role-option">
                  <input
                    type="radio"
                    id="role-vet"
                    name="role"
                    value="VET"
                    checked={role === 'VET'}
                    onChange={() => setRole('VET')}
                  />
                  <label className="role-option-label" htmlFor="role-vet">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1a3 3 0 100 6 3 3 0 000-6zM2 13c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Veterinarian
                  </label>
                </div>
                <div className="role-option">
                  <input
                    type="radio"
                    id="role-customer"
                    name="role"
                    value="CUSTOMER"
                    checked={role === 'CUSTOMER'}
                    onChange={() => setRole('CUSTOMER')}
                  />
                  <label className="role-option-label" htmlFor="role-customer">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 14s-1-1 0-3 4.5-3 6-3 5 1 6 3 0 3 0 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Pet Owner
                  </label>
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div className="form-section-title animate-in animate-in-delay-1">Personal information</div>

            <div className="form-row animate-in animate-in-delay-1">
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
                <label className="form-label" htmlFor="phone">Phone</label>
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

            <div className="form-field animate-in animate-in-delay-2">
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

            {/* Vet-specific fields */}
            {role === 'VET' && (
              <>
                <div className="form-section-title animate-in">Clinic details</div>

                <div className="form-row animate-in">
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

            {/* Credentials */}
            <div className="form-section-title animate-in animate-in-delay-2">Login credentials</div>

            <div className="form-field animate-in animate-in-delay-2">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.name@clinic.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="form-row animate-in animate-in-delay-3">
              <div className="form-field">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {password && (
                  <div className="password-strength" style={{ marginTop: 8 }}>
                    <div className={`strength-bar ${strength >= 1 ? 'filled-' + (strength === 1 ? 'weak' : strength === 2 ? 'ok' : 'strong') : ''}`} />
                    <div className={`strength-bar ${strength >= 2 ? 'filled-' + (strength === 2 ? 'ok' : 'strong') : ''}`} />
                    <div className={`strength-bar ${strength >= 3 ? 'filled-strong' : ''}`} />
                  </div>
                )}
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="confirm">Confirm password</label>
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
                  style={confirmPassword && confirmPassword !== password ? { borderColor: 'var(--error)' } : {}}
                />
              </div>
            </div>

            <div className="animate-in animate-in-delay-4" style={{ marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading && <span className="spinner" />}
                {isLoading ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>
<div className="form-divider">
  <span>or</span>
</div>


<a href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
  className="btn btn-secondary"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    textDecoration: 'none',
    marginTop: 0,
  }}
>
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.2-2.7-.5-3z" fill="#FFC107"/>
    <path d="M6.3 14.7l7 5.1C15.2 16.5 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.2-17.7 10.7z" fill="#FF3D00"/>
    <path d="M24 44c5.5 0 10.5-2 14.3-5.2l-6.6-5.6C29.7 35 27 36 24 36c-6 0-11.1-4-12.9-9.5l-7 5.4C7.9 39.9 15.4 44 24 44z" fill="#4CAF50"/>
    <path d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-5 6.3l6.6 5.6C41.4 37.1 44 31 44 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
  </svg>
  Continue with Google
</a>
          <div className="auth-footer-link animate-in animate-in-delay-5">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}