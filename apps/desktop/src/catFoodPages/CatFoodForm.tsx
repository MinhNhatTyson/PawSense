import { useState } from 'react'
import type { CatFood, CatFoodInput, FoodCategory, FoodType } from './catFoodAPI'

interface CatFoodFormProps {
  food?: CatFood
  allDiseases: { id: string; name: string; severity: string }[]
  onSubmit: (data: CatFoodInput, imageFile?: File) => void
  loading: boolean
  onCancel: () => void
}

const CATEGORIES: { value: FoodCategory; label: string; icon: string }[] = [
  { value: 'KITTEN',       label: 'Kitten',       icon: '🐱' },
  { value: 'ADULT',        label: 'Adult',        icon: '🐈' },
  { value: 'SENIOR',       label: 'Senior',       icon: '🐾' },
  { value: 'PRESCRIPTION', label: 'Prescription', icon: '💊' },
]

const FOOD_TYPES: { value: FoodType; label: string; icon: string }[] = [
  { value: 'DRY',        label: 'Dry',        icon: '🫘' },
  { value: 'WET',        label: 'Wet',        icon: '🥫' },
  { value: 'SEMI_MOIST', label: 'Semi-Moist', icon: '🧃' },
  { value: 'RAW',        label: 'Raw',        icon: '🥩' },
  { value: 'SUPPLEMENT', label: 'Supplement', icon: '💊' },
]

const COMMON_BRANDS = [
  'Royal Canin', 'Hill\'s Science Diet', 'Purina Pro Plan',
  'Orijen', 'Acana', 'Blue Buffalo', 'Wellness', 'Iams',
  'Whiskas', 'Fancy Feast', 'Merrick', 'Taste of the Wild',
  'Natural Balance', 'Nutro', 'Other',
]

const COMMON_ALLERGENS = [
  'Chicken', 'Fish', 'Beef', 'Dairy', 'Wheat', 'Corn',
  'Soy', 'Eggs', 'Lamb', 'Duck', 'Pork', 'Gluten',
]

export default function CatFoodForm({ food, allDiseases, onSubmit, loading, onCancel }: CatFoodFormProps) {
  const [name, setName] = useState(food?.name || '')
  const [brand, setBrand] = useState(food?.brand || '')
  const [customBrand, setCustomBrand] = useState('')
  const [category, setCategory] = useState<FoodCategory>(food?.category || 'ADULT')
  const [foodType, setFoodType] = useState<FoodType>(food?.foodType || 'DRY')
  const [description, setDescription] = useState(food?.description || '')
  const [ingredients, setIngredients] = useState(food?.ingredients.join('\n') || '')
  const [protein, setProtein] = useState(food?.protein !== null ? String(food?.protein ?? '') : '')
  const [fat, setFat] = useState(food?.fat !== null ? String(food?.fat ?? '') : '')
  const [fiber, setFiber] = useState(food?.fiber !== null ? String(food?.fiber ?? '') : '')
  const [moisture, setMoisture] = useState(food?.moisture !== null ? String(food?.moisture ?? '') : '')
  const [calories, setCalories] = useState(food?.calories !== null ? String(food?.calories ?? '') : '')
  const [ageMinMonths, setAgeMinMonths] = useState(food?.ageMinMonths !== null ? String(food?.ageMinMonths ?? '') : '')
  const [ageMaxMonths, setAgeMaxMonths] = useState(food?.ageMaxMonths !== null ? String(food?.ageMaxMonths ?? '') : '')
  const [weightRange, setWeightRange] = useState(food?.weightRange || '')
  const [allergens, setAllergens] = useState<string[]>(food?.allergens || [])
  const [prescriptionRequired, setPrescriptionRequired] = useState(food?.prescriptionRequired || false)
  const [vetNotes, setVetNotes] = useState(food?.vetNotes || '')
  const [diseaseIds, setDiseaseIds] = useState<string[]>(
    food?.diseaseFoods?.map(df => df.diseaseId) || []
  )
  const [diseaseSearch, setDiseaseSearch] = useState('')
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>(food?.imageUrl || undefined)

  const isEditing = !!food

  const effectiveBrand = brand === 'Other' ? customBrand : brand

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const toggleAllergen = (a: string) => {
    setAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const toggleDisease = (id: string) => {
    setDiseaseIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filteredDiseases = allDiseases.filter(d =>
    d.name.toLowerCase().includes(diseaseSearch.toLowerCase())
  )

  const parseLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean)
  const parseNum = (s: string) => s.trim() === '' ? undefined : parseFloat(s)
  const parseInt2 = (s: string) => s.trim() === '' ? undefined : parseInt(s)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      brand: effectiveBrand,
      category,
      foodType,
      description,
      ingredients: parseLines(ingredients),
      protein: parseNum(protein),
      fat: parseNum(fat),
      fiber: parseNum(fiber),
      moisture: parseNum(moisture),
      calories: parseNum(calories),
      ageMinMonths: parseInt2(ageMinMonths),
      ageMaxMonths: parseInt2(ageMaxMonths),
      weightRange: weightRange || undefined,
      allergens,
      prescriptionRequired,
      vetNotes: vetNotes || undefined,
      diseaseIds,
    }, imageFile)
  }

  return (
    <div className="cf-form-shell">
      <div className="cf-form-header">
        <h2 className="cf-form-title">
          {isEditing ? `Edit: ${food.name}` : 'New Cat Food Product'}
        </h2>
        <p className="cf-form-subtitle">
          {isEditing
            ? 'Update the details for this cat food product'
            : 'Add a new cat food product to the knowledge base'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Card 1 — Core info */}
        <div className="cf-form-card">
          <div className="cf-form-section-title">Core information</div>

          <div className="cf-form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="cf-name">Product name *</label>
              <input
                id="cf-name"
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Royal Canin Kitten Dry Food 2kg"
                required
                disabled={loading}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cf-brand">Brand *</label>
              <select
                id="cf-brand"
                className="form-input"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                required
                disabled={loading}
                style={{ appearance: 'auto' }}
              >
                <option value="">Select brand…</option>
                {COMMON_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {brand === 'Other' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: 8 }}
                  value={customBrand}
                  onChange={e => setCustomBrand(e.target.value)}
                  placeholder="Enter brand name…"
                  required
                  disabled={loading}
                />
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="cf-desc">Description *</label>
            <textarea
              id="cf-desc"
              className="cf-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a clear description of this product, its purpose and key benefits…"
              rows={3}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Card 2 — Category & Type */}
        <div className="cf-form-card">
          <div className="cf-form-section-title">Category & type</div>

          <div className="form-field">
            <label className="form-label">Life stage *</label>
            <div className="cf-cat-grid">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`cf-option-btn${category === c.value ? ' selected' : ''}`}
                  onClick={() => setCategory(c.value)}
                  disabled={loading}
                >
                  <span className="cf-option-icon">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label">Food type *</label>
            <div className="cf-type-grid">
              {FOOD_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`cf-option-btn${foodType === t.value ? ' selected' : ''}`}
                  onClick={() => setFoodType(t.value)}
                  disabled={loading}
                >
                  <span className="cf-option-icon">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3 — Nutrition */}
        <div className="cf-form-card">
          <div className="cf-form-section-title">Nutritional information</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            All values are optional. Enter percentages as dry matter values where applicable.
          </p>
          <div className="cf-nutrition-inputs">
            {[
              { label: 'Protein', unit: '%', value: protein, set: setProtein },
              { label: 'Fat',     unit: '%', value: fat,     set: setFat },
              { label: 'Fiber',   unit: '%', value: fiber,   set: setFiber },
              { label: 'Moisture',unit: '%', value: moisture,set: setMoisture },
              { label: 'Calories',unit: 'kcal/100g', value: calories, set: setCalories },
            ].map(({ label, unit, value, set }) => (
              <div key={label} className="cf-nutr-input-group">
                <span className="cf-nutr-input-label">{label}</span>
                <div className="cf-nutr-input-unit">
                  <input
                    type="number"
                    min="0"
                    max={unit === '%' ? 100 : undefined}
                    step="0.1"
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder="—"
                    disabled={loading}
                  />
                  <span className="cf-nutr-unit-label">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4 — Suitability */}
        <div className="cf-form-card">
          <div className="cf-form-section-title">Age & weight suitability</div>

          <div className="cf-form-row-3">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="cf-age-min">Min age (months)</label>
              <input
                id="cf-age-min"
                type="number"
                min="0"
                className="form-input"
                value={ageMinMonths}
                onChange={e => setAgeMinMonths(e.target.value)}
                placeholder="e.g. 0"
                disabled={loading}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="cf-age-max">
                Max age (months)
                <span style={{ color: 'var(--text-light)', fontSize: 11, marginLeft: 6 }}>blank = no limit</span>
              </label>
              <input
                id="cf-age-max"
                type="number"
                min="0"
                className="form-input"
                value={ageMaxMonths}
                onChange={e => setAgeMaxMonths(e.target.value)}
                placeholder="e.g. 12"
                disabled={loading}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="cf-weight">Weight range</label>
              <input
                id="cf-weight"
                type="text"
                className="form-input"
                value={weightRange}
                onChange={e => setWeightRange(e.target.value)}
                placeholder="e.g. 2–6 kg"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Card 5 — Ingredients & Allergens */}
        <div className="cf-form-card">
          <div className="cf-form-section-title">Ingredients & allergens</div>

          <div className="form-field">
            <label className="form-label" htmlFor="cf-ingredients">Ingredients</label>
            <textarea
              id="cf-ingredients"
              className="cf-textarea"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              placeholder={'Chicken meal\nBrown rice\nSalmon oil\nDried beet pulp'}
              rows={5}
              disabled={loading}
            />
            <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
              One ingredient per line
            </span>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Known allergens
              {allergens.length > 0 && (
                <span className="cf-link-count" style={{ marginLeft: 8 }}>{allergens.length} selected</span>
              )}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {COMMON_ALLERGENS.map(a => {
                const checked = allergens.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAllergen(a)}
                    disabled={loading}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 100,
                      border: `1.5px solid ${checked ? 'rgba(192,57,43,0.4)' : 'var(--warm-white)'}`,
                      background: checked ? '#fdf0ee' : 'var(--ivory)',
                      color: checked ? 'var(--error)' : 'var(--text-body)',
                      fontSize: 13,
                      fontWeight: checked ? 500 : 400,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {a}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Card 6 — Prescription & Notes */}
        <div className="cf-form-card">
          <div className="cf-form-section-title">Clinical details</div>

          <div
            className={`cf-rx-toggle${prescriptionRequired ? ' active' : ''}`}
            onClick={() => !loading && setPrescriptionRequired(p => !p)}
            style={{ marginBottom: 20 }}
          >
            <div className="cf-rx-toggle-switch">
              <div className="cf-rx-toggle-knob" />
            </div>
            <div className="cf-rx-toggle-text">
              <div className="cf-rx-toggle-title">Prescription required</div>
              <div className="cf-rx-toggle-desc">This food requires a veterinary prescription to dispense</div>
            </div>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="cf-vetnotes">Veterinarian notes</label>
            <textarea
              id="cf-vetnotes"
              className="cf-textarea"
              value={vetNotes}
              onChange={e => setVetNotes(e.target.value)}
              placeholder="Feeding guidelines, contraindications, clinical observations…"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* Card 7 — Image */}
        <div className="cf-form-card">
          <div className="cf-form-section-title">Product image</div>
          <div className="cf-upload-area">
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
            <div className="cf-upload-icon">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="4" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 18l7-5 4 3 4-4 9 6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="cf-upload-label">Drop an image here or click to browse</p>
            <p className="cf-upload-hint">PNG, JPG, WebP — max 5 MB</p>
          </div>
          {imagePreview && (
            <div className="cf-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="cf-image-preview-remove"
                onClick={() => { setImagePreview(undefined); setImageFile(undefined) }}
              >×</button>
            </div>
          )}
        </div>

        {/* Card 8 — Link diseases */}
        {allDiseases.length > 0 && (
          <div className="cf-form-card">
            <div className="cf-form-section-title">
              Link to diseases
              {diseaseIds.length > 0 && (
                <span className="cf-link-count">{diseaseIds.length} selected</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Associate this food with diseases it helps manage (e.g. a renal diet for kidney disease).
            </p>

            <div className="cf-treatment-search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="cf-treatment-search"
                placeholder="Filter diseases…"
                value={diseaseSearch}
                onChange={e => setDiseaseSearch(e.target.value)}
              />
            </div>

            <div className="cf-treatment-grid">
              {filteredDiseases.map(d => {
                const checked = diseaseIds.includes(d.id)
                return (
                  <label
                    key={d.id}
                    className={`cf-treatment-option${checked ? ' checked' : ''}`}
                    onClick={() => toggleDisease(d.id)}
                  >
                    <span className="cf-checkmark">
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="cf-treatment-option-name">{d.name}</span>
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
        <div className="cf-form-actions">
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', flex: 1 }} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Create food record'}
          </button>
          <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}