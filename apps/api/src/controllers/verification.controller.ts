import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

// ── APPROVE DISEASE ───────────────────────────────────────────────────────────
export async function approveDisease(req: AuthRequest, res: Response) {
  const { id } = req.params
  const approverId = req.userId!

  const disease = await prisma.disease.findUnique({ where: { id } })
  if (!disease) {
    res.status(404).json({ error: 'Disease not found' })
    return
  }
  if (disease.createdById === approverId) {
    res.status(403).json({ error: 'You cannot approve a record you created' })
    return
  }
  if (disease.status === 'APPROVED') {
    res.status(400).json({ error: 'Record is already approved' })
    return
  }

  const updated = await prisma.disease.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedById: approverId,
      approvedAt: new Date(),
    },
  })

  res.json(updated)
}

// ── APPROVE MEDICINE ──────────────────────────────────────────────────────────
export async function approveMedicine(req: AuthRequest, res: Response) {
  const { id } = req.params
  const approverId = req.userId!

  const medicine = await prisma.medicine.findUnique({ where: { id } })
  if (!medicine) {
    res.status(404).json({ error: 'Medicine not found' })
    return
  }
  if (medicine.createdById === approverId) {
    res.status(403).json({ error: 'You cannot approve a record you created' })
    return
  }
  if (medicine.status === 'APPROVED') {
    res.status(400).json({ error: 'Record is already approved' })
    return
  }

  const updated = await prisma.medicine.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedById: approverId,
      approvedAt: new Date(),
    },
  })

  res.json(updated)
}

// ── RAISE FLAG ────────────────────────────────────────────────────────────────
export async function raiseFlag(req: AuthRequest, res: Response) {
  const { contentType, contentId, reason } = req.body as {
    contentType: 'DISEASE' | 'MEDICINE'
    contentId: string
    reason: string
  }
  const raisedById = req.userId!

  if (!contentType || !contentId || !reason?.trim()) {
    res.status(400).json({ error: 'contentType, contentId and reason are required' })
    return
  }

  // Verify the content exists
  if (contentType === 'DISEASE') {
    const disease = await prisma.disease.findUnique({ where: { id: contentId } })
    if (!disease) { res.status(404).json({ error: 'Disease not found' }); return }
  } else {
    const medicine = await prisma.medicine.findUnique({ where: { id: contentId } })
    if (!medicine) { res.status(404).json({ error: 'Medicine not found' }); return }
  }

  // Check for existing open flag from same user
  const existing = await prisma.contentFlag.findFirst({
    where: { contentType, contentId, raisedById, status: 'OPEN' },
  })
  if (existing) {
    res.status(409).json({ error: 'You already have an open flag on this record' })
    return
  }

  // Mark content as FLAGGED
  if (contentType === 'DISEASE') {
    await prisma.disease.update({ where: { id: contentId }, data: { status: 'FLAGGED' } })
  } else {
    await prisma.medicine.update({ where: { id: contentId }, data: { status: 'FLAGGED' } })
  }

  const flag = await prisma.contentFlag.create({
    data: { contentType, contentId, reason, raisedById },
    include: { raisedBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } } },
  })

  res.status(201).json(flag)
}

// ── LIST FLAGS ────────────────────────────────────────────────────────────────
export async function listFlags(req: AuthRequest, res: Response) {
  const { status, contentType } = req.query
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (contentType) where.contentType = contentType

  const flags = await prisma.contentFlag.findMany({
    where,
    include: {
      raisedBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      resolvedBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(flags)
}

// ── RESOLVE FLAG ──────────────────────────────────────────────────────────────
export async function resolveFlag(req: AuthRequest, res: Response) {
  const { id } = req.params
  const { resolverNote } = req.body as { resolverNote?: string }
  const resolvedById = req.userId!

  const flag = await prisma.contentFlag.findUnique({ where: { id } })
  if (!flag) { res.status(404).json({ error: 'Flag not found' }); return }
  if (flag.status !== 'OPEN') {
    res.status(400).json({ error: 'Flag is not open' }); return
  }

  await prisma.contentFlag.update({
    where: { id },
    data: { status: 'RESOLVED', resolvedById, resolverNote: resolverNote || null },
  })

  // If no other open flags remain, move content back to DRAFT
  const remainingFlags = await prisma.contentFlag.count({
    where: { contentId: flag.contentId, contentType: flag.contentType, status: 'OPEN' },
  })
  if (remainingFlags === 0) {
    if (flag.contentType === 'DISEASE') {
      await prisma.disease.update({ where: { id: flag.contentId }, data: { status: 'DRAFT' } })
    } else {
      await prisma.medicine.update({ where: { id: flag.contentId }, data: { status: 'DRAFT' } })
    }
  }

  res.json({ success: true })
}

// ── DISMISS FLAG ──────────────────────────────────────────────────────────────
export async function dismissFlag(req: AuthRequest, res: Response) {
  const { id } = req.params
  const { resolverNote } = req.body as { resolverNote?: string }
  const resolvedById = req.userId!

  const flag = await prisma.contentFlag.findUnique({ where: { id } })
  if (!flag) { res.status(404).json({ error: 'Flag not found' }); return }
  if (flag.status !== 'OPEN') {
    res.status(400).json({ error: 'Flag is not open' }); return
  }

  await prisma.contentFlag.update({
    where: { id },
    data: { status: 'DISMISSED', resolvedById, resolverNote: resolverNote || null },
  })

  // If no other open flags remain, move content back to DRAFT
  const remainingFlags = await prisma.contentFlag.count({
    where: { contentId: flag.contentId, contentType: flag.contentType, status: 'OPEN' },
  })
  if (remainingFlags === 0) {
    if (flag.contentType === 'DISEASE') {
      await prisma.disease.update({ where: { id: flag.contentId }, data: { status: 'DRAFT' } })
    } else {
      await prisma.medicine.update({ where: { id: flag.contentId }, data: { status: 'DRAFT' } })
    }
  }

  res.json({ success: true })
}

// ── LIST PENDING ──────────────────────────────────────────────────────────────
export async function listPendingContent(req: AuthRequest, res: Response) {
  const [diseases, medicines] = await Promise.all([
    prisma.disease.findMany({
      where: { status: { in: ['DRAFT', 'FLAGGED'] } },
      select: {
        id: true, name: true, severity: true, status: true, createdAt: true,
        createdBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.medicine.findMany({
      where: { status: { in: ['DRAFT', 'FLAGGED'] } },
      select: {
        id: true, name: true, dosage: true, status: true, createdAt: true,
        createdBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  res.json({ diseases, medicines })
}