import type { Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const treatmentInclude = {
  steps: { orderBy: { stepOrder: 'asc' as const } },
  diseaseTreatments: { include: { disease: true } },
}

// ── CREATE ────────────────────────────────────────────────────────────────────
export async function createTreatment(req: AuthRequest, res: Response) {
  const {
    name,
    description,
    contraindications,
    vetNotes,
    estimatedDuration,
    estimatedCost,
    successRate,
    steps,
    diseaseIds,
  } = req.body as {
    name: string
    description: string
    contraindications?: string[]
    vetNotes?: string
    estimatedDuration?: string
    estimatedCost?: string
    successRate?: string
    steps?: string
    diseaseIds?: string
  }

  if (!name || !description) {
    res.status(400).json({ error: 'Name and description are required' })
    return
  }

  const existing = await prisma.treatment.findUnique({ where: { name } })
  if (existing) {
    res.status(409).json({ error: 'Treatment with this name already exists' })
    return
  }

  let imageUrl: string | undefined
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/treatments',
    })
    imageUrl = result.secure_url
  }

  const parsedContra: string[] = Array.isArray(contraindications)
    ? contraindications
    : contraindications ? JSON.parse(contraindications) : []

  const parsedSteps: Array<{ title: string; description: string; durationMinutes?: number }> =
    steps ? JSON.parse(steps) : []

  const parsedDiseaseIds: string[] = Array.isArray(diseaseIds)
    ? diseaseIds
    : diseaseIds ? JSON.parse(diseaseIds) : []

  const parsedSuccessRate = successRate ? parseFloat(successRate) : undefined

  const treatment = await prisma.treatment.create({
    data: {
      name,
      description,
      contraindications: parsedContra,
      vetNotes: vetNotes || null,
      estimatedDuration: estimatedDuration || null,
      estimatedCost: estimatedCost || null,
      successRate: parsedSuccessRate ?? null,
      imageUrl: imageUrl ?? null,
    },
  })

  // Create steps
  if (parsedSteps.length > 0) {
    await Promise.all(
      parsedSteps.map((step, idx) =>
        prisma.treatmentStep.create({
          data: {
            treatmentId: treatment.id,
            stepOrder: idx + 1,
            title: step.title,
            description: step.description,
            durationMinutes: step.durationMinutes ?? null,
          },
        })
      )
    )
  }

  // Link diseases
  if (parsedDiseaseIds.length > 0) {
    await Promise.all(
      parsedDiseaseIds.map((diseaseId) =>
        prisma.diseaseTreatment.create({
          data: { diseaseId, treatmentId: treatment.id },
        })
      )
    )
  }

  const full = await prisma.treatment.findUnique({
    where: { id: treatment.id },
    include: treatmentInclude,
  })

  res.status(201).json(full)
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
export async function getTreatment(req: AuthRequest, res: Response) {
  const { id } = req.params

  const treatment = await prisma.treatment.findUnique({
    where: { id },
    include: treatmentInclude,
  })

  if (!treatment) {
    res.status(404).json({ error: 'Treatment not found' })
    return
  }

  res.json(treatment)
}

