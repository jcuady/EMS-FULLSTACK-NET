"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileText, Download, Calendar, Users, DollarSign, CalendarCheck } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"

type ReportType = 'Employees' | 'Attendance' | 'Payroll' | 'Leave'
type ExportFormat = 'PDF' | 'Excel'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('Employees')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const reportTypes = [
    { name: 'Employees' as ReportType, icon: Users, color: 'blue', description: 'Employee directory and details' },
    { name: 'Attendance' as ReportType, icon: Calendar, color: 'green', description: 'Attendance records and work hours' },
    { name: 'Payroll' as ReportType, icon: DollarSign, color: 'purple', description: 'Payroll summaries and calculations' },
    { name: 'Leave' as ReportType, icon: CalendarCheck, color: 'orange', description: 'Leave requests and balances' },
  ]

  const handleGenerateReport = async () => {
    if ((selectedReport === 'Attendance' || selectedReport === 'Payroll') && (!startDate || !endDate)) {
      alert('Start date and end date are required for this report type')
      return
    }

    setLoading(true)

    try {
      const request = {
        reportType: selectedReport,
        exportFormat: exportFormat,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        department: department || undefined,
        status: status || undefined,
      }

      let response: Response

      switch (selectedReport) {
        case 'Employees':
          response = await fetch(`${api.baseUrl}/reports/employees`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${api.getToken()}`,
            },
            body: JSON.stringify(request),
          })
          break
        case 'Attendance':
          response = await fetch(`${api.baseUrl}/reports/attendance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${api.getToken()}`,
            },
            body: JSON.stringify(request),
          })
          break
        case 'Payroll':
          response = await fetch(`${api.baseUrl}/reports/payroll`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${api.getToken()}`,
            },
            body: JSON.stringify(request),
          })
          break
        case 'Leave':
          response = await fetch(`${api.baseUrl}/reports/leave`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${api.getToken()}`,
            },
            body: JSON.stringify(request),
          })
          break
        default:
          throw new Error('Invalid report type')
      }

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${selectedReport}_Report.${exportFormat === 'PDF' ? 'pdf' : 'xlsx'}`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error: any) {
      console.error('Error generating report:', error)
      alert(error.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const requiresDates = selectedReport === 'Attendance' || selectedReport === 'Payroll'

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-white">Reports</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-zinc-400 mt-1">Generate and export reports in PDF or Excel format</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isSelected = selectedReport === report.name
          return (
            <Card
              key={report.name}
              onClick={() => setSelectedReport(report.name)}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? `bg-${report.color}-950/30 border-${report.color}-600`
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-4 rounded-full ${
                    isSelected 
                      ? `bg-${report.color}-600/20` 
                      : 'bg-zinc-800'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      isSelected 
                        ? `text-${report.color}-400` 
                        : 'text-zinc-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      isSelected ? 'text-white' : 'text-zinc-300'
                    }`}>
                      {report.name}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report Configuration */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label className="text-zinc-200">Export Format *</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="PDF"
                  checked={exportFormat === 'PDF'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-zinc-300">PDF</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="Excel"
                  checked={exportFormat === 'Excel'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-zinc-300">Excel</span>
              </label>
            </div>
          </div>

          {/* Date Range (Required for Attendance and Payroll) */}
          {requiresDates && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-zinc-200">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-zinc-200">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>
          )}

          {/* Optional Date Range for Leave Report */}
          {selectedReport === 'Leave' && (
            <div>
              <Label className="text-zinc-200 mb-2 block">Date Range (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDateOpt" className="text-zinc-400 text-sm">Start Date</Label>
                  <Input
                    id="startDateOpt"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDateOpt" className="text-zinc-400 text-sm">End Date</Label>
                  <Input
                    id="endDateOpt"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Optional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Filter (for Employee, Attendance, Leave reports) */}
            {selectedReport !== 'Payroll' && (
              <div className="space-y-2">
                <Label htmlFor="department" className="text-zinc-200">Department (Optional)</Label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            )}

            {/* Status Filter */}
            {(selectedReport === 'Employees' || selectedReport === 'Payroll' || selectedReport === 'Leave') && (
              <div className="space-y-2">
                <Label htmlFor="status" className="text-zinc-200">Status (Optional)</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  {selectedReport === 'Employees' && (
                    <>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </>
                  )}
                  {selectedReport === 'Payroll' && (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </>
                  )}
                  {selectedReport === 'Leave' && (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleGenerateReport}
              disabled={loading || (requiresDates && (!startDate || !endDate))}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate {exportFormat} Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-2">Report Information</h3>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• PDF reports are best for viewing and printing</li>
                <li>• Excel reports allow for further data analysis and manipulation</li>
                <li>• Attendance and Payroll reports require a date range</li>
                <li>• Use filters to narrow down your report data</li>
                <li>• All reports include metadata (generated by, timestamp, filters applied)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
