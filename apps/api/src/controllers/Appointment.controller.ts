import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const appointmentInclude = {
  slot: true,
  vet: { select: { id: true, email: true, profile: { select: { fullName: true, clinicName: true, address: true, phone: true } } } },
  owner: { select: { id: true, email: true, profile: { select: { fullName: true, phone: true } } } },
  catProfile: { select: { id: true, name: true } },
}

// ── BOOK (CUSTOMER only) ─────────────────────────────────────────────────────
export async function bookAppointment(req: AuthRequest, res: Response) {
  const ownerId = req.userId!
  const { slotId, catProfileId, reason } = req.body as {
    slotId: string
    catProfileId?: string
    reason?: string
  }

  if (!slotId) {
    res.status(400).json({ error: 'slotId is required' })
    return
  }

  if (catProfileId) {
    const cat = await prisma.catProfile.findUnique({ where: { id: catProfileId } })
    if (!cat || cat.ownerId !== ownerId) {
      res.status(404).json({ error: 'Cat profile not found' })
      return
    }
  }

  try {
    const now = new Date()

    const appointment = await prisma.$transaction(async (tx: any) => {
      // Make booking race-safe: only flip isBooked from false -> true if it is still open.
      const updatedSlot = await tx.vetAvailabilitySlot.updateMany({
        where: {
          id: slotId,
          isBooked: false,
          blocked: false,          
          startTime: { gte: now },
        },
        data: { isBooked: true },
      })

      if (updatedSlot.count === 0) {
        const slot = await tx.vetAvailabilitySlot.findUnique({ where: { id: slotId } })
        if (!slot) throw new Error('SLOT_NOT_FOUND')
        if (slot.isBooked) throw new Error('SLOT_TAKEN')
        if (slot.blocked) throw new Error('SLOT_BLOCKED')  
        if (slot.startTime < now) throw new Error('SLOT_PAST')
        throw new Error('SLOT_NOT_AVAILABLE')
      }

      const slot = await tx.vetAvailabilitySlot.findUnique({ where: { id: slotId } })
      if (!slot) throw new Error('SLOT_NOT_FOUND')

      return tx.appointment.create({
        data: {
          ownerId,
          vetId: slot.vetId,
          slotId,
          catProfileId: catProfileId || null,
          reason: reason || null,
        },
        include: appointmentInclude,
      })
    })

    res.status(201).json(appointment)
  } catch (err: any) {
    if (err.message === 'SLOT_NOT_FOUND') { res.status(404).json({ error: 'Slot not found' }); return }
    if (err.message === 'SLOT_TAKEN') { res.status(409).json({ error: 'This slot has just been booked by someone else' }); return }
    if (err.message === 'SLOT_PAST') { res.status(400).json({ error: 'This slot is no longer available' }); return }
    if (err.message === 'SLOT_NOT_AVAILABLE') { res.status(409).json({ error: 'This slot is no longer available' }); return }
    if (err.message === 'SLOT_BLOCKED') { res.status(409).json({ error: 'This slot is not available for booking' }); return }
    throw err
  }
}

// ── LIST as owner (CUSTOMER only) ───────────────────────────────────────────
export async function listMyAppointments(req: AuthRequest, res: Response) {
  const ownerId = req.userId!
  const appointments = await prisma.appointment.findMany({
    where: { ownerId },
    include: appointmentInclude,
    orderBy: { slot: { startTime: 'desc' } },
  })
  res.json(appointments)
}

// ── LIST as vet (VET only) ──────────────────────────────────────────────────
export async function listVetAppointments(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { status } = req.query

  const appointments = await prisma.appointment.findMany({
    where: { vetId, ...(status ? { status: status as any } : {}) },
    include: appointmentInclude,
    orderBy: { slot: { startTime: 'asc' } },
  })
  res.json(appointments)
}

// ── CANCEL (owner or vet) ───────────────────────────────────────────────────
export async function cancelAppointment(req: AuthRequest, res: Response) {
  const userId = req.userId!
  const userRole = req.userRole
  const { id } = req.params
  const { cancelReason } = req.body as { cancelReason?: string }

  const appointment = await prisma.appointment.findUnique({ where: { id } })
  if (!appointment) { res.status(404).json({ error: 'Appointment not found' }); return }
  if (appointment.ownerId !== userId && appointment.vetId !== userId) {
    res.status(403).json({ error: 'You do not have access to this appointment' })
    return
  }
  if (appointment.status !== 'CONFIRMED') {
    res.status(400).json({ error: 'Only confirmed appointments can be cancelled' })
    return
  }

  await prisma.$transaction([
    prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy: userRole === 'VET' ? 'VET' : 'OWNER',
        cancelReason: cancelReason || null,
      },
    }),
    // Free the slot if it still exists.
    prisma.vetAvailabilitySlot.updateMany({
      where: { id: appointment.slotId },
      data: { isBooked: false },
    }),
  ])

  const full = await prisma.appointment.findUnique({ where: { id }, include: appointmentInclude })
  res.json(full)
}

// ── COMPLETE (VET only) ─────────────────────────────────────────────────────
export async function completeAppointment(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { id } = req.params

  const appointment = await prisma.appointment.findUnique({ where: { id } })
  if (!appointment || appointment.vetId !== vetId) {
    res.status(404).json({ error: 'Appointment not found' })
    return
  }
  if (appointment.status !== 'CONFIRMED') {
    res.status(400).json({ error: 'Only confirmed appointments can be marked completed' })
    return
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    await tx.vetAvailabilitySlot.updateMany({
      where: { id: appointment.slotId },
      data: { isBooked: false },
    })

    return tx.appointment.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: appointmentInclude,
    })
  })

  res.json(updated)
}