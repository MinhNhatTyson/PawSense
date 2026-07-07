import { Router } from 'express'
import {
  bookAppointment, listMyAppointments, listVetAppointments,
  cancelAppointment, completeAppointment,
} from '../controllers/Appointment.controller.js'
import { authenticate, requireVet, requireCustomer } from '../middleware/auth.middleware.js'

export const appointmentRouter: Router = Router()

appointmentRouter.use(authenticate)

appointmentRouter.post('/', requireCustomer, bookAppointment)
appointmentRouter.get('/mine', requireCustomer, listMyAppointments)
appointmentRouter.get('/vet', requireVet, listVetAppointments)
appointmentRouter.patch('/:id/cancel', cancelAppointment)
appointmentRouter.patch('/:id/complete', requireVet, completeAppointment)