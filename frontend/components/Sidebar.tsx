"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  UserCircle,
  FileText,
  Loader2,
  CalendarCheck,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

type NavLink = {
  title: string
  href: string
  icon: any
  hasSubmenu?: boolean
}

const adminNavLinks: NavLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employee",
    href: "/employees",
    icon: Users,
    hasSubmenu: true,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: Calendar,
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
  },
  {
    title: "Leave Management",
    href: "/leaves",
    icon: CalendarCheck,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Audit Logs",
    href: "/audit",
    icon: FileText,
  },
  {
    title: "Working Tracker",
    href: "/working-tracker",
    icon: Clock,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
]

const employeeNavLinks: NavLink[] = [
  {
    title: "My Dashboard",
    href: "/employee/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    href: "/employee/profile",
    icon: UserCircle,
  },
  {
    title: "My Attendance",
    href: "/employee/attendance",
    icon: Calendar,
  },
  {
    title: "My Payslips",
    href: "/employee/payslip",
    icon: FileText,
  },
  {
    title: "My Leaves",
    href: "/leaves",
    icon: CalendarCheck,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
]

const bottomNavLinks = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/help",
    icon: HelpCircle,
  },
  {
    title: "Log Out",
    href: "/logout",
    icon: LogOut,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bg-zinc-950 border-r border-zinc-800">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      </aside>
    )
  }

  if (!user) {
    return null
  }

  const topNavLinks = (user.role === "admin" || user.role === "manager") 
    ? adminNavLinks 
    : employeeNavLinks

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bg-zinc-950 border-r border-zinc-800">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <span className="text-white font-bold text-xl">DooKa</span>
      </div>

      {/* User Info */}
      <div className="mx-4 mb-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-zinc-400 capitalize">
              {user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {topNavLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5" />
                <span>{link.title}</span>
              </div>
              {link.hasSubmenu && (
                <ChevronRight className="w-4 h-4" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <nav className="px-4 pb-6 space-y-1">
        {bottomNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <link.icon className="w-5 h-5" />
            <span>{link.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
