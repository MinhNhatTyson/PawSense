import { Router } from 'express'
import multer from 'multer'
import { analyzeBreed } from '../controllers/BreedRecognition.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

export const breedRecognitionRouter: Router = Router()

// Open to any authenticated user (VET or CUSTOMER) — mobile pet owners use this
breedRecognitionRouter.use(authenticate)
breedRecognitionRouter.post('/analyze', upload.single('image'), analyzeBreed)