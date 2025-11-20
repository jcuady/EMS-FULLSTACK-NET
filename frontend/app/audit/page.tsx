"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Search, Filter, Calendar, User, Activity, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  entityType: string
  entityId: string | null
  description: string
  ipAddress: string | null
  userAgent: string | null
  changes: string | null
  createdAt: string
}

interface PagedResponse {
  data: AuditLog[]
  totalRecords: number
  page: number
  pageSize: number
  totalPages: number
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20

  // Filters
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchAuditLogs()
  }, [page])

  async function fetchAuditLogs() {
    try {
      const query: any = {
        page,
        pageSize,
      }

      if (entityTypeFilter) query.entityType = entityTypeFilter
      if (actionFilter) query.action = actionFilter
      if (startDateFilter) query.startDate = startDateFilter
      if (endDateFilter) query.endDate = endDateFilter

      const response = await api.getAuditLogs(query)
      const pagedData: PagedResponse = response.data

      setLogs(pagedData.data)
      setTotalRecords(pagedData.totalRecords)
      setTotalPages(pagedData.totalPages)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    setPage(1) // Reset to first page
    fetchAuditLogs()
  }

  const handleClearFilters = () => {
    setEntityTypeFilter('')
    setActionFilter('')
    setStartDateFilter('')
    setEndDateFilter('')
    setPage(1)
    fetchAuditLogs()
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Created':
        return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'Updated':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      case 'Deleted':
        return 'bg-red-600/20 text-red-400 border-red-600/30'
      case 'Approved':
        return 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30'
      case 'Rejected':
        return 'bg-orange-600/20 text-orange-400 border-orange-600/30'
      case 'Viewed':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
      case 'Login':
      case 'Logout':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/30'
      default:
        return 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30'
    }
  }

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'Employee':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      case 'Attendance':
        return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'Payroll':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/30'
      case 'Leave':
        return 'bg-orange-600/20 text-orange-400 border-orange-600/30'
      case 'User':
        return 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30'
      default:
        return 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-600/20 text-red-400 border-red-600/30'
      case 'manager':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      case 'employee':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      default:
        return 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading audit logs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Audit Logs
          </h1>
          <p className="text-zinc-400 mt-1">Complete audit trail of system activities</p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="border-zinc-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Activity className="w-12 h-12 text-blue-400" />
            <div>
              <p className="text-3xl font-bold text-white">{totalRecords.toLocaleString()}</p>
              <p className="text-zinc-400">Total audit records</p>
            </div>
            <div className="ml-auto text-right text-sm text-zinc-500">
              <p>Page {page} of {totalPages}</p>
              <p>Showing {logs.length} records</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Filter Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-200">Entity Type</Label>
                <select
                  value={entityTypeFilter}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Employee">Employee</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Leave">Leave</option>
                  <option value="User">User</option>
                  <option value="System">System</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-200">Action</Label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="Created">Created</option>
                  <option value="Updated">Updated</option>
                  <option value="Deleted">Deleted</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Login">Login</option>
                  <option value="Logout">Logout</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-200">Start Date</Label>
                <Input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-200">End Date</Label>
                <Input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  min={startDateFilter}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <Button onClick={handleClearFilters} variant="outline" className="border-zinc-700">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs List */}
      {logs.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No audit logs found</h3>
            <p className="text-zinc-400">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <Badge className={getEntityColor(log.entityType)}>
                        {log.entityType}
                      </Badge>
                      <Badge className={getRoleColor(log.userRole)}>
                        {log.userRole}
                      </Badge>
                      <span className="text-xs text-zinc-500 ml-auto">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>

                    <p className="text-white font-medium mb-2">{log.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500">User</p>
                        <p className="text-zinc-200">{log.userName}</p>
                      </div>
                      {log.entityId && (
                        <div>
                          <p className="text-zinc-500">Entity ID</p>
                          <p className="text-zinc-200 font-mono text-xs">{log.entityId.substring(0, 8)}...</p>
                        </div>
                      )}
                      {log.ipAddress && (
                        <div>
                          <p className="text-zinc-500">IP Address</p>
                          <p className="text-zinc-200">{log.ipAddress}</p>
                        </div>
                      )}
                    </div>

                    {log.changes && (
                      <details className="mt-3">
                        <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
                          View Changes
                        </summary>
                        <pre className="mt-2 p-3 bg-zinc-950 rounded text-xs text-zinc-300 overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.changes), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalRecords)} of {totalRecords} records
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className={page === pageNum ? 'bg-blue-600 hover:bg-blue-700' : 'border-zinc-700'}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
