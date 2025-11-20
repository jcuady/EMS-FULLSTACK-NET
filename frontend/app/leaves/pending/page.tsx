"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, ArrowLeft, Calendar, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

interface PendingLeave {
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
  createdAt: string
}

export default function PendingApprovalsPage() {
  const [leaves, setLeaves] = useState<PendingLeave[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null)
  const { user, isAdmin } = useAuth()

  useEffect(() => {
    fetchPendingLeaves()
  }, [])

  async function fetchPendingLeaves() {
    try {
      const response = await api.getPendingLeaves()
      setLeaves(response.data)
    } catch (error) {
      console.error('Error fetching pending leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(leaveId: string) {
    if (!confirm('Are you sure you want to approve this leave request?')) return

    setProcessingId(leaveId)
    try {
      await api.approveLeave(leaveId)
      await fetchPendingLeaves()
      alert('Leave request approved successfully')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve leave request')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(leaveId: string) {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    if (rejectionReason.length < 10) {
      alert('Rejection reason must be at least 10 characters long')
      return
    }

    setProcessingId(leaveId)
    try {
      await api.rejectLeave(leaveId, rejectionReason)
      await fetchPendingLeaves()
      setShowRejectDialog(null)
      setRejectionReason('')
      alert('Leave request rejected successfully')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject leave request')
    } finally {
      setProcessingId(null)
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="bg-zinc-900 border-zinc-800 max-w-md">
          <CardContent className="py-16 text-center">
            <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
            <p className="text-zinc-400 mb-4">
              Only administrators and managers can approve leave requests.
            </p>
            <Link href="/leaves">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Back to Leaves
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading pending approvals...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leaves">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Pending Approvals</h1>
          <p className="text-zinc-400 mt-1">Review and approve leave requests</p>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Clock className="w-12 h-12 text-yellow-400" />
            <div>
              <p className="text-3xl font-bold text-white">{leaves.length}</p>
              <p className="text-zinc-400">Pending approval{leaves.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Leaves List */}
      {leaves.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-zinc-400 mb-4">
              No pending leave requests at the moment.
            </p>
            <Link href="/leaves">
              <Button className="bg-blue-600 hover:bg-blue-700">
                View All Leaves
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <Card key={leave.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{leave.employeeName}</h3>
                        <Badge className={getLeaveTypeColor(leave.leaveType)}>
                          {leave.leaveType}
                        </Badge>
                        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500">
                        Requested on {formatDateTime(leave.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Employee Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-950/50 rounded-lg">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Employee Code</p>
                      <p className="text-sm text-zinc-200">{leave.employeeCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Department</p>
                      <p className="text-sm text-zinc-200">{leave.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Duration</p>
                      <p className="text-sm text-zinc-200">{leave.daysCount} day{leave.daysCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Leave Dates</p>
                      <p className="text-sm text-zinc-200">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <p className="text-sm text-zinc-500 mb-2">Reason for Leave:</p>
                    <p className="text-zinc-300 p-3 bg-zinc-950/50 rounded-lg">{leave.reason}</p>
                  </div>

                  {/* Reject Dialog */}
                  {showRejectDialog === leave.id && (
                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg space-y-3">
                      <Label htmlFor={`reject-reason-${leave.id}`} className="text-red-400">
                        Rejection Reason * (10-500 characters)
                      </Label>
                      <Textarea
                        id={`reject-reason-${leave.id}`}
                        value={rejectionReason}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a clear reason for rejecting this leave request..."
                        className="bg-zinc-900 border-red-900/50 text-white min-h-[100px]"
                        maxLength={500}
                      />
                      <p className="text-xs text-zinc-500 text-right">
                        {rejectionReason.length}/500 characters
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowRejectDialog(null)
                            setRejectionReason('')
                          }}
                          className="flex-1 border-zinc-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(leave.id)}
                          disabled={processingId === leave.id || !rejectionReason.trim() || rejectionReason.length < 10}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          {processingId === leave.id ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {showRejectDialog !== leave.id && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => setShowRejectDialog(leave.id)}
                        disabled={processingId !== null}
                        variant="outline"
                        className="flex-1 border-red-700 text-red-400 hover:bg-red-950/20"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(leave.id)}
                        disabled={processingId !== null}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {processingId === leave.id ? 'Approving...' : 'Approve'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
