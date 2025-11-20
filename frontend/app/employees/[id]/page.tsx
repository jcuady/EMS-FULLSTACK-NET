"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  DollarSign,
  Edit,
  Trash2,
  Loader2,
  TrendingUp,
  Clock,
  Briefcase,
  MapPin,
  Star
} from "lucide-react"

type Employee = {
  id: string
  employeeCode: string
  userId: string
  departmentId: string
  position: string
  hireDate: string
  salary: number
  status: string
  performanceRating: number
  users: {
    fullName: string
    email: string
    phone?: string
  }
  departments: {
    name: string
  }
}

type AttendanceRecord = {
  id: string
  date: string
  clockIn: string
  clockOut?: string
  status: string
  hoursWorked?: number
}

type PayrollRecord = {
  id: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  bonuses: number
  deductions: number
  tax: number
  netSalary: number
  paymentStatus: string
}

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [payrollLoading, setPayrollLoading] = useState(false)

  useEffect(() => {
    fetchEmployeeDetails()
  }, [params.id])

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.getEmployee(params.id)
      setEmployee(response.data)
      
      // Fetch attendance and payroll in parallel
      fetchAttendance()
      fetchPayroll()
    } catch (error) {
      console.error('Error fetching employee details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendance = async () => {
    setAttendanceLoading(true)
    try {
      const response = await api.getAttendanceByEmployee(params.id)
      const records = response.data || []
      // Get last 10 records
      setAttendanceRecords(records.slice(0, 10))
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setAttendanceLoading(false)
    }
  }

  const fetchPayroll = async () => {
    setPayrollLoading(true)
    try {
      const response = await api.getPayrollByEmployee(params.id)
      const records = response.data || []
      // Get last 6 months
      setPayrollRecords(records.slice(0, 6))
    } catch (error) {
      console.error('Error fetching payroll:', error)
    } finally {
      setPayrollLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    
    try {
      await api.deleteEmployee(params.id)
      router.push('/employees')
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Failed to delete employee')
    }
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    return names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-600'
      case 'present':
        return 'bg-green-600'
      case 'paid':
        return 'bg-green-600'
      case 'late':
        return 'bg-yellow-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'absent':
        return 'bg-red-600'
      case 'inactive':
        return 'bg-red-600'
      default:
        return 'bg-zinc-600'
    }
  }

  const calculateAttendanceRate = () => {
    if (attendanceRecords.length === 0) return 0
    const presentDays = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length
    return Math.round((presentDays / attendanceRecords.length) * 100)
  }

  const calculateAverageHours = () => {
    const recordsWithHours = attendanceRecords.filter(r => r.hoursWorked)
    if (recordsWithHours.length === 0) return 0
    const totalHours = recordsWithHours.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)
    return (totalHours / recordsWithHours.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-zinc-400 mb-4">Employee not found</p>
        <Button onClick={() => router.push('/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/employees')}
          className="border-zinc-700 hover:bg-zinc-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
            onClick={() => router.push(`/employees/${params.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline"
            className="border-red-700 hover:bg-red-900 text-red-400"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Employee Header Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/avatars/employee.png" alt={employee.users.fullName} />
              <AvatarFallback className="text-2xl bg-blue-600">
                {getInitials(employee.users.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{employee.users.fullName}</h1>
              <p className="text-xl text-zinc-400 mb-3">{employee.position}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <Badge variant="default" className={getStatusColor(employee.status)}>
                  {employee.status}
                </Badge>
                <Badge variant="outline" className="border-zinc-700">
                  {employee.employeeCode}
                </Badge>
                <Badge variant="secondary">
                  {employee.departments.name}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="w-4 h-4" />
                  <span>{employee.users.email}</span>
                </div>
                {employee.users.phone && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Phone className="w-4 h-4" />
                    <span>{employee.users.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(employee.hireDate)}</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-zinc-400 mb-1">Base Salary</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(employee.salary)}</p>
              <p className="text-xs text-zinc-500 mt-1">per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Performance</p>
                <p className="text-2xl font-bold text-white">{employee.performanceRating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-white">{calculateAttendanceRate()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Avg Hours/Day</p>
                <p className="text-2xl font-bold text-white">{calculateAverageHours()}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Tenure</p>
                <p className="text-2xl font-bold text-white">
                  {Math.floor((Date.now() - new Date(employee.hireDate).getTime()) / (365 * 24 * 60 * 60 * 1000))}y
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employment Details */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Employment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-zinc-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Position</p>
                  <p className="text-white font-medium">{employee.position}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-zinc-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Department</p>
                  <p className="text-white font-medium">{employee.departments.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-zinc-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Hire Date</p>
                  <p className="text-white font-medium">{formatDate(employee.hireDate)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-zinc-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Base Salary</p>
                  <p className="text-white font-medium">{formatCurrency(employee.salary)}/month</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-zinc-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Performance Rating</p>
                  <p className="text-white font-medium">{employee.performanceRating}/5</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className={`${getStatusColor(employee.status)} mt-1`}>
                  {employee.status}
                </Badge>
                <div>
                  <p className="text-sm text-zinc-400">Employment Status</p>
                  <p className="text-white font-medium capitalize">{employee.status}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Recent Attendance</span>
            <Button 
              size="sm" 
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
              onClick={() => router.push('/attendance')}
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No attendance records found</p>
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
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3 px-4 text-white">{formatDate(record.date)}</td>
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
                        <Badge className={getStatusColor(record.status)}>
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

      {/* Payroll History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Payroll History (Last 6 Months)</span>
            <Button 
              size="sm" 
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
              onClick={() => router.push('/payroll')}
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payrollLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : payrollRecords.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No payroll records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Period</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Basic Salary</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Allowances</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Deductions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Net Salary</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((record) => (
                    <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3 px-4 text-white">
                        {getMonthName(record.month)} {record.year}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{formatCurrency(record.basicSalary)}</td>
                      <td className="py-3 px-4 text-green-400">+{formatCurrency(record.allowances + record.bonuses)}</td>
                      <td className="py-3 px-4 text-red-400">-{formatCurrency(record.deductions + record.tax)}</td>
                      <td className="py-3 px-4 text-white font-semibold">{formatCurrency(record.netSalary)}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(record.paymentStatus)}>
                          {record.paymentStatus}
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
