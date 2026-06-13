import type { Disease } from './diseaseAPI'

interface DiseaseListProps {
  diseases: Disease[]
  loading: boolean
  onViewDetail: (disease: Disease) => void
  onEdit: (disease: Disease) => void
  onDelete: (id: string) => void
}

function SevBadge({ sev }: { sev: string }) {
  const cls = sev.toLowerCase()
  return <span className={`sev-badge sev-${cls}`}>{sev}</span>
}

function ImagePlaceholder() {
  return (
    <div className="dm-card-image-placeholder">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <ellipse cx="20" cy="26" rx="11" ry="10" fill="currentColor" opacity=".35"/>
        <circle cx="12" cy="16" r="4.5" fill="currentColor" opacity=".35"/>
        <circle cx="19" cy="12" r="3.8" fill="currentColor" opacity=".35"/>
        <circle cx="27" cy="12.5" r="3.8" fill="currentColor" opacity=".35"/>
        <circle cx="33" cy="17.5" r="4" fill="currentColor" opacity=".35"/>
      </svg>
    </div>
  )
}

export default function DiseaseList({
  diseases, loading, onViewDetail, onEdit, onDelete,
}: DiseaseListProps) {
  if (loading && diseases.length === 0) {
    return (
      <div className="dm-loading">
        <span className="spinner spinner-dark" />
        Loading disease records…
      </div>
    )
  }

  if (diseases.length === 0) {
    return (
      <div className="dm-empty">
        <div className="dm-empty-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M14 9v5.5M14 17.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p>No diseases found. Try adjusting your filters or create the first record.</p>
      </div>
    )
  }

  return (
    <div className="dm-grid">
      {diseases.map((disease, i) => {
        const visibleSymptoms = disease.symptoms.slice(0, 3)
        const extra = disease.symptoms.length - 3
        return (
          <div
            key={disease.id}
            className="dm-card"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {disease.imageUrl
              ? <img src={disease.imageUrl} alt={disease.name} className="dm-card-image" />
              : <ImagePlaceholder />
            }

            <div className="dm-card-body">
              <div className="dm-card-top">
                <span className="dm-card-name">{disease.name}</span>
                <SevBadge sev={disease.severity} />
              </div>

              <p className="dm-card-desc">{disease.description}</p>

              {visibleSymptoms.length > 0 && (
                <div className="dm-card-meta">
                  <div className="dm-card-meta-row">
                    <span className="dm-card-meta-label">Symptoms</span>
                    <div className="dm-chips">
                      {visibleSymptoms.map((s, idx) => (
                        <span key={idx} className="dm-chip">{s}</span>
                      ))}
                      {extra > 0 && <span className="dm-chip-more">+{extra} more</span>}
                    </div>
                  </div>
                  {disease.recoveryPeriod && (
                    <div className="dm-card-meta-row">
                      <span className="dm-card-meta-label">Recovery</span>
                      <span className="dm-card-meta-value">{disease.recoveryPeriod}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="dm-card-footer">
              <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => onViewDetail(disease)}>
                View details
              </button>
              <button className="btn btn-secondary" style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }} onClick={() => onEdit(disease)}>
                Edit
              </button>
              <button
                className="btn btn-danger"
                style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }}
                onClick={() => onDelete(disease.id)}
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