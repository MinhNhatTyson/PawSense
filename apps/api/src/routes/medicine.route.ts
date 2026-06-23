import { Router } from 'express'
import multer from 'multer'
import {
  createMedicine,
  getMedicine,
  listMedicines,
  searchMedicines,
  updateMedicine,
  deleteMedicine,
} from '../controllers/Medicine.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })

export const medicineRouter: Router = Router()

medicineRouter.use(authenticate)

medicineRouter.post('/', requireVet, upload.single('image'), createMedicine)
medicineRouter.get('/', listMedicines)
medicineRouter.get('/search', searchMedicines)
medicineRouter.get('/:id', getMedicine)
medicineRouter.put('/:id', requireVet, upload.single('image'), updateMedicine)
medicineRouter.delete('/:id', requireVet, deleteMedicine)