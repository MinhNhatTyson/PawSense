import React, { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '../utils/storage'
import { API_URL } from '../config'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  fullName?: string
  phone?: string
  address?: string
  avatar?: string
  // Pet owners don't have clinic/specialization
}

export interface AuthUser {
  id: string
  email: string
  role: 'VET' | 'CUSTOMER'
  profile?: UserProfile
}

export interface AuthContextType {
  token: string | null
  user: AuthUser | null
  isLoading: boolean
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    profileData?: { fullName?: string; phone?: string; address?: string }
  ) => Promise<void>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  updateProfile: (profileData: {
    fullName?: string
    phone?: string
    address?: string
  }) => Promise<void>
  refreshProfile: () => Promise<void>
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const TOKEN_KEY = 'auth_token'

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Restore token on mount
  useEffect(() => {
    async function bootstrap() {
      try {
        const stored = await storage.getItem(TOKEN_KEY)
        if (stored) {
          setToken(stored)
          await fetchProfile(stored)
        }
      } catch {
        // token invalid or expired — stay logged out
      } finally {
        setIsInitializing(false)
      }
    }
    bootstrap()
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  async function fetchProfile(authToken: string) {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!res.ok) throw new Error('Session expired')
    const data = await res.json()
    setUser(data.user)
  }

  async function persistToken(newToken: string) {
    setToken(newToken)
    await storage.setItem(TOKEN_KEY, newToken)
  }

  // ── Auth actions ─────────────────────────────────────────────────────────────

  async function login(email: string, password: string) {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      await persistToken(data.token)
      setUser(data.user)
    } finally {
      setIsLoading(false)
    }
  }

  async function register(
    email: string,
    password: string,
    profileData?: { fullName?: string; phone?: string; address?: string }
  ) {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: 'CUSTOMER', // Mobile is always Pet Owner
          fullName: profileData?.fullName,
          phone: profileData?.phone,
          address: profileData?.address,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      await persistToken(data.token)
      setUser(data.user)
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    setToken(null)
    setUser(null)
    await storage.removeItem(TOKEN_KEY)
  }

  async function changePassword(currentPassword: string, newPassword: string) {
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Password change failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateProfile(profileData: {
    fullName?: string
    phone?: string
    address?: string
  }) {
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Profile update failed')
      // Refresh user state
      if (token) await fetchProfile(token)
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshProfile() {
    if (!token) return
    await fetchProfile(token)
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
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}