// ── LIST ──────────────────────────────────────────────────────────────────────
export async function listTreatments(req: AuthRequest, res: Response) {
  const { search, skip = '0', take = '12' } = req.query

  const skipInt = parseInt(skip as string, 10)
  const takeInt = parseInt(take as string, 10)

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ]
  }

  const [treatments, total] = await Promise.all([
    prisma.treatment.findMany({
      where,
      include: treatmentInclude,
      skip: skipInt,
      take: takeInt,
      orderBy: { name: 'asc' },
    }),
    prisma.treatment.count({ where }),
  ])

  res.json({
    data: treatments,
    pagination: { total, skip: skipInt, take: takeInt, hasMore: skipInt + takeInt < total },
  })
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
export async function searchTreatments(req: AuthRequest, res: Response) {
  const { q } = req.query

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Search query is required' })
    return
  }

  const treatments = await prisma.treatment.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: treatmentInclude,
    take: 20,
  })

  res.json(treatments)
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
export async function updateTreatment(req: AuthRequest, res: Response) {
  const { id } = req.params
  const {
    name,
    description,
    contraindications,
    vetNotes,
    estimatedDuration,
    estimatedCost,
    successRate,
    steps,
    diseaseIds,
  } = req.body as {
    name?: string
    description?: string
    contraindications?: string[]
    vetNotes?: string
    estimatedDuration?: string
    estimatedCost?: string
    successRate?: string
    steps?: string
    diseaseIds?: string
  }

  const treatment = await prisma.treatment.findUnique({ where: { id } })
  if (!treatment) {
    res.status(404).json({ error: 'Treatment not found' })
    return
  }

  if (name && name !== treatment.name) {
    const existing = await prisma.treatment.findUnique({ where: { name } })
    if (existing) {
      res.status(409).json({ error: 'Treatment with this name already exists' })
      return
    }
  }

  let imageUrl = treatment.imageUrl

  if (req.file) {
    if (treatment.imageUrl) {
      const publicId = treatment.imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
      await cloudinary.uploader.destroy(`PawSense/treatments/${publicId}`)
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/treatments',
    })
    imageUrl = result.secure_url
  }

  const parsedContra: string[] | undefined =
    contraindications !== undefined
      ? Array.isArray(contraindications) ? contraindications : JSON.parse(contraindications)
      : undefined

  const parsedSuccessRate =
    successRate !== undefined
      ? successRate === '' ? null : parseFloat(successRate)
      : undefined

  await prisma.treatment.update({
    where: { id },
    data: {
      name: name ?? treatment.name,
      description: description ?? treatment.description,
      contraindications: parsedContra ?? treatment.contraindications,
      vetNotes: vetNotes !== undefined ? vetNotes || null : treatment.vetNotes,
      estimatedDuration: estimatedDuration !== undefined ? estimatedDuration || null : treatment.estimatedDuration,
      estimatedCost: estimatedCost !== undefined ? estimatedCost || null : treatment.estimatedCost,
      successRate: parsedSuccessRate !== undefined ? parsedSuccessRate : treatment.successRate,
      imageUrl,
    },
  })

  // Replace steps if provided
  if (steps !== undefined) {
    const parsedSteps: Array<{ title: string; description: string; durationMinutes?: number }> =
      JSON.parse(steps)
    await prisma.treatmentStep.deleteMany({ where: { treatmentId: id } })
    if (parsedSteps.length > 0) {
      await Promise.all(
        parsedSteps.map((step, idx) =>
          prisma.treatmentStep.create({
            data: {
              treatmentId: id,
              stepOrder: idx + 1,
              title: step.title,
              description: step.description,
              durationMinutes: step.durationMinutes ?? null,
            },
          })
        )
      )
    }
  }

  // Replace disease links if provided
  if (diseaseIds !== undefined) {
    const parsed: string[] = Array.isArray(diseaseIds) ? diseaseIds : JSON.parse(diseaseIds)
    await prisma.diseaseTreatment.deleteMany({ where: { treatmentId: id } })
    if (parsed.length > 0) {
      await Promise.all(
        parsed.map((diseaseId) =>
          prisma.diseaseTreatment.create({ data: { diseaseId, treatmentId: id } })
        )
      )
    }
  }

  const full = await prisma.treatment.findUnique({
    where: { id },
    include: treatmentInclude,
  })

  res.json(full)
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function deleteTreatment(req: AuthRequest, res: Response) {
  const { id } = req.params

  const treatment = await prisma.treatment.findUnique({ where: { id } })
  if (!treatment) {
    res.status(404).json({ error: 'Treatment not found' })
    return
  }

  if (treatment.imageUrl) {
    const publicId = treatment.imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
    await cloudinary.uploader.destroy(`PawSense/treatments/${publicId}`)
  }

  await prisma.treatment.delete({ where: { id } })
  res.status(204).send()
}