"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')

  useEffect(() => {
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${apiUrl.replace('/api', '')}/health`)
      if (response.ok) {
        setStatus('connected')
      } else {
        setStatus('disconnected')
      }
    } catch (error) {
      setStatus('disconnected')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant={status === 'connected' ? 'default' : status === 'checking' ? 'secondary' : 'destructive'}
        className="flex items-center gap-2 px-3 py-2"
      >
        {status === 'checking' && (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Checking API...</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <CheckCircle className="w-3 h-3" />
            <span>.NET API Connected</span>
          </>
        )}
        {status === 'disconnected' && (
          <>
            <XCircle className="w-3 h-3" />
            <span>.NET API Offline</span>
          </>
        )}
      </Badge>
      {status === 'connected' && (
        <div className="text-xs text-zinc-500 mt-1 text-right">
          {apiUrl}
        </div>
      )}
    </div>
  )
}
