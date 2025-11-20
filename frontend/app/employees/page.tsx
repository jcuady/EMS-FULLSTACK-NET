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
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Building2,
  UserCheck,
  Loader2,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

type Employee = {
  id: string
  employee_code: string
  user_id: string
  department_id: string
  position: string
  hire_date: string
  salary: number
  status: string
  performance_rating: number
  users: {
    full_name: string
    email: string
    phone?: string
  }
  departments: {
    name: string
  }
}

type Department = {
  id: string
  name: string
}

type User = {
  id: string
  full_name: string
  email: string
  phone?: string
  role: string
}

export default function EmployeesPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    user_id: "",
    department_id: "",
    position: "",
    hire_date: "",
    salary: "",
    status: "active",
    performance_rating: "3"
  })

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/employee/dashboard')
    }
  }, [isAdmin, router])

  // Fetch employees
  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
    fetchUsers()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.getEmployees()
      setEmployees(response.data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      // For now, use empty array or fetch from API if endpoint exists
      setDepartments([])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers()
      setUsers(response.data?.filter((u: any) => u.role === 'employee') || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleAddEmployee = async () => {
    try {
      // Generate employee code
      const count = employees.length + 1
      const employee_code = `EMP${String(count).padStart(3, '0')}`

      await api.createEmployee({
        employeeCode: employee_code,
        userId: formData.user_id,
        departmentId: formData.department_id,
        position: formData.position,
        hireDate: formData.hire_date,
        salary: parseFloat(formData.salary),
        employmentType: 'Permanent',
        performanceRating: parseFloat(formData.performance_rating)
      })

      alert('Employee added successfully!')
      setShowAddModal(false)
      resetForm()
      fetchEmployees()
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('Failed to add employee')
    }
  }

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return

    try {
      await api.updateEmployee(editingEmployee.id, {
        userId: formData.user_id,
        departmentId: formData.department_id,
        position: formData.position,
        hireDate: formData.hire_date,
        salary: parseFloat(formData.salary),
        employmentType: 'Permanent',
        performanceRating: parseFloat(formData.performance_rating)
      })

      alert('Employee updated successfully!')
      setEditingEmployee(null)
      resetForm()
      fetchEmployees()
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Failed to update employee')
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      await api.deleteEmployee(id)

      alert('Employee deleted successfully!')
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Failed to delete employee')
    }
  }

  const resetForm = () => {
    setFormData({
      user_id: "",
      department_id: "",
      position: "",
      hire_date: "",
      salary: "",
      status: "active",
      performance_rating: "3"
    })
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      user_id: employee.user_id,
      department_id: employee.department_id,
      position: employee.position,
      hire_date: employee.hire_date.split('T')[0],
      salary: employee.salary.toString(),
      status: employee.status,
      performance_rating: employee.performance_rating.toString()
    })
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false
    
    const matchesDepartment = 
      selectedDepartment === "all" || employee.department_id === selectedDepartment

    return matchesSearch && matchesDepartment
  })

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
        <span className="text-white">Employees</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Employee Management</h1>
          <p className="text-zinc-400 mt-1">
            Manage employee records, departments, and information • {employees.length} total employees
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{employees.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {employees.filter(e => e.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{departments.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Avg Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {employees.length > 0 
                ? (employees.reduce((sum, e) => sum + e.performance_rating, 0) / employees.length).toFixed(1)
                : '0.0'}
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
                placeholder="Search by name, code, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Position</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Performance</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{employee.users.full_name}</div>
                        <div className="text-sm text-zinc-400">{employee.users.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{employee.employee_code}</td>
                    <td className="py-3 px-4 text-zinc-300">{employee.position}</td>
                    <td className="py-3 px-4 text-zinc-300">{employee.departments.name}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        employee.status === 'active' 
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      )}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{employee.performance_rating.toFixed(1)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(employee)}
                          className="border-zinc-700 hover:bg-zinc-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEmployee(employee.id)}
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

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No employees found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {(showAddModal || editingEmployee) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-900 border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingEmployee(null)
                  resetForm()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Select User
                </label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  disabled={!!editingEmployee}
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Department
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Select department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Position
                </label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g. Senior Developer"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Hire Date
                  </label>
                  <Input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Salary
                  </label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="60000"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Performance Rating
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.performance_rating}
                    onChange={(e) => setFormData({ ...formData, performance_rating: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.user_id || !formData.department_id || !formData.position}
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingEmployee(null)
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
