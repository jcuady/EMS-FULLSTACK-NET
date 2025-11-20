"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-100">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-zinc-400">
            You don't have permission to access this page.
            {user && (
              <>
                <br />
                <span className="text-sm mt-2 block">
                  Your role: <span className="font-medium text-zinc-300 capitalize">{user.role}</span>
                </span>
              </>
            )}
          </p>

          <div className="space-y-2">
            <Button
              onClick={() => router.back()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push(user?.role === 'admin' || user?.role === 'manager' ? '/dashboard' : '/employee/dashboard')}
              variant="outline"
              className="w-full border-zinc-700"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
