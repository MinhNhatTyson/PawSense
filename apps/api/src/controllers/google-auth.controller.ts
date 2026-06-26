import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme'
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

export async function googleCallback(req: Request, res: Response) {
  const googleUser = req.user as {
    googleId: string
    email: string
    fullName?: string
    avatar?: string
  }

  if (!googleUser?.email) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_failed`)
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: googleUser.email },
    include: { profile: true },
  })

  if (!existingUser) {
    // New user — send to role selection with a temporary token
    const tempToken = jwt.sign(
      {
        googleId: googleUser.googleId,
        email: googleUser.email,
        fullName: googleUser.fullName ?? '',
        avatar: googleUser.avatar ?? '',
        isGoogleTemp: true,
      },
      JWT_SECRET,
      { expiresIn: '10m' }
    )
    return res.redirect(`${FRONTEND_URL}/auth/select-role?temp=${tempToken}`)
  }

  // Existing user — link Google if not linked, then log in
  if (!existingUser.googleId) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { googleId: googleUser.googleId },
    })
    if (googleUser.avatar && !existingUser.profile?.avatar) {
      await prisma.profile.upsert({
        where: { userId: existingUser.id },
        update: { avatar: googleUser.avatar },
        create: { userId: existingUser.id, avatar: googleUser.avatar },
      })
    }
  }

  const token = jwt.sign(
    { userId: existingUser.id, role: existingUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
}

export async function completeGoogleSignup(req: Request, res: Response) {
  const { tempToken, role } = req.body as { tempToken: string; role: 'VET' | 'CUSTOMER' }

  if (!tempToken || !role) {
    res.status(400).json({ error: 'Missing tempToken or role' })
    return
  }

  if (role !== 'VET' && role !== 'CUSTOMER') {
    res.status(400).json({ error: 'Invalid role' })
    return
  }

  let payload: {
    googleId: string
    email: string
    fullName: string
    avatar: string
    isGoogleTemp: boolean
  }

  try {
    payload = jwt.verify(tempToken, JWT_SECRET) as typeof payload
  } catch {
    res.status(401).json({ error: 'Temp token expired or invalid. Please sign in with Google again.' })
    return
  }

  if (!payload.isGoogleTemp) {
    res.status(401).json({ error: 'Invalid token type' })
    return
  }

  // Check if user was already created (avoid duplicates)
  const existing = await prisma.user.findUnique({ where: { email: payload.email } })
  if (existing) {
    const token = jwt.sign(
      { userId: existing.id, role: existing.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      user: { id: existing.id, email: existing.email, role: existing.role },
    })
    return
  }

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      googleId: payload.googleId,
      role,
      profile: {
        create: {
          fullName: payload.fullName || null,
          avatar: payload.avatar || null,
        },
      },
    },
    include: { profile: true },
  })

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: user.role, profile: user.profile },
  })
}