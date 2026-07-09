import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { geocodeAddress } from '../utils/geocode.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme'

export async function register(req: Request, res: Response) {
  const {
    email,
    password,
    role,
    fullName,
    phone,
    clinicName,
    address,
    specialization,
  } = req.body as {
    email: string
    password: string
    role?: 'VET' | 'CUSTOMER'
    fullName?: string
    phone?: string
    clinicName?: string
    address?: string
    specialization?: string
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email already in use' })
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: role ?? 'CUSTOMER',
      profile: {
        create: {
          fullName: fullName || null,
          phone: phone || null,
          clinicName: clinicName || null,
          address: address || null,
          specialization: specialization || null,
        },
      },
    },
    include: { profile: true },
  })

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  })

  res.status(201).json({
    token,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
  })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as {
    email: string
    password: string
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  })
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  if (!user.password) {
    res.status(401).json({ error: 'This account uses Google Sign-In. Please sign in with Google.' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  })

  res.json({
    token,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
  })
}

export async function changePassword(req: Request, res: Response) {
  const userId = (req as any).userId
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string
    newPassword: string
  }

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new passwords are required' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  if (!user.password) {
    res.status(400).json({ error: 'This account uses Google Sign-In and has no password set.' })
    return
  }
  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    res.status(401).json({ error: 'Current password is incorrect' })
    return
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  })

  res.json({ message: 'Password changed successfully' })
}

export async function getProfile(req: Request, res: Response) {
  const userId = (req as any).userId

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
  })
}

export async function updateProfile(req: Request, res: Response) {
  const userId = (req as any).userId
  const {
    fullName,
    phone,
    clinicName,
    address,
    specialization,
    avatar,
    latitude,
    longitude,
  } = req.body

  const existing = await prisma.profile.findUnique({ where: { userId } })

  // Manual coordinates (typed or device GPS) always win. Otherwise, if the
  // address is new or changed, try to auto-resolve coordinates from it so
  // vets don't have to find lat/lng themselves.
  let resolvedLat = latitude !== undefined ? latitude : undefined
  let resolvedLng = longitude !== undefined ? longitude : undefined

  const addressChanged = address !== undefined && address !== existing?.address
  const noCoordsProvided = latitude === undefined && longitude === undefined

  if (addressChanged && noCoordsProvided && address?.trim()) {
    const geocoded = await geocodeAddress(address)
    if (geocoded) {
      resolvedLat = geocoded.latitude
      resolvedLng = geocoded.longitude
    }
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      fullName: fullName || undefined,
      phone: phone || undefined,
      clinicName: clinicName || undefined,
      address: address || undefined,
      specialization: specialization || undefined,
      avatar: avatar || undefined,
      latitude: resolvedLat !== undefined ? (resolvedLat === null || resolvedLat === '' ? null : Number(resolvedLat)) : undefined,
      longitude: resolvedLng !== undefined ? (resolvedLng === null || resolvedLng === '' ? null : Number(resolvedLng)) : undefined,
    },
    create: {
      userId,
      fullName: fullName || null,
      phone: phone || null,
      clinicName: clinicName || null,
      address: address || null,
      specialization: specialization || null,
      avatar: avatar || null,
      latitude: resolvedLat !== undefined && resolvedLat !== '' ? Number(resolvedLat) : null,
      longitude: resolvedLng !== undefined && resolvedLng !== '' ? Number(resolvedLng) : null,
    },
  })

  res.json({ profile })
}