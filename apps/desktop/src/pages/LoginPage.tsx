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

          <div className="auth-footer-link animate-in animate-in-delay-4">
            New to PawSense?{' '}
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}