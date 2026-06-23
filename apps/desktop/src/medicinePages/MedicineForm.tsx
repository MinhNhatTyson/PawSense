import { useState } from 'react'
import type { Medicine } from './medicineAPI'

interface Disease {
  id: string
  name: string
  severity: string
}

interface MedicineFormProps {
  medicine?: Medicine
  allDiseases: Disease[]
  onSubmit: (
    data: {
      name: string
      description: string
      dosage: string
      sideEffects: string[]
      usageInstructions: string
      warnings: string[]
      manufacturer?: string
      diseaseIds: string[]
    },
    imageFile?: File
  ) => void
  loading: boolean
  onCancel: () => void
}

export default function MedicineForm({
  medicine,
  allDiseases,
  onSubmit,
  loading,
  onCancel,
}: MedicineFormProps) {
  const [name, setName] = useState(medicine?.name || '')
  const [description, setDescription] = useState(medicine?.description || '')
  const [dosage, setDosage] = useState(medicine?.dosage || '')
  const [sideEffects, setSideEffects] = useState(
    medicine?.sideEffects?.join('\n') || ''
  )
  const [usageInstructions, setUsageInstructions] = useState(
    medicine?.usageInstructions || ''
  )
  const [warnings, setWarnings] = useState(medicine?.warnings?.join('\n') || '')
  const [manufacturer, setManufacturer] = useState(medicine?.manufacturer || '')
  const [diseaseIds, setDiseaseIds] = useState<string[]>(
    medicine?.diseaseMedicines?.map((dm) => dm.diseaseId) || []
  )
  const [diseaseSearch, setDiseaseSearch] = useState('')
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    medicine?.imageUrl
  )

  const isEditing = !!medicine

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const toggleDisease = (id: string) => {
    setDiseaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const filteredDiseases = allDiseases.filter((d) =>
    d.name.toLowerCase().includes(diseaseSearch.toLowerCase())
  )

  const parseLines = (s: string) =>
    s
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(
      {
        name,
        description,
        dosage,
        sideEffects: parseLines(sideEffects),
        usageInstructions,
        warnings: parseLines(warnings),
        manufacturer: manufacturer || undefined,
        diseaseIds,
      },
      imageFile
    )
  }

  return (
    <div className="med-form-shell">
      <div className="med-form-header">
        <h2 className="med-form-title">
          {isEditing ? `Edit: ${medicine.name}` : 'New Medicine Record'}
        </h2>
        <p className="med-form-subtitle">
          {isEditing
            ? 'Update the clinical details for this medicine'
            : 'Define a new medicine and optionally link it to diseases'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1 — Core information */}
        <div className="med-form-card">
          <div className="med-form-section-title">Core information</div>

          <div className="form-field">
            <label className="form-label" htmlFor="med-name">
              Medicine name *
            </label>
            <input
              id="med-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amoxicillin, Doxycycline"
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="med-desc">
              Description *
            </label>
            <textarea
              id="med-desc"
              className="med-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a clear clinical description of this medicine, its class and primary use…"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="med-form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="med-dosage">
                Dosage *
              </label>
              <input
                id="med-dosage"
                type="text"
                className="form-input"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 5mg/kg twice daily for 7 days"
                required
                disabled={loading}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="med-manufacturer">
                Manufacturer{' '}
                <span style={{ color: 'var(--text-light)', fontSize: 11 }}>
                  optional
                </span>
              </label>
              <input
                id="med-manufacturer"
                type="text"
                className="form-input"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Zoetis, Elanco, Merck"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Card 2 — Clinical details */}
        <div className="med-form-card">
          <div className="med-form-section-title">Clinical details</div>

          <div className="form-field">
            <label className="form-label" htmlFor="med-instructions">
              Usage instructions *
            </label>
            <textarea
              id="med-instructions"
              className="med-textarea"
              value={usageInstructions}
              onChange={(e) => setUsageInstructions(e.target.value)}
              placeholder="Describe how this medicine should be administered, timing, route (oral/IV/topical), food interaction…"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="med-form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="med-sideeffects">
                Side effects
              </label>
              <textarea
                id="med-sideeffects"
                className="med-textarea"
                value={sideEffects}
                onChange={(e) => setSideEffects(e.target.value)}
                placeholder={'Vomiting\nDiarrhoea\nLoss of appetite'}
                rows={5}
                disabled={loading}
              />
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-light)',
                  marginTop: 4,
                  display: 'block',
                }}
              >
                One entry per line
              </span>
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="med-warnings">
                Warnings
              </label>
              <textarea
                id="med-warnings"
                className="med-textarea"
                value={warnings}
                onChange={(e) => setWarnings(e.target.value)}
                placeholder={
                  'Do not use in pregnant animals\nAvoid in renal insufficiency\nMonitor liver function'
                }
                rows={5}
                disabled={loading}
              />
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-light)',
                  marginTop: 4,
                  display: 'block',
                }}
              >
                One entry per line
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 — Image */}
        <div className="med-form-card">
          <div className="med-form-section-title">Reference image</div>
          <div className="med-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            <div className="med-upload-icon">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="24"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                <path
                  d="M2 18l7-5 4 3 4-4 9 6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="med-upload-label">Drop an image here or click to browse</p>
            <p className="med-upload-hint">PNG, JPG, WebP — max 5 MB</p>
          </div>
          {imagePreview && (
            <div className="med-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="med-image-preview-remove"
                onClick={() => {
                  setImagePreview(undefined)
                  setImageFile(undefined)
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Card 4 — Link diseases */}
        {allDiseases.length > 0 && (
          <div className="med-form-card">
            <div className="med-form-section-title">
              Link to diseases
              {diseaseIds.length > 0 && (
                <span className="med-link-count">{diseaseIds.length} selected</span>
              )}
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                marginBottom: 14,
              }}
            >
              Associate this medicine with diseases it is used to treat.
            </p>

            <div className="med-disease-search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                <path
                  d="M10 10l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                className="med-disease-search"
                placeholder="Filter diseases…"
                value={diseaseSearch}
                onChange={(e) => setDiseaseSearch(e.target.value)}
              />
            </div>

            <div className="med-disease-grid">
              {filteredDiseases.map((d) => {
                const checked = diseaseIds.includes(d.id)
                return (
                  <label
                    key={d.id}
                    className={`med-disease-option${checked ? ' checked' : ''}`}
                    onClick={() => toggleDisease(d.id)}
                  >
                    <span className="med-checkmark">
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
                    <span className="med-disease-option-name">{d.name}</span>
                    <span
                      className={`sev-badge sev-${d.severity.toLowerCase()}`}
                      style={{ fontSize: 10, padding: '2px 7px' }}
                    >
                      {d.severity}
                    </span>
                  </label>
                )
              })}
              {filteredDiseases.length === 0 && (
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-light)',
                    fontStyle: 'italic',
                    gridColumn: '1/-1',
                    padding: '8px 0',
                  }}
                >
                  No diseases match your search.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="med-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: 'auto', flex: 1 }}
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading
              ? 'Saving…'
              : isEditing
              ? 'Save changes'
              : 'Create medicine record'}
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