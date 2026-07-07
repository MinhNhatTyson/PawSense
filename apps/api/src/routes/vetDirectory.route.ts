import { Router } from 'express'
import { listVets } from '../controllers/VetDirectory.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export const vetDirectoryRouter: Router = Router()

vetDirectoryRouter.use(authenticate)
vetDirectoryRouter.get('/', listVets)