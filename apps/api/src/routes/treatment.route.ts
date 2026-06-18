import { Router } from 'express'
import multer from 'multer'
import {
  createTreatment,
  getTreatment,
  listTreatments,
  searchTreatments,
  updateTreatment,
  deleteTreatment,
} from '../controllers/Treatment.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })

export const treatmentRouter: Router = Router()

treatmentRouter.use(authenticate)

treatmentRouter.post('/', requireVet, upload.single('image'), createTreatment)
treatmentRouter.get('/', listTreatments)
treatmentRouter.get('/search', searchTreatments)
treatmentRouter.get('/:id', getTreatment)
treatmentRouter.put('/:id', requireVet, upload.single('image'), updateTreatment)
treatmentRouter.delete('/:id', requireVet, deleteTreatment)