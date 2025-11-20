"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'admin' | 'employee' | 'manager'

export type User = {
  id: string
  email: string
  full_name?: string
  fullName?: string
  role: UserRole
  avatar_url?: string
  avatarUrl?: string
  employeeId?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (user: User) => void
  logout: () => void
  isAdmin: boolean
  isEmployee: boolean
  isManager: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ems_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('ems_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ems_user')
    localStorage.removeItem('token') // Clear JWT token
    window.location.href = '/login' // Redirect to login
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'manager'
  const isEmployee = user?.role === 'employee'
  const isManager = user?.role === 'manager'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isEmployee,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
