"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, TrendingUp, CheckCircle, XCircle, AlertCircle, LogIn, LogOut, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

type AttendanceRecord = {
  id: string
  employee_id: string
  date: string
  check_in_time: string
  check_out_time: string | null
  status: string
  notes: string | null
}

export default function EmployeeAttendancePage() {
  const { user, isEmployee } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [clockingIn, setClockingIn] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    rate: 0
  })

  // Redirect if not employee
  useEffect(() => {
    if (!isEmployee) {
      router.push('/dashboard')
    }
  }, [isEmployee, router])

  // Fetch employee ID and attendance data
  useEffect(() => {
    if (user) {
      fetchEmployeeId()
    }
  }, [user])

  useEffect(() => {
    if (employeeId) {
      fetchTodayAttendance()
      fetchRecentAttendance()
      calculateStats()
    }
  }, [employeeId])

  const fetchEmployeeId = async () => {
    try {
      const response = await api.getEmployees()
      const empData = response.data?.find((e: any) => e.userId === user?.id)
      
      if (!empData) throw new Error('Employee record not found')
      setEmployeeId(empData.id)
    } catch (error) {
      console.error('Error fetching employee ID:', error)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await api.getAttendanceByEmployee(employeeId!)
      const todayAtt = response.data?.find((a: any) => a.date.startsWith(today))
      
      setTodayRecord(todayAtt || null)
    } catch (error) {
      console.error('Error fetching today attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentAttendance = async () => {
    try {
      const response = await api.getAttendanceByEmployee(employeeId!)
      const sortedData = (response.data || []).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 10)
      
      setRecentRecords(sortedData)
    } catch (error) {
      console.error('Error fetching recent attendance:', error)
    }
  }

  const calculateStats = async () => {
    try {
      const response = await api.getAttendanceByEmployee(employeeId!)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const records = (response.data || []).filter((r: any) => 
        new Date(r.date) >= thirtyDaysAgo
      )
      
      const present = records.filter((r: any) => 
        r.status === 'On Time' || r.status === 'Present' || r.status === 'Late'
      ).length
      const late = records.filter((r: any) => r.status === 'Late').length
      const absent = records.filter((r: any) => r.status === 'Absent').length
      const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0

      setStats({ present, absent, late, rate })
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  const handleClockIn = async () => {
    if (!employeeId) return

    setClockingIn(true)
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5) // HH:MM format
      
      // Check if already clocked in today
      if (todayRecord) {
        alert('You have already clocked in today!')
        return
      }

      // Determine status based on time (on-time if before 9:00 AM)
      const hour = now.getHours()
      const minute = now.getMinutes()
      const isLate = hour > 9 || (hour === 9 && minute > 0)
      const status = isLate ? 'late' : 'on-time'

      await api.clockIn(employeeId)

      alert('Clocked in successfully!')
      fetchTodayAttendance()
      fetchRecentAttendance()
      calculateStats()
    } catch (error) {
      console.error('Error clocking in:', error)
      alert('Failed to clock in. Please try again.')
    } finally {
      setClockingIn(false)
    }
  }

  const handleClockOut = async () => {
    if (!employeeId) return

    setClockingOut(true)
    try {
      await api.clockOut(employeeId)

      alert('Clocked out successfully!')
      fetchTodayAttendance()
      fetchRecentAttendance()
    } catch (error) {
      console.error('Error clocking out:', error)
      alert('Failed to clock out. Please try again.')
    } finally {
      setClockingOut(false)
    }
  }

  const calculateWorkingHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn) return '0h 0m'
    
    if (!checkOut) {
      const now = new Date()
      const [inHour, inMin] = checkIn.split(':').map(Number)
      const checkInDate = new Date()
      checkInDate.setHours(inHour, inMin, 0)
      
      const diff = now.getTime() - checkInDate.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      return `${hours}h ${minutes}m`
    }

    const [inHour, inMin] = checkIn.split(':').map(Number)
    const [outHour, outMin] = checkOut.split(':').map(Number)
    
    const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return `${hours}h ${minutes}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (!isEmployee) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Attendance</h1>
        {todayRecord ? (
          todayRecord.check_out_time ? (
            <Badge variant="default" className="bg-zinc-700 text-white text-base px-4 py-2">
              Already Clocked Out Today
            </Badge>
          ) : (
            <Button 
              onClick={handleClockOut}
              disabled={clockingOut}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {clockingOut ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Clock Out
            </Button>
          )
        ) : (
          <Button 
            onClick={handleClockIn}
            disabled={clockingIn}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {clockingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            Clock In
          </Button>
        )}
      </div>

      {/* Today's Status */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Today's Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Clock In</p>
              <p className="text-2xl font-bold text-white">
                {todayRecord?.check_in_time || '--:--'}
              </p>
              {todayRecord && (
                <Badge 
                  variant="default" 
                  className={todayRecord.status === 'on-time' ? 'bg-green-600' : 'bg-yellow-600'}
                >
                  {todayRecord.status === 'on-time' ? 'On Time' : 'Late'}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Clock Out</p>
              <p className="text-2xl font-bold text-zinc-400">
                {todayRecord?.check_out_time || '--:--'}
              </p>
              <Badge variant="secondary">
                {todayRecord?.check_out_time ? 'Completed' : 'Not Yet'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Working Hours</p>
              <p className="text-2xl font-bold text-white">
                {todayRecord ? calculateWorkingHours(todayRecord.check_in_time, todayRecord.check_out_time) : '0h 0m'}
              </p>
              <Badge variant="outline">
                {todayRecord && !todayRecord.check_out_time ? 'In Progress' : 'Completed'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Status</p>
              <p className="text-2xl font-bold text-white">
                {todayRecord ? 'Present' : 'Not Clocked In'}
              </p>
              <Badge variant="default" className={todayRecord ? 'bg-blue-600' : 'bg-zinc-700'}>
                {todayRecord ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-zinc-400">Present Days</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.present}</p>
            <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-zinc-400">Absent Days</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.absent}</p>
            <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <p className="text-sm text-zinc-400">Late Arrivals</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.late}</p>
            <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-zinc-400">Attendance Rate</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.rate}%</p>
            <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Clock In</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Clock Out</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Working Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.length > 0 ? (
                  recentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3 px-4 text-white">{formatDate(record.date)}</td>
                      <td className="py-3 px-4 text-zinc-400">{record.check_in_time}</td>
                      <td className="py-3 px-4 text-zinc-400">{record.check_out_time || '--:--'}</td>
                      <td className="py-3 px-4 text-white font-medium">
                        {calculateWorkingHours(record.check_in_time, record.check_out_time)}
                      </td>
                      <td className="py-3 px-4">
                        {record.status === 'on-time' && (
                          <Badge variant="default" className="bg-green-600">On Time</Badge>
                        )}
                        {record.status === 'late' && (
                          <Badge variant="default" className="bg-yellow-600">Late</Badge>
                        )}
                        {record.status === 'absent' && (
                          <Badge variant="default" className="bg-red-600">Absent</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Leave Balance */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Annual Leave</span>
                <span className="text-white font-semibold">12 days</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Sick Leave</span>
                <span className="text-white font-semibold">3 days</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Personal Leave</span>
                <span className="text-white font-semibold">2 days</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "20%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
