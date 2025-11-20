"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, Trash2, Filter, AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  link?: string
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const response = await api.getNotifications()
      setNotifications(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      await api.markNotificationAsRead(id)
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      await api.markAllNotificationsAsRead()
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      )
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  async function deleteNotification(id: string) {
    try {
      await api.deleteNotification(id)
      setNotifications(prev => prev.filter(notif => notif.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  async function clearReadNotifications() {
    try {
      await api.clearReadNotifications()
      setNotifications(prev => prev.filter(notif => !notif.isRead))
    } catch (error) {
      console.error('Error clearing read notifications:', error)
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead
    if (filter === 'read') return notif.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600'
      case 'warning':
        return 'bg-yellow-600'
      case 'error':
        return 'bg-red-600'
      default:
        return 'bg-blue-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-white" />
      case 'error':
        return <XCircle className="w-5 h-5 text-white" />
      default:
        return <Info className="w-5 h-5 text-white" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'warning':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      case 'error':
        return 'bg-red-600/20 text-red-400 border-red-600/30'
      default:
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const groupNotifications = (notifs: Notification[]) => {
    const today: Notification[] = []
    const yesterday: Notification[] = []
    const older: Notification[] = []

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    notifs.forEach(notif => {
      const notifDate = new Date(notif.createdAt)
      if (notifDate >= todayStart) {
        today.push(notif)
      } else if (notifDate >= yesterdayStart) {
        yesterday.push(notif)
      } else {
        older.push(notif)
      }
    })

    return { today, yesterday, older }
  }

  const { today, yesterday, older } = groupNotifications(filteredNotifications)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-zinc-400 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-zinc-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.some(n => n.isRead) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearReadNotifications}
              className="border-zinc-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-400 mr-4">Filter:</span>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-zinc-700'}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'bg-blue-600 hover:bg-blue-700' : 'border-zinc-700'}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
                className={filter === 'read' ? 'bg-blue-600 hover:bg-blue-700' : 'border-zinc-700'}
              >
                Read ({notifications.length - unreadCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredNotifications.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <Bell className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
            <p className="text-zinc-400">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : filter === 'read'
                ? "No read notifications found."
                : "You don't have any notifications yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          {today.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Today</h2>
              {today.map((notification) => (
                <Card
                  key={notification.id}
                  className={`bg-zinc-900 border-zinc-800 transition-all hover:border-zinc-700 ${
                    !notification.isRead ? 'border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-lg ${getTypeColor(
                          notification.type
                        )} flex items-center justify-center flex-shrink-0`}
                      >
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold text-lg">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-zinc-400 hover:text-white"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-zinc-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Badge className={`mb-3 ${getTypeBadgeColor(notification.type)}`}>
                          {notification.type}
                        </Badge>
                        
                        <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        {notification.link && (
                          <a href={notification.link}>
                            <Button variant="link" size="sm" className="p-0 h-auto text-blue-400 hover:text-blue-300">
                              View Details →
                            </Button>
                          </a>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          <span>•</span>
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Yesterday */}
          {yesterday.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Yesterday</h2>
              {yesterday.map((notification) => (
                <Card
                  key={notification.id}
                  className={`bg-zinc-900 border-zinc-800 transition-all hover:border-zinc-700 ${
                    !notification.isRead ? 'border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${getTypeColor(
                          notification.type
                        )} flex items-center justify-center flex-shrink-0`}
                      >
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold text-lg">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-zinc-400 hover:text-white"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-zinc-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Badge className={`mb-3 ${getTypeBadgeColor(notification.type)}`}>
                          {notification.type}
                        </Badge>
                        
                        <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        {notification.link && (
                          <a href={notification.link}>
                            <Button variant="link" size="sm" className="p-0 h-auto text-blue-400 hover:text-blue-300">
                              View Details →
                            </Button>
                          </a>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          <span>•</span>
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Older */}
          {older.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Older</h2>
              {older.map((notification) => (
                <Card
                  key={notification.id}
                  className={`bg-zinc-900 border-zinc-800 transition-all hover:border-zinc-700 ${
                    !notification.isRead ? 'border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${getTypeColor(
                          notification.type
                        )} flex items-center justify-center flex-shrink-0`}
                      >
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold text-lg">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-zinc-400 hover:text-white"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-zinc-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Badge className={`mb-3 ${getTypeBadgeColor(notification.type)}`}>
                          {notification.type}
                        </Badge>
                        
                        <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        {notification.link && (
                          <a href={notification.link}>
                            <Button variant="link" size="sm" className="p-0 h-auto text-blue-400 hover:text-blue-300">
                              View Details →
                            </Button>
                          </a>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          <span>•</span>
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
