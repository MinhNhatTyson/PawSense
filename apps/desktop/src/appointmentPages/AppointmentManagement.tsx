import { useState, useEffect } from 'react'
import { vetAvailabilityAPI, appointmentAPI, type VetAvailabilitySlot, type Appointment } from './appointmentAPI'
import { Sidebar } from '../components/Sidebar'
import './AppointmentManagement.css'

type Tab = 'availability' | 'appointments'

function formatDateHeading(d: Date) {
  return new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
}
function formatTime(d: Date) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(d)
}

function groupSlotsByDate(slots: VetAvailabilitySlot[]) {
  const groups: Record<string, VetAvailabilitySlot[]> = {}
  for (const s of slots) {
    const key = new Date(s.startTime).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return Object.entries(groups).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
}

export default function AppointmentManagement() {
  const [tab, setTab] = useState<Tab>('availability')

  const [slots, setSlots] = useState<VetAvailabilitySlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slotDate, setSlotDate] = useState('')
  const [slotStart, setSlotStart] = useState('')
  const [slotEnd, setSlotEnd] = useState('')
  const [bulkDate, setBulkDate] = useState('')
  const [bulkStart, setBulkStart] = useState('09:00')
  const [bulkEnd, setBulkEnd] = useState('17:00')
  const [bulkDuration, setBulkDuration] = useState('30')
  const [savingSlot, setSavingSlot] = useState(false)

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [apptLoading, setApptLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (tab === 'availability') loadSlots() }, [tab])
  useEffect(() => { if (tab === 'appointments') loadAppointments() }, [tab, statusFilter])

  const loadSlots = async () => {
    setSlotsLoading(true)
    setError(null)
    try {
      const res = await vetAvailabilityAPI.listMine()
      setSlots(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load availability')
    } finally {
      setSlotsLoading(false)
    }
  }

  const loadAppointments = async () => {
    setApptLoading(true)
    setError(null)
    try {
      const res = await appointmentAPI.listAsVet(statusFilter || undefined)
      setAppointments(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load appointments')
    } finally {
      setApptLoading(false)
    }
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slotDate || !slotStart || !slotEnd) return
    setSavingSlot(true)
    setError(null)
    try {
      const startTime = new Date(`${slotDate}T${slotStart}`).toISOString()
      const endTime = new Date(`${slotDate}T${slotEnd}`).toISOString()
      await vetAvailabilityAPI.createSlot(startTime, endTime)
      setSlotStart(''); setSlotEnd('')
      loadSlots()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add slot')
    } finally {
      setSavingSlot(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkDate || !bulkStart || !bulkEnd || !bulkDuration) return
    setSavingSlot(true)
    setError(null)
    try {
      await vetAvailabilityAPI.createSlotsBulk({
        date: bulkDate, dayStart: bulkStart, dayEnd: bulkEnd, durationMinutes: parseInt(bulkDuration),
      })
      loadSlots()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate slots')
    } finally {
      setSavingSlot(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm('Remove this open slot?')) return
    try {
      await vetAvailabilityAPI.deleteSlot(id)
      loadSlots()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove slot')
    }
  }

  const handleBlockSlot = async (id: string) => {
    try {
      await vetAvailabilityAPI.blockSlot(id)
      loadSlots()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to block slot')
    }
  }

  const handleUnblockSlot = async (id: string) => {
    try {
      await vetAvailabilityAPI.unblockSlot(id)
      loadSlots()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to unblock slot')
    }
  }

  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')

  const startEditing = (slot: VetAvailabilitySlot) => {
    setEditingSlotId(slot.id)
    setEditStart(toLocalTimeInputValue(new Date(slot.startTime)))
    setEditEnd(toLocalTimeInputValue(new Date(slot.endTime)))
  }

  const cancelEditing = () => setEditingSlotId(null)

  const saveEdit = async (slot: VetAvailabilitySlot) => {
    try {
      const day = new Date(slot.startTime)
      const [sh, sm] = editStart.split(':').map(Number)
      const [eh, em] = editEnd.split(':').map(Number)
      const newStart = new Date(day); newStart.setHours(sh, sm, 0, 0)
      const newEnd = new Date(day); newEnd.setHours(eh, em, 0, 0)

      await vetAvailabilityAPI.editSlot(slot.id, newStart.toISOString(), newEnd.toISOString())
      setEditingSlotId(null)
      loadSlots()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update slot')
    }
  }

  // helper: Date -> "HH:mm" for <input type="time">
  function toLocalTimeInputValue(d: Date) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const handleCancelAppointment = async (id: string) => {
    const reason = window.prompt('Reason for cancelling (optional):') || undefined
    try {
      await appointmentAPI.cancel(id, reason)
      loadAppointments()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel appointment')
    }
  }

  const handleCompleteAppointment = async (id: string) => {
    try {
      await appointmentAPI.complete(id)
      loadAppointments()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update appointment')
    }
  }

  const groupedSlots = groupSlotsByDate(slots)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="ap-shell">
      <Sidebar />
      <main className="ap-main">
        <div className="ap-page-header animate-in">
          <div>
            <h1 className="ap-title">Appointments</h1>
            <p className="ap-subtitle">Manage your open slots and upcoming bookings</p>
          </div>
        </div>

        <div className="ap-tabs animate-in animate-in-delay-1">
          <button className={`ap-tab${tab === 'availability' ? ' active' : ''}`} onClick={() => setTab('availability')}>
            My Availability
          </button>
          <button className={`ap-tab${tab === 'appointments' ? ' active' : ''}`} onClick={() => setTab('appointments')}>
            Appointments
          </button>
        </div>

        {error && (
          <div className="alert alert-error animate-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {tab === 'availability' && (
          <>
            <div className="ap-form-row animate-in animate-in-delay-1">
              <form className="ap-form-card" onSubmit={handleAddSlot}>
                <div className="ap-form-card-title">Add a single slot</div>
                <div className="ap-inline-fields">
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" min={today} value={slotDate} onChange={e => setSlotDate(e.target.value)} required />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start</label>
                    <input type="time" className="form-input" value={slotStart} onChange={e => setSlotStart(e.target.value)} required />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">End</label>
                    <input type="time" className="form-input" value={slotEnd} onChange={e => setSlotEnd(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', marginTop: 16 }} disabled={savingSlot}>
                  {savingSlot && <span className="spinner" />}
                  Add slot
                </button>
              </form>

              <form className="ap-form-card" onSubmit={handleGenerate}>
                <div className="ap-form-card-title">Generate a full day</div>
                <div className="ap-inline-fields">
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" min={today} value={bulkDate} onChange={e => setBulkDate(e.target.value)} required />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Day start</label>
                    <input type="time" className="form-input" value={bulkStart} onChange={e => setBulkStart(e.target.value)} required />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Day end</label>
                    <input type="time" className="form-input" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} required />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Slot length</label>
                    <select className="form-input" value={bulkDuration} onChange={e => setBulkDuration(e.target.value)} style={{ appearance: 'auto' }}>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: 'auto', marginTop: 16 }} disabled={savingSlot}>
                  {savingSlot && <span className="spinner spinner-dark" />}
                  Generate slots
                </button>
              </form>
            </div>

            <div className="ap-slots-section animate-in animate-in-delay-2">
              {slotsLoading ? (
                <div className="ap-loading"><span className="spinner spinner-dark" /> Loading availability…</div>
              ) : groupedSlots.length === 0 ? (
                <div className="ap-empty">No upcoming open slots. Add some above so pet owners can book you.</div>
              ) : (
                groupedSlots.map(([dateKey, daySlots]) => (
                  <div key={dateKey} className="ap-day-group">
                    <div className="ap-day-heading">{formatDateHeading(new Date(dateKey))}</div>
                    <div className="ap-slot-grid">
                      {daySlots.map(slot => (
                        <div
                          key={slot.id}
                          className={`ap-slot-card${slot.isBooked ? ' booked' : ''}${slot.blocked ? ' blocked' : ''}`}
                        >
                          <div className="ap-slot-time">
                            {formatTime(new Date(slot.startTime))} – {formatTime(new Date(slot.endTime))}
                          </div>

                          {slot.isBooked && slot.appointment ? (
                            <div className="ap-slot-booked-info">
                              <span className="ap-slot-badge booked">Booked</span>
                              <span className="ap-slot-owner">
                                {slot.appointment.owner.profile?.fullName || slot.appointment.owner.email}
                                {slot.appointment.catProfile && ` · ${slot.appointment.catProfile.name}`}
                              </span>
                            </div>
                          ) : slot.blocked ? (
                            <div className="ap-slot-booked-info">
                              <span className="ap-slot-badge blocked">Blocked</span>
                              <button
                                className="ap-slot-unblock"
                                onClick={() => handleUnblockSlot(slot.id)}
                                title="Make available again"
                              >
                                Unblock
                              </button>
                            </div>
                          ) : editingSlotId === slot.id ? (
                            <div className="ap-slot-edit-row">
                              <input type="time" value={editStart} onChange={e => setEditStart(e.target.value)} className="ap-slot-time-input" />
                              <span className="ap-slot-time-sep">–</span>
                              <input type="time" value={editEnd} onChange={e => setEditEnd(e.target.value)} className="ap-slot-time-input" />
                              <button className="ap-slot-save" onClick={() => saveEdit(slot)}>Save</button>
                              <button className="ap-slot-cancel-edit" onClick={cancelEditing}>Cancel</button>
                            </div>
                          ) : (
                            <div className="ap-slot-booked-info">
                              <span className="ap-slot-badge open">Open</span>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="ap-slot-block"
                                  onClick={() => handleBlockSlot(slot.id)}
                                  title="Mark unavailable"
                                >
                                  Block
                                </button>
                                <button className="ap-slot-remove" onClick={() => handleDeleteSlot(slot.id)} title="Remove slot">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {tab === 'appointments' && (
          <>
            <div className="ap-toolbar animate-in animate-in-delay-1">
              <select className="ap-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {apptLoading ? (
              <div className="ap-loading"><span className="spinner spinner-dark" /> Loading appointments…</div>
            ) : appointments.length === 0 ? (
              <div className="ap-empty">No appointments found.</div>
            ) : (
              <div className="ap-appt-list animate-in animate-in-delay-2">
                {appointments.map(a => {
                  const start = new Date(a.slot.startTime)
                  const isPast = start < new Date()
                  return (
                    <div key={a.id} className="ap-appt-card">
                      <div className="ap-appt-date-block">
                        <span className="ap-appt-day">{new Intl.DateTimeFormat('en', { day: '2-digit' }).format(start)}</span>
                        <span className="ap-appt-month">{new Intl.DateTimeFormat('en', { month: 'short' }).format(start)}</span>
                      </div>
                      <div className="ap-appt-main">
                        <div className="ap-appt-top">
                          <span className="ap-appt-owner">{a.owner.profile?.fullName || a.owner.email}</span>
                          <span className={`ap-status-badge ap-status-${a.status.toLowerCase()}`}>{a.status}</span>
                        </div>
                        <div className="ap-appt-meta">
                          {formatTime(start)} – {formatTime(new Date(a.slot.endTime))}
                          {a.catProfile && ` · ${a.catProfile.name}`}
                        </div>
                        {a.reason && <p className="ap-appt-reason">{a.reason}</p>}
                        {a.status === 'CANCELLED' && a.cancelReason && (
                          <p className="ap-appt-reason ap-appt-reason-cancel">
                            Cancelled by {a.cancelledBy === 'VET' ? 'you' : 'owner'}: {a.cancelReason}
                          </p>
                        )}
                      </div>
                      {a.status === 'CONFIRMED' && (
                        <div className="ap-appt-actions">
                          {isPast && (
                            <button className="btn btn-secondary" style={{ width: 'auto', fontSize: 13, padding: '7px 14px' }} onClick={() => handleCompleteAppointment(a.id)}>
                              Mark completed
                            </button>
                          )}
                          <button className="btn btn-danger" style={{ width: 'auto', fontSize: 13, padding: '7px 14px' }} onClick={() => handleCancelAppointment(a.id)}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}