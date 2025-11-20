"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CardKPI } from "@/components/CardKPI"
import { SatisfactionChart } from "@/components/SatisfactionChart"
import { AttendanceChart } from "@/components/AttendanceChart"
import { EmployeeTable } from "@/components/EmployeeTable"
import { Users, TrendingUp, Star, DollarSign } from "lucide-react"
import { api } from "@/lib/api"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    employeeCount: 0,
    attendanceRate: 0,
    avgRating: '0.0',
    payrollTotal: '$0'
  })

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/employee/dashboard')
    }
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) {
      getDashboardData()
    }
  }, [isAdmin])

  async function getDashboardData() {
    try {
      const response = await api.getDashboardStats()
      const data = response.data

      setStats({
        employeeCount: data.totalEmployees || 0,
        attendanceRate: data.attendanceRate || 0,
        avgRating: (data.averagePerformanceRating || 0).toFixed(1),
        payrollTotal: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(data.currentMonthPayroll || 0)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardKPI
          title="Total Employees"
          value={stats.employeeCount.toString()}
          description="Active employees"
          icon={Users}
        />
        <CardKPI
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          description="Last 30 days"
          icon={TrendingUp}
        />
        <CardKPI
          title="Performance Ratings"
          value={stats.avgRating}
          description="Out of 5.0"
          icon={Star}
        />
        <CardKPI
          title="Payroll Summary"
          value={stats.payrollTotal}
          description="Current month"
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SatisfactionChart />
        </div>
        <div className="lg:col-span-1">
          <AttendanceChart />
        </div>
      </div>

      {/* Employee Directory */}
      <EmployeeTable />
    </div>
  )
}
