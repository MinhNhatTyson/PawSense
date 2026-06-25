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

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: googleUser.email },
    include: { profile: true },
  })

  if (!user) {
    // New user — create with Google info
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        googleId: googleUser.googleId,
        role: 'CUSTOMER',
        profile: {
          create: {
            fullName: googleUser.fullName ?? null,
            avatar: googleUser.avatar ?? null,
          },
        },
      },
      include: { profile: true },
    })
  } else if (!user.googleId) {
    // Existing email user — link Google account
    await prisma.user.update({
      where: { id: user.id },
      data: { googleId: googleUser.googleId },
    })
    if (googleUser.avatar && !user.profile?.avatar) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { avatar: googleUser.avatar },
      })
    }
    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    })!
  }

  const token = jwt.sign(
    { userId: user!.id, role: user!.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  // Redirect to frontend with token
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
}