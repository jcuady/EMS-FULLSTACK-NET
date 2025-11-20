"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Settings as SettingsIcon, Save, RefreshCw, Building, Clock, DollarSign, Calendar, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type SystemSetting = {
  id: string
  setting_key: string
  setting_value: string
  description?: string
  updated_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key')

      if (error) throw error

      const settingsMap: Record<string, string> = {}
      data?.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value
      })
      setSettings(settingsMap)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from('system_settings')
          .update({ setting_value: value, updated_at: new Date().toISOString() })
          .eq('setting_key', key)
      )

      await Promise.all(updates)
      
      setEditMode(false)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading settings...</p>
      </div>
    )
  }

  const settingsConfig = [
    {
      key: 'company_name',
      label: 'Company Name',
      icon: Building,
      description: 'Company name displayed in the system'
    },
    {
      key: 'working_hours_start',
      label: 'Working Hours Start',
      icon: Clock,
      description: 'Standard working hours start time'
    },
    {
      key: 'working_hours_end',
      label: 'Working Hours End',
      icon: Clock,
      description: 'Standard working hours end time'
    },
    {
      key: 'currency',
      label: 'Currency',
      icon: DollarSign,
      description: 'Default currency for payroll'
    },
    {
      key: 'late_threshold_minutes',
      label: 'Late Threshold (Minutes)',
      icon: Clock,
      description: 'Minutes after which employee is marked late'
    },
    {
      key: 'max_leave_days',
      label: 'Max Leave Days',
      icon: Calendar,
      description: 'Maximum leave days per year'
    },
    {
      key: 'payroll_day',
      label: 'Payroll Day',
      icon: Calendar,
      description: 'Day of month for payroll processing'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-zinc-400 mt-1">Manage your system configuration</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  fetchSettings()
                  setEditMode(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Current Configuration Summary */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-zinc-800 rounded-lg">
              <Building className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 mb-1">Company</p>
              <p className="text-sm font-semibold text-white">{settings.company_name || 'N/A'}</p>
            </div>
            <div className="text-center p-4 bg-zinc-800 rounded-lg">
              <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 mb-1">Work Hours</p>
              <p className="text-sm font-semibold text-white">
                {settings.working_hours_start} - {settings.working_hours_end}
              </p>
            </div>
            <div className="text-center p-4 bg-zinc-800 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 mb-1">Currency</p>
              <p className="text-sm font-semibold text-white">{settings.currency || 'N/A'}</p>
            </div>
            <div className="text-center p-4 bg-zinc-800 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 mb-1">Payroll Day</p>
              <p className="text-sm font-semibold text-white">Day {settings.payroll_day}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {settingsConfig.map((config) => (
              <div key={config.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <config.icon className="w-4 h-4 text-zinc-400" />
                  <label className="text-sm font-medium text-white">
                    {config.label}
                  </label>
                  {!editMode && (
                    <Badge variant="secondary" className="ml-2">
                      Current
                    </Badge>
                  )}
                </div>
                <Input
                  value={settings[config.key] || ''}
                  onChange={(e) => handleChange(config.key, e.target.value)}
                  disabled={!editMode}
                  className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                />
                <p className="text-xs text-zinc-500">{config.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Attendance Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Late Threshold</p>
                  <p className="text-xs text-zinc-500">Minutes before marking late</p>
                </div>
                <Badge variant="outline">{settings.late_threshold_minutes} min</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Work From Home</p>
                  <p className="text-xs text-zinc-500">Allow remote attendance</p>
                </div>
                <Badge variant="default" className="bg-green-600">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Payroll Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Currency</p>
                  <p className="text-xs text-zinc-500">Default payment currency</p>
                </div>
                <Badge variant="outline">{settings.currency}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Processing Day</p>
                  <p className="text-xs text-zinc-500">Monthly payroll date</p>
                </div>
                <Badge variant="outline">Day {settings.payroll_day}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-zinc-400 mb-1">Version</p>
              <p className="text-white font-semibold">1.0.0 MVP</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-1">Database</p>
              <p className="text-white font-semibold">Supabase (PostgreSQL)</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-1">Last Updated</p>
              <p className="text-white font-semibold">November 14, 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
