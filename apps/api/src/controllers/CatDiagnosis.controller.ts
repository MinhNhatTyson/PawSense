import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const diagnosisInclude = {
  disease: { select: { id: true, name: true, severity: true } },
  catProfile: { select: { id: true, name: true, ownerId: true } },
  diagnosedBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
}

// ── CREATE (VET only) ─────────────────────────────────────────────────────────
export async function createCatDiagnosis(req: AuthRequest, res: Response) {
  const diagnosedById = req.userId!
  const { catProfileId, diseaseId, notes, diagnosedAt } = req.body as {
    catProfileId: string
    diseaseId: string
    notes?: string
    diagnosedAt?: string
  }

  if (!catProfileId || !diseaseId) {
    res.status(400).json({ error: 'catProfileId and diseaseId are required' })
    return
  }

  const [catProfile, disease] = await Promise.all([
    prisma.catProfile.findUnique({ where: { id: catProfileId } }),
    prisma.disease.findUnique({ where: { id: diseaseId } }),
  ])
  if (!catProfile) { res.status(404).json({ error: 'Cat profile not found' }); return }
  if (!disease) { res.status(404).json({ error: 'Disease not found' }); return }

  const existing = await prisma.catDiagnosis.findUnique({
    where: { catProfileId_diseaseId: { catProfileId, diseaseId } },
  })
  if (existing) {
    res.status(409).json({ error: 'This condition is already recorded for this cat' })
    return
  }

  const diagnosis = await prisma.catDiagnosis.create({
    data: {
      catProfileId,
      diseaseId,
      diagnosedById,
      notes: notes || null,
      diagnosedAt: diagnosedAt ? new Date(diagnosedAt) : undefined,
    },
    include: diagnosisInclude,
  })

  res.status(201).json(diagnosis)
}

// ── LIST (VET only) — optionally filter by catProfileId ───────────────────────
export async function listCatDiagnoses(req: AuthRequest, res: Response) {
  const { catProfileId } = req.query

  const diagnoses = await prisma.catDiagnosis.findMany({
    where: catProfileId ? { catProfileId: catProfileId as string } : undefined,
    include: diagnosisInclude,
    orderBy: { diagnosedAt: 'desc' },
  })

  res.json(diagnoses)
}

// ── DELETE (VET only) ──────────────────────────────────────────────────────────
export async function deleteCatDiagnosis(req: AuthRequest, res: Response) {
  const { id } = req.params

  const diagnosis = await prisma.catDiagnosis.findUnique({ where: { id } })
  if (!diagnosis) { res.status(404).json({ error: 'Diagnosis record not found' }); return }

  await prisma.catDiagnosis.delete({ where: { id } })
  res.status(204).send()
}