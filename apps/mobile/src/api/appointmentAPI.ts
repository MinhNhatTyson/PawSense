import { apiFetch } from '../utils/apiFetch'

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

export const appointmentAPI = {
  async listSlotsForVet(vetId: string): Promise<VetAvailabilitySlot[]> {
    const res = await apiFetch(`/vet-availability/vet/${vetId}`)
    if (!res.ok) throw new Error('Failed to load availability')
    return res.json()
  },

  async book(data: { slotId: string; catProfileId?: string; reason?: string }): Promise<Appointment> {
    const res = await apiFetch('/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to book appointment')
    return json
  },

  async listMine(): Promise<Appointment[]> {
    const res = await apiFetch('/appointments/mine')
    if (!res.ok) throw new Error('Failed to load appointments')
    return res.json()
  },

  async cancel(id: string, cancelReason?: string): Promise<Appointment> {
    const res = await apiFetch(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelReason }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to cancel appointment')
    return json
  },
}