import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import passport from 'passport'          
import { authRouter } from './routes/auth.js'
import { diseaseRouter } from './routes/disease.js'
import { symptomRouter } from './routes/symptom.js'
import { treatmentRouter } from './routes/treatment.route.js'
import { medicineRouter } from './routes/medicine.route.js'
import { googleAuthRouter } from './routes/google-auth.route.js'  
import { catBreedRouter } from './routes/catBreed.route.js'
import { catFoodRouter } from './routes/catFood.route.js'
import { catProfileRouter } from './routes/catProfile.route.js'
import { verificationRouter } from './routes/verification.route.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())
app.use(passport.initialize())           

// Routes
app.use('/api/auth', authRouter)
app.use('/api/auth/google', googleAuthRouter)   
app.use('/api/diseases', diseaseRouter)
app.use('/api/symptoms', symptomRouter)
app.use('/api/treatments', treatmentRouter)
app.use('/api/medicines', medicineRouter)
app.use('/api/cat-breeds', catBreedRouter)
app.use('/api/cat-foods', catFoodRouter)
app.use('/api/cat-profiles', catProfileRouter)
app.use('/api/verification', verificationRouter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})