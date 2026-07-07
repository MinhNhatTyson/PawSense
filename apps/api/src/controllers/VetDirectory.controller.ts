import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

export async function listVets(req: AuthRequest, res: Response) {
  const { search } = req.query

  const where: any = { role: 'VET' }
  if (search) {
    where.OR = [
      { profile: { fullName: { contains: search as string, mode: 'insensitive' } } },
      { profile: { clinicName: { contains: search as string, mode: 'insensitive' } } },
      { profile: { specialization: { contains: search as string, mode: 'insensitive' } } },
    ]
  }

  const vets = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          fullName: true, clinicName: true, address: true,
          specialization: true, phone: true, avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })

  res.json(vets)
}