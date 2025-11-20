"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Calendar, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"

type AttendanceRecord = {
  id: string
  employee_id: string
  date: string
  check_in_time: string
  check_out_time: string | null
  status: string
  notes: string | null
  employees: {
    employee_code: string
    users: {
      full_name: string
    }
    departments: {
      name: string
    }
  }
}

type Employee = {
  id: string
  employee_code: string
  users: {
    full_name: string
  }[]
}

export default function AttendancePage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [formData, setFormData] = useState({
    employee_id: "",
    date: "",
    check_in_time: "",
    check_out_time: "",
    status: "on-time",
    notes: ""
  })

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/employee/dashboard')
    }
  }, [isAdmin, router])

  // Fetch attendance records
  useEffect(() => {
    fetchAttendance()
    fetchEmployees()
  }, [])

  const fetchAttendance = async () => {
    try {
      const response = await api.getAttendance()
      setRecords(response.data || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await api.getEmployees()
      setEmployees(response.data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleAddRecord = async () => {
    try {
      await api.createAttendance({
        employeeId: formData.employee_id,
        date: formData.date,
        clockIn: formData.check_in_time,
        clockOut: formData.check_out_time || null,
        status: formData.status,
        notes: formData.notes || null
      })

      alert('Attendance record added successfully!')
      setShowAddModal(false)
      resetForm()
      fetchAttendance()
    } catch (error) {
      console.error('Error adding record:', error)
      alert('Failed to add attendance record')
    }
  }

  const handleUpdateRecord = async () => {
    if (!editingRecord) return

    try {
      await api.updateAttendance(editingRecord.id, {
        employeeId: formData.employee_id,
        date: formData.date,
        clockIn: formData.check_in_time,
        clockOut: formData.check_out_time || null,
        status: formData.status,
        notes: formData.notes || null
      })

      alert('Attendance record updated successfully!')
      setEditingRecord(null)
      resetForm()
      fetchAttendance()
    } catch (error) {
      console.error('Error updating record:', error)
      alert('Failed to update attendance record')
    }
  }

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return

    try {
      await api.deleteAttendance(id)

      alert('Attendance record deleted successfully!')
      fetchAttendance()
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Failed to delete attendance record')
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: "",
      date: "",
      check_in_time: "",
      check_out_time: "",
      status: "on-time",
      notes: ""
    })
  }

  const openEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setFormData({
      employee_id: record.employee_id,
      date: record.date.split('T')[0],
      check_in_time: record.check_in_time,
      check_out_time: record.check_out_time || "",
      status: record.status,
      notes: record.notes || ""
    })
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.employees?.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employees?.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false
    
    const matchesEmployee = 
      selectedEmployee === "all" || record.employee_id === selectedEmployee

    const matchesStatus = 
      selectedStatus === "all" || record.status === selectedStatus

    const matchesDateRange = 
      (!startDate || record.date >= startDate) &&
      (!endDate || record.date <= endDate)

    return matchesSearch && matchesEmployee && matchesStatus && matchesDateRange
  })

  const stats = {
    total: records.length,
    onTime: records.filter(r => r.status === 'on-time').length,
    late: records.filter(r => r.status === 'late').length,
    absent: records.filter(r => r.status === 'absent').length
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-500" />
    }
  }

  if (!isAdmin) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Attendance Management</h1>
          <p className="text-zinc-400 mt-1">
            Track and manage employee attendance records
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="border-zinc-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              On Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.onTime}
              <span className="text-sm text-zinc-400 ml-2">
                ({stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Late
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.late}
              <span className="text-sm text-zinc-400 ml-2">
                ({stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.absent}
              <span className="text-sm text-zinc-400 ml-2">
                ({stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  placeholder="Search by employee name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_code} - {emp.users[0]?.full_name}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
              >
                <option value="all">All Status</option>
                <option value="on-time">On Time</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-zinc-400 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-zinc-400 mb-2">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Check In</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Check Out</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="py-3 px-4 text-zinc-300">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{record.employees.users.full_name}</div>
                        <div className="text-sm text-zinc-400">{record.employees.employee_code}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{record.employees.departments.name}</td>
                    <td className="py-3 px-4 text-zinc-300">{record.check_in_time}</td>
                    <td className="py-3 px-4 text-zinc-300">
                      {record.check_out_time || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          record.status === 'on-time' && "bg-green-500/20 text-green-500",
                          record.status === 'late' && "bg-yellow-500/20 text-yellow-500",
                          record.status === 'absent' && "bg-red-500/20 text-red-500"
                        )}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(record)}
                          className="border-zinc-700 hover:bg-zinc-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="border-zinc-700 hover:bg-red-900/20 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No attendance records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRecord) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-900 border-zinc-800 max-w-2xl w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingRecord ? 'Edit Attendance Record' : 'Add Attendance Record'}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingRecord(null)
                  resetForm()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Select Employee
                </label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Select an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_code} - {emp.users[0]?.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Check In Time
                  </label>
                  <Input
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Check Out Time
                  </label>
                  <Input
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="on-time">On Time</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={editingRecord ? handleUpdateRecord : handleAddRecord}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.employee_id || !formData.date || !formData.check_in_time}
                >
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingRecord(null)
                    resetForm()
                  }}
                  className="border-zinc-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
