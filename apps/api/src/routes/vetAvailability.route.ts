import { Router } from 'express'
import {
  createSlot, createSlotsBulk, listMySlots, deleteSlot, listPublicSlots,blockSlot, unblockSlot, editSlot, 
} from '../controllers/VetAvailability.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

export const vetAvailabilityRouter: Router = Router()

vetAvailabilityRouter.use(authenticate)

vetAvailabilityRouter.post('/', requireVet, createSlot)
vetAvailabilityRouter.post('/bulk', requireVet, createSlotsBulk)
vetAvailabilityRouter.get('/mine', requireVet, listMySlots)
vetAvailabilityRouter.patch('/:id', requireVet, editSlot) 
vetAvailabilityRouter.patch('/:id/block', requireVet, blockSlot)      // ← ADD
vetAvailabilityRouter.patch('/:id/unblock', requireVet, unblockSlot) 
vetAvailabilityRouter.delete('/:id', requireVet, deleteSlot)
vetAvailabilityRouter.get('/vet/:vetId', listPublicSlots)