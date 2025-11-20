"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LogIn, Loader2, Mail, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login, user } = useAuth()

  // Demo credentials helper
  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
  }

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'manager') {
        router.push('/dashboard')
      } else {
        router.push('/employee/dashboard')
      }
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setLoading(true)
    try {
      const response = await api.login(email, password)
      
      if (response.success && response.data) {
        // Store JWT token
        localStorage.setItem('token', response.data.token)
        
        // Store user data
        login(response.data.user)
        
        // Redirect based on role
        if (response.data.user.role === 'admin' || response.data.user.role === 'manager') {
          router.push('/dashboard')
        } else {
          router.push('/employee/dashboard')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-100">
            Employee Management System
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Sign in with your credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-950 border-red-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
            <div className="bg-zinc-800 rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-300">✅ Working Demo Credentials:</p>
              <div className="space-y-2 text-xs">
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials("demo.admin@company.com", "demo123")}
                  className="w-full flex items-center justify-between p-2 bg-zinc-700/50 rounded hover:bg-zinc-600/50 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  <div>
                    <p className="text-red-400 font-medium">👨‍💼 Admin Access</p>
                    <p className="text-zinc-300 text-left">demo.admin@company.com</p>
                  </div>
                  <code className="text-zinc-400 text-[10px] bg-zinc-800 px-2 py-1 rounded">demo123</code>
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials("demo.manager@company.com", "demo123")}
                  className="w-full flex items-center justify-between p-2 bg-zinc-700/50 rounded hover:bg-zinc-600/50 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  <div>
                    <p className="text-blue-400 font-medium">👩‍💼 Manager Access</p>
                    <p className="text-zinc-300 text-left">demo.manager@company.com</p>
                  </div>
                  <code className="text-zinc-400 text-[10px] bg-zinc-800 px-2 py-1 rounded">demo123</code>
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoCredentials("demo.employee@company.com", "demo123")}
                  className="w-full flex items-center justify-between p-2 bg-zinc-700/50 rounded hover:bg-zinc-600/50 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  <div>
                    <p className="text-green-400 font-medium">👤 Employee Access</p>
                    <p className="text-zinc-300 text-left">demo.employee@company.com</p>
                  </div>
                  <code className="text-zinc-400 text-[10px] bg-zinc-800 px-2 py-1 rounded">demo123</code>
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 italic text-center">👆 Click on any credential above to auto-fill and test different user roles</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                JWT Authentication
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">.NET API</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
