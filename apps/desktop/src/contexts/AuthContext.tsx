import React, { createContext, useContext, useState, useEffect } from 'react'

export interface UserProfile {
  id: string
  email: string
  role: 'VET' | 'CUSTOMER'
  profile?: {
    id: string
    fullName?: string
    phone?: string
    clinicName?: string
    address?: string
    specialization?: string
    avatar?: string
    latitude?: number | null
    longitude?: number | null
  }
}

export interface AuthContextType {
  token: string | null
  user: UserProfile | null
  isLoading: boolean
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, role: 'VET' | 'CUSTOMER', profileData?: Partial<UserProfile['profile']>) => Promise<void>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  updateProfile: (profileData: Partial<UserProfile['profile']>) => Promise<void>
  getProfile: () => Promise<void>
  handleGoogleCallback: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)  // NEW

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  useEffect(() => {
    if (token) {
      getProfile().finally(() => setIsInitializing(false))  // wait for profile
    } else {
      setIsInitializing(false)  // no token, nothing to wait for
    }
  }, [])  // only on mount — remove token dependency to avoid re-running

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Login failed')
      }
      const data = await res.json()
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('auth_token', data.token)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    role: 'VET' | 'CUSTOMER',
    profileData?: Partial<UserProfile['profile']>
  ) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          fullName: profileData?.fullName,
          phone: profileData?.phone,
          clinicName: profileData?.clinicName,
          address: profileData?.address,
          specialization: profileData?.specialization,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Registration failed')
      }
      const data = await res.json()
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('auth_token', data.token)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Password change failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData: Partial<UserProfile['profile']>) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Profile update failed')
      }
      await getProfile()
    } finally {
      setIsLoading(false)
    }
  }

  const getProfile = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      logout()
    }
  }

  const handleGoogleCallback = async (token: string) => {
  setToken(token)
  localStorage.setItem('auth_token', token)
  // Fetch profile with the new token
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to fetch profile')
    const data = await res.json()
    setUser(data.user)
  } catch (error) {
    console.error('Failed to fetch profile after Google login:', error)
    logout()
  }
}

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isInitializing,
        login,
        register,
        logout,
        changePassword,
        updateProfile,
        getProfile,
        handleGoogleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}