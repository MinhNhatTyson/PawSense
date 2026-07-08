import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

// ── CREATE single slot (VET only) ──────────────────────────────────────────
export async function createSlot(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { startTime, endTime } = req.body as { startTime: string; endTime: string }

  if (!startTime || !endTime) {
    res.status(400).json({ error: 'startTime and endTime are required' })
    return
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    res.status(400).json({ error: 'Invalid time range' })
    return
  }
  if (start < new Date()) {
    res.status(400).json({ error: 'Cannot create a slot in the past' })
    return
  }

  const overlap = await prisma.vetAvailabilitySlot.findFirst({
    where: { vetId, startTime: { lt: end }, endTime: { gt: start } },
  })
  if (overlap) {
    res.status(409).json({ error: 'This slot overlaps with an existing slot' })
    return
  }

  const slot = await prisma.vetAvailabilitySlot.create({
    data: { vetId, startTime: start, endTime: end },
  })

  res.status(201).json(slot)
}

// ── BULK CREATE (VET only) — generate slots across a day ───────────────────
export async function createSlotsBulk(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { date, dayStart, dayEnd, durationMinutes } = req.body as {
    date: string
    dayStart: string
    dayEnd: string
    durationMinutes: number
  }

  if (!date || !dayStart || !dayEnd || !durationMinutes || durationMinutes < 5) {
    res.status(400).json({ error: 'date, dayStart, dayEnd and durationMinutes are required' })
    return
  }

  const [sh, sm] = dayStart.split(':').map(Number) as [number, number]
  const [eh, em] = dayEnd.split(':').map(Number) as [number, number]

  const rangeStart = new Date(date)
  rangeStart.setHours(sh, sm, 0, 0)
  const rangeEnd = new Date(date)
  rangeEnd.setHours(eh, em, 0, 0)

  if (rangeEnd <= rangeStart) {
    res.status(400).json({ error: 'dayEnd must be after dayStart' })
    return
  }

  const existing = await prisma.vetAvailabilitySlot.findMany({
    where: { vetId, startTime: { gte: rangeStart, lt: rangeEnd } },
  })

  const toCreate: { vetId: string; startTime: Date; endTime: Date }[] = []
  let cursor = new Date(rangeStart)
  while (cursor.getTime() + durationMinutes * 60000 <= rangeEnd.getTime()) {
    const slotStart = new Date(cursor)
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000)
    if (
      slotStart >= new Date() &&
      !existing.some((e: any) => e.startTime < slotEnd && e.endTime > slotStart)
    ) {
      toCreate.push({ vetId, startTime: slotStart, endTime: slotEnd })
    }
    cursor = slotEnd
  }

  if (toCreate.length === 0) {
    res.status(400).json({ error: 'No new slots to create for this range' })
    return
  }

  await prisma.vetAvailabilitySlot.createMany({ data: toCreate })

  const created = await prisma.vetAvailabilitySlot.findMany({
    where: { vetId, startTime: { gte: rangeStart, lt: rangeEnd } },
    orderBy: { startTime: 'asc' },
  })

  res.status(201).json(created)
}

// ── LIST own slots (VET only) ───────────────────────────────────────────────
export async function listMySlots(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { from } = req.query

  const start = from ? new Date(from as string) : new Date(new Date().setHours(0, 0, 0, 0))
  if (from && isNaN(start.getTime())) {
    res.status(400).json({ error: 'Invalid `from` date' })
    return
  }

  const slots = await prisma.vetAvailabilitySlot.findMany({
    where: {
      vetId,
      startTime: { gte: start },
    },
    include: {
      appointment: {
        include: {
          owner: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          catProfile: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  })

  res.json(slots)
}

// ── DELETE slot (VET only) — must not be booked ─────────────────────────────
export async function deleteSlot(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { id } = req.params

  const slot = await prisma.vetAvailabilitySlot.findUnique({ where: { id } })
  if (!slot || slot.vetId !== vetId) {
    res.status(404).json({ error: 'Slot not found' })
    return
  }
  if (slot.isBooked) {
    res.status(409).json({ error: 'Cannot delete a booked slot — cancel the appointment first' })
    return
  }

  await prisma.vetAvailabilitySlot.delete({ where: { id } })
  res.status(204).send()
}

// ── LIST public open slots for a vet (any authenticated user) ──────────────
export async function listPublicSlots(req: AuthRequest, res: Response) {
  const { vetId } = req.params

  const vet = await prisma.user.findUnique({ where: { id: vetId } })
  if (!vet || vet.role !== 'VET') {
    res.status(404).json({ error: 'Vet not found' })
    return
  }

  const now = new Date()
  const slots = await prisma.vetAvailabilitySlot.findMany({
    where: { vetId, isBooked: false, blocked: false, startTime: { gte: now } },
    orderBy: { startTime: 'asc' },
    take: 200,
  })

  res.json(slots)
}

// ── BLOCK slot (VET only) — mark unavailable without deleting ──────────────
export async function blockSlot(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { id } = req.params

  const slot = await prisma.vetAvailabilitySlot.findUnique({ where: { id } })
  if (!slot || slot.vetId !== vetId) {
    res.status(404).json({ error: 'Slot not found' })
    return
  }
  if (slot.isBooked) {
    res.status(409).json({ error: 'Cannot block a booked slot — cancel the appointment first' })
    return
  }

  const updated = await prisma.vetAvailabilitySlot.update({
    where: { id },
    data: { blocked: true },
  })
  res.json(updated)
}

// ── UNBLOCK slot (VET only) ─────────────────────────────────────────────────
export async function unblockSlot(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { id } = req.params

  const slot = await prisma.vetAvailabilitySlot.findUnique({ where: { id } })
  if (!slot || slot.vetId !== vetId) {
    res.status(404).json({ error: 'Slot not found' })
    return
  }

  const updated = await prisma.vetAvailabilitySlot.update({
    where: { id },
    data: { blocked: false },
  })
  res.json(updated)
}

// ── EDIT slot (VET only) — change start/end time in place ──────────────────
export async function editSlot(req: AuthRequest, res: Response) {
  const vetId = req.userId!
  const { id } = req.params
  const { startTime, endTime } = req.body

  if (!startTime || !endTime) {
    res.status(400).json({ error: 'startTime and endTime are required' })
    return
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    res.status(400).json({ error: 'Invalid time range' })
    return
  }

  const slot = await prisma.vetAvailabilitySlot.findUnique({ where: { id } })
  if (!slot || slot.vetId !== vetId) {
    res.status(404).json({ error: 'Slot not found' })
    return
  }
  if (slot.isBooked) {
    res.status(409).json({ error: 'Cannot edit a booked slot — cancel the appointment first' })
    return
  }
  if (slot.blocked) {
    res.status(409).json({ error: 'Cannot edit a blocked slot — unblock it first' })
    return
  }

  // Overlap check against this vet's other slots (excluding self)
  const overlap = await prisma.vetAvailabilitySlot.findFirst({
    where: {
      vetId,
      id: { not: id },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  })
  if (overlap) {
    res.status(409).json({ error: 'This time overlaps an existing slot' })
    return
  }

  const updated = await prisma.vetAvailabilitySlot.update({
    where: { id },
    data: { startTime: start, endTime: end },
  })
  res.json(updated)
}