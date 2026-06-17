import { useState } from 'react'
import type { Treatment, TreatmentStepInput } from './treatmentAPI'

interface TreatmentFormProps {
  treatment?: Treatment
  allDiseases: { id: string; name: string; severity: string }[]
  onSubmit: (
    data: {
      name: string
      description: string
      contraindications: string[]
      vetNotes?: string
      estimatedDuration?: string
      estimatedCost?: string
      successRate?: number
      steps: TreatmentStepInput[]
      diseaseIds: string[]
    },
    imageFile?: File
  ) => void
  loading: boolean
  onCancel: () => void
}

export default function TreatmentForm({
  treatment, allDiseases, onSubmit, loading, onCancel,
}: TreatmentFormProps) {
  const [name, setName] = useState(treatment?.name || '')
  const [description, setDescription] = useState(treatment?.description || '')
  const [contraindications, setContraindications] = useState(
    treatment?.contraindications.join('\n') || ''
  )
  const [vetNotes, setVetNotes] = useState(treatment?.vetNotes || '')
  const [estimatedDuration, setEstimatedDuration] = useState(treatment?.estimatedDuration || '')
  const [estimatedCost, setEstimatedCost] = useState(treatment?.estimatedCost || '')
  const [successRate, setSuccessRate] = useState(
    treatment?.successRate !== undefined && treatment?.successRate !== null
      ? String(treatment.successRate) : ''
  )
  const [steps, setSteps] = useState<TreatmentStepInput[]>(
    treatment?.steps.map(s => ({
      title: s.title,
      description: s.description,
      durationMinutes: s.durationMinutes,
    })) || []
  )
  const [diseaseIds, setDiseaseIds] = useState<string[]>(
    treatment?.diseaseTreatments?.map(dt => dt.diseaseId) || []
  )
  const [diseaseSearch, setDiseaseSearch] = useState('')
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>(treatment?.imageUrl)

  const isEditing = !!treatment

  // ── Step management ───────────────────────────────
  const addStep = () => {
    setSteps(prev => [...prev, { title: '', description: '', durationMinutes: undefined }])
  }

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx))
  }

  const updateStep = (idx: number, field: keyof TreatmentStepInput, value: string | number | undefined) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const moveStep = (idx: number, direction: 'up' | 'down') => {
    setSteps(prev => {
      const next = [...prev]
      const target = direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target]!, next[idx]!]
      return next
    })
  }

  // ── Image ─────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const toggleDisease = (id: string) => {
    setDiseaseIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filteredDiseases = allDiseases.filter(d =>
    d.name.toLowerCase().includes(diseaseSearch.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parseLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean)
    onSubmit({
      name,
      description,
      contraindications: parseLines(contraindications),
      vetNotes: vetNotes || undefined,
      estimatedDuration: estimatedDuration || undefined,
      estimatedCost: estimatedCost || undefined,
      successRate: successRate ? parseFloat(successRate) : undefined,
      steps: steps.filter(s => s.title.trim()),
      diseaseIds,
    }, imageFile)
  }

  return (
    <div className="tr-form-shell">
      <div className="tr-form-header">
        <h2 className="tr-form-title">
          {isEditing ? `Edit: ${treatment.name}` : 'New Treatment Protocol'}
        </h2>
        <p className="tr-form-subtitle">
          {isEditing
            ? 'Update the clinical details for this treatment'
            : 'Define a reusable treatment protocol with step-by-step procedures'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1 — Core info */}
        <div className="tr-form-card">
          <div className="tr-form-section-title">Core information</div>

          <div className="form-field">
            <label className="form-label" htmlFor="tr-name">Treatment name *</label>
            <input
              id="tr-name"
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Fluid Resuscitation Therapy, Wound Debridement"
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="tr-desc">Description *</label>
            <textarea
              id="tr-desc"
              className="tr-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a clear clinical overview of this treatment protocol…"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="tr-form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tr-duration">Estimated duration</label>
              <input
                id="tr-duration"
                type="text"
                className="form-input"
                value={estimatedDuration}
                onChange={e => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 30–60 minutes, 3–5 days"
                disabled={loading}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tr-cost">Estimated cost</label>
              <input
                id="tr-cost"
                type="text"
                className="form-input"
                value={estimatedCost}
                onChange={e => setEstimatedCost(e.target.value)}
                placeholder="e.g. $150–$300 USD"
                disabled={loading}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tr-rate">
                Success rate (%)
                <span style={{ color: 'var(--text-light)', fontSize: 11, marginLeft: 6 }}>optional</span>
              </label>
              <input
                id="tr-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="form-input"
                value={successRate}
                onChange={e => setSuccessRate(e.target.value)}
                placeholder="e.g. 87.5"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Card 2 — Procedure steps */}
        <div className="tr-form-card">
          <div className="tr-form-section-title">
            Procedure steps
            {steps.length > 0 && (
              <span className="tr-link-count">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Define the ordered steps a veterinarian follows to administer this treatment.
          </p>

          {steps.map((step, idx) => (
            <div key={idx} className="tr-step-editor">
              <div className="tr-step-editor-num">{idx + 1}</div>
              <div className="tr-step-editor-fields">
                <div className="tr-form-row">
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Step title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={step.title}
                      onChange={e => updateStep(idx, 'title', e.target.value)}
                      placeholder="e.g. Prepare IV line"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={step.durationMinutes ?? ''}
                      onChange={e => updateStep(idx, 'durationMinutes', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="e.g. 15"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: 0, marginTop: 10 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="tr-textarea"
                    value={step.description}
                    onChange={e => updateStep(idx, 'description', e.target.value)}
                    placeholder="Describe what the veterinarian should do in this step…"
                    rows={2}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="tr-step-editor-actions">
                <button
                  type="button"
                  className="tr-step-btn"
                  onClick={() => moveStep(idx, 'up')}
                  disabled={idx === 0 || loading}
                  title="Move up"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="tr-step-btn"
                  onClick={() => moveStep(idx, 'down')}
                  disabled={idx === steps.length - 1 || loading}
                  title="Move down"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="tr-step-btn tr-step-btn-danger"
                  onClick={() => removeStep(idx)}
                  disabled={loading}
                  title="Remove step"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="tr-add-step-btn"
            onClick={addStep}
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add step
          </button>
        </div>

        {/* Card 3 — Clinical details */}
        <div className="tr-form-card">
          <div className="tr-form-section-title">Clinical details</div>

          <div className="form-field">
            <label className="form-label" htmlFor="tr-contra">Contraindications</label>
            <textarea
              id="tr-contra"
              className="tr-textarea"
              value={contraindications}
              onChange={e => setContraindications(e.target.value)}
              placeholder={"Pregnancy\nSevere renal impairment\nKnown drug allergy"}
              rows={4}
              disabled={loading}
            />
            <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
              One entry per line
            </span>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="tr-notes">Veterinarian notes</label>
            <textarea
              id="tr-notes"
              className="tr-textarea"
              value={vetNotes}
              onChange={e => setVetNotes(e.target.value)}
              placeholder="Clinical observations, dosage adjustments, post-treatment monitoring instructions…"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* Card 4 — Image */}
        <div className="tr-form-card">
          <div className="tr-form-section-title">Reference image</div>
          <div className="tr-upload-area">
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
            <div className="tr-upload-icon">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="4" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 18l7-5 4 3 4-4 9 6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="tr-upload-label">Drop an image here or click to browse</p>
            <p className="tr-upload-hint">PNG, JPG, WebP — max 5 MB</p>
          </div>
          {imagePreview && (
            <div className="tr-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="tr-image-preview-remove"
                onClick={() => { setImagePreview(undefined); setImageFile(undefined) }}
              >×</button>
            </div>
          )}
        </div>

        {/* Card 5 — Link diseases */}
        {allDiseases.length > 0 && (
          <div className="tr-form-card">
            <div className="tr-form-section-title">
              Link to diseases
              {diseaseIds.length > 0 && (
                <span className="tr-link-count">{diseaseIds.length} selected</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Associate this treatment with one or more diseases in the knowledge base.
            </p>

            <div className="tr-disease-search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="tr-disease-search"
                placeholder="Filter diseases…"
                value={diseaseSearch}
                onChange={e => setDiseaseSearch(e.target.value)}
              />
            </div>

            <div className="tr-disease-grid">
              {filteredDiseases.map(d => {
                const checked = diseaseIds.includes(d.id)
                return (
                  <label
                    key={d.id}
                    className={`tr-disease-option${checked ? ' checked' : ''}`}
                    onClick={() => toggleDisease(d.id)}
                  >
                    <span className="tr-checkmark">
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="tr-disease-option-name">{d.name}</span>
                    <span className={`sev-badge sev-${d.severity.toLowerCase()}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                      {d.severity}
                    </span>
                  </label>
                )
              })}
              {filteredDiseases.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic', gridColumn: '1/-1', padding: '8px 0' }}>
                  No diseases match your search.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="tr-form-actions">
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', flex: 1 }} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Create treatment protocol'}
          </button>
          <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}