"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (user.role === 'admin' || user.role === 'manager') {
        router.push('/dashboard')
      } else if (user.role === 'employee') {
        router.push('/employee/dashboard')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="text-zinc-400">Loading...</div>
    </div>
  )
}
