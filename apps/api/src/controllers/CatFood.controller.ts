import type { Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const foodInclude = {
  diseaseFoods: {
    include: {
      disease: {
        select: { id: true, name: true, severity: true },
      },
    },
  },
}

// ── CREATE ────────────────────────────────────────────────────────────────────
export async function createCatFood(req: AuthRequest, res: Response) {
  const {
    name, brand, category, foodType, description,
    ingredients, protein, fat, fiber, moisture, calories,
    ageMinMonths, ageMaxMonths, weightRange,
    allergens, prescriptionRequired, vetNotes, diseaseIds,
  } = req.body as {
    name: string
    brand: string
    category: string
    foodType: string
    description: string
    ingredients?: string | string[]
    protein?: string
    fat?: string
    fiber?: string
    moisture?: string
    calories?: string
    ageMinMonths?: string
    ageMaxMonths?: string
    weightRange?: string
    allergens?: string | string[]
    prescriptionRequired?: string
    vetNotes?: string
    diseaseIds?: string | string[]
  }

  if (!name || !brand || !category || !foodType || !description) {
    res.status(400).json({ error: 'Name, brand, category, food type, and description are required' })
    return
  }

  const existing = await prisma.catFood.findUnique({ where: { name } })
  if (existing) {
    res.status(409).json({ error: 'A cat food with this name already exists' })
    return
  }

  let imageUrl: string | undefined
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/cat-foods',
    })
    imageUrl = result.secure_url
  }

  const parsedIngredients: string[] = Array.isArray(ingredients)
    ? ingredients
    : ingredients ? JSON.parse(ingredients) : []

  const parsedAllergens: string[] = Array.isArray(allergens)
    ? allergens
    : allergens ? JSON.parse(allergens) : []

  const parsedDiseaseIds: string[] = Array.isArray(diseaseIds)
    ? diseaseIds
    : diseaseIds ? JSON.parse(diseaseIds) : []

  const food = await prisma.catFood.create({
    data: {
      name,
      brand,
      category: category as any,
      foodType: foodType as any,
      description,
      ingredients: parsedIngredients,
      protein: protein ? parseFloat(protein) : null,
      fat: fat ? parseFloat(fat) : null,
      fiber: fiber ? parseFloat(fiber) : null,
      moisture: moisture ? parseFloat(moisture) : null,
      calories: calories ? parseFloat(calories) : null,
      ageMinMonths: ageMinMonths ? parseInt(ageMinMonths) : null,
      ageMaxMonths: ageMaxMonths ? parseInt(ageMaxMonths) : null,
      weightRange: weightRange || null,
      allergens: parsedAllergens,
      prescriptionRequired: prescriptionRequired === 'true' || prescriptionRequired === true as any,
      vetNotes: vetNotes || null,
      imageUrl: imageUrl ?? null,
    },
  })

  if (parsedDiseaseIds.length > 0) {
    await Promise.all(
      parsedDiseaseIds.map((diseaseId) =>
        prisma.diseaseFood.create({ data: { foodId: food.id, diseaseId } })
      )
    )
  }

  const full = await prisma.catFood.findUnique({ where: { id: food.id }, include: foodInclude })
  res.status(201).json(full)
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
export async function getCatFood(req: AuthRequest, res: Response) {
  const { id } = req.params
  const food = await prisma.catFood.findUnique({ where: { id }, include: foodInclude })
  if (!food) { res.status(404).json({ error: 'Cat food not found' }); return }
  res.json(food)
}

