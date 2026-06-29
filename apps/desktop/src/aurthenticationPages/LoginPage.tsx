import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PawLogoLight } from '../components/PawLogo'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="auth-layout">
      {/* Left decorative panel */}
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <PawLogoLight size={40} />
            <span className="auth-brand-name">Paw<span>Sense</span></span>
          </div>
          <div className="auth-headline">
            <h1>
              Elevate your<br />
              <em>veterinary practice</em>
            </h1>
            <p>
              A precision-built knowledge management system designed for modern veterinary professionals.
            </p>
          </div>
        </div>

        <div className="auth-features">
          <div className="auth-feature-item">Comprehensive disease & breed knowledge base</div>
          <div className="auth-feature-item">AI-assisted diagnostic support tools</div>
          <div className="auth-feature-item">Clinical-grade data management</div>
          <div className="auth-feature-item">Secure, role-based access control</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <div className="auth-card animate-in">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your veterinary dashboard</p>
          </div>

          {error && (
            <div className="alert alert-error animate-in">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field animate-in animate-in-delay-1">
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

            <div className="form-field animate-in animate-in-delay-2">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="animate-in animate-in-delay-3">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading && <span className="spinner" />}
                {isLoading ? 'Signing in…' : 'Sign in'}
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
          
          <div className="auth-footer-link animate-in animate-in-delay-4">
            New to PawSense?{' '}
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}