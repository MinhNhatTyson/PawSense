import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const token = header.split(' ')[1]!
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string
      role: string
    }
    req.userId = payload.userId
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const authMiddleware = authenticate

export function requireVet(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'VET') {
    res.status(403).json({ error: 'Vet access only' })
    return
  }
  next()
}

export function requireCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'CUSTOMER') {
    res.status(403).json({ error: 'Customer access only' })
    return
  }
  next()
}