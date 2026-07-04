import type { Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const profileInclude = {
  vaccinations: { orderBy: { dateGiven: 'desc' as const } },
  breed: { select: { id: true, name: true, origin: true } },
  diagnoses: {
    include: { disease: { select: { id: true, name: true, severity: true } } },
    orderBy: { diagnosedAt: 'desc' as const },
  },
}

// ── CREATE ────────────────────────────────────────────────────────────────────
export async function createCatProfile(req: AuthRequest, res: Response) {
  const ownerId = req.userId!
  const {
    name, gender, birthDate, ageYears, ageMonths,
    weightKg, breedId, color, notes, vaccinations,
  } = req.body as {
    name: string
    gender?: string
    birthDate?: string
    ageYears?: string
    ageMonths?: string
    weightKg?: string
    breedId?: string
    color?: string
    notes?: string
    vaccinations?: string
  }

  if (!name) {
    res.status(400).json({ error: 'Cat name is required' })
    return
  }

  // Handle multiple image uploads
  const imageUrls: string[] = []
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const b64 = Buffer.from(file.buffer).toString('base64')
      const dataURI = `data:${file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'PawSense/cat-profiles',
      })
      imageUrls.push(result.secure_url)
    }
  }

  const parsedVaccinations: Array<{
    vaccineName: string
    dateGiven: string
    nextDueDate?: string
    veterinarian?: string
    notes?: string
  }> = vaccinations ? JSON.parse(vaccinations) : []

  const catProfile = await prisma.catProfile.create({
    data: {
      ownerId,
      name,
      gender: (gender as any) ?? 'UNKNOWN',
      birthDate: birthDate ? new Date(birthDate) : null,
      ageYears: ageYears ? parseInt(ageYears) : null,
      ageMonths: ageMonths ? parseInt(ageMonths) : null,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      breedId: breedId || null,
      color: color || null,
      notes: notes || null,
      imageUrls,
    },
  })

  if (parsedVaccinations.length > 0) {
    await Promise.all(
      parsedVaccinations.map((v) =>
        prisma.vaccination.create({
          data: {
            catProfileId: catProfile.id,
            vaccineName: v.vaccineName,
            dateGiven: new Date(v.dateGiven),
            nextDueDate: v.nextDueDate ? new Date(v.nextDueDate) : null,
            veterinarian: v.veterinarian || null,
            notes: v.notes || null,
          },
        })
      )
    )
  }

  const full = await prisma.catProfile.findUnique({
    where: { id: catProfile.id },
    include: profileInclude,
  })

  res.status(201).json(full)
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
export async function getCatProfile(req: AuthRequest, res: Response) {
  const { id } = req.params
  const ownerId = req.userId!

  const profile = await prisma.catProfile.findUnique({
    where: { id },
    include: profileInclude,
  })

  if (!profile || profile.ownerId !== ownerId) {
    res.status(404).json({ error: 'Cat profile not found' })
    return
  }

  res.json(profile)
}

// ── LIST (owner's cats only) ──────────────────────────────────────────────────
export async function listCatProfiles(req: AuthRequest, res: Response) {
  const ownerId = req.userId!

  const profiles = await prisma.catProfile.findMany({
    where: { ownerId },
    include: profileInclude,
    orderBy: { createdAt: 'desc' },
  })

  res.json(profiles)
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
export async function updateCatProfile(req: AuthRequest, res: Response) {
  const { id } = req.params
  const ownerId = req.userId!

  const existing = await prisma.catProfile.findUnique({ where: { id } })
  if (!existing || existing.ownerId !== ownerId) {
    res.status(404).json({ error: 'Cat profile not found' })
    return
  }

  const {
    name, gender, birthDate, ageYears, ageMonths,
    weightKg, breedId, color, notes, vaccinations, existingImageUrls,
  } = req.body as Record<string, string | undefined>

  // Handle new image uploads
  const newImageUrls: string[] = []
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const b64 = Buffer.from(file.buffer).toString('base64')
      const dataURI = `data:${file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'PawSense/cat-profiles',
      })
      newImageUrls.push(result.secure_url)
    }
  }

  const keptImageUrls: string[] = existingImageUrls
    ? JSON.parse(existingImageUrls)
    : existing.imageUrls

  const finalImageUrls = [...keptImageUrls, ...newImageUrls]

  await prisma.catProfile.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      gender: (gender as any) ?? existing.gender,
      birthDate: birthDate !== undefined
        ? (birthDate ? new Date(birthDate) : null)
        : existing.birthDate,
      ageYears: ageYears !== undefined
        ? (ageYears ? parseInt(ageYears) : null)
        : existing.ageYears,
      ageMonths: ageMonths !== undefined
        ? (ageMonths ? parseInt(ageMonths) : null)
        : existing.ageMonths,
      weightKg: weightKg !== undefined
        ? (weightKg ? parseFloat(weightKg) : null)
        : existing.weightKg,
      breedId: breedId !== undefined ? (breedId || null) : existing.breedId,
      color: color !== undefined ? (color || null) : existing.color,
      notes: notes !== undefined ? (notes || null) : existing.notes,
      imageUrls: finalImageUrls,
    },
  })

  // Replace vaccinations if provided
  if (vaccinations !== undefined) {
    const parsed: Array<{
      vaccineName: string
      dateGiven: string
      nextDueDate?: string
      veterinarian?: string
      notes?: string
    }> = JSON.parse(vaccinations)

    await prisma.vaccination.deleteMany({ where: { catProfileId: id } })
    if (parsed.length > 0) {
      await Promise.all(
        parsed.map((v) =>
          prisma.vaccination.create({
            data: {
              catProfileId: id,
              vaccineName: v.vaccineName,
              dateGiven: new Date(v.dateGiven),
              nextDueDate: v.nextDueDate ? new Date(v.nextDueDate) : null,
              veterinarian: v.veterinarian || null,
              notes: v.notes || null,
            },
          })
        )
      )
    }
  }

  const full = await prisma.catProfile.findUnique({
    where: { id },
    include: profileInclude,
  })

  res.json(full)
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function deleteCatProfile(req: AuthRequest, res: Response) {
  const { id } = req.params
  const ownerId = req.userId!

  const profile = await prisma.catProfile.findUnique({ where: { id } })
  if (!profile || profile.ownerId !== ownerId) {
    res.status(404).json({ error: 'Cat profile not found' })
    return
  }

  for (const imageUrl of profile.imageUrls) {
    try {
      const publicId = imageUrl.split('/').slice(-1)[0]!.split('.')[0]!
      await cloudinary.uploader.destroy(`PawSense/cat-profiles/${publicId}`)
    } catch { /* continue */ }
  }

  await prisma.catProfile.delete({ where: { id } })
  res.status(204).send()
}

