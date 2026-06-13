import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

export async function createSymptom(req: AuthRequest, res: Response) {
  const {
    name,
    description,
    affectedBodyArea,
    commonality,
    onsetSpeed,
    notes,
    diseaseIds,
  } = req.body as {
    name: string
    description: string
    affectedBodyArea?: string
    commonality?: 'RARE' | 'COMMON' | 'VERY_COMMON'
    onsetSpeed?: 'ACUTE' | 'SUBACUTE' | 'CHRONIC'
    notes?: string
    diseaseIds?: string[]
  }

  if (!name || !description) {
    res.status(400).json({ error: 'Name and description are required' })
    return
  }

  const existing = await prisma.symptom.findUnique({ where: { name } })
  if (existing) {
    res.status(409).json({ error: 'Symptom with this name already exists' })
    return
  }

  const symptom = await prisma.symptom.create({
    data: {
      name,
      description,
      affectedBodyArea: affectedBodyArea || null,
      commonality: commonality || 'COMMON',
      onsetSpeed: onsetSpeed || 'ACUTE',
      notes: notes || null,
    },
  })

  if (diseaseIds && diseaseIds.length > 0) {
    await Promise.all(
      diseaseIds.map((diseaseId: string) =>
        prisma.diseaseSymptom.create({
          data: { diseaseId, symptomId: symptom.id },
        })
      )
    )
  }

  const full = await prisma.symptom.findUnique({
    where: { id: symptom.id },
    include: {
      diseaseSymptoms: { include: { disease: true } },
    },
  })

  res.status(201).json(full)
}

export async function getSymptom(req: AuthRequest, res: Response) {
  const { id } = req.params

  const symptom = await prisma.symptom.findUnique({
    where: { id },
    include: {
      diseaseSymptoms: { include: { disease: true } },
    },
  })

  if (!symptom) {
    res.status(404).json({ error: 'Symptom not found' })
    return
  }

  res.json(symptom)
}

export async function listSymptoms(req: AuthRequest, res: Response) {
  const {
    search,
    commonality,
    onsetSpeed,
    affectedBodyArea,
    skip = '0',
    take = '20',
  } = req.query

  const skipInt = parseInt(skip as string, 10)
  const takeInt = parseInt(take as string, 10)

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { affectedBodyArea: { contains: search as string, mode: 'insensitive' } },
    ]
  }

  if (commonality) where.commonality = commonality
  if (onsetSpeed) where.onsetSpeed = onsetSpeed
  if (affectedBodyArea) {
    where.affectedBodyArea = { contains: affectedBodyArea as string, mode: 'insensitive' }
  }

  const [symptoms, total] = await Promise.all([
    prisma.symptom.findMany({
      where,
      include: {
        diseaseSymptoms: { include: { disease: true } },
      },
      skip: skipInt,
      take: takeInt,
      orderBy: { name: 'asc' },
    }),
    prisma.symptom.count({ where }),
  ])

  res.json({
    data: symptoms,
    pagination: {
      total,
      skip: skipInt,
      take: takeInt,
      hasMore: skipInt + takeInt < total,
    },
  })
}

export async function searchSymptoms(req: AuthRequest, res: Response) {
  const { q } = req.query

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Search query is required' })
    return
  }

  const symptoms = await prisma.symptom.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { affectedBodyArea: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: {
      diseaseSymptoms: { include: { disease: true } },
    },
    take: 20,
    orderBy: { name: 'asc' },
  })

  res.json(symptoms)
}

export async function updateSymptom(req: AuthRequest, res: Response) {
  const { id } = req.params
  const {
    name,
    description,
    affectedBodyArea,
    commonality,
    onsetSpeed,
    notes,
    diseaseIds,
  } = req.body as {
    name?: string
    description?: string
    affectedBodyArea?: string
    commonality?: 'RARE' | 'COMMON' | 'VERY_COMMON'
    onsetSpeed?: 'ACUTE' | 'SUBACUTE' | 'CHRONIC'
    notes?: string
    diseaseIds?: string[]
  }

  const symptom = await prisma.symptom.findUnique({ where: { id } })
  if (!symptom) {
    res.status(404).json({ error: 'Symptom not found' })
    return
  }

  if (name && name !== symptom.name) {
    const existing = await prisma.symptom.findUnique({ where: { name } })
    if (existing) {
      res.status(409).json({ error: 'Symptom with this name already exists' })
      return
    }
  }

  await prisma.symptom.update({
    where: { id },
    data: {
      name: name ?? symptom.name,
      description: description ?? symptom.description,
      affectedBodyArea: affectedBodyArea !== undefined ? affectedBodyArea || null : symptom.affectedBodyArea,
      commonality: commonality ?? symptom.commonality,
      onsetSpeed: onsetSpeed ?? symptom.onsetSpeed,
      notes: notes !== undefined ? notes || null : symptom.notes,
    },
  })

  if (diseaseIds !== undefined) {
    await prisma.diseaseSymptom.deleteMany({ where: { symptomId: id } })
    if (diseaseIds.length > 0) {
      await Promise.all(
        diseaseIds.map((diseaseId: string) =>
          prisma.diseaseSymptom.create({
            data: { diseaseId, symptomId: id },
          })
        )
      )
    }
  }

  const full = await prisma.symptom.findUnique({
    where: { id },
    include: {
      diseaseSymptoms: { include: { disease: true } },
    },
  })

  res.json(full)
}

export async function deleteSymptom(req: AuthRequest, res: Response) {
  const { id } = req.params

  const symptom = await prisma.symptom.findUnique({ where: { id } })
  if (!symptom) {
    res.status(404).json({ error: 'Symptom not found' })
    return
  }

  await prisma.symptom.delete({ where: { id } })
  res.status(204).send()
}

export async function linkDiseases(req: AuthRequest, res: Response) {
  const { id } = req.params
  const { diseaseIds } = req.body as { diseaseIds: string[] }

  const symptom = await prisma.symptom.findUnique({ where: { id } })
  if (!symptom) {
    res.status(404).json({ error: 'Symptom not found' })
    return
  }

  await Promise.all(
    diseaseIds.map((diseaseId: string) =>
      prisma.diseaseSymptom.upsert({
        where: { diseaseId_symptomId: { diseaseId, symptomId: id } },
        update: {},
        create: { diseaseId, symptomId: id },
      })
    )
  )

  const full = await prisma.symptom.findUnique({
    where: { id },
    include: { diseaseSymptoms: { include: { disease: true } } },
  })

  res.json(full)
}

export async function unlinkDisease(req: AuthRequest, res: Response) {
  const { id, diseaseId } = req.params

  await prisma.diseaseSymptom.deleteMany({
    where: { symptomId: id, diseaseId },
  })

  const full = await prisma.symptom.findUnique({
    where: { id },
    include: { diseaseSymptoms: { include: { disease: true } } },
  })

  res.json(full)
}