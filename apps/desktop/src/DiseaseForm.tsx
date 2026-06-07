import { useState } from 'react'
import type { Disease } from './diseaseAPI'

interface DiseaseFormProps {
  disease?: Disease
  allDiseases: Disease[]
  onSubmit: (
    formData: Omit<Disease, 'id' | 'createdAt' | 'updatedAt'> & {
      relatedDiseaseIds?: string[]
    },
    imageFile?: File
  ) => void
  loading: boolean
  onCancel: () => void
}

const SEV_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

export default function DiseaseForm({ disease, allDiseases, onSubmit, loading, onCancel }: DiseaseFormProps) {
  const [name, setName] = useState(disease?.name || '')
  const [description, setDescription] = useState(disease?.description || '')
  const [severity, setSeverity] = useState(disease?.severity || 'MEDIUM')
  const [causes, setCauses] = useState(disease?.causes.join('\n') || '')
  const [symptoms, setSymptoms] = useState(disease?.symptoms.join('\n') || '')
  const [prevention, setPrevention] = useState(disease?.preventionMethods.join('\n') || '')
  const [treatment, setTreatment] = useState(disease?.treatmentMethods.join('\n') || '')
  const [recoveryPeriod, setRecoveryPeriod] = useState(disease?.recoveryPeriod || '')
  const [relatedIds, setRelatedIds] = useState<string[]>(
    disease?.relatedDiseasesFrom?.map(r => r.diseaseTo.id) || []
  )
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>(disease?.imageUrl)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const toggleRelated = (id: string) => {
    setRelatedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parseLines = (s: string) =>
      s.split('\n').map(l => l.trim()).filter(Boolean)

    onSubmit({
      name,
      description,
      severity: severity as any,
      causes: parseLines(causes),
      symptoms: parseLines(symptoms),
      preventionMethods: parseLines(prevention),
      treatmentMethods: parseLines(treatment),
      recoveryPeriod,
      relatedDiseaseIds: relatedIds,
    }, imageFile)
  }

  const isEditing = !!disease
  const otherDiseases = allDiseases.filter(d => d.id !== disease?.id)

  return (
    <div className="dm-form-shell">
      <div className="dm-form-header">
        <h2 className="dm-form-title">
          {isEditing ? `Edit: ${disease.name}` : 'New Disease Record'}
        </h2>
        <p className="dm-form-subtitle">
          {isEditing
            ? 'Update the clinical details for this disease record'
            : 'Fill in the clinical details to create a new disease record'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1 — Core info */}
        <div className="dm-form-card">
          <div className="dm-form-section-title">Core information</div>

          <div className="form-field">
            <label className="form-label" htmlFor="dm-name">Disease name *</label>
            <input
              id="dm-name"
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Feline Panleukopenia"
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="dm-desc">Description *</label>
            <textarea
              id="dm-desc"
              className="dm-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a clear clinical description of this disease…"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="dm-form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dm-sev">Severity level *</label>
              <select
                id="dm-sev"
                className="dm-select"
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                disabled={loading}
              >
                {SEV_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dm-recovery">Recovery period *</label>
              <input
                id="dm-recovery"
                type="text"
                className="form-input"
                value={recoveryPeriod}
                onChange={e => setRecoveryPeriod(e.target.value)}
                placeholder="e.g. 7–14 days"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Card 2 — Clinical details */}
        <div className="dm-form-card">
          <div className="dm-form-section-title">Clinical details</div>

          <div className="dm-form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dm-causes">Causes</label>
              <textarea
                id="dm-causes"
                className="dm-textarea"
                value={causes}
                onChange={e => setCauses(e.target.value)}
                placeholder={"Viral infection\nBacterial contamination\nParasitic exposure"}
                rows={4}
                disabled={loading}
              />
              <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>One entry per line</span>
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dm-symptoms">Symptoms *</label>
              <textarea
                id="dm-symptoms"
                className="dm-textarea"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder={"Fever\nVomiting\nLethargy\nLoss of appetite"}
                rows={4}
                required
                disabled={loading}
              />
              <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>One entry per line</span>
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dm-prevention">Prevention methods</label>
              <textarea
                id="dm-prevention"
                className="dm-textarea"
                value={prevention}
                onChange={e => setPrevention(e.target.value)}
                placeholder={"Regular vaccination\nProper sanitation"}
                rows={4}
                disabled={loading}
              />
              <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>One entry per line</span>
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dm-treatment">Treatment methods *</label>
              <textarea
                id="dm-treatment"
                className="dm-textarea"
                value={treatment}
                onChange={e => setTreatment(e.target.value)}
                placeholder={"Supportive IV fluids\nAntibiotics\nAntivirals"}
                rows={4}
                required
                disabled={loading}
              />
              <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>One entry per line</span>
            </div>
          </div>
        </div>

        {/* Card 3 — Image */}
        <div className="dm-form-card">
          <div className="dm-form-section-title">Disease image</div>
          <div className="dm-upload-area">
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
            <div className="dm-upload-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="4" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 18l7-5 4 3 4-4 9 6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="dm-upload-label">Drop an image here or click to browse</p>
            <p className="dm-upload-hint">PNG, JPG, WebP — max 5 MB</p>
          </div>
          {imagePreview && (
            <div className="dm-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="dm-image-preview-remove"
                onClick={() => { setImagePreview(undefined); setImageFile(undefined) }}
              >×</button>
            </div>
          )}
        </div>

        {/* Card 4 — Related diseases */}
        {otherDiseases.length > 0 && (
          <div className="dm-form-card">
            <div className="dm-form-section-title">Related diseases</div>
            <div className="dm-related-grid">
              {otherDiseases.map(d => {
                const checked = relatedIds.includes(d.id)
                return (
                  <label
                    key={d.id}
                    className={`dm-related-option${checked ? ' checked' : ''}`}
                    onClick={() => toggleRelated(d.id)}
                  >
                    <span className="dm-checkmark">
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {d.name}
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="dm-form-actions">
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', flex: 1 }} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Create disease record'}
          </button>
          <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}