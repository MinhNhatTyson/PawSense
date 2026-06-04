import type { Request, Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function createDisease(req: AuthRequest, res: Response) {
  const {
    name,
    description,
    causes,
    symptoms,
    severity,
    preventionMethods,
    treatmentMethods,
    recoveryPeriod,
    relatedDiseaseIds,
  } = req.body as {
    name: string
    description: string
    causes: string[]
    symptoms: string[]
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    preventionMethods: string[]
    treatmentMethods: string[]
    recoveryPeriod: string
    relatedDiseaseIds?: string[]
  }

  if (!name || !description) {
    res.status(400).json({ error: 'Name and description are required' })
    return
  }

  const existing = await prisma.disease.findUnique({ where: { name } })
  if (existing) {
    res.status(409).json({ error: 'Disease with this name already exists' })
    return
  }

  let imageUrl: string | undefined

  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`

    const cloudinaryRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/diseases',
    })
    imageUrl = cloudinaryRes.secure_url
  }

  const disease = await prisma.disease.create({
    data: {
      name,
      description,
      causes: causes || [],
      symptoms: symptoms || [],
      severity: severity || 'MEDIUM',
      preventionMethods: preventionMethods || [],
      treatmentMethods: treatmentMethods || [],
      recoveryPeriod,
      imageUrl,
    },
  })

  if (relatedDiseaseIds && relatedDiseaseIds.length > 0) {
    await Promise.all(
      relatedDiseaseIds.map((relatedId: string) =>
        prisma.relatedDisease.create({
          data: {
            diseaseFromId: disease.id,
            diseaseToId: relatedId,
          },
        })
      )
    )
  }

  const fullDisease = await prisma.disease.findUnique({
    where: { id: disease.id },
    include: {
      relatedDiseasesFrom: { include: { diseaseTo: true } },
      relatedDiseasesTo: { include: { diseaseFrom: true } },
      medicines: true,
    },
  })

  res.status(201).json(fullDisease)
}

export async function getDisease(req: AuthRequest, res: Response) {
  const { id } = req.params

  const disease = await prisma.disease.findUnique({
    where: { id },
    include: {
      relatedDiseasesFrom: { include: { diseaseTo: true } },
      relatedDiseasesTo: { include: { diseaseFrom: true } },
      medicines: true,
    },
  })

  if (!disease) {
    res.status(404).json({ error: 'Disease not found' })
    return
  }

  res.json(disease)
}

export async function listDiseases(req: AuthRequest, res: Response) {
  const { search, severity, skip = '0', take = '10' } = req.query

  const skipInt = parseInt(skip as string, 10)
  const takeInt = parseInt(take as string, 10)

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { symptoms: { hasSome: [search as string] } },
    ]
  }

  if (severity) {
    where.severity = severity
  }

  const [diseases, total] = await Promise.all([
    prisma.disease.findMany({
      where,
      include: {
        relatedDiseasesFrom: { include: { diseaseTo: true } },
        relatedDiseasesTo: { include: { diseaseFrom: true } },
        medicines: true,
      },
      skip: skipInt,
      take: takeInt,
    }),
    prisma.disease.count({ where }),
  ])

  res.json({
    data: diseases,
    pagination: {
      total,
      skip: skipInt,
      take: takeInt,
      hasMore: skipInt + takeInt < total,
    },
  })
}

export async function searchDiseases(req: AuthRequest, res: Response) {
  const { q } = req.query

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Search query is required' })
    return
  }

  const diseases = await prisma.disease.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { symptoms: { hasSome: [q] } },
        { causes: { hasSome: [q] } },
      ],
    },
    include: {
      relatedDiseasesFrom: { include: { diseaseTo: true } },
      relatedDiseasesTo: { include: { diseaseFrom: true } },
      medicines: true,
    },
    take: 20,
  })

  res.json(diseases)
}

export async function updateDisease(req: AuthRequest, res: Response) {
  const { id } = req.params
  const {
    name,
    description,
    causes,
    symptoms,
    severity,
    preventionMethods,
    treatmentMethods,
    recoveryPeriod,
    relatedDiseaseIds,
  } = req.body as {
    name?: string
    description?: string
    causes?: string[]
    symptoms?: string[]
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    preventionMethods?: string[]
    treatmentMethods?: string[]
    recoveryPeriod?: string
    relatedDiseaseIds?: string[]
  }

  const disease = await prisma.disease.findUnique({ where: { id } })
  if (!disease) {
    res.status(404).json({ error: 'Disease not found' })
    return
  }

  if (name && name !== disease.name) {
    const existing = await prisma.disease.findUnique({ where: { name } })
    if (existing) {
      res.status(409).json({ error: 'Disease with this name already exists' })
      return
    }
  }

  let imageUrl = disease.imageUrl

  if (req.file) {
    if (disease.imageUrl) {
      const publicId = disease.imageUrl.split('/').slice(-1)[0].split('.')[0]
      await cloudinary.uploader.destroy(`PawSense/diseases/${publicId}`)
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`

    const cloudinaryRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/diseases',
    })
    imageUrl = cloudinaryRes.secure_url
  }

  const updated = await prisma.disease.update({
    where: { id },
    data: {
      name: name ?? disease.name,
      description: description ?? disease.description,
      causes: causes ?? disease.causes,
      symptoms: symptoms ?? disease.symptoms,
      severity: severity ?? disease.severity,
      preventionMethods: preventionMethods ?? disease.preventionMethods,
      treatmentMethods: treatmentMethods ?? disease.treatmentMethods,
      recoveryPeriod: recoveryPeriod ?? disease.recoveryPeriod,
      imageUrl,
    },
  })

  if (relatedDiseaseIds !== undefined) {
    await prisma.relatedDisease.deleteMany({
      where: { diseaseFromId: id },
    })

    if (relatedDiseaseIds.length > 0) {
      await Promise.all(
        relatedDiseaseIds.map((relatedId: string) =>
          prisma.relatedDisease.create({
            data: {
              diseaseFromId: id,
              diseaseToId: relatedId,
            },
          })
        )
      )
    }
  }

  const fullDisease = await prisma.disease.findUnique({
    where: { id },
    include: {
      relatedDiseasesFrom: { include: { diseaseTo: true } },
      relatedDiseasesTo: { include: { diseaseFrom: true } },
      medicines: true,
    },
  })

  res.json(fullDisease)
}

export async function deleteDisease(req: AuthRequest, res: Response) {
  const { id } = req.params

  const disease = await prisma.disease.findUnique({ where: { id } })
  if (!disease) {
    res.status(404).json({ error: 'Disease not found' })
    return
  }

  if (disease.imageUrl) {
    const publicId = disease.imageUrl.split('/').slice(-1)[0].split('.')[0]
    await cloudinary.uploader.destroy(`PawSense/diseases/${publicId}`)
  }

  await prisma.disease.delete({ where: { id } })

  res.status(204).send()
}
