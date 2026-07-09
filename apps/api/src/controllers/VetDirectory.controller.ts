import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

// Haversine great-circle distance in kilometres
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function listVets(req: AuthRequest, res: Response) {
  const { search, lat, lng, radiusKm } = req.query

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
          latitude: true, longitude: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 200, // wider candidate pool so distance sort/filter has enough to work with
  })

  const userLat = lat ? parseFloat(lat as string) : null
  const userLng = lng ? parseFloat(lng as string) : null
  const radius = radiusKm ? parseFloat(radiusKm as string) : null

  // No coordinates supplied — behave exactly as the original name/clinic search did
  if (userLat === null || userLng === null || isNaN(userLat) || isNaN(userLng)) {
    res.json(vets.slice(0, 100).map((v) => ({ ...v, distanceKm: null })))
    return
  }

  const withDistance = vets.map((v) => {
    const vLat = v.profile?.latitude
    const vLng = v.profile?.longitude
    const distanceKm =
      vLat != null && vLng != null
        ? Math.round(haversineKm(userLat, userLng, vLat, vLng) * 10) / 10
        : null
    return { ...v, distanceKm }
  })

  // Vets without saved coordinates can't be located — exclude them when a radius
  // is requested, otherwise keep them (sorted to the end) so nothing disappears silently.
  let results = withDistance
  if (radius !== null && !isNaN(radius)) {
    results = withDistance.filter((v) => v.distanceKm !== null && v.distanceKm <= radius)
  }

  results.sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) return 0
    if (a.distanceKm === null) return 1
    if (b.distanceKm === null) return -1
    return a.distanceKm - b.distanceKm
  })

  res.json(results.slice(0, 100))
}