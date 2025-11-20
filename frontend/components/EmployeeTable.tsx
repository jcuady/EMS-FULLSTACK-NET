"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type EmployeeWithDetails = {
  id: string
  employee_code: string
  position: string
  employment_type: string
  users: {
    full_name: string
    email: string
  }
  departments: {
    name: string
  } | null
}

export function EmployeeTable() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_code,
          position,
          employment_type,
          users!inner (
            full_name,
            email
          ),
          departments (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      // Transform the data to match our type
      const transformedData = (data || []).map(emp => ({
        ...emp,
        users: Array.isArray(emp.users) ? emp.users[0] : emp.users,
        departments: Array.isArray(emp.departments) ? emp.departments[0] : emp.departments
      })) as EmployeeWithDetails[]
      
      setEmployees(transformedData)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.departments?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const getStatusVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'Permanent':
        return 'default'
      case 'Remote':
        return 'secondary'
      case 'Contract':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-zinc-400">Loading employees...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Employee Directory</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-10 w-64 bg-zinc-800 border-zinc-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white text-sm">
                          {getInitials(employee.users.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-white">{employee.users.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {employee.departments?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-zinc-400">{employee.position}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(employee.employment_type)}>
                      {employee.employment_type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled>
            Back
          </Button>
          <Button variant="default" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
