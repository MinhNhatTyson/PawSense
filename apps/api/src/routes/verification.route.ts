import { Router } from 'express'
import {
  approveDisease,
  approveMedicine,
  raiseFlag,
  listFlags,
  resolveFlag,
  dismissFlag,
  listPendingContent,
} from '../controllers/verification.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'
import { approveEmergencyGuide } from '../controllers/verification.controller.js'

export const verificationRouter: Router = Router()

verificationRouter.use(authenticate)

// Approve — VET only
verificationRouter.patch('/diseases/:id/approve', requireVet, approveDisease)
verificationRouter.patch('/medicines/:id/approve', requireVet, approveMedicine)

// Pending queue — VET only
verificationRouter.get('/pending', requireVet, listPendingContent)

// Flags — raise is open to all authenticated, manage is VET only
verificationRouter.post('/flags', raiseFlag)
verificationRouter.get('/flags', requireVet, listFlags)
verificationRouter.patch('/flags/:id/resolve', requireVet, resolveFlag)
verificationRouter.patch('/flags/:id/dismiss', requireVet, dismissFlag)
verificationRouter.patch('/emergency-guides/:id/approve', requireVet, approveEmergencyGuide)