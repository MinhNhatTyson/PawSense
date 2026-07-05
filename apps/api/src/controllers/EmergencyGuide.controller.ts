import type { Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const guideInclude = {
  createdBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
  approvedBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
}

// ── CREATE (VET only) — always starts as DRAFT, needs peer approval ──────────
export async function createEmergencyGuide(req: AuthRequest, res: Response) {
  const {
    title, category, urgency, summary,
    emergencySymptoms, firstAidSteps, doNots, whenToSeekVet,
  } = req.body as {
    title: string
    category: string
    urgency?: 'CRITICAL' | 'URGENT'
    summary: string
    emergencySymptoms?: string | string[]
    firstAidSteps?: string | string[]
    doNots?: string | string[]
    whenToSeekVet: string
  }

  if (!title || !category || !summary || !whenToSeekVet) {
    res.status(400).json({ error: 'Title, category, summary, and "when to seek vet" are required' })
    return
  }

  const existing = await prisma.emergencyGuide.findUnique({ where: { title } })
  if (existing) {
    res.status(409).json({ error: 'An emergency guide with this title already exists' })
    return
  }

  let imageUrl: string | undefined
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/emergency-guides',
    })
    imageUrl = result.secure_url
  }

  const parseArr = (v: string | string[] | undefined): string[] =>
    Array.isArray(v) ? v : v ? JSON.parse(v) : []

  const guide = await prisma.emergencyGuide.create({
    data: {
      title,
      category,
      urgency: urgency || 'URGENT',
      summary,
      emergencySymptoms: parseArr(emergencySymptoms),
      firstAidSteps: parseArr(firstAidSteps),
      doNots: parseArr(doNots),
      whenToSeekVet,
      imageUrl: imageUrl ?? null,
      createdById: req.userId ?? null,
      // status defaults to DRAFT — must be approved by another vet before
      // it is treated as verified guidance in the UI
    },
    include: guideInclude,
  })

  res.status(201).json(guide)
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
export async function getEmergencyGuide(req: AuthRequest, res: Response) {
  const { id } = req.params
  const guide = await prisma.emergencyGuide.findUnique({ where: { id }, include: guideInclude })
  if (!guide) { res.status(404).json({ error: 'Emergency guide not found' }); return }
  res.json(guide)
}

// ── LIST (all authenticated users can read) ───────────────────────────────────
export async function listEmergencyGuides(req: AuthRequest, res: Response) {
  const { search, category, urgency, status } = req.query

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { summary: { contains: search as string, mode: 'insensitive' } },
      { emergencySymptoms: { hasSome: [search as string] } },
    ]
  }
  if (category) where.category = category
  if (urgency) where.urgency = urgency
  if (status) where.status = status

  const guides = await prisma.emergencyGuide.findMany({
    where,
    include: guideInclude,
    orderBy: [{ urgency: 'asc' }, { title: 'asc' }],
  })

  res.json(guides)
}

// ── UPDATE (VET only) — edits reset status to DRAFT so it re-enters review ────
export async function updateEmergencyGuide(req: AuthRequest, res: Response) {
  const { id } = req.params
  const {
    title, category, urgency, summary,
    emergencySymptoms, firstAidSteps, doNots, whenToSeekVet,
  } = req.body as Record<string, string | string[] | undefined>

  const guide = await prisma.emergencyGuide.findUnique({ where: { id } })
  if (!guide) { res.status(404).json({ error: 'Emergency guide not found' }); return }

  if (title && title !== guide.title) {
    const dupe = await prisma.emergencyGuide.findUnique({ where: { title: title as string } })
    if (dupe) { res.status(409).json({ error: 'An emergency guide with this title already exists' }); return }
  }

  let imageUrl = guide.imageUrl
  if (req.file) {
    if (guide.imageUrl) {
      const publicId = guide.imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
      await cloudinary.uploader.destroy(`PawSense/emergency-guides/${publicId}`)
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/emergency-guides',
    })
    imageUrl = result.secure_url
  }

  const parseArr = (v: string | string[] | undefined, fallback: string[]) =>
    v !== undefined ? (Array.isArray(v) ? v : JSON.parse(v)) : fallback

  const updated = await prisma.emergencyGuide.update({
    where: { id },
    data: {
      title: (title as string) ?? guide.title,
      category: (category as string) ?? guide.category,
      urgency: (urgency as any) ?? guide.urgency,
      summary: (summary as string) ?? guide.summary,
      emergencySymptoms: parseArr(emergencySymptoms, guide.emergencySymptoms),
      firstAidSteps: parseArr(firstAidSteps, guide.firstAidSteps),
      doNots: parseArr(doNots, guide.doNots),
      whenToSeekVet: (whenToSeekVet as string) ?? guide.whenToSeekVet,
      imageUrl,
      // Any edit — even by the original author or an approver — must be
      // re-reviewed before it counts as verified guidance again.
      status: 'DRAFT',
      approvedById: null,
      approvedAt: null,
    },
    include: guideInclude,
  })

  res.json(updated)
}

// ── DELETE (VET only) ──────────────────────────────────────────────────────────
export async function deleteEmergencyGuide(req: AuthRequest, res: Response) {
  const { id } = req.params
  const guide = await prisma.emergencyGuide.findUnique({ where: { id } })
  if (!guide) { res.status(404).json({ error: 'Emergency guide not found' }); return }

  if (guide.imageUrl) {
    const publicId = guide.imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
    await cloudinary.uploader.destroy(`PawSense/emergency-guides/${publicId}`)
  }

  await prisma.emergencyGuide.delete({ where: { id } })
  res.status(204).send()
}