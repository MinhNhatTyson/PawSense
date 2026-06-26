import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PawLogoLight } from '../components/PawLogo'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function GoogleSelectRolePage() {
  const [role, setRole] = useState<'VET' | 'CUSTOMER'>('VET')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const { handleGoogleCallback } = useAuth()
  const navigate = useNavigate()

  const tempToken = searchParams.get('temp')

  if (!tempToken) {
    navigate('/login')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/google/complete-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      await handleGoogleCallback(data.token)
      navigate('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
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
              One last step<br />
              <em>before you begin</em>
            </h1>
            <p>
              Tell us how you'll be using PawSense so we can set up the right experience for you.
            </p>
          </div>
        </div>
        <div className="auth-features">
          <div className="auth-feature-item">Veterinarians get full clinical tools</div>
          <div className="auth-feature-item">Pet owners get a personalised dashboard</div>
          <div className="auth-feature-item">You can always contact support to change roles</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <div className="auth-card animate-in" style={{ maxWidth: 460 }}>
          <div className="auth-card-header">
            <h2>Choose your role</h2>
            <p>How will you be using PawSense?</p>
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
            <div className="form-field animate-in animate-in-delay-1">
              <div className="role-selector" style={{ gridTemplateColumns: '1fr', gap: 12 }}>

                {/* VET option */}
                <div className="role-option">
                  <input
                    type="radio"
                    id="role-vet"
                    name="role"
                    value="VET"
                    checked={role === 'VET'}
                    onChange={() => setRole('VET')}
                  />
                  <label
                    htmlFor="role-vet"
                    className="role-option-label"
                    style={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '16px 20px',
                      gap: 6,
                      border: role === 'VET' ? '2px solid var(--green-sage)' : '2px solid var(--warm-white)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM3 17c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M14 10v4M12 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>Veterinarian</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
                      Access clinical tools, disease library, treatment protocols, and medicine management.
                    </span>
                  </label>
                </div>

                {/* CUSTOMER option */}
                <div className="role-option">
                  <input
                    type="radio"
                    id="role-customer"
                    name="role"
                    value="CUSTOMER"
                    checked={role === 'CUSTOMER'}
                    onChange={() => setRole('CUSTOMER')}
                  />
                  <label
                    htmlFor="role-customer"
                    className="role-option-label"
                    style={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '16px 20px',
                      gap: 6,
                      border: role === 'CUSTOMER' ? '2px solid var(--green-sage)' : '2px solid var(--warm-white)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM3 17c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>Pet Owner</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
                      Browse the knowledge base and manage your pets' health information.
                    </span>
                  </label>
                </div>

              </div>
            </div>

            <div className="animate-in animate-in-delay-2" style={{ marginTop: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading && <span className="spinner" />}
                {loading ? 'Setting up your account…' : 'Continue to PawSense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}