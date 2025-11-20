"use client"

import { useState, useEffect } from "react"
import { CardKPI } from "@/components/CardKPI"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Clock, DollarSign, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function EmployeeDashboardPage() {
  const { user, isEmployee } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    daysPresent: 0,
    onTimeRate: 0,
    performanceScore: 0,
    monthlySalary: 0
  })

  // Redirect if not employee
  useEffect(() => {
    if (!isEmployee) {
      router.push('/dashboard')
    }
  }, [isEmployee, router])

  useEffect(() => {
    if (user) {
      fetchEmployeeData()
    }
  }, [user])

  const fetchEmployeeData = async () => {
    try {
      // Get all employees and find the current user's employee record
      const empResponse = await api.getEmployees()
      const empData = empResponse.data?.find((e: any) => e.userId === user?.id)
      
      if (!empData) throw new Error('Employee record not found')
      setEmployeeId(empData.id)

      // Get attendance for this employee
      const attResponse = await api.getAttendanceByEmployee(empData.id)
      const attendanceData = attResponse.data || []

      // Filter for current month
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      const thisMonthAttendance = attendanceData.filter((a: any) => {
        const attDate = new Date(a.date)
        return attDate.getMonth() + 1 === currentMonth && attDate.getFullYear() === currentYear
      })

      const daysPresent = thisMonthAttendance.filter((a: any) => a.status !== 'Absent').length
      const onTimeCount = thisMonthAttendance.filter((a: any) => 
        a.status === 'On Time' || a.status === 'Present'
      ).length
      const onTimeRate = thisMonthAttendance.length ? Math.round((onTimeCount / thisMonthAttendance.length) * 100) : 0

      // Get latest payroll
      const payResponse = await api.getPayrollByEmployee(empData.id)
      const payrollData = payResponse.data || []
      const latestPayroll = payrollData.length > 0 ? payrollData[0] : null

      setStats({
        daysPresent,
        onTimeRate,
        performanceScore: empData.performanceRating || 0,
        monthlySalary: latestPayroll?.netSalary || empData.salary || 0
      })
    } catch (error) {
      console.error('Error fetching employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isEmployee) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.full_name?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'Employee'}!</h1>
        <p className="text-zinc-400">Here's your work summary for today</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardKPI
          title="Days Present"
          value={stats.daysPresent.toString()}
          description="This month"
          icon={Calendar}
        />
        <CardKPI
          title="On-Time Arrivals"
          value={`${stats.onTimeRate}%`}
          description="This month"
          icon={Clock}
        />
        <CardKPI
          title="Performance Score"
          value={stats.performanceScore.toFixed(1)}
          description="Out of 100"
          icon={TrendingUp}
        />
        <CardKPI
          title="This Month's Salary"
          value={`$${stats.monthlySalary.toLocaleString()}`}
          description="Net amount"
          icon={DollarSign}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-zinc-400">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Clock In: 09:00 AM</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Lunch Break: 12:00 PM - 1:00 PM</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Clock Out: 05:00 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Leave Balance</span>
                <span className="text-white font-semibold">12 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total Attendance</span>
                <span className="text-white font-semibold">{stats.daysPresent} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Performance</span>
                <span className="text-white font-semibold">{stats.performanceScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "09:00 AM", action: "Clocked in", date: "Today" },
              { time: "Yesterday", action: "Attendance marked", date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
              { time: "2 days ago", action: "Profile viewed", date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0">
                <div>
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-xs text-zinc-500">{activity.date}</p>
                </div>
                <span className="text-sm text-zinc-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
