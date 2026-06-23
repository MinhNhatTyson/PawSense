import type { Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const medicineInclude = {
  diseaseMedicines: {
    include: { disease: true },
  },
}

// ── CREATE ────────────────────────────────────────────────────────────────────
export async function createMedicine(req: AuthRequest, res: Response) {
  const {
    name,
    description,
    dosage,
    sideEffects,
    usageInstructions,
    warnings,
    manufacturer,
    diseaseIds,
  } = req.body as {
    name: string
    description: string
    dosage: string
    sideEffects?: string | string[]
    usageInstructions: string
    warnings?: string | string[]
    manufacturer?: string
    diseaseIds?: string | string[]
  }

  if (!name || !description || !dosage || !usageInstructions) {
    res.status(400).json({
      error: 'Name, description, dosage, and usage instructions are required',
    })
    return
  }

  const existing = await prisma.medicine.findUnique({ where: { name } })
  if (existing) {
    res.status(409).json({ error: 'A medicine with this name already exists' })
    return
  }

  let imageUrl: string | undefined
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/medicines',
    })
    imageUrl = result.secure_url
  }

  const parsedSideEffects: string[] = Array.isArray(sideEffects)
    ? sideEffects
    : sideEffects
    ? JSON.parse(sideEffects)
    : []

  const parsedWarnings: string[] = Array.isArray(warnings)
    ? warnings
    : warnings
    ? JSON.parse(warnings)
    : []

  const parsedDiseaseIds: string[] = Array.isArray(diseaseIds)
    ? diseaseIds
    : diseaseIds
    ? JSON.parse(diseaseIds)
    : []

  const medicine = await prisma.medicine.create({
    data: {
      name,
      description,
      dosage,
      sideEffects: parsedSideEffects,
      usageInstructions,
      warnings: parsedWarnings,
      manufacturer: manufacturer || null,
      imageUrl: imageUrl ?? null,
    },
  })

  if (parsedDiseaseIds.length > 0) {
    await Promise.all(
      parsedDiseaseIds.map((diseaseId) =>
        prisma.diseaseMedicine.create({
          data: { diseaseId, medicineId: medicine.id },
        })
      )
    )
  }

  const full = await prisma.medicine.findUnique({
    where: { id: medicine.id },
    include: medicineInclude,
  })

  res.status(201).json(full)
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
export async function getMedicine(req: AuthRequest, res: Response) {
  const { id } = req.params

  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: medicineInclude,
  })

  if (!medicine) {
    res.status(404).json({ error: 'Medicine not found' })
    return
  }

  res.json(medicine)
}

// ── LIST ──────────────────────────────────────────────────────────────────────
export async function listMedicines(req: AuthRequest, res: Response) {
  const { search, skip = '0', take = '12' } = req.query

  const skipInt = parseInt(skip as string, 10)
  const takeInt = parseInt(take as string, 10)

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { manufacturer: { contains: search as string, mode: 'insensitive' } },
    ]
  }

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      include: medicineInclude,
      skip: skipInt,
      take: takeInt,
      orderBy: { name: 'asc' },
    }),
    prisma.medicine.count({ where }),
  ])

  res.json({
    data: medicines,
    pagination: {
      total,
      skip: skipInt,
      take: takeInt,
      hasMore: skipInt + takeInt < total,
    },
  })
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
export async function searchMedicines(req: AuthRequest, res: Response) {
  const { q } = req.query

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Search query is required' })
    return
  }

  const medicines = await prisma.medicine.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { manufacturer: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: medicineInclude,
    take: 20,
    orderBy: { name: 'asc' },
  })

  res.json(medicines)
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
export async function updateMedicine(req: AuthRequest, res: Response) {
  const { id } = req.params
  const {
    name,
    description,
    dosage,
    sideEffects,
    usageInstructions,
    warnings,
    manufacturer,
    diseaseIds,
  } = req.body as {
    name?: string
    description?: string
    dosage?: string
    sideEffects?: string | string[]
    usageInstructions?: string
    warnings?: string | string[]
    manufacturer?: string
    diseaseIds?: string | string[]
  }

  const medicine = await prisma.medicine.findUnique({ where: { id } })
  if (!medicine) {
    res.status(404).json({ error: 'Medicine not found' })
    return
  }

  if (name && name !== medicine.name) {
    const existing = await prisma.medicine.findUnique({ where: { name } })
    if (existing) {
      res.status(409).json({ error: 'A medicine with this name already exists' })
      return
    }
  }

  let imageUrl = medicine.imageUrl

  if (req.file) {
    if (medicine.imageUrl) {
      const publicId = medicine.imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
      await cloudinary.uploader.destroy(`PawSense/medicines/${publicId}`)
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/medicines',
    })
    imageUrl = result.secure_url
  }

  const parsedSideEffects: string[] | undefined =
    sideEffects !== undefined
      ? Array.isArray(sideEffects)
        ? sideEffects
        : JSON.parse(sideEffects)
      : undefined

  const parsedWarnings: string[] | undefined =
    warnings !== undefined
      ? Array.isArray(warnings)
        ? warnings
        : JSON.parse(warnings)
      : undefined

  await prisma.medicine.update({
    where: { id },
    data: {
      name: name ?? medicine.name,
      description: description ?? medicine.description,
      dosage: dosage ?? medicine.dosage,
      sideEffects: parsedSideEffects ?? medicine.sideEffects,
      usageInstructions: usageInstructions ?? medicine.usageInstructions,
      warnings: parsedWarnings ?? medicine.warnings,
      manufacturer:
        manufacturer !== undefined ? manufacturer || null : medicine.manufacturer,
      imageUrl,
    },
  })

  if (diseaseIds !== undefined) {
    const parsed: string[] = Array.isArray(diseaseIds)
      ? diseaseIds
      : JSON.parse(diseaseIds)
    await prisma.diseaseMedicine.deleteMany({ where: { medicineId: id } })
    if (parsed.length > 0) {
      await Promise.all(
        parsed.map((diseaseId) =>
          prisma.diseaseMedicine.create({ data: { diseaseId, medicineId: id } })
        )
      )
    }
  }

  const full = await prisma.medicine.findUnique({
    where: { id },
    include: medicineInclude,
  })

  res.json(full)
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function deleteMedicine(req: AuthRequest, res: Response) {
  const { id } = req.params

  const medicine = await prisma.medicine.findUnique({ where: { id } })
  if (!medicine) {
    res.status(404).json({ error: 'Medicine not found' })
    return
  }

  if (medicine.imageUrl) {
    const publicId = medicine.imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
    await cloudinary.uploader.destroy(`PawSense/medicines/${publicId}`)
  }

  await prisma.medicine.delete({ where: { id } })
  res.status(204).send()
}