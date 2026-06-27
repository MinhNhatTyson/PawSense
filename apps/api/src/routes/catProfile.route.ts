import { Router } from 'express'
import multer from 'multer'
import {
  createCatProfile,
  getCatProfile,
  listCatProfiles,
  updateCatProfile,
  deleteCatProfile,
  addVaccination,
  deleteVaccination,
} from '../controllers/CatProfile.controller.js'
import { authenticate, requireCustomer } from '../middleware/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })

export const catProfileRouter: Router = Router()

catProfileRouter.use(authenticate)
catProfileRouter.use(requireCustomer)

catProfileRouter.get('/', listCatProfiles)
catProfileRouter.post('/', upload.array('images', 5), createCatProfile)
catProfileRouter.get('/:id', getCatProfile)
catProfileRouter.put('/:id', upload.array('images', 5), updateCatProfile)
catProfileRouter.delete('/:id', deleteCatProfile)
catProfileRouter.post('/:id/vaccinations', addVaccination)
catProfileRouter.delete('/:id/vaccinations/:vaccinationId', deleteVaccination)