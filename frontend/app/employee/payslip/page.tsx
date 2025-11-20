"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, DollarSign, Calendar, TrendingUp, FileText, Loader2 } from "lucide-react"

type PayrollRecord = {
  id: string
  employee_id: string
  month: number
  year: number
  basic_salary: number
  allowances: number
  bonuses: number
  deductions: number
  tax: number
  net_salary: number
  payment_date?: string
  payment_status: string
  payment_method?: string
  notes?: string
}

export default function EmployeePayslipPage() {
  const { user, isEmployee } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [currentMonthPayroll, setCurrentMonthPayroll] = useState<PayrollRecord | null>(null)
  const [employeeId, setEmployeeId] = useState<string | null>(null)

  useEffect(() => {
    if (!isEmployee) {
      router.push('/dashboard')
    }
  }, [isEmployee, router])

  useEffect(() => {
    if (user && isEmployee) {
      fetchEmployeePayroll()
    }
  }, [user, isEmployee])

  const fetchEmployeePayroll = async () => {
    try {
      // Get employee ID from user_id
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user!.id)
        .single()

      if (employeeError) throw employeeError
      if (!employeeData) return

      setEmployeeId(employeeData.id)

      // Get all payroll records for this employee
      const { data: payrollData, error: payrollError } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (payrollError) throw payrollError

      setPayrollRecords(payrollData || [])

      // Get current month payroll
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      const currentPayroll = payrollData?.find(
        p => p.month === currentMonth && p.year === currentYear
      )

      setCurrentMonthPayroll(currentPayroll || null)
    } catch (error) {
      console.error('Error fetching payroll data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-600'
      case 'processed':
        return 'bg-blue-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'failed':
        return 'bg-red-600'
      default:
        return 'bg-zinc-600'
    }
  }

  const calculateYTDTotals = () => {
    const currentYear = new Date().getFullYear()
    const ytdRecords = payrollRecords.filter(p => p.year === currentYear)
    
    return {
      totalGross: ytdRecords.reduce((sum, p) => sum + p.basic_salary + p.allowances + p.bonuses, 0),
      totalDeductions: ytdRecords.reduce((sum, p) => sum + p.deductions + p.tax, 0),
      totalNet: ytdRecords.reduce((sum, p) => sum + p.net_salary, 0),
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

  const ytdTotals = calculateYTDTotals()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Payslips</h1>
        {payrollRecords.length > 0 && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        )}
      </div>

      {/* Current Month Salary Summary */}
      {currentMonthPayroll ? (
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">Current Month Salary</p>
                <p className="text-4xl font-bold text-white">{formatCurrency(currentMonthPayroll.net_salary)}</p>
                <p className="text-sm text-blue-100 mt-2">{getMonthName(currentMonth)} {currentYear}</p>
              </div>
              <DollarSign className="w-16 h-16 text-blue-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <p className="text-zinc-400 text-center">No payroll data available for current month</p>
          </CardContent>
        </Card>
      )}

      {/* Salary Breakdown */}
      {currentMonthPayroll && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-zinc-400">Gross Salary</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(currentMonthPayroll.basic_salary + currentMonthPayroll.allowances + currentMonthPayroll.bonuses)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Before deductions</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-zinc-400">Deductions</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(currentMonthPayroll.deductions + currentMonthPayroll.tax)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Tax + Deductions</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-zinc-400">Net Salary</p>
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(currentMonthPayroll.net_salary)}</p>
                <p className="text-xs text-zinc-500 mt-1">Take home amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Month Breakdown */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">{getMonthName(currentMonth)} {currentYear} Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">Basic Salary</span>
                  <span className="text-white font-semibold">{formatCurrency(currentMonthPayroll.basic_salary)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">Allowances</span>
                  <span className="text-white font-semibold">{formatCurrency(currentMonthPayroll.allowances)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">Bonuses</span>
                  <span className="text-white font-semibold">{formatCurrency(currentMonthPayroll.bonuses)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <span className="text-red-400">Tax</span>
                  <span className="text-red-400 font-semibold">-{formatCurrency(currentMonthPayroll.tax)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <span className="text-red-400">Other Deductions</span>
                  <span className="text-red-400 font-semibold">-{formatCurrency(currentMonthPayroll.deductions)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white font-bold text-lg">Net Salary</span>
                  <span className="text-white font-bold text-lg">{formatCurrency(currentMonthPayroll.net_salary)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Payslip History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Payslip History</CardTitle>
        </CardHeader>
        <CardContent>
          {payrollRecords.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No payroll history available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Month</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Gross Salary</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Deductions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Net Salary</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((payslip) => {
                    const grossSalary = payslip.basic_salary + payslip.allowances + payslip.bonuses
                    const totalDeductions = payslip.deductions + payslip.tax
                    
                    return (
                      <tr key={payslip.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="py-3 px-4 text-white">
                          {getMonthName(payslip.month)} {payslip.year}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{formatCurrency(grossSalary)}</td>
                        <td className="py-3 px-4 text-red-400">{formatCurrency(totalDeductions)}</td>
                        <td className="py-3 px-4 text-white font-semibold">{formatCurrency(payslip.net_salary)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="default" className={getStatusColor(payslip.payment_status)}>
                            {payslip.payment_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year-to-Date Summary */}
      {payrollRecords.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Year-to-Date Summary ({currentYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Total Gross Earned</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(ytdTotals.totalGross)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Total Deductions</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(ytdTotals.totalDeductions)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Total Net Paid</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(ytdTotals.totalNet)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
