import { Router } from 'express'
import {
  createCatTreatmentRecord,
  listCatTreatmentRecords,
  deleteCatTreatmentRecord,
} from '../controllers/CatTreatmentRecord.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

export const catTreatmentRecordRouter: Router = Router()

// Vet-only, mirrors catDiagnosis.route.ts. Pet owners read records via the
// existing /api/cat-profiles/:id include instead (no owner-facing GET here).
catTreatmentRecordRouter.use(authenticate)
catTreatmentRecordRouter.use(requireVet)

catTreatmentRecordRouter.post('/', createCatTreatmentRecord)
catTreatmentRecordRouter.get('/', listCatTreatmentRecords)
catTreatmentRecordRouter.delete('/:id', deleteCatTreatmentRecord)