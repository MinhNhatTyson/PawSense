import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Profile.css'

export function EditProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [fullName, setFullName] = useState(user?.profile?.fullName || '')
  const [phone, setPhone] = useState(user?.profile?.phone || '')
  const [clinicName, setClinicName] = useState(user?.profile?.clinicName || '')
  const [address, setAddress] = useState(user?.profile?.address || '')
  const [specialization, setSpecialization] = useState(user?.profile?.specialization || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await updateProfile({
        fullName: fullName || undefined,
        phone: phone || undefined,
        clinicName: clinicName || undefined,
        address: address || undefined,
        specialization: specialization || undefined,
      })
      setSuccess('Profile updated successfully!')
      setTimeout(() => navigate('/profile'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed')
    }
  }

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Edit Profile</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State"
              disabled={isLoading}
            />
          </div>

          {user.role === 'VET' && (
            <>
              <div className="form-group">
                <label htmlFor="clinicName">Clinic/Organization Name</label>
                <input
                  id="clinicName"
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Your clinic name"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <input
                  id="specialization"
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., Feline Medicine, Surgery"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
