"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

type AllowedRole = 'admin' | 'manager' | 'employee' | 'all'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: AllowedRole[]
}

export default function ProtectedRoute({ children, allowedRoles = ['all'] }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Wait for auth check to complete
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      console.log('🔒 No user found, redirecting to login')
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes('all')) {
      const userRole = user.role.toLowerCase()
      const hasPermission = allowedRoles.some(role => {
        if (role === 'admin') {
          return userRole === 'admin'
        }
        if (role === 'manager') {
          return userRole === 'manager' || userRole === 'admin'
        }
        if (role === 'employee') {
          return userRole === 'employee' || userRole === 'manager' || userRole === 'admin'
        }
        return false
      })

      if (!hasPermission) {
        console.log(`🔒 User role "${userRole}" not allowed. Required: ${allowedRoles.join(', ')}`)
        router.push('/unauthorized')
        return
      }
    }
  }, [user, loading, router, pathname, allowedRoles])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not authorized
  if (!user) {
    return null
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes('all')) {
    const userRole = user.role.toLowerCase()
    const hasPermission = allowedRoles.some(role => {
      if (role === 'admin') return userRole === 'admin'
      if (role === 'manager') return userRole === 'manager' || userRole === 'admin'
      if (role === 'employee') return userRole === 'employee' || userRole === 'manager' || userRole === 'admin'
      return false
    })

    if (!hasPermission) {
      return null
    }
  }

  return <>{children}</>
}