// ── LIST ──────────────────────────────────────────────────────────────────────
export async function listCatFoods(req: AuthRequest, res: Response) {
  const { search, category, foodType, prescriptionRequired, skip = '0', take = '12' } = req.query

  const skipInt = parseInt(skip as string, 10)
  const takeInt = parseInt(take as string, 10)
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { brand: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ]
  }
  if (category) where.category = category
  if (foodType) where.foodType = foodType
  if (prescriptionRequired !== undefined)
    where.prescriptionRequired = prescriptionRequired === 'true'

  const [foods, total] = await Promise.all([
    prisma.catFood.findMany({
      where,
      include: foodInclude,
      skip: skipInt,
      take: takeInt,
      orderBy: { name: 'asc' },
    }),
    prisma.catFood.count({ where }),
  ])

  res.json({ data: foods, pagination: { total, skip: skipInt, take: takeInt, hasMore: skipInt + takeInt < total } })
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
export async function searchCatFoods(req: AuthRequest, res: Response) {
  const { q } = req.query
  if (!q || typeof q !== 'string') { res.status(400).json({ error: 'Search query is required' }); return }

  const foods = await prisma.catFood.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: foodInclude,
    take: 20,
    orderBy: { name: 'asc' },
  })
  res.json(foods)
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
export async function updateCatFood(req: AuthRequest, res: Response) {
  const { id } = req.params
  const {
    name, brand, category, foodType, description,
    ingredients, protein, fat, fiber, moisture, calories,
    ageMinMonths, ageMaxMonths, weightRange,
    allergens, prescriptionRequired, vetNotes, diseaseIds,
  } = req.body as Record<string, string | string[] | undefined>

  const food = await prisma.catFood.findUnique({ where: { id } })
  if (!food) { res.status(404).json({ error: 'Cat food not found' }); return }

  if (name && name !== food.name) {
    const existing = await prisma.catFood.findUnique({ where: { name: name as string } })
    if (existing) { res.status(409).json({ error: 'A cat food with this name already exists' }); return }
  }

  let imageUrl = food.imageUrl
  if (req.file) {
    if (food.imageUrl) {
      const publicId = food.imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
      await cloudinary.uploader.destroy(`PawSense/cat-foods/${publicId}`)
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'PawSense/cat-foods',
    })
    imageUrl = result.secure_url
  }

  const parseArr = (v: string | string[] | undefined, fallback: string[]) =>
    v !== undefined ? (Array.isArray(v) ? v : JSON.parse(v)) : fallback

  const parseFloat2 = (v: string | string[] | undefined, fallback: number | null) =>
    v !== undefined ? (v === '' ? null : parseFloat(v as string)) : fallback

  const parseInt2 = (v: string | string[] | undefined, fallback: number | null) =>
    v !== undefined ? (v === '' ? null : parseInt(v as string)) : fallback

  await prisma.catFood.update({
    where: { id },
    data: {
      name: (name as string) ?? food.name,
      brand: (brand as string) ?? food.brand,
      category: (category as any) ?? food.category,
      foodType: (foodType as any) ?? food.foodType,
      description: (description as string) ?? food.description,
      ingredients: parseArr(ingredients, food.ingredients),
      protein: parseFloat2(protein, food.protein),
      fat: parseFloat2(fat, food.fat),
      fiber: parseFloat2(fiber, food.fiber),
      moisture: parseFloat2(moisture, food.moisture),
      calories: parseFloat2(calories, food.calories),
      ageMinMonths: parseInt2(ageMinMonths, food.ageMinMonths),
      ageMaxMonths: parseInt2(ageMaxMonths, food.ageMaxMonths),
      weightRange: weightRange !== undefined ? (weightRange as string) || null : food.weightRange,
      allergens: parseArr(allergens, food.allergens),
      prescriptionRequired: prescriptionRequired !== undefined
        ? prescriptionRequired === 'true'
        : food.prescriptionRequired,
      vetNotes: vetNotes !== undefined ? (vetNotes as string) || null : food.vetNotes,
      imageUrl,
    },
  })

  if (diseaseIds !== undefined) {
    const parsed: string[] = Array.isArray(diseaseIds) ? diseaseIds : JSON.parse(diseaseIds as string)
    await prisma.diseaseFood.deleteMany({ where: { foodId: id } })
    if (parsed.length > 0) {
      await Promise.all(parsed.map((diseaseId) =>
        prisma.diseaseFood.create({ data: { foodId: id, diseaseId } })
      ))
    }
  }

  const full = await prisma.catFood.findUnique({ where: { id }, include: foodInclude })
  res.json(full)
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function deleteCatFood(req: AuthRequest, res: Response) {
  const { id } = req.params
  const food = await prisma.catFood.findUnique({ where: { id } })
  if (!food) { res.status(404).json({ error: 'Cat food not found' }); return }

  if (food.imageUrl) {
    const publicId = food.imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
    await cloudinary.uploader.destroy(`PawSense/cat-foods/${publicId}`)
  }

  await prisma.catFood.delete({ where: { id } })
  res.status(204).send()
}