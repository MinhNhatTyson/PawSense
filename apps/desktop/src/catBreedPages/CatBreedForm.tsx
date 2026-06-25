import { useState, useRef } from 'react'
import type { CatBreed } from './catBreedAPI'

interface CatBreedFormProps {
  breed?: CatBreed
  onSubmit: (
    data: {
      name: string
      origin: string
      description: string
      physicalAppearance: string
      weightRange: string
      lifespan: string
      temperament: string[]
      personality: string
      existingImageUrls?: string[]
    },
    imageFiles?: File[]
  ) => void
  loading: boolean
  onCancel: () => void
}

const TEMPERAMENT_PRESETS = [
  'Affectionate', 'Gentle', 'Playful', 'Curious', 'Independent',
  'Loyal', 'Social', 'Calm', 'Energetic', 'Intelligent',
  'Vocal', 'Quiet', 'Adaptable', 'Shy', 'Bold',
  'Kid-friendly', 'Dog-friendly', 'Lap cat', 'Active', 'Docile',
]

export default function CatBreedForm({ breed, onSubmit, loading, onCancel }: CatBreedFormProps) {
  const [name, setName] = useState(breed?.name || '')
  const [origin, setOrigin] = useState(breed?.origin || '')
  const [description, setDescription] = useState(breed?.description || '')
  const [physicalAppearance, setPhysicalAppearance] = useState(breed?.physicalAppearance || '')
  const [weightRange, setWeightRange] = useState(breed?.weightRange || '')
  const [lifespan, setLifespan] = useState(breed?.lifespan || '')
  const [temperament, setTemperament] = useState<string[]>(breed?.temperament || [])
  const [customTrait, setCustomTrait] = useState('')
  const [personality, setPersonality] = useState(breed?.personality || '')

  // Image management
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(breed?.imageUrls || [])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!breed

  // ── Temperament ───────────────────────────────────────────────────────────
  const toggleTrait = (trait: string) => {
    setTemperament(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    )
  }

  const addCustomTrait = () => {
    const trimmed = customTrait.trim()
    if (!trimmed || temperament.includes(trimmed)) return
    setTemperament(prev => [...prev, trimmed])
    setCustomTrait('')
  }

  const removeTrait = (trait: string) => {
    setTemperament(prev => prev.filter(t => t !== trait))
  }

  // ── Images ────────────────────────────────────────────────────────────────
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const totalImages = existingImageUrls.length + newImageFiles.length + files.length
    if (totalImages > 10) {
      alert('Maximum 10 images allowed.')
      return
    }
    setNewImageFiles(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    // Reset input so same file can be re-added after removal
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeExistingImage = (url: string) => {
    setExistingImageUrls(prev => prev.filter(u => u !== url))
  }

  const removeNewImage = (idx: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(
      {
        name,
        origin,
        description,
        physicalAppearance,
        weightRange,
        lifespan,
        temperament,
        personality,
        existingImageUrls: isEditing ? existingImageUrls : undefined,
      },
      newImageFiles.length > 0 ? newImageFiles : undefined
    )
  }

  const totalImageCount = existingImageUrls.length + newImageFiles.length

  return (
    <div className="cb-form-shell">
      <div className="cb-form-header">
        <h2 className="cb-form-title">
          {isEditing ? `Edit: ${breed.name}` : 'New Cat Breed'}
        </h2>
        <p className="cb-form-subtitle">
          {isEditing
            ? 'Update the information for this cat breed'
            : 'Add a new cat breed to the knowledge base'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Card 1: Core info ── */}
        <div className="cb-form-card">
          <div className="cb-form-section-title">Basic information</div>

          <div className="cb-form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="cb-name">Breed name *</label>
              <input
                id="cb-name"
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Maine Coon, Siamese, Persian"
                required
                disabled={loading}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cb-origin">Origin *</label>
              <input
                id="cb-origin"
                type="text"
                className="form-input"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="e.g. United States, Thailand, Iran"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="cb-desc">Description *</label>
            <textarea
              id="cb-desc"
              className="cb-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a general overview of this breed — history, distinguishing traits, and what makes it unique…"
              rows={4}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* ── Card 2: Physical & Vital stats ── */}
        <div className="cb-form-card">
          <div className="cb-form-section-title">Physical characteristics</div>

          <div className="form-field">
            <label className="form-label" htmlFor="cb-appearance">Physical appearance *</label>
            <textarea
              id="cb-appearance"
              className="cb-textarea"
              value={physicalAppearance}
              onChange={e => setPhysicalAppearance(e.target.value)}
              placeholder="Describe coat type and length, body structure, eye colour, distinguishing physical features…"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="cb-form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="cb-weight">Weight range *</label>
              <input
                id="cb-weight"
                type="text"
                className="form-input"
                value={weightRange}
                onChange={e => setWeightRange(e.target.value)}
                placeholder="e.g. 4–8 kg, 8–18 lbs"
                required
                disabled={loading}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="cb-lifespan">Lifespan *</label>
              <input
                id="cb-lifespan"
                type="text"
                className="form-input"
                value={lifespan}
                onChange={e => setLifespan(e.target.value)}
                placeholder="e.g. 12–15 years"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* ── Card 3: Temperament ── */}
        <div className="cb-form-card">
          <div className="cb-form-section-title">
            Temperament
            {temperament.length > 0 && (
              <span className="cb-link-count">{temperament.length} selected</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Select from common traits or add your own.
          </p>

          {/* Preset grid */}
          <div className="cb-trait-preset-grid">
            {TEMPERAMENT_PRESETS.map(trait => {
              const selected = temperament.includes(trait)
              return (
                <button
                  key={trait}
                  type="button"
                  className={`cb-trait-preset-btn${selected ? ' selected' : ''}`}
                  onClick={() => toggleTrait(trait)}
                  disabled={loading}
                >
                  {selected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {trait}
                </button>
              )
            })}
          </div>

          {/* Custom trait input */}
          <div className="cb-custom-trait-row">
            <input
              type="text"
              className="form-input"
              value={customTrait}
              onChange={e => setCustomTrait(e.target.value)}
              placeholder="Add a custom trait…"
              disabled={loading}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTrait() } }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '11px 18px', flexShrink: 0 }}
              onClick={addCustomTrait}
              disabled={loading || !customTrait.trim()}
            >
              Add
            </button>
          </div>

          {/* Selected traits display */}
          {temperament.length > 0 && (
            <div className="cb-selected-traits">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 8 }}>
                Selected traits
              </div>
              <div className="cb-trait-chips-editable">
                {temperament.map(trait => (
                  <span key={trait} className="cb-trait-chip-edit">
                    {trait}
                    <button
                      type="button"
                      onClick={() => removeTrait(trait)}
                      disabled={loading}
                      className="cb-trait-remove"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Card 4: Personality ── */}
        <div className="cb-form-card">
          <div className="cb-form-section-title">Personality</div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="cb-personality">Personality description *</label>
            <textarea
              id="cb-personality"
              className="cb-textarea"
              value={personality}
              onChange={e => setPersonality(e.target.value)}
              placeholder="Describe this breed's general personality, how it interacts with people, children, other pets, and its typical behaviour at home…"
              rows={4}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* ── Card 5: Images ── */}
        <div className="cb-form-card">
          <div className="cb-form-section-title">
            Breed images
            <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 400, letterSpacing: 0, textTransform: 'none', marginLeft: 8 }}>
              {totalImageCount}/10
            </span>
          </div>

          {/* Image grid preview */}
          {(existingImageUrls.length > 0 || newImagePreviews.length > 0) && (
            <div className="cb-image-grid">
              {existingImageUrls.map((url, idx) => (
                <div key={`existing-${idx}`} className="cb-image-thumb">
                  <img src={url} alt={`Breed image ${idx + 1}`} />
                  <button
                    type="button"
                    className="cb-image-thumb-remove"
                    onClick={() => removeExistingImage(url)}
                    disabled={loading}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  {idx === 0 && <span className="cb-image-thumb-badge">Primary</span>}
                </div>
              ))}
              {newImagePreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="cb-image-thumb cb-image-thumb-new">
                  <img src={src} alt={`New image ${idx + 1}`} />
                  <button
                    type="button"
                    className="cb-image-thumb-remove"
                    onClick={() => removeNewImage(idx)}
                    disabled={loading}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <span className="cb-image-thumb-badge cb-image-thumb-badge-new">New</span>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          {totalImageCount < 10 && (
            <div
              className="cb-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAdd}
                disabled={loading}
                style={{ display: 'none' }}
              />
              <div className="cb-upload-icon">
                <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="4" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 18l7-5 4 3 4-4 9 6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="cb-upload-label">
                {totalImageCount === 0 ? 'Add breed images' : 'Add more images'}
              </p>
              <p className="cb-upload-hint">PNG, JPG, WebP · Max 5 MB each · Up to {10 - totalImageCount} more</p>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="cb-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: 'auto', flex: 1 }}
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add breed'}
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