"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type AttendanceData = {
  name: string
  value: number
  color: string
}

export function AttendanceChart() {
  const [data, setData] = useState<AttendanceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  async function fetchAttendanceData() {
    try {
      // Get attendance for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select('status')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

      if (error) throw error

      // Count by status
      const onTime = attendanceData?.filter(a => a.status === 'On Time' || a.status === 'Present').length || 0
      const late = attendanceData?.filter(a => a.status === 'Late').length || 0
      const absent = attendanceData?.filter(a => a.status === 'Absent').length || 0
      const total = attendanceData?.length || 0
      const remaining = Math.max(0, 150 - total) // Assuming ~150 expected attendance records per month

      setData([
        { name: "On Time", value: onTime, color: "#8b5cf6" },
        { name: "Late", value: late, color: "#f97316" },
        { name: "Absent", value: absent, color: "#ef4444" },
        { name: "Remaining", value: remaining, color: "#3f3f46" },
      ])
    } catch (error) {
      console.error('Error fetching attendance:', error)
      // Set default data on error
      setData([
        { name: "On Time", value: 30, color: "#8b5cf6" },
        { name: "Late", value: 6, color: "#f97316" },
        { name: "Absent", value: 4, color: "#ef4444" },
        { name: "Remaining", value: 60, color: "#3f3f46" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const present = data.slice(0, 3).reduce((sum, item) => sum + item.value, 0)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-zinc-400">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{present}</div>
              <div className="text-sm text-zinc-500">/ {total}</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {data.slice(0, 3).map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-zinc-400">
                {item.value} {item.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
