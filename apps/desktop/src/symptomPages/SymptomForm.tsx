import { useState } from 'react'
import type { Symptom, SymptomCommonality, SymptomOnsetSpeed } from './symptomAPI'

interface Disease {
  id: string
  name: string
  severity: string
}

interface SymptomFormProps {
  symptom?: Symptom
  allDiseases: Disease[]
  onSubmit: (
    data: Omit<Symptom, 'id' | 'createdAt' | 'updatedAt'> & { diseaseIds?: string[] }
  ) => void
  loading: boolean
  onCancel: () => void
}

const COMMONALITY_OPTIONS: { value: SymptomCommonality; label: string; desc: string }[] = [
  { value: 'RARE', label: 'Rare', desc: 'Infrequently observed' },
  { value: 'COMMON', label: 'Common', desc: 'Regularly observed' },
  { value: 'VERY_COMMON', label: 'Very Common', desc: 'Almost always present' },
]

const ONSET_OPTIONS: { value: SymptomOnsetSpeed; label: string; desc: string }[] = [
  { value: 'ACUTE', label: 'Acute', desc: 'Hours to days' },
  { value: 'SUBACUTE', label: 'Subacute', desc: 'Days to weeks' },
  { value: 'CHRONIC', label: 'Chronic', desc: 'Weeks to months' },
]

const BODY_AREAS = [
  'Skin & Coat', 'Respiratory', 'Digestive', 'Musculoskeletal',
  'Neurological', 'Cardiovascular', 'Urinary', 'Reproductive',
  'Ocular', 'Oral', 'Systemic', 'Behavioural',
]

export default function SymptomForm({ symptom, allDiseases, onSubmit, loading, onCancel }: SymptomFormProps) {
  const [name, setName] = useState(symptom?.name || '')
  const [description, setDescription] = useState(symptom?.description || '')
  const [affectedBodyAreas, setAffectedBodyAreas] = useState<string[]>(
    symptom?.affectedBodyAreas || []
  )
  const [commonality, setCommonality] = useState<SymptomCommonality>(symptom?.commonality || 'COMMON')
  const [onsetSpeed, setOnsetSpeed] = useState<SymptomOnsetSpeed>(symptom?.onsetSpeed || 'ACUTE')
  const [notes, setNotes] = useState(symptom?.notes || '')
  const [diseaseIds, setDiseaseIds] = useState<string[]>(
    symptom?.diseaseSymptoms?.map(ds => ds.diseaseId) || []
  )
  const [diseaseSearch, setDiseaseSearch] = useState('')

  const isEditing = !!symptom

  const filteredDiseases = allDiseases.filter(d =>
    d.name.toLowerCase().includes(diseaseSearch.toLowerCase())
  )

  const toggleBodyArea = (area: string) => {
    setAffectedBodyAreas(prev =>
      prev.includes(area) ? prev.filter(x => x !== area) : [...prev, area]
    )
  }

  const toggleDisease = (id: string) => {
    setDiseaseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description,
      affectedBodyAreas,
      commonality,
      onsetSpeed,
      notes: notes || undefined,
      diseaseIds,
    })
  }

  return (
    <div className="sym-form-shell">
      <div className="sym-form-header">
        <h2 className="sym-form-title">
          {isEditing ? `Edit: ${symptom.name}` : 'New Symptom Record'}
        </h2>
        <p className="sym-form-subtitle">
          {isEditing
            ? 'Update the clinical details for this symptom'
            : 'Define a new symptom and link it to related diseases'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1 — Core info */}
        <div className="sym-form-card">
          <div className="sym-form-section-title">Core information</div>

          <div className="form-field">
            <label className="form-label" htmlFor="sym-name">Symptom name *</label>
            <input
              id="sym-name"
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Hair loss, Persistent cough, Lethargy"
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="sym-desc">Description *</label>
            <textarea
              id="sym-desc"
              className="sym-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a clear clinical description of this symptom, how it presents and what it indicates…"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          {/* Body areas — multi-select checkbox grid */}
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Affected body areas
              {affectedBodyAreas.length > 0 && (
                <span className="sym-link-count" style={{ marginLeft: 8 }}>
                  {affectedBodyAreas.length} selected
                </span>
              )}
            </label>
            <div className="sym-body-areas-grid">
              {BODY_AREAS.map(area => {
                const checked = affectedBodyAreas.includes(area)
                return (
                  <label
                    key={area}
                    className={`sym-body-area-option${checked ? ' checked' : ''}`}
                    onClick={() => !loading && toggleBodyArea(area)}
                  >
                    <span className="sym-checkmark">
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {area}
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Card 2 — Clinical profile */}
        <div className="sym-form-card">
          <div className="sym-form-section-title">Clinical profile</div>

          <div className="form-field">
            <label className="form-label">Commonality</label>
            <div className="sym-radio-group">
              {COMMONALITY_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`sym-radio-option${commonality === opt.value ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="commonality"
                    value={opt.value}
                    checked={commonality === opt.value}
                    onChange={() => setCommonality(opt.value)}
                    disabled={loading}
                  />
                  <div className="sym-radio-content">
                    <span className="sym-radio-label">{opt.label}</span>
                    <span className="sym-radio-desc">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label">Onset speed</label>
            <div className="sym-radio-group">
              {ONSET_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`sym-radio-option${onsetSpeed === opt.value ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="onsetSpeed"
                    value={opt.value}
                    checked={onsetSpeed === opt.value}
                    onChange={() => setOnsetSpeed(opt.value)}
                    disabled={loading}
                  />
                  <div className="sym-radio-content">
                    <span className="sym-radio-label">{opt.label}</span>
                    <span className="sym-radio-desc">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3 — Notes */}
        <div className="sym-form-card">
          <div className="sym-form-section-title">Additional notes</div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sym-notes">Clinical notes</label>
            <textarea
              id="sym-notes"
              className="sym-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional clinical observations, differential diagnosis hints, or special considerations…"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* Card 4 — Link diseases */}
        {allDiseases.length > 0 && (
          <div className="sym-form-card">
            <div className="sym-form-section-title">
              Link to diseases
              {diseaseIds.length > 0 && (
                <span className="sym-link-count">{diseaseIds.length} selected</span>
              )}
            </div>

            <div className="sym-disease-search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="sym-disease-search"
                placeholder="Filter diseases…"
                value={diseaseSearch}
                onChange={e => setDiseaseSearch(e.target.value)}
              />
            </div>

            <div className="sym-disease-grid">
              {filteredDiseases.map(d => {
                const checked = diseaseIds.includes(d.id)
                return (
                  <label
                    key={d.id}
                    className={`sym-disease-option${checked ? ' checked' : ''}`}
                    onClick={() => toggleDisease(d.id)}
                  >
                    <span className="sym-checkmark">
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="sym-disease-option-name">{d.name}</span>
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
        <div className="sym-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: 'auto', flex: 1 }}
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Create symptom record'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: 'auto' }}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}