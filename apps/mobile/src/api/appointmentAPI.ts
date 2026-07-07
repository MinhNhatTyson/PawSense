import { storage } from '../utils/storage'
import { API_URL } from '../config'

export interface VetAvailabilitySlot {
  id: string
  vetId: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export type AppointmentStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface Appointment {
  id: string
  status: AppointmentStatus
  reason?: string | null
  cancelReason?: string | null
  cancelledBy?: 'OWNER' | 'VET' | null
  slot: { id: string; startTime: string; endTime: string }
  vet: { id: string; email: string; profile?: { fullName?: string; clinicName?: string; address?: string; phone?: string } }
  catProfile?: { id: string; name: string } | null
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export const appointmentAPI = {
  async listSlotsForVet(vetId: string): Promise<VetAvailabilitySlot[]> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/vet-availability/vet/${vetId}`, { headers })
    if (!res.ok) throw new Error('Failed to load availability')
    return res.json()
  },

  async book(data: { slotId: string; catProfileId?: string; reason?: string }): Promise<Appointment> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST', headers, body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to book appointment')
    return json
  },

  async listMine(): Promise<Appointment[]> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/appointments/mine`, { headers })
    if (!res.ok) throw new Error('Failed to load appointments')
    return res.json()
  },

  async cancel(id: string, cancelReason?: string): Promise<Appointment> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
      method: 'PATCH', headers, body: JSON.stringify({ cancelReason }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to cancel appointment')
    return json
  },
}