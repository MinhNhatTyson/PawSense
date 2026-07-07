import { Router } from 'express'
import {
  createSlot, createSlotsBulk, listMySlots, deleteSlot, listPublicSlots,
} from '../controllers/VetAvailability.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

export const vetAvailabilityRouter: Router = Router()

vetAvailabilityRouter.use(authenticate)

vetAvailabilityRouter.post('/', requireVet, createSlot)
vetAvailabilityRouter.post('/bulk', requireVet, createSlotsBulk)
vetAvailabilityRouter.get('/mine', requireVet, listMySlots)
vetAvailabilityRouter.delete('/:id', requireVet, deleteSlot)
vetAvailabilityRouter.get('/vet/:vetId', listPublicSlots)