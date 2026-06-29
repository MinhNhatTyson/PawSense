import { useState, useEffect } from 'react'
import { symptomAPI, type Symptom } from '../symptomPages/symptomAPI'
import { diseaseAPI, type Disease } from '../diseasePages/diseaseAPI'
import { Sidebar } from '../components/Sidebar'
import DiagnosisPanel from './DiagnosisPanel'
import './DiagnosisPanel.css'

export default function DiagnosisManagement() {
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([])
  const [allDiseases, setAllDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [symptomsRes, diseasesRes] = await Promise.all([
        symptomAPI.list(0, 200),
        diseaseAPI.list(0, 200),
      ])
      setAllSymptoms(symptomsRes.data.data)
      setAllDiseases(diseasesRes.data.data)
    } catch {
      setError('Failed to load knowledge base data. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="diag-shell">
      <Sidebar />

      <main className="diag-main">
        {loading ? (
          <div className="diag-page-loading">
            <span className="spinner spinner-dark" />
            Loading knowledge base…
          </div>
        ) : error ? (
          <div className="diag-page-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6v4.5M10 13h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        ) : (
          <DiagnosisPanel allSymptoms={allSymptoms} allDiseases={allDiseases} />
        )}
      </main>
    </div>
  )
}