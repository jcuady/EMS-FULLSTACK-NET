"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  DollarSign, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  TrendingUp,
  Users,
  Loader2,
  X,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"

type PayrollRecord = {
  id: string
  employee_id: string
  month: string
  year: number
  base_salary: number
  bonus: number
  deductions: number
  net_pay: number
  payment_date: string | null
  status: string
  employees: {
    employee_code: string
    users: {
      full_name: string
    }[]
    departments: {
      name: string
    }[]
  }
}

type Employee = {
  id: string
  employee_code: string
  salary: number
  users: {
    full_name: string
  }[]
}

export default function PayrollPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null)
  const [formData, setFormData] = useState({
    employee_id: "",
    month: "",
    year: new Date().getFullYear().toString(),
    base_salary: "",
    bonus: "0",
    deductions: "0",
    payment_date: "",
    status: "pending"
  })

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/employee/dashboard')
    }
  }, [isAdmin, router])

  // Fetch payroll records
  useEffect(() => {
    fetchPayroll()
    fetchEmployees()
  }, [])

  const fetchPayroll = async () => {
    try {
      const response = await api.getPayroll()
      setRecords(response.data || [])
    } catch (error) {
      console.error('Error fetching payroll:', error)
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
      const baseSalary = parseFloat(formData.base_salary)
      const bonus = parseFloat(formData.bonus)
      const deductions = parseFloat(formData.deductions)

      await api.createPayroll({
        employeeId: formData.employee_id,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        basicSalary: baseSalary,
        allowances: 0,
        bonuses: bonus,
        deductions: deductions,
        tax: 0,
        netSalary: baseSalary + bonus - deductions,
        paymentDate: formData.payment_date || null,
        paymentStatus: formData.status,
        notes: ''
      })

      alert('Payroll record added successfully!')
      setShowAddModal(false)
      resetForm()
      fetchPayroll()
    } catch (error) {
      console.error('Error adding record:', error)
      alert('Failed to add payroll record')
    }
  }

  const handleUpdateRecord = async () => {
    if (!editingRecord) return

    try {
      const baseSalary = parseFloat(formData.base_salary)
      const bonus = parseFloat(formData.bonus)
      const deductions = parseFloat(formData.deductions)

      await api.updatePayroll(editingRecord.id, {
        employeeId: formData.employee_id,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        basicSalary: baseSalary,
        allowances: 0,
        bonuses: bonus,
        deductions: deductions,
        tax: 0,
        netSalary: baseSalary + bonus - deductions,
        paymentDate: formData.payment_date || null,
        paymentStatus: formData.status,
        notes: ''
      })

      alert('Payroll record updated successfully!')
      setEditingRecord(null)
      resetForm()
      fetchPayroll()
    } catch (error) {
      console.error('Error updating record:', error)
      alert('Failed to update payroll record')
    }
  }

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payroll record?')) return

    try {
      await api.deletePayroll(id)

      alert('Payroll record deleted successfully!')
      fetchPayroll()
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Failed to delete payroll record')
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: "",
      month: "",
      year: new Date().getFullYear().toString(),
      base_salary: "",
      bonus: "0",
      deductions: "0",
      payment_date: "",
      status: "pending"
    })
  }

  const openEditModal = (record: PayrollRecord) => {
    setEditingRecord(record)
    setFormData({
      employee_id: record.employee_id,
      month: record.month,
      year: record.year.toString(),
      base_salary: record.base_salary.toString(),
      bonus: record.bonus.toString(),
      deductions: record.deductions.toString(),
      payment_date: record.payment_date ? record.payment_date.split('T')[0] : "",
      status: record.status
    })
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    if (employee) {
      setFormData({
        ...formData,
        employee_id: employeeId,
        base_salary: employee.salary.toString()
      })
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.employees?.users?.[0]?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employees?.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false
    
    const matchesEmployee = 
      selectedEmployee === "all" || record.employee_id === selectedEmployee

    const matchesMonth = 
      selectedMonth === "all" || record.month === selectedMonth

    const matchesYear = 
      record.year?.toString() === selectedYear

    return matchesSearch && matchesEmployee && matchesMonth && matchesYear
  })

  const stats = {
    total: filteredRecords.reduce((sum, r) => sum + r.net_pay, 0),
    average: filteredRecords.length > 0 ? filteredRecords.reduce((sum, r) => sum + r.net_pay, 0) / filteredRecords.length : 0,
    records: filteredRecords.length,
    paid: filteredRecords.filter(r => r.status === 'paid').length
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

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
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-white">Payroll</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payroll Management</h1>
          <p className="text-zinc-400 mt-1">
            Manage employee salaries, bonuses, and deductions • {records.length} records
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
            Add Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${stats.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Average Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${Math.round(stats.average).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.records}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats.paid}
              <span className="text-sm text-zinc-400 ml-2">
                ({stats.records > 0 ? Math.round((stats.paid / stats.records) * 100) : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
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
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
            >
              <option value="all">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Period</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Employee</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Base Salary</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Bonus</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Deductions</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Net Pay</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="py-3 px-4 text-zinc-300">
                      {record.month} {record.year}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{record.employees.users[0]?.full_name}</div>
                        <div className="text-sm text-zinc-400">{record.employees.employee_code}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-300">
                      ${record.base_salary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-green-400">
                      +${record.bonus.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-red-400">
                      -${record.deductions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      ${record.net_pay.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium capitalize",
                        record.status === 'paid' && "bg-green-500/20 text-green-500",
                        record.status === 'pending' && "bg-yellow-500/20 text-yellow-500",
                        record.status === 'processing' && "bg-blue-500/20 text-blue-500"
                      )}>
                        {record.status}
                      </span>
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
              <DollarSign className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No payroll records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRecord) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-900 border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingRecord ? 'Edit Payroll Record' : 'Add Payroll Record'}
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
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Select an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_code} - {emp.users[0]?.full_name} (${emp.salary.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="">Select month...</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Base Salary
                </label>
                <Input
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                  placeholder="60000"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Bonus
                  </label>
                  <Input
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    placeholder="0"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Deductions
                  </label>
                  <Input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    placeholder="0"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-zinc-300">Net Pay:</span>
                  <span className="text-2xl font-bold text-white">
                    ${(
                      parseFloat(formData.base_salary || "0") + 
                      parseFloat(formData.bonus || "0") - 
                      parseFloat(formData.deductions || "0")
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Payment Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
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
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={editingRecord ? handleUpdateRecord : handleAddRecord}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.employee_id || !formData.month || !formData.base_salary}
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
