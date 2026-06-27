import type { CatFood, FoodCategory, FoodType } from './catFoodAPI'

interface CatFoodListProps {
  foods: CatFood[]
  loading: boolean
  onViewDetail: (food: CatFood) => void
  onEdit: (food: CatFood) => void
  onDelete: (id: string) => void
}

export const CATEGORY_CONFIG: Record<FoodCategory, { label: string; cls: string }> = {
  KITTEN:       { label: 'Kitten',       cls: 'cf-cat-kitten' },
  ADULT:        { label: 'Adult',        cls: 'cf-cat-adult' },
  SENIOR:       { label: 'Senior',       cls: 'cf-cat-senior' },
  PRESCRIPTION: { label: 'Prescription', cls: 'cf-cat-prescription' },
}

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  DRY:        'Dry',
  WET:        'Wet',
  SEMI_MOIST: 'Semi-Moist',
  RAW:        'Raw',
  SUPPLEMENT: 'Supplement',
}

function NutrBit({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  if (value === null) return null
  return (
    <div className="cf-nutr-item">
      <span className="cf-nutr-label">{label}</span>
      <span className="cf-nutr-value">{value}{unit}</span>
    </div>
  )
}

function ImagePlaceholder() {
  return (
    <div className="cf-card-image-placeholder">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5" opacity=".4"/>
        <path d="M6 30l10-8 8 6 8-10 10 12" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity=".35"/>
        <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="1.3" opacity=".4"/>
        <path d="M20 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".3"/>
      </svg>
    </div>
  )
}

export default function CatFoodList({ foods, loading, onViewDetail, onEdit, onDelete }: CatFoodListProps) {
  if (loading && foods.length === 0) {
    return (
      <div className="cf-loading">
        <span className="spinner spinner-dark" />
        Loading cat food records…
      </div>
    )
  }

  if (foods.length === 0) {
    return (
      <div className="cf-empty">
        <div className="cf-empty-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="6" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 14h10M14 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p>No cat food products found. Add the first one to the knowledge base.</p>
      </div>
    )
  }

  return (
    <div className="cf-grid">
      {foods.map((food, i) => {
        const cat = CATEGORY_CONFIG[food.category]
        const hasNutrition = food.protein !== null || food.fat !== null || food.fiber !== null || food.calories !== null

        return (
          <div key={food.id} className="cf-card" style={{ animationDelay: `${i * 0.05}s` }}>
            {food.imageUrl
              ? <img src={food.imageUrl} alt={food.name} className="cf-card-image" />
              : <ImagePlaceholder />
            }

            <div className="cf-card-body">
              <div className="cf-card-top">
                <span className="cf-card-name">{food.name}</span>
                <span className="cf-card-brand">{food.brand}</span>
              </div>

              <div className="cf-badge-row">
                <span className={`cf-cat-badge ${cat.cls}`}>{cat.label}</span>
                <span className="cf-type-badge">{FOOD_TYPE_LABELS[food.foodType]}</span>
                {food.prescriptionRequired && (
                  <span className="cf-rx-badge">
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2h4a2 2 0 010 4H2V2zM5 6l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Rx
                  </span>
                )}
              </div>

              <p className="cf-card-desc">{food.description}</p>

              {hasNutrition && (
                <div className="cf-card-nutrition">
                  <NutrBit label="Protein" value={food.protein} unit="%" />
                  <NutrBit label="Fat" value={food.fat} unit="%" />
                  <NutrBit label="Fiber" value={food.fiber} unit="%" />
                  <NutrBit label="kcal" value={food.calories} unit="" />
                </div>
              )}
            </div>

            <div className="cf-card-footer">
              <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => onViewDetail(food)}>
                View details
              </button>
              <button className="btn btn-secondary" style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }} onClick={() => onEdit(food)}>
                Edit
              </button>
              <button className="btn btn-danger" style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }} onClick={() => onDelete(food.id)}>
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}