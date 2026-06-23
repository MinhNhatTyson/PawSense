import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { diseaseRouter } from './routes/disease.js'
import { symptomRouter } from './routes/symptom.js'
import { treatmentRouter } from './routes/treatment.route.js'
import { medicineRouter } from './routes/medicine.route.js'
const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/diseases', diseaseRouter)
app.use('/api/symptoms', symptomRouter)
app.use('/api/treatments', treatmentRouter)
app.use('/api/medicines', medicineRouter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})