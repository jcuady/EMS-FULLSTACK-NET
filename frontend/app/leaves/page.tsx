"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Filter, Check, X, Trash2, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Leave {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  leaveType: string
  startDate: string
  endDate: string
  daysCount: number
  reason: string
  status: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all')
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchLeaves()
  }, [filter])

  async function fetchLeaves() {
    try {
      const status = filter === 'all' ? undefined : filter
      const response = await api.getLeaves(status)
      setLeaves(response.data)
    } catch (error) {
      console.error('Error fetching leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this leave request?')) return

    try {
      await api.cancelLeave(id)
      await fetchLeaves()
    } catch (error) {
      console.error('Error cancelling leave:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      case 'Approved':
        return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'Rejected':
        return 'bg-red-600/20 text-red-400 border-red-600/30'
      case 'Cancelled':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
      default:
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Sick':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/30'
      case 'Vacation':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      case 'Personal':
        return 'bg-orange-600/20 text-orange-400 border-orange-600/30'
      case 'Unpaid':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
      default:
        return 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading leaves...</p>
      </div>
    )
  }

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-white">Leave Management</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leave Management</h1>
          <p className="text-zinc-400 mt-1">
            Manage employee leave requests • {user?.full_name || user?.fullName}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href="/leaves/pending">
              <Button variant="outline" className="border-zinc-700">
                <Check className="w-4 h-4 mr-2" />
                Pending Approvals ({stats.pending})
              </Button>
            </Link>
          )}
          <Link href="/leaves/request">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Request Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Requests</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Approved</p>
                <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
              </div>
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <X className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-400 mr-4">Filter by Status:</span>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-zinc-700'}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={filter === 'Pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('Pending')}
                className={filter === 'Pending' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-zinc-700'}
              >
                Pending ({stats.pending})
              </Button>
              <Button
                variant={filter === 'Approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('Approved')}
                className={filter === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'border-zinc-700'}
              >
                Approved ({stats.approved})
              </Button>
              <Button
                variant={filter === 'Rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('Rejected')}
                className={filter === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-700'}
              >
                Rejected ({stats.rejected})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaves List */}
      {leaves.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <Calendar className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No leave requests found</h3>
            <p className="text-zinc-400 mb-6">
              {filter === 'all' 
                ? isAdmin 
                  ? "No leave requests have been submitted yet." 
                  : "You haven't submitted any leave requests yet."
                : `No ${filter.toLowerCase()} leave requests found.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/leaves/request">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Leave
                </Button>
              </Link>
              {filter !== 'all' && (
                <Button 
                  variant="outline" 
                  className="border-zinc-700"
                  onClick={() => setFilter('all')}
                >
                  View All Requests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <Card key={leave.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">{leave.employeeName}</h3>
                      <Badge className={getStatusColor(leave.status)}>
                        {leave.status}
                      </Badge>
                      <Badge className={getLeaveTypeColor(leave.leaveType)}>
                        {leave.leaveType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500">Employee Code</p>
                        <p className="text-zinc-200">{leave.employeeCode}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Department</p>
                        <p className="text-zinc-200">{leave.department}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Duration</p>
                        <p className="text-zinc-200">{leave.daysCount} day{leave.daysCount !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Dates</p>
                        <p className="text-zinc-200">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-zinc-500 text-sm mb-1">Reason:</p>
                      <p className="text-zinc-300 text-sm">{leave.reason}</p>
                    </div>

                    {leave.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
                        <p className="text-red-400 text-sm mb-1 font-medium">Rejection Reason:</p>
                        <p className="text-red-300 text-sm">{leave.rejectionReason}</p>
                      </div>
                    )}

                    {leave.approvedByName && (
                      <div className="mt-3 text-sm text-zinc-500">
                        {leave.status === 'Approved' ? 'Approved' : 'Rejected'} by <span className="text-zinc-300">{leave.approvedByName}</span> on{' '}
                        <span className="text-zinc-300">{leave.approvedAt ? formatDate(leave.approvedAt) : 'N/A'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {leave.status === 'Pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(leave.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
