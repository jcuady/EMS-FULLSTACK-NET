"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit, Camera, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type EmployeeData = {
  id: string
  employee_code: string
  full_name: string
  email: string
  phone: string
  position: string
  department: { name: string } | null
  date_of_birth: string
  address: string
  base_salary: number
  status: string
  created_at: string
}

export default function EmployeeProfilePage() {
  const { user, isEmployee } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null)

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
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          department:departments(name)
        `)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setEmployeeData(data)
    } catch (error) {
      console.error('Error fetching employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return '??'
    const names = name.split(' ')
    return names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (!isEmployee) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!employeeData) {
    return (
      <div className="text-center text-zinc-400 py-8">
        No employee data found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src="/avatars/employee.png" alt={employeeData.full_name} />
                <AvatarFallback className="text-2xl">{getInitials(employeeData.full_name)}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-2" disabled>
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">{employeeData.full_name}</h2>
              <p className="text-zinc-400 mb-2">{employeeData.position}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="default" className={employeeData.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                  {employeeData.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="secondary">Full-time</Badge>
                <Badge variant="outline">{employeeData.department?.name || 'No Department'}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <Input
                disabled
                value={employeeData.full_name}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                disabled
                value={employeeData.email}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <Input
                disabled
                value={employeeData.phone || 'Not provided'}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </label>
              <Input
                disabled
                value={employeeData.date_of_birth ? formatDate(employeeData.date_of_birth) : 'Not provided'}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <Input
                disabled
                value={employeeData.address || 'Not provided'}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Employment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Employee ID
              </label>
              <Input
                disabled
                value={employeeData.employee_code}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Position
              </label>
              <Input
                disabled
                value={employeeData.position}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Department
              </label>
              <Input
                disabled
                value={employeeData.department?.name || 'Not assigned'}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Join Date
              </label>
              <Input
                disabled
                value={formatDate(employeeData.created_at)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Employment Status
              </label>
              <Input
                disabled
                value={employeeData.status === 'active' ? 'Active' : 'Inactive'}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Employment Type
              </label>
              <Input
                disabled
                value="Full-time"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
