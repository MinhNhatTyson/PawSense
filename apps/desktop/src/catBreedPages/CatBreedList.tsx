import type { CatBreed } from './catBreedAPI'

interface CatBreedListProps {
  breeds: CatBreed[]
  loading: boolean
  onViewDetail: (breed: CatBreed) => void
  onEdit: (breed: CatBreed) => void
  onDelete: (id: string) => void
}

function ImagePlaceholder() {
  return (
    <div className="cb-card-image-placeholder">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* Cat silhouette */}
        <ellipse cx="24" cy="32" rx="14" ry="10" fill="currentColor" opacity=".18"/>
        <circle cx="24" cy="20" r="8" fill="currentColor" opacity=".18"/>
        {/* Ears */}
        <polygon points="16,14 13,6 20,12" fill="currentColor" opacity=".22"/>
        <polygon points="32,14 35,6 28,12" fill="currentColor" opacity=".22"/>
        {/* Eyes */}
        <ellipse cx="21" cy="19" rx="1.5" ry="1.8" fill="currentColor" opacity=".5"/>
        <ellipse cx="27" cy="19" rx="1.5" ry="1.8" fill="currentColor" opacity=".5"/>
        {/* Whiskers */}
        <line x1="10" y1="22" x2="19" y2="22" stroke="currentColor" strokeWidth="0.8" opacity=".3"/>
        <line x1="10" y1="24" x2="19" y2="24" stroke="currentColor" strokeWidth="0.8" opacity=".3"/>
        <line x1="29" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="0.8" opacity=".3"/>
        <line x1="29" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="0.8" opacity=".3"/>
      </svg>
    </div>
  )
}

export default function CatBreedList({
  breeds, loading, onViewDetail, onEdit, onDelete,
}: CatBreedListProps) {
  if (loading && breeds.length === 0) {
    return (
      <div className="cb-loading">
        <span className="spinner spinner-dark" />
        Loading cat breed records…
      </div>
    )
  }

  if (breeds.length === 0) {
    return (
      <div className="cb-empty">
        <div className="cb-empty-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="14" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <polygon points="10,10 8,4 14,9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
            <polygon points="22,10 24,4 18,9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
            <path d="M6 28c0-5.523 4.477-8 10-8s10 2.477 10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p>No cat breeds found. Add the first breed to the knowledge base.</p>
      </div>
    )
  }

  return (
    <div className="cb-grid">
      {breeds.map((breed, i) => {
        const visibleTraits = breed.temperament.slice(0, 3)
        const extraTraits = breed.temperament.length - 3
        const primaryImage = breed.imageUrls[0]

        return (
          <div
            key={breed.id}
            className="cb-card"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {primaryImage
              ? (
                <div className="cb-card-image-wrap">
                  <img src={primaryImage} alt={breed.name} className="cb-card-image" />
                  {breed.imageUrls.length > 1 && (
                    <span className="cb-card-image-count">
                      +{breed.imageUrls.length - 1}
                    </span>
                  )}
                </div>
              )
              : <ImagePlaceholder />
            }

            <div className="cb-card-body">
              <div className="cb-card-top">
                <span className="cb-card-name">{breed.name}</span>
                <span className="cb-card-origin">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M6 1a4 4 0 014 4c0 3-4 7-4 7S2 8 2 5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  {breed.origin}
                </span>
              </div>

              <p className="cb-card-desc">{breed.description}</p>

              <div className="cb-card-stats">
                <div className="cb-card-stat">
                  <span className="cb-card-stat-label">Weight</span>
                  <span className="cb-card-stat-value">{breed.weightRange}</span>
                </div>
                <div className="cb-card-stat-divider" />
                <div className="cb-card-stat">
                  <span className="cb-card-stat-label">Lifespan</span>
                  <span className="cb-card-stat-value">{breed.lifespan}</span>
                </div>
              </div>

              {visibleTraits.length > 0 && (
                <div className="cb-card-traits">
                  {visibleTraits.map((trait, idx) => (
                    <span key={idx} className="cb-trait-chip">{trait}</span>
                  ))}
                  {extraTraits > 0 && (
                    <span className="cb-trait-chip-more">+{extraTraits}</span>
                  )}
                </div>
              )}
            </div>

            <div className="cb-card-footer">
              <button
                className="btn btn-ghost"
                style={{ fontSize: 13 }}
                onClick={() => onViewDetail(breed)}
              >
                View details
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }}
                onClick={() => onEdit(breed)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }}
                onClick={() => onDelete(breed.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}