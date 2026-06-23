import type { Medicine } from './medicineAPI'

interface MedicineListProps {
  medicines: Medicine[]
  loading: boolean
  onViewDetail: (medicine: Medicine) => void
  onEdit: (medicine: Medicine) => void
  onDelete: (id: string) => void
}

function ImagePlaceholder() {
  return (
    <div className="med-card-image-placeholder">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" opacity=".5"/>
        <path d="M12 22l5-4 4 3 5-6 7 7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" opacity=".4"/>
        <circle cx="14" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.3" opacity=".5"/>
        <path d="M14 32h12M20 30v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
      </svg>
    </div>
  )
}

export default function MedicineList({
  medicines, loading, onViewDetail, onEdit, onDelete,
}: MedicineListProps) {
  if (loading && medicines.length === 0) {
    return (
      <div className="med-loading">
        <span className="spinner spinner-dark" />
        Loading medicine records…
      </div>
    )
  }

  if (medicines.length === 0) {
    return (
      <div className="med-empty">
        <div className="med-empty-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 14h8M14 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p>No medicines found. Create the first medicine record.</p>
      </div>
    )
  }

  return (
    <div className="med-grid">
      {medicines.map((medicine, i) => {
        const linkedDiseases = medicine.diseaseMedicines || []
        const visibleDiseases = linkedDiseases.slice(0, 3)
        const extra = linkedDiseases.length - 3
        const visibleSideEffects = medicine.sideEffects?.slice(0, 2) || []

        return (
          <div
            key={medicine.id}
            className="med-card"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {medicine.imageUrl
              ? <img src={medicine.imageUrl} alt={medicine.name} className="med-card-image" />
              : <ImagePlaceholder />
            }

            <div className="med-card-body">
              <div className="med-card-top">
                <span className="med-card-name">{medicine.name}</span>
                {medicine.manufacturer && (
                  <span className="med-card-manufacturer">{medicine.manufacturer}</span>
                )}
              </div>

              <p className="med-card-desc">{medicine.description}</p>

              <div className="med-card-meta">
                <div className="med-card-meta-row">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="med-dosage-badge">{medicine.dosage}</span>
                </div>

                {visibleSideEffects.length > 0 && (
                  <div className="med-card-meta-row">
                    <span className="med-card-meta-label">Side effects</span>
                    <div className="med-chips">
                      {visibleSideEffects.map((effect, idx) => (
                        <span key={idx} className="med-chip">{effect}</span>
                      ))}
                      {(medicine.sideEffects?.length || 0) > 2 && (
                        <span className="med-chip-more">+{(medicine.sideEffects?.length || 0) - 2} more</span>
                      )}
                    </div>
                  </div>
                )}

                {linkedDiseases.length > 0 && (
                  <div className="med-card-meta-row">
                    <span className="med-card-meta-label">Linked diseases</span>
                    <div className="med-chips">
                      {visibleDiseases.map((dm) => (
                        <span key={dm.id} className="med-chip">{dm.disease.name}</span>
                      ))}
                      {extra > 0 && (
                        <span className="med-chip-more">+{extra} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="med-card-footer">
              <button
                className="btn btn-ghost"
                style={{ fontSize: 13 }}
                onClick={() => onViewDetail(medicine)}
              >
                View details
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }}
                onClick={() => onEdit(medicine)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }}
                onClick={() => onDelete(medicine.id)}
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