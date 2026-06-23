import { useState } from 'react'
import type { Disease } from './diseaseAPI'
import type { Symptom } from '../symptomPages/symptomAPI'
import type { Treatment } from '../treatmentPages/treatmentAPI'
import type { Medicine } from '../medicinePages/medicineAPI'

interface DiseaseFormProps {
  disease?: Disease
  allDiseases: Disease[]
  allSymptoms?: Symptom[]
  allTreatments?: Treatment[]
  allMedicines?: Medicine[]
  onSubmit: (
    formData: Omit<Disease, 'id' | 'createdAt' | 'updatedAt'> & {
      relatedDiseaseIds?: string[]
      symptomIds?: string[]
      treatmentIds?: string[]
      medicineIds?: string[]   
    },
    imageFile?: File
  ) => void
  loading: boolean
  onCancel: () => void
}

const SEV_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

const COMMONALITY_CONFIG: Record<string, { label: string; class: string }> = {
  RARE: { label: 'Rare', class: 'sym-rare' },
  COMMON: { label: 'Common', class: 'sym-common' },
  VERY_COMMON: { label: 'Very Common', class: 'sym-very-common' },
}

export default function DiseaseForm({ disease, allDiseases, allSymptoms = [], allTreatments = [], allMedicines = [], onSubmit, loading, onCancel }: DiseaseFormProps) {
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
  const [symptomIds, setSymptomIds] = useState<string[]>(
    disease?.diseaseSymptoms?.map((ds: any) => ds.symptomId) || []
  )
  
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>(disease?.imageUrl)
  const [symptomSearch, setSymptomSearch] = useState('')
  const [treatmentIds, setTreatmentIds] = useState<string[]>(
    disease?.diseaseTreatments?.map((dt: any) => dt.treatmentId) || []
  )
  const [treatmentSearch, setTreatmentSearch] = useState('')
  const [medicineIds, setMedicineIds] = useState<string[]>(
  disease?.diseaseMedicines?.map((dm: any) => dm.medicineId) || []
  )
  const [medicineSearch, setMedicineSearch] = useState('')

  const filteredMedicines = (allMedicines || []).filter((m) =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    (m.manufacturer || '').toLowerCase().includes(medicineSearch.toLowerCase())
  )

  const toggleMedicine = (id: string) => {
    setMedicineIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

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

  const toggleSymptom = (id: string) => {
    setSymptomIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleTreatment = (id: string) => {
    setTreatmentIds(prev =>
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
      symptomIds,
      treatmentIds,
      medicineIds,
    }, imageFile)
  }

  const isEditing = !!disease
  const otherDiseases = allDiseases.filter(d => d.id !== disease?.id)
  const filteredSymptoms = allSymptoms.filter(s =>
    s.name.toLowerCase().includes(symptomSearch.toLowerCase()) ||
    (s.affectedBodyAreas || '').includes(symptomSearch.toLowerCase())
  )

  const filteredTreatments = allTreatments.filter(t =>
    t.name.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(treatmentSearch.toLowerCase())
  )

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
              <label className="form-label" htmlFor="dm-symptoms">Symptoms (free text)</label>
              <textarea
                id="dm-symptoms"
                className="dm-textarea"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder={"Fever\nVomiting\nLethargy\nLoss of appetite"}
                rows={4}
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

        {/* Card 4 — Link symptoms from library */}
        {allSymptoms.length > 0 && (
          <div className="dm-form-card">
            <div className="dm-form-section-title">
              Link symptoms from library
              {symptomIds.length > 0 && (
                <span className="sym-link-count">{symptomIds.length} selected</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Select symptoms from the symptom library to associate with this disease.
            </p>

            <div className="sym-disease-search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="sym-disease-search"
                placeholder="Filter symptoms…"
                value={symptomSearch}
                onChange={e => setSymptomSearch(e.target.value)}
              />
            </div>

            <div className="sym-disease-grid">
              {filteredSymptoms.map(s => {
                const checked = symptomIds.includes(s.id)
                const commonality = COMMONALITY_CONFIG[s.commonality] || { label: s.commonality, class: 'sym-common' }
                return (
                  <label
                    key={s.id}
                    className={`sym-disease-option${checked ? ' checked' : ''}`}
                    onClick={() => toggleSymptom(s.id)}
                  >
                    <span className="sym-checkmark">
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="sym-disease-option-name">{s.name}</span>
                    <span className={`sym-badge ${commonality.class}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                      {commonality.label}
                    </span>
                  </label>
                )
              })}
              {filteredSymptoms.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic', gridColumn: '1/-1', padding: '8px 0' }}>
                  No symptoms match your search.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Card 5 — Link treatments from library */}
        {allTreatments.length > 0 && (
          <div className="dm-form-card">
            <div className="dm-form-section-title">
              Link treatments from library
              {treatmentIds.length > 0 && (
                <span className="sym-link-count">{treatmentIds.length} selected</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Associate treatment protocols from the treatment library with this disease.
            </p>

            <div className="sym-disease-search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="sym-disease-search"
                placeholder="Filter treatments…"
                value={treatmentSearch}
                onChange={e => setTreatmentSearch(e.target.value)}
              />
            </div>

            <div className="sym-disease-grid">
              {filteredTreatments.map(t => {
                const checked = treatmentIds.includes(t.id)
                return (
                  <label
                    key={t.id}
                    className={`sym-disease-option${checked ? ' checked' : ''}`}
                    onClick={() => toggleTreatment(t.id)}
                  >
                    <span className="sym-checkmark">
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="sym-disease-option-name">{t.name}</span>
                    {t.steps.length > 0 && (
                      <span style={{
                        fontSize: 10, padding: '2px 7px',
                        background: 'var(--green-pale)', color: 'var(--green-forest)',
                        borderRadius: 100, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {t.steps.length} step{t.steps.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </label>
                )
              })}
              {filteredTreatments.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic', gridColumn: '1/-1', padding: '8px 0' }}>
                  No treatments match your search.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Card 6 — Link medicines from library */}
        {(allMedicines || []).length > 0 && (
          <div className="dm-form-card">
            <div className="dm-form-section-title">
              Link medicines from library
              {medicineIds.length > 0 && (
                <span className="sym-link-count">{medicineIds.length} selected</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Associate medicines used to treat this disease.
            </p>

            <div className="sym-disease-search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className="sym-disease-search"
                placeholder="Filter medicines…"
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
              />
            </div>

            <div className="sym-disease-grid">
              {filteredMedicines.map((m) => {
                const checked = medicineIds.includes(m.id)
                return (
                  <label
                    key={m.id}
                    className={`sym-disease-option${checked ? ' checked' : ''}`}
                    onClick={() => toggleMedicine(m.id)}
                  >
                    <span className="sym-checkmark">
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4l3 3 5-6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="sym-disease-option-name">{m.name}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-light)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.dosage}
                    </span>
                  </label>
                )
              })}
              {filteredMedicines.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic', gridColumn: '1/-1', padding: '8px 0' }}>
                  No medicines match your search.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Card 5 — Related diseases */}
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