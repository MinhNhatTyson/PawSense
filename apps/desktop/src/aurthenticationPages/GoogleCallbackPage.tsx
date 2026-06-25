import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const { handleGoogleCallback } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error || !token) {
      navigate('/login?error=google_failed')
      return
    }

    handleGoogleCallback(token).then(() => {
      navigate('/dashboard')
    }).catch(() => {
      navigate('/login?error=google_failed')
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'var(--font-body)',
    }}>
      <span className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Signing you in…</p>
    </div>
  )
}