// ── ADD VACCINATION ───────────────────────────────────────────────────────────
export async function addVaccination(req: AuthRequest, res: Response) {
  const { id } = req.params
  const ownerId = req.userId!
  const { vaccineName, dateGiven, nextDueDate, veterinarian, notes } = req.body as {
    vaccineName: string
    dateGiven: string
    nextDueDate?: string
    veterinarian?: string
    notes?: string
  }

  const profile = await prisma.catProfile.findUnique({ where: { id } })
  if (!profile || profile.ownerId !== ownerId) {
    res.status(404).json({ error: 'Cat profile not found' })
    return
  }

  if (!vaccineName || !dateGiven) {
    res.status(400).json({ error: 'Vaccine name and date given are required' })
    return
  }

  const vaccination = await prisma.vaccination.create({
    data: {
      catProfileId: id,
      vaccineName,
      dateGiven: new Date(dateGiven),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      veterinarian: veterinarian || null,
      notes: notes || null,
    },
  })

  res.status(201).json(vaccination)
}

// ── DELETE VACCINATION ────────────────────────────────────────────────────────
export async function deleteVaccination(req: AuthRequest, res: Response) {
  const { id, vaccinationId } = req.params
  const ownerId = req.userId!

  const profile = await prisma.catProfile.findUnique({ where: { id } })
  if (!profile || profile.ownerId !== ownerId) {
    res.status(404).json({ error: 'Cat profile not found' })
    return
  }

  await prisma.vaccination.delete({ where: { id: vaccinationId } })
  res.status(204).send()
}