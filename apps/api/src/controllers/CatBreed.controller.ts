import type { Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// ── CREATE ────────────────────────────────────────────────────────────────────
export async function createCatBreed(req: AuthRequest, res: Response) {
  const {
    name,
    origin,
    description,
    physicalAppearance,
    weightRange,
    lifespan,
    temperament,
    personality,
  } = req.body as {
    name: string
    origin: string
    description: string
    physicalAppearance: string
    weightRange: string
    lifespan: string
    temperament?: string | string[]
    personality: string
  }

  if (!name || !origin || !description || !physicalAppearance || !weightRange || !lifespan || !personality) {
    res.status(400).json({ error: 'All required fields must be provided' })
    return
  }

  const existing = await prisma.catBreed.findUnique({ where: { name } })
  if (existing) {
    res.status(409).json({ error: 'A cat breed with this name already exists' })
    return
  }

  const parsedTemperament: string[] = Array.isArray(temperament)
    ? temperament
    : temperament
    ? JSON.parse(temperament)
    : []

  // Handle multiple image uploads
  const imageUrls: string[] = []
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const b64 = Buffer.from(file.buffer).toString('base64')
      const dataURI = `data:${file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'PawSense/cat-breeds',
      })
      imageUrls.push(result.secure_url)
    }
  }

  const breed = await prisma.catBreed.create({
    data: {
      name,
      origin,
      description,
      physicalAppearance,
      weightRange,
      lifespan,
      temperament: parsedTemperament,
      personality,
      imageUrls,
    },
  })

  res.status(201).json(breed)
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
export async function getCatBreed(req: AuthRequest, res: Response) {
  const { id } = req.params

  const breed = await prisma.catBreed.findUnique({ where: { id } })

  if (!breed) {
    res.status(404).json({ error: 'Cat breed not found' })
    return
  }

  res.json(breed)
}

// ── LIST ──────────────────────────────────────────────────────────────────────
export async function listCatBreeds(req: AuthRequest, res: Response) {
  const { search, skip = '0', take = '12' } = req.query

  const skipInt = parseInt(skip as string, 10)
  const takeInt = parseInt(take as string, 10)

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { origin: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { personality: { contains: search as string, mode: 'insensitive' } },
    ]
  }

  const [breeds, total] = await Promise.all([
    prisma.catBreed.findMany({
      where,
      skip: skipInt,
      take: takeInt,
      orderBy: { name: 'asc' },
    }),
    prisma.catBreed.count({ where }),
  ])

  res.json({
    data: breeds,
    pagination: {
      total,
      skip: skipInt,
      take: takeInt,
      hasMore: skipInt + takeInt < total,
    },
  })
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
export async function searchCatBreeds(req: AuthRequest, res: Response) {
  const { q } = req.query

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Search query is required' })
    return
  }

  const breeds = await prisma.catBreed.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { origin: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { personality: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 20,
    orderBy: { name: 'asc' },
  })

  res.json(breeds)
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
export async function updateCatBreed(req: AuthRequest, res: Response) {
  const { id } = req.params
  const {
    name,
    origin,
    description,
    physicalAppearance,
    weightRange,
    lifespan,
    temperament,
    personality,
    existingImageUrls,
  } = req.body as {
    name?: string
    origin?: string
    description?: string
    physicalAppearance?: string
    weightRange?: string
    lifespan?: string
    temperament?: string | string[]
    personality?: string
    existingImageUrls?: string | string[]
  }

  const breed = await prisma.catBreed.findUnique({ where: { id } })
  if (!breed) {
    res.status(404).json({ error: 'Cat breed not found' })
    return
  }

  if (name && name !== breed.name) {
    const existing = await prisma.catBreed.findUnique({ where: { name } })
    if (existing) {
      res.status(409).json({ error: 'A cat breed with this name already exists' })
      return
    }
  }

  const parsedTemperament: string[] | undefined =
    temperament !== undefined
      ? Array.isArray(temperament)
        ? temperament
        : JSON.parse(temperament)
      : undefined

  // Keep existing images that weren't removed
  const keptImageUrls: string[] = Array.isArray(existingImageUrls)
    ? existingImageUrls
    : existingImageUrls
    ? JSON.parse(existingImageUrls)
    : breed.imageUrls

  // Upload new images
  const newImageUrls: string[] = []
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const b64 = Buffer.from(file.buffer).toString('base64')
      const dataURI = `data:${file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'PawSense/cat-breeds',
      })
      newImageUrls.push(result.secure_url)
    }
  }

  const finalImageUrls = [...keptImageUrls, ...newImageUrls]

  const updated = await prisma.catBreed.update({
    where: { id },
    data: {
      name: name ?? breed.name,
      origin: origin ?? breed.origin,
      description: description ?? breed.description,
      physicalAppearance: physicalAppearance ?? breed.physicalAppearance,
      weightRange: weightRange ?? breed.weightRange,
      lifespan: lifespan ?? breed.lifespan,
      temperament: parsedTemperament ?? breed.temperament,
      personality: personality ?? breed.personality,
      imageUrls: finalImageUrls,
    },
  })

  res.json(updated)
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function deleteCatBreed(req: AuthRequest, res: Response) {
  const { id } = req.params

  const breed = await prisma.catBreed.findUnique({ where: { id } })
  if (!breed) {
    res.status(404).json({ error: 'Cat breed not found' })
    return
  }

  // Delete all images from Cloudinary
  for (const imageUrl of breed.imageUrls) {
    try {
      const publicId = imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
      await cloudinary.uploader.destroy(`PawSense/cat-breeds/${publicId}`)
    } catch {
      // Continue even if individual image deletion fails
    }
  }

  await prisma.catBreed.delete({ where: { id } })
  res.status(204).send()
}