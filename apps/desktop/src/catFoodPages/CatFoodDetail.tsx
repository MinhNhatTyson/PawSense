import type { CatFood } from './catFoodAPI'
import { CATEGORY_CONFIG, FOOD_TYPE_LABELS } from './CatFoodList'

interface Props {
  food: CatFood
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

function Section({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`cf-section${full ? ' cf-section-full' : ''}`}>
      <div className="cf-section-title">{title}</div>
      <div className="cf-section-body">{children}</div>
    </div>
  )
}

function formatAge(minMonths: number | null, maxMonths: number | null): string {
  const fmt = (m: number) => m < 12 ? `${m}mo` : `${(m / 12).toFixed(1).replace('.0', '')}yr`
  if (minMonths === null && maxMonths === null) return 'All ages'
  if (minMonths !== null && maxMonths === null) return `${fmt(minMonths)}+`
  if (minMonths === null && maxMonths !== null) return `Up to ${fmt(maxMonths)}`
  return `${fmt(minMonths!)} – ${fmt(maxMonths!)}`
}

export default function CatFoodDetail({ food, onEdit, onDelete, onBack }: Props) {
  const cat = CATEGORY_CONFIG[food.category]
  const linkedDiseases = food.diseaseFoods || []
  const hasNutrition = [food.protein, food.fat, food.fiber, food.moisture, food.calories].some(v => v !== null)

  return (
    <div className="cf-detail">
      {/* Hero */}
      <div className="cf-detail-hero">
        {food.imageUrl && <img src={food.imageUrl} alt={food.name} className="cf-detail-hero-img" />}
        <div className="cf-detail-hero-content">
          <h1 className="cf-detail-hero-name">{food.name}</h1>
          <div className="cf-detail-hero-meta">
            <span className="cf-detail-hero-badge">{food.brand}</span>
            <span className={`cf-cat-badge ${cat.cls}`} style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {cat.label}
            </span>
            <span className="cf-detail-hero-badge">{FOOD_TYPE_LABELS[food.foodType]}</span>
            {food.prescriptionRequired && (
              <span className="cf-detail-hero-badge" style={{ background: 'rgba(192,57,43,0.25)', borderColor: 'rgba(192,57,43,0.4)' }}>
                Prescription Required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="cf-detail-actions-bar">
        <button className="btn btn-ghost" style={{ width: 'auto', padding: '9px 14px' }} onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to list
        </button>
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '9px 20px' }} onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
          Edit record
        </button>
        <button className="btn btn-danger" style={{ width: 'auto', padding: '9px 20px' }} onClick={onDelete}>
          Delete
        </button>
      </div>

      {/* Content grid */}
      <div className="cf-detail-grid">
        <Section title="Description" full>
          <p>{food.description}</p>
        </Section>

        {/* Nutrition */}
        {hasNutrition && (
          <Section title="Nutritional information" full>
            <div className="cf-nutrition-grid">
              {food.protein !== null && (
                <div className="cf-nutrition-item">
                  <span className="cf-nutrition-value">{food.protein}</span>
                  <span className="cf-nutrition-unit">%</span>
                  <span className="cf-nutrition-label">Protein</span>
                </div>
              )}
              {food.fat !== null && (
                <div className="cf-nutrition-item">
                  <span className="cf-nutrition-value">{food.fat}</span>
                  <span className="cf-nutrition-unit">%</span>
                  <span className="cf-nutrition-label">Fat</span>
                </div>
              )}
              {food.fiber !== null && (
                <div className="cf-nutrition-item">
                  <span className="cf-nutrition-value">{food.fiber}</span>
                  <span className="cf-nutrition-unit">%</span>
                  <span className="cf-nutrition-label">Fiber</span>
                </div>
              )}
              {food.moisture !== null && (
                <div className="cf-nutrition-item">
                  <span className="cf-nutrition-value">{food.moisture}</span>
                  <span className="cf-nutrition-unit">%</span>
                  <span className="cf-nutrition-label">Moisture</span>
                </div>
              )}
              {food.calories !== null && (
                <div className="cf-nutrition-item">
                  <span className="cf-nutrition-value">{food.calories}</span>
                  <span className="cf-nutrition-unit">kcal/100g</span>
                  <span className="cf-nutrition-label">Calories</span>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Age & Weight */}
        <Section title="Suitability">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="cf-age-row">
              <div className="cf-age-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="cf-age-label">Age range</div>
                <div className="cf-age-value">{formatAge(food.ageMinMonths, food.ageMaxMonths)}</div>
              </div>
            </div>
            {food.weightRange && (
              <div className="cf-age-row">
                <div className="cf-age-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 13V8a4 4 0 018 0v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <rect x="2" y="12" width="12" height="2" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                </div>
                <div>
                  <div className="cf-age-label">Weight range</div>
                  <div className="cf-age-value">{food.weightRange}</div>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Ingredients */}
        <Section title={`Ingredients (${food.ingredients.length})`}>
          {food.ingredients.length === 0
            ? <p className="cf-empty-section">No ingredients listed.</p>
            : (
              <div className="cf-tag-chips">
                {food.ingredients.map((ing, i) => (
                  <span key={i} className="cf-tag-chip">{ing}</span>
                ))}
              </div>
            )
          }
        </Section>

        {/* Allergens */}
        <Section title="Allergens">
          {food.allergens.length === 0
            ? <p className="cf-empty-section">No known allergens listed.</p>
            : (
              <div className="cf-tag-chips">
                {food.allergens.map((a, i) => (
                  <span key={i} className="cf-allergen-chip">{a}</span>
                ))}
              </div>
            )
          }
        </Section>

        {/* Vet notes */}
        {food.vetNotes && (
          <Section title="Veterinarian notes" full>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{food.vetNotes}</p>
          </Section>
        )}

        {/* Linked diseases */}
        <Section title={`Linked diseases (${linkedDiseases.length})`} full>
          {linkedDiseases.length === 0
            ? <p className="cf-empty-section">This food is not linked to any disease yet.</p>
            : (
              <div className="cf-linked-treatments-grid">
                {linkedDiseases.map((df) => (
                  <div key={df.id} className="cf-linked-treatment-card">
                    <span className="cf-linked-treatment-name">{df.disease.name}</span>
                    <span className={`sev-badge sev-${df.disease.severity.toLowerCase()}`}>
                      {df.disease.severity}
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </Section>
      </div>
    </div>
  )
}