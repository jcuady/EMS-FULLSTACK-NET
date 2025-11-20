"use client"

import { Search, Bell, Settings as SettingsIcon, ChevronDown, Activity, User, LogOut, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export function Topbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  async function fetchUnreadCount() {
    try {
      const response = await api.getUnreadNotificationCount()
      setUnreadCount(response.data)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  if (!user) return null

  // Get initials for avatar
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U'
    const names = name.split(' ')
    return names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-zinc-900 border-zinc-800 focus:border-primary"
            />
          </div>
        </div>

        {/* Right Side - Icons & Profile */}
        <div className="flex items-center gap-4">
          {/* API Status Indicator */}
          <Badge variant="outline" className="border-green-600 text-green-400 bg-green-950/20">
            <Activity className="w-3 h-3 mr-1.5" />
            .NET API
          </Badge>

          {/* Notification Icon */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-zinc-400" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold border-2 border-zinc-950"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </>
              )}
            </Button>
          </Link>

          {/* Settings Icon */}
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <SettingsIcon className="w-5 h-5 text-zinc-400" />
            </Button>
          </Link>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 pl-4 border-l border-zinc-800 h-auto p-2 hover:bg-zinc-800/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || user.avatarUrl || "/avatar-placeholder.png"} />
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {getInitials(user.full_name || user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-white">
                    {user.full_name || user.fullName || 'User'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {user.role === 'admin' && <Shield className="w-3 h-3 text-blue-400" />}
                    <span className="text-xs text-zinc-500 capitalize">{user.role}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-white">{user.full_name || user.fullName}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
                <Badge className="mt-1 h-5 px-2 capitalize bg-primary/20 text-primary border-primary/30">
                  {user.role}
                </Badge>
              </div>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem 
                onClick={() => router.push('/employee/profile')}
                className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem 
                onClick={logout}
                className="text-red-400 focus:bg-red-950/50 focus:text-red-300 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
