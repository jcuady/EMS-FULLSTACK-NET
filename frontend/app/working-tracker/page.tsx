"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  Calendar,
  TrendingUp,
  Loader2,
  Activity
} from "lucide-react"

type AttendanceRecord = {
  id: string
  date: string
  clockIn: string
  clockOut?: string
  status: string
  hoursWorked?: number
  notes?: string
}

export default function WorkingTrackerPage() {
  const { user, isEmployee } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [clockedIn, setClockedIn] = useState(false)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [weekRecords, setWeekRecords] = useState<AttendanceRecord[]>([])
  const [notes, setNotes] = useState("")
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Redirect if not employee
  useEffect(() => {
    if (!isEmployee) {
      router.push('/dashboard')
    }
  }, [isEmployee, router])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch employee data and attendance
  useEffect(() => {
    if (user && isEmployee) {
      fetchEmployeeData()
    }
  }, [user, isEmployee])

  const fetchEmployeeData = async () => {
    try {
      // Get employee ID from user
      const empResponse = await api.getEmployees()
      const empData = empResponse.data?.find((e: any) => e.userId === user?.id)
      
      if (!empData) throw new Error('Employee record not found')
      setEmployeeId(empData.id)

      // Get attendance records
      const attResponse = await api.getAttendanceByEmployee(empData.id)
      const records = attResponse.data || []

      // Filter for today
      const today = new Date().toISOString().split('T')[0]
      const todayAtt = records.find((r: any) => r.date.startsWith(today))
      
      if (todayAtt) {
        setTodayRecord(todayAtt)
        setClockedIn(!!todayAtt.clockIn && !todayAtt.clockOut)
      }

      // Get this week's records
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date)
        return recordDate >= weekStart
      })
      setWeekRecords(weekRecords)
    } catch (error) {
      console.error('Error fetching employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async () => {
    if (!employeeId) return
    
    setActionLoading(true)
    try {
      await api.clockIn(employeeId, { notes })
      setNotes("")
      await fetchEmployeeData()
    } catch (error) {
      console.error('Error clocking in:', error)
      alert('Failed to clock in')
    } finally {
      setActionLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!employeeId || !todayRecord) return
    
    setActionLoading(true)
    try {
      await api.clockOut(employeeId, { notes })
      setNotes("")
      await fetchEmployeeData()
    } catch (error) {
      console.error('Error clocking out:', error)
      alert('Failed to clock out')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateTodayHours = () => {
    if (!todayRecord?.clockIn) return "0:00"
    
    const clockInTime = new Date(todayRecord.clockIn)
    const endTime = todayRecord.clockOut ? new Date(todayRecord.clockOut) : new Date()
    const diffMs = endTime.getTime() - clockInTime.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  const calculateWeeklyHours = () => {
    const total = weekRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)
    return total.toFixed(1)
  }

  const calculateWeeklyDays = () => {
    return weekRecords.filter(r => r.status === 'present' || r.status === 'late').length
  }

  const getStatusInfo = () => {
    if (!clockedIn) {
      return {
        text: "Not Clocked In",
        color: "bg-zinc-600",
        icon: Clock
      }
    }
    return {
      text: "Working",
      color: "bg-green-600",
      icon: Activity
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

  const statusInfo = getStatusInfo()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Working Tracker</h1>
        <Badge className={statusInfo.color} variant="default">
          <statusInfo.icon className="w-4 h-4 mr-2" />
          {statusInfo.text}
        </Badge>
      </div>

      {/* Current Time Display */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-700">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-blue-100 text-lg mb-2">{formatDate(currentTime)}</p>
            <p className="text-6xl md:text-8xl font-bold text-white mb-4 font-mono">
              {formatTime(currentTime)}
            </p>
            <p className="text-blue-100 text-sm">
              {clockedIn ? `Clocked in at ${todayRecord?.clockIn ? new Date(todayRecord.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}` : 'Ready to start your day?'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Hours Today</p>
                <p className="text-3xl font-bold text-white">{calculateTodayHours()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Days This Week</p>
                <p className="text-3xl font-bold text-white">{calculateWeeklyDays()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Weekly Hours</p>
                <p className="text-3xl font-bold text-white">{calculateWeeklyHours()}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clock In/Out Actions */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Time Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Add any notes about your shift..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!clockedIn ? (
              <Button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white h-16 text-lg"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                Clock In
              </Button>
            ) : (
              <Button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white h-16 text-lg"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5 mr-2" />
                )}
                Clock Out
              </Button>
            )}

            <Button
              variant="outline"
              disabled
              className="border-zinc-700 hover:bg-zinc-800 h-16 text-lg"
            >
              <Coffee className="w-5 h-5 mr-2" />
              Break (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Timeline */}
      {todayRecord && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayRecord.clockIn && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-full">
                    <LogIn className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Clocked In</p>
                    <p className="text-sm text-zinc-400">
                      {new Date(todayRecord.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge className="bg-green-600">Start</Badge>
                </div>
              )}

              {todayRecord.clockOut && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-600/20 rounded-full">
                    <LogOut className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Clocked Out</p>
                    <p className="text-sm text-zinc-400">
                      {new Date(todayRecord.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge className="bg-red-600">End</Badge>
                </div>
              )}

              {todayRecord.notes && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-1">Notes:</p>
                  <p className="text-white">{todayRecord.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Summary */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">This Week's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {weekRecords.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No attendance records for this week</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Clock In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Clock Out</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {weekRecords.map((record) => (
                    <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3 px-4 text-white">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {record.clockIn ? new Date(record.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {record.clockOut ? new Date(record.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          record.status === 'present' ? 'bg-green-600' :
                          record.status === 'late' ? 'bg-yellow-600' :
                          record.status === 'absent' ? 'bg-red-600' : 'bg-zinc-600'
                        }>
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
