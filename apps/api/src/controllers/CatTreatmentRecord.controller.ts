import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const recordInclude = {
  treatment: { select: { id: true, name: true, estimatedDuration: true } },
  catProfile: { select: { id: true, name: true, ownerId: true } },
  administeredBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
}

// ── CREATE (VET only) ─────────────────────────────────────────────────────────
export async function createCatTreatmentRecord(req: AuthRequest, res: Response) {
  const administeredById = req.userId!
  const { catProfileId, treatmentId, notes, administeredAt } = req.body as {
    catProfileId: string
    treatmentId: string
    notes?: string
    administeredAt?: string
  }

  if (!catProfileId || !treatmentId) {
    res.status(400).json({ error: 'catProfileId and treatmentId are required' })
    return
  }

  const [catProfile, treatment] = await Promise.all([
    prisma.catProfile.findUnique({ where: { id: catProfileId } }),
    prisma.treatment.findUnique({ where: { id: treatmentId } }),
  ])
  if (!catProfile) { res.status(404).json({ error: 'Cat profile not found' }); return }
  if (!treatment) { res.status(404).json({ error: 'Treatment not found' }); return }

  const record = await prisma.catTreatmentRecord.create({
    data: {
      catProfileId,
      treatmentId,
      administeredById,
      notes: notes || null,
      administeredAt: administeredAt ? new Date(administeredAt) : undefined,
    },
    include: recordInclude,
  })

  res.status(201).json(record)
}

// ── LIST (VET only) — optionally filter by catProfileId ───────────────────────
export async function listCatTreatmentRecords(req: AuthRequest, res: Response) {
  const { catProfileId } = req.query

  const records = await prisma.catTreatmentRecord.findMany({
    where: catProfileId ? { catProfileId: catProfileId as string } : undefined,
    include: recordInclude,
    orderBy: { administeredAt: 'desc' },
  })

  res.json(records)
}

// ── DELETE (VET only) ──────────────────────────────────────────────────────────
export async function deleteCatTreatmentRecord(req: AuthRequest, res: Response) {
  const { id } = req.params

  const record = await prisma.catTreatmentRecord.findUnique({ where: { id } })
  if (!record) { res.status(404).json({ error: 'Treatment record not found' }); return }

  await prisma.catTreatmentRecord.delete({ where: { id } })
  res.status(204).send()
}