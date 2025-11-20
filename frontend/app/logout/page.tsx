"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Home, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function LogoutPage() {
  const router = useRouter()
  const { logout, user } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = () => {
    setLoggingOut(true)
    
    // Clear authentication and redirect
    setTimeout(() => {
      logout()
      router.push('/login')
    }, 500)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="bg-zinc-900 border-zinc-800 max-w-md w-full">
        <CardContent className="pt-12 pb-8 px-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Logout</h1>
            <p className="text-zinc-400">
              {user ? `${user.full_name}, are you sure you want to log out?` : 'Are you sure you want to log out of your account?'}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Your session will be ended</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>You'll need to log in again to access the system</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Any unsaved changes will be lost</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {loggingOut ? 'Logging out...' : 'Yes, Logout'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loggingOut}
              variant="outline"
              className="w-full border-zinc-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-500 mb-3">
              Having trouble logging out?
            </p>
            <Button
              variant="link"
              size="sm"
              className="text-blue-400 hover:text-blue-300"
              onClick={() => router.push('/help')}
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
