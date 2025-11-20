"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LeaveBalance {
  sickTotal: number
  sickUsed: number
  sickRemaining: number
  vacationTotal: number
  vacationUsed: number
  vacationRemaining: number
  personalTotal: number
  personalUsed: number
  personalRemaining: number
  unpaidLeaveUsed: number
}

export default function RequestLeavePage() {
  const [leaveType, setLeaveType] = useState<'Sick' | 'Vacation' | 'Personal' | 'Unpaid'>('Vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState<LeaveBalance | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.employeeId) {
      fetchBalance()
    }
  }, [user])

  async function fetchBalance() {
    try {
      const currentYear = new Date().getFullYear()
      const response = await api.getLeaveBalance(user!.employeeId!, currentYear)
      setBalance(response.data)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Include both start and end dates
  }

  const getAvailableBalance = () => {
    if (!balance) return 0
    switch (leaveType) {
      case 'Sick':
        return balance.sickRemaining
      case 'Vacation':
        return balance.vacationRemaining
      case 'Personal':
        return balance.personalRemaining
      case 'Unpaid':
        return Infinity
      default:
        return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!startDate || !endDate || !reason) {
      alert('Please fill in all fields')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date must be after start date')
      return
    }

    if (new Date(startDate) < new Date()) {
      alert('Cannot request leave for past dates')
      return
    }

    const daysCount = calculateDays()
    const available = getAvailableBalance()
    
    if (leaveType !== 'Unpaid' && daysCount > available) {
      alert(`Insufficient ${leaveType.toLowerCase()} leave balance. Available: ${available} days, Requested: ${daysCount} days`)
      return
    }

    if (reason.length < 10) {
      alert('Reason must be at least 10 characters long')
      return
    }

    if (reason.length > 500) {
      alert('Reason must be less than 500 characters')
      return
    }

    setLoading(true)

    try {
      await api.requestLeave({
        leaveType,
        startDate,
        endDate,
        reason
      })
      
      alert('Leave request submitted successfully')
      router.push('/leaves')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit leave request')
    } finally {
      setLoading(false)
    }
  }

  const daysCount = calculateDays()
  const availableBalance = getAvailableBalance()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leaves">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Request Leave</h1>
          <p className="text-zinc-400 mt-1">Submit a new leave request</p>
        </div>
      </div>

      {/* Leave Balance Card */}
      {balance && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Leave Balance ({new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-lg">
                <p className="text-sm text-purple-400 mb-1">Sick Leave</p>
                <p className="text-2xl font-bold text-white">{balance.sickRemaining}</p>
                <p className="text-xs text-zinc-500">of {balance.sickTotal} days</p>
              </div>

              <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-400 mb-1">Vacation Leave</p>
                <p className="text-2xl font-bold text-white">{balance.vacationRemaining}</p>
                <p className="text-xs text-zinc-500">of {balance.vacationTotal} days</p>
              </div>

              <div className="p-4 bg-orange-950/20 border border-orange-900/30 rounded-lg">
                <p className="text-sm text-orange-400 mb-1">Personal Leave</p>
                <p className="text-2xl font-bold text-white">{balance.personalRemaining}</p>
                <p className="text-xs text-zinc-500">of {balance.personalTotal} days</p>
              </div>

              <div className="p-4 bg-gray-950/20 border border-gray-900/30 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Unpaid Leave</p>
                <p className="text-2xl font-bold text-white">{balance.unpaidLeaveUsed}</p>
                <p className="text-xs text-zinc-500">days used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Leave Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leaveType" className="text-zinc-200">Leave Type *</Label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Sick">Sick Leave</option>
                <option value="Vacation">Vacation Leave</option>
                <option value="Personal">Personal Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
              {leaveType !== 'Unpaid' && (
                <p className="text-sm text-zinc-500">
                  Available: <span className="text-white font-medium">{availableBalance}</span> days
                </p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-zinc-200">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
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
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>

            {/* Days Count */}
            {daysCount > 0 && (
              <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-400">
                  Total Days Requested: <span className="text-2xl font-bold text-white ml-2">{daysCount}</span> day{daysCount !== 1 ? 's' : ''}
                </p>
                {leaveType !== 'Unpaid' && daysCount > availableBalance && (
                  <p className="text-red-400 text-sm mt-2">
                    ⚠️ Warning: Requested days exceed available balance
                  </p>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-zinc-200">
                Reason * <span className="text-zinc-500 text-sm">(10-500 characters)</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                placeholder="Please provide a reason for your leave request..."
                className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
                maxLength={500}
                required
              />
              <p className="text-sm text-zinc-500 text-right">
                {reason.length}/500 characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href="/leaves" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-zinc-700"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || (leaveType !== 'Unpaid' && daysCount > availableBalance)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
