import { useState, useEffect, useRef } from 'react'
import { notificationAPI, type Notification } from '../notificationPages/notificationAPI'
import { useNavigate } from 'react-router-dom'
import './NotificationBell.css'

const POLL_INTERVAL = 30000

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    try {
      const res = await notificationAPI.list()
      setNotifications(res.data.data)
      setUnreadCount(res.data.unreadCount)
    } catch { /* silent */ }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await notificationAPI.markRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
      setUnreadCount(c => Math.max(0, c - 1))
    }
    if (n.contentType === 'APPOINTMENT') {   
      setOpen(false)
      navigate('/appointments')
    }
  }

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button className="notif-bell-btn" onClick={() => setOpen(o => !o)} aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 7a5 5 0 0110 0c0 3.5 1.2 4.5 1.2 4.5H2.8S4 10.5 4 7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M7.2 14a1.8 1.8 0 003.6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notif-panel-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet.</div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  className={`notif-item${n.read ? '' : ' unread'}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <span className="notif-item-title">{n.title}</span>
                  <span className="notif-item-message">{n.message}</span>
                  <span className="notif-item-date">{new Date(n.createdAt).toLocaleDateString()}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}