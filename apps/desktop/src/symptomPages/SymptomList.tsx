import type { Symptom } from './symptomAPI'

interface SymptomListProps {
  symptoms: Symptom[]
  loading: boolean
  onViewDetail: (symptom: Symptom) => void
  onEdit: (symptom: Symptom) => void
  onDelete: (id: string) => void
}

const COMMONALITY_CONFIG = {
  RARE: { label: 'Rare', class: 'sym-rare' },
  COMMON: { label: 'Common', class: 'sym-common' },
  VERY_COMMON: { label: 'Very Common', class: 'sym-very-common' },
}

const ONSET_CONFIG = {
  ACUTE: { label: 'Acute', icon: '⚡' },
  SUBACUTE: { label: 'Subacute', icon: '〜' },
  CHRONIC: { label: 'Chronic', icon: '◎' },
}

function CommonalityBadge({ c }: { c: keyof typeof COMMONALITY_CONFIG }) {
  const cfg = COMMONALITY_CONFIG[c]
  return <span className={`sym-badge ${cfg.class}`}>{cfg.label}</span>
}

export default function SymptomList({
  symptoms, loading, onViewDetail, onEdit, onDelete,
}: SymptomListProps) {
  if (loading && symptoms.length === 0) {
    return (
      <div className="sym-loading">
        <span className="spinner spinner-dark" />
        Loading symptom records…
      </div>
    )
  }

  if (symptoms.length === 0) {
    return (
      <div className="sym-empty">
        <div className="sym-empty-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M16 11v6M16 20.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p>No symptoms found. Adjust your filters or create the first record.</p>
      </div>
    )
  }

  return (
    <div className="sym-grid">
      {symptoms.map((symptom, i) => {
        const linkedDiseases = symptom.diseaseSymptoms || []
        const visibleDiseases = linkedDiseases.slice(0, 3)
        const extra = linkedDiseases.length - 3
        const onset = ONSET_CONFIG[symptom.onsetSpeed]

        return (
          <div
            key={symptom.id}
            className="sym-card"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="sym-card-header">
              <div className="sym-card-header-top">
                <span className="sym-card-name">{symptom.name}</span>
                <CommonalityBadge c={symptom.commonality} />
              </div>
              <div className="sym-card-meta-row">
                {symptom.affectedBodyArea && (
                  <span className="sym-card-area">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M1 11c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {symptom.affectedBodyArea}
                  </span>
                )}
                <span className="sym-card-onset">
                  <span className="sym-onset-icon">{onset.icon}</span>
                  {onset.label}
                </span>
              </div>
            </div>

            <div className="sym-card-body">
              <p className="sym-card-desc">{symptom.description}</p>

              {linkedDiseases.length > 0 && (
                <div className="sym-card-diseases">
                  <span className="sym-card-diseases-label">Linked diseases</span>
                  <div className="sym-chips">
                    {visibleDiseases.map((ds) => (
                      <span key={ds.id} className="sym-chip">{ds.disease.name}</span>
                    ))}
                    {extra > 0 && (
                      <span className="sym-chip-more">+{extra} more</span>
                    )}
                  </div>
                </div>
              )}

              {linkedDiseases.length === 0 && (
                <div className="sym-no-links">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 7.5l3-3M3 5.5A2.5 2.5 0 107.5 10L9 8.5M9 6.5a2.5 2.5 0 00-4.5-1.5l-.5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Not linked to any disease
                </div>
              )}
            </div>

            <div className="sym-card-footer">
              <button
                className="btn btn-ghost"
                style={{ fontSize: 13 }}
                onClick={() => onViewDetail(symptom)}
              >
                View details
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }}
                onClick={() => onEdit(symptom)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                style={{ fontSize: 13, flex: 'none', padding: '8px 12px' }}
                onClick={() => onDelete(symptom.id)}
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