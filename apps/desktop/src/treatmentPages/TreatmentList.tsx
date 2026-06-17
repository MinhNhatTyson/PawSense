import type { Treatment } from './treatmentAPI'

interface TreatmentListProps {
  treatments: Treatment[]
  loading: boolean
  onViewDetail: (t: Treatment) => void
  onEdit: (t: Treatment) => void
  onDelete: (id: string) => void
}

function StepCountBadge({ count }: { count: number }) {
  return (
    <span className="tr-step-count">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      {count} step{count !== 1 ? 's' : ''}
    </span>
  )
}

function ImagePlaceholder() {
  return (
    <div className="tr-card-image-placeholder">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M6 24l8-6 5 4 5-7 8 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity=".4"/>
        <rect x="2" y="4" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" opacity=".3"/>
        <circle cx="11" cy="13" r="3" stroke="currentColor" strokeWidth="1.3" opacity=".4"/>
      </svg>
    </div>
  )
}

export default function TreatmentList({
  treatments, loading, onViewDetail, onEdit, onDelete,
}: TreatmentListProps) {
  if (loading && treatments.length === 0) {
    return (
      <div className="tr-loading">
        <span className="spinner spinner-dark" />
        Loading treatment records…
      </div>
    )
  }

  if (treatments.length === 0) {
    return (
      <div className="tr-empty">
        <div className="tr-empty-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4v10M14 18h.01M9 4H5a1 1 0 00-1 1v18a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="8" y="2" width="12" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <p>No treatments found. Create the first treatment protocol.</p>
      </div>
    )
  }

  return (
    <div className="tr-grid">
      {treatments.map((t, i) => {
        const linkedDiseases = t.diseaseTreatments || []
        const visibleDiseases = linkedDiseases.slice(0, 3)
        const extraDiseases = linkedDiseases.length - 3

        return (
          <div key={t.id} className="tr-card" style={{ animationDelay: `${i * 0.05}s` }}>
            {t.imageUrl
              ? <img src={t.imageUrl} alt={t.name} className="tr-card-image" />
              : <ImagePlaceholder />
            }

            <div className="tr-card-body">
              <div className="tr-card-top">
                <span className="tr-card-name">{t.name}</span>
                <StepCountBadge count={t.steps.length} />
              </div>

              <p className="tr-card-desc">{t.description}</p>

              <div className="tr-card-meta">
                {t.estimatedDuration && (
                  <div className="tr-card-meta-row">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M6 3v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className="tr-card-meta-value">{t.estimatedDuration}</span>
                  </div>
                )}
                {t.successRate !== undefined && t.successRate !== null && (
                  <div className="tr-card-meta-row">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 8l3-3 2 2 4-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="tr-card-meta-value">{t.successRate}% success</span>
                  </div>
                )}
                {linkedDiseases.length > 0 && (
                  <div className="tr-card-diseases">
                    <span className="tr-card-meta-label">Linked diseases</span>
                    <div className="tr-chips">
                      {visibleDiseases.map((dt) => (
                        <span key={dt.id} className="tr-chip">{dt.disease.name}</span>
                      ))}
                      {extraDiseases > 0 && (
                        <span className="tr-chip-more">+{extraDiseases} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="tr-card-footer">
              <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => onViewDetail(t)}>
                View details
              </button>
              <button className="btn btn-secondary" style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }} onClick={() => onEdit(t)}>
                Edit
              </button>
              <button className="btn btn-danger" style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }} onClick={() => onDelete(t.id)}>
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}