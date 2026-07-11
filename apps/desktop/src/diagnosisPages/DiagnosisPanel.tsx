import { useState, useRef } from 'react'
import type { Symptom } from '../symptomPages/symptomAPI'
import type { Disease } from '../diseasePages/diseaseAPI'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const apiClient = axios.create({ baseURL: API_BASE_URL })
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
// ── Types ─────────────────────────────────────────────────────────────────────
interface DiagnosisResult {
  rank: number
  diseaseName: string
  matchedDiseaseId: string | null   // null if not in PawSense DB
  confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW'
  confidenceReasoning: string
  matchingSymptoms: string[]
  missingSymptoms: string[]
  suggestedTreatments: string[]
  suggestedMedicines: string[]
  urgency: 'IMMEDIATE' | 'URGENT' | 'ROUTINE' | 'MONITOR'
  clinicalNotes: string
}

interface DiagnosisResponse {
  summary: string
  differentialDiagnoses: DiagnosisResult[]
  generalRecommendations: string[]
  disclaimer: string
}

interface DiagnosisPanelProps {
  allSymptoms: Symptom[]
  allDiseases: Disease[]
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CONFIDENCE_CONFIG = {
  HIGH:     { label: 'High',     cls: 'diag-conf-high',     dot: '#2d7a4f' },
  MODERATE: { label: 'Moderate', cls: 'diag-conf-moderate', dot: '#8b6340' },
  LOW:      { label: 'Low',      cls: 'diag-conf-low',      dot: '#7a9882' },
}

const URGENCY_CONFIG = {
  IMMEDIATE: { label: 'Immediate',    cls: 'diag-urg-immediate', icon: '⬤' },
  URGENT:    { label: 'Urgent',       cls: 'diag-urg-urgent',    icon: '⬤' },
  ROUTINE:   { label: 'Routine',      cls: 'diag-urg-routine',   icon: '⬤' },
  MONITOR:   { label: 'Monitor only', cls: 'diag-urg-monitor',   icon: '⬤' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildPrompt(selectedSymptoms: Symptom[], allDiseases: Disease[]): string {
  const symptomDescriptions = selectedSymptoms.map(s =>
    `- ${s.name} (${s.commonality.toLowerCase()} commonality, ${s.onsetSpeed.toLowerCase()} onset${
      s.affectedBodyAreas?.length ? `, affects: ${s.affectedBodyAreas.join(', ')}` : ''
    }): ${s.description}`
  ).join('\n')

  const knowledgeBaseDiseases = allDiseases.map(d =>
    `- ID:${d.id} | ${d.name} (${d.severity} severity): symptoms include ${d.symptoms.slice(0, 5).join(', ')}`
  ).join('\n')

  return `You are a veterinary clinical decision support assistant. A veterinarian is presenting the following observed symptoms in a patient animal. Provide a differential diagnosis.

## Observed Symptoms (${selectedSymptoms.length} total)
${symptomDescriptions}

## PawSense Knowledge Base Diseases (for cross-referencing)
${knowledgeBaseDiseases || 'No diseases currently in knowledge base.'}

## Instructions
Analyze the symptoms and return a differential diagnosis. For each diagnosis:
1. Cross-reference against the PawSense knowledge base — if a matching disease exists, include its ID in matchedDiseaseId
2. If not in the knowledge base, set matchedDiseaseId to null
3. Rank by clinical likelihood given the presented symptoms
4. Provide specific clinical reasoning, not generic statements
5. Maximum 5 differential diagnoses

Return ONLY valid JSON in this exact structure:
{
  "summary": "Brief 1-2 sentence clinical summary of the presentation",
  "differentialDiagnoses": [
    {
      "rank": 1,
      "diseaseName": "Disease name",
      "matchedDiseaseId": "uuid-if-in-pawsense-or-null",
      "confidenceLevel": "HIGH|MODERATE|LOW",
      "confidenceReasoning": "Specific reasoning why this ranks here based on the presented symptoms",
      "matchingSymptoms": ["symptom names that support this diagnosis"],
      "missingSymptoms": ["classic symptoms of this disease NOT observed, if any"],
      "suggestedTreatments": ["specific treatment approaches"],
      "suggestedMedicines": ["specific medicine classes or names"],
      "urgency": "IMMEDIATE|URGENT|ROUTINE|MONITOR",
      "clinicalNotes": "Additional clinical considerations, contraindications, or follow-up notes"
    }
  ],
  "generalRecommendations": ["Cross-cutting recommendations applicable regardless of final diagnosis"],
  "disclaimer": "Standard veterinary disclaimer"
}`
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SymptomSelector({
  allSymptoms,
  selected,
  onToggle,
  search,
  onSearch,
}: {
  allSymptoms: Symptom[]
  selected: Symptom[]
  onToggle: (s: Symptom) => void
  search: string
  onSearch: (v: string) => void
}) {
  const filtered = allSymptoms.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.affectedBodyAreas || []).some(a => a.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="diag-symptom-selector">
      <div className="diag-search-wrap">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          className="diag-search"
          placeholder="Search symptoms or body areas…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      <div className="diag-symptom-grid">
        {filtered.length === 0 && (
          <p className="diag-empty-hint">No symptoms match your search.</p>
        )}
        {filtered.map(s => {
          const checked = selected.some(sel => sel.id === s.id)
          return (
            <button
              key={s.id}
              type="button"
              className={`diag-symptom-btn${checked ? ' checked' : ''}`}
              onClick={() => onToggle(s)}
            >
              <span className="diag-symptom-check">
                {checked && (
                  <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className="diag-symptom-name">{s.name}</span>
              {s.affectedBodyAreas?.[0] && (
                <span className="diag-symptom-area">{s.affectedBodyAreas[0]}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SelectedSymptomChips({
  selected,
  onRemove,
}: {
  selected: Symptom[]
  onRemove: (s: Symptom) => void
}) {
  if (selected.length === 0) return null
  return (
    <div className="diag-selected-chips">
      {selected.map(s => (
        <span key={s.id} className="diag-chip">
          {s.name}
          <button type="button" className="diag-chip-remove" onClick={() => onRemove(s)}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </span>
      ))}
    </div>
  )
}

function DiagnosisResultCard({
  result,
  allDiseases,
}: {
  result: DiagnosisResult
  allDiseases: Disease[]
}) {
  const [expanded, setExpanded] = useState(false)
  const conf = CONFIDENCE_CONFIG[result.confidenceLevel]
  const urg = URGENCY_CONFIG[result.urgency]
  const linkedDisease = result.matchedDiseaseId
    ? allDiseases.find(d => d.id === result.matchedDiseaseId)
    : null

  return (
    <div className={`diag-result-card diag-result-rank-${result.rank}`}>
      <div className="diag-result-header" onClick={() => setExpanded(e => !e)}>
        <div className="diag-result-rank">#{result.rank}</div>
        <div className="diag-result-header-main">
          <div className="diag-result-name-row">
            <span className="diag-result-name">{result.diseaseName}</span>
            {linkedDisease && (
              <span className="diag-result-in-db" title="Found in PawSense knowledge base">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                In knowledge base
              </span>
            )}
          </div>
          <div className="diag-result-badges">
            <span className={`diag-conf-badge ${conf.cls}`}>
              <span className="diag-conf-dot" style={{ background: conf.dot }} />
              {conf.label} confidence
            </span>
            <span className={`diag-urg-badge ${urg.cls}`}>
              {result.urgency === 'IMMEDIATE' || result.urgency === 'URGENT' ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v4M5 7.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              )}
              {urg.label}
            </span>
          </div>
        </div>
        <button className={`diag-expand-btn${expanded ? ' expanded' : ''}`} type="button">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="diag-result-reasoning">{result.confidenceReasoning}</div>

      {expanded && (
        <div className="diag-result-body">
          <div className="diag-result-grid">
            <div className="diag-result-section">
              <div className="diag-result-section-title">Supporting symptoms</div>
              <div className="diag-symptom-tags">
                {result.matchingSymptoms.map((sym, i) => (
                  <span key={i} className="diag-tag diag-tag-match">{sym}</span>
                ))}
                {result.matchingSymptoms.length === 0 && (
                  <span className="diag-tag-empty">None listed</span>
                )}
              </div>
            </div>

            {result.missingSymptoms.length > 0 && (
              <div className="diag-result-section">
                <div className="diag-result-section-title">Classic symptoms not observed</div>
                <div className="diag-symptom-tags">
                  {result.missingSymptoms.map((sym, i) => (
                    <span key={i} className="diag-tag diag-tag-missing">{sym}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="diag-result-section">
              <div className="diag-result-section-title">Suggested treatments</div>
              <ul className="diag-result-list">
                {result.suggestedTreatments.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>

            <div className="diag-result-section">
              <div className="diag-result-section-title">Suggested medicines</div>
              <ul className="diag-result-list">
                {result.suggestedMedicines.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>

            <div className="diag-result-section diag-result-section-full">
              <div className="diag-result-section-title">Clinical notes</div>
              <p className="diag-result-notes">{result.clinicalNotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DiagnosisPanel({ allSymptoms, allDiseases }: DiagnosisPanelProps) {
  const [selected, setSelected] = useState<Symptom[]>([])
  const [symptomSearch, setSymptomSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'result'>('select')
  const resultRef = useRef<HTMLDivElement>(null)

  const toggleSymptom = (s: Symptom) => {
    setSelected(prev =>
      prev.some(sel => sel.id === s.id)
        ? prev.filter(sel => sel.id !== s.id)
        : [...prev, s]
    )
    setResult(null)
    setError(null)
  }

  const clearAll = () => {
    setSelected([])
    setResult(null)
    setError(null)
    setStep('select')
  }

  // AFTER
const runDiagnosis = async () => {
  if (selected.length < 2) {
    setError('Please select at least 2 symptoms to run a differential diagnosis.')
    return
  }

  setLoading(true)
  setError(null)
  setResult(null)

  try {
    const res = await apiClient.post<DiagnosisResponse>('/differential-diagnosis/analyze', {
      symptomIds: selected.map(s => s.id),
    })

    setResult(res.data)
    setStep('result')

    // Scroll to results
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  } catch (err) {
    console.error('Diagnosis error:', err)
    setError('Failed to run diagnosis. Please check your connection and try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="diag-panel">
      {/* ── Header ── */}
      <div className="diag-panel-header">
        <div className="diag-panel-header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 2C6.48 2 2 6.48 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
          </svg>
        </div>
        <div>
          <h2 className="diag-panel-title">Differential Diagnosis</h2>
          <p className="diag-panel-subtitle">
            Select observed symptoms to generate AI-assisted clinical differentials
          </p>
        </div>
      </div>

      {/* ── Symptom selection ── */}
      <div className="diag-section-card">
        <div className="diag-section-label">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 7h6M7 4v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          Select observed symptoms
          {selected.length > 0 && (
            <span className="diag-count-badge">{selected.length} selected</span>
          )}
        </div>

        {allSymptoms.length === 0 ? (
          <div className="diag-empty-state">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity=".3"/>
              <path d="M16 10v6M16 20h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
            </svg>
            <p>No symptoms in the knowledge base yet.</p>
            <p className="diag-empty-hint-sub">Add symptoms to the Symptom Library first.</p>
          </div>
        ) : (
          <SymptomSelector
            allSymptoms={allSymptoms}
            selected={selected}
            onToggle={toggleSymptom}
            search={symptomSearch}
            onSearch={setSymptomSearch}
          />
        )}

        {selected.length > 0 && (
          <>
            <div className="diag-selected-label">Selected for diagnosis:</div>
            <SelectedSymptomChips selected={selected} onRemove={toggleSymptom} />
          </>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="diag-error">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="diag-actions">
        <button
          type="button"
          className="btn btn-primary diag-run-btn"
          onClick={runDiagnosis}
          disabled={loading || selected.length < 2}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Analysing…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Run Differential Diagnosis
            </>
          )}
        </button>
        {(selected.length > 0 || result) && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: 'auto' }}
            onClick={clearAll}
            disabled={loading}
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="diag-loading-state">
          <div className="diag-loading-pulse" />
          <div className="diag-loading-text">
            <span>Analysing {selected.length} symptom{selected.length !== 1 ? 's' : ''}</span>
            <span className="diag-loading-sub">Cross-referencing knowledge base · Generating differentials</span>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {result && !loading && (
        <div className="diag-results" ref={resultRef}>
          {/* Summary */}
          <div className="diag-summary-card">
            <div className="diag-summary-icon">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="diag-summary-label">Clinical Summary</div>
              <p className="diag-summary-text">{result.summary}</p>
            </div>
          </div>

          {/* Differential list */}
          <div className="diag-results-label">
            Differential Diagnoses
            <span className="diag-results-count">{result.differentialDiagnoses.length} conditions</span>
          </div>

          <div className="diag-result-list-wrap">
            {result.differentialDiagnoses.map(d => (
              <DiagnosisResultCard
                key={d.rank}
                result={d}
                allDiseases={allDiseases}
              />
            ))}
          </div>

          {/* General recommendations */}
          {result.generalRecommendations?.length > 0 && (
            <div className="diag-recommendations">
              <div className="diag-recommendations-title">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                General Recommendations
              </div>
              <ul className="diag-recommendations-list">
                {result.generalRecommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="diag-disclaimer">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 5v3M7 10h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {result.disclaimer}
          </div>

          {/* Re-run */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', fontSize: 13 }}
              onClick={runDiagnosis}
              disabled={loading}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7a5 5 0 019.3-2.5M12 7a5 5 0 01-9.3 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M11.5 2.5V5H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Re-run analysis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}