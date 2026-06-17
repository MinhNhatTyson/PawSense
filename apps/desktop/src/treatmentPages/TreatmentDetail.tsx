import type { Treatment } from './treatmentAPI'

interface Props {
  treatment: Treatment
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

function Section({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`tr-section${full ? ' tr-section-full' : ''}`}>
      <div className="tr-section-title">{title}</div>
      <div className="tr-section-body">{children}</div>
    </div>
  )
}

function BulletList({ items, empty = 'Not documented' }: { items: string[]; empty?: string }) {
  if (!items || items.length === 0) return <p className="tr-empty-section">{empty}</p>
  return (
    <ul className="tr-list">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

export default function TreatmentDetail({ treatment, onEdit, onDelete, onBack }: Props) {
  const linkedDiseases = treatment.diseaseTreatments || []

  return (
    <div className="tr-detail">
      {/* Hero */}
      <div className="tr-detail-hero">
        {treatment.imageUrl && (
          <img src={treatment.imageUrl} alt={treatment.name} className="tr-detail-hero-img" />
        )}
        <div className="tr-detail-hero-content">
          <h1 className="tr-detail-hero-name">{treatment.name}</h1>
          <div className="tr-detail-hero-meta">
            {treatment.steps.length > 0 && (
              <span className="tr-detail-hero-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3.5h10M2 7h8M2 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {treatment.steps.length} procedure step{treatment.steps.length !== 1 ? 's' : ''}
              </span>
            )}
            {treatment.estimatedDuration && (
              <span className="tr-detail-hero-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {treatment.estimatedDuration}
              </span>
            )}
            {treatment.successRate !== undefined && treatment.successRate !== null && (
              <span className="tr-detail-hero-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 9l4-4 2.5 2.5L13 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {treatment.successRate}% success rate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="tr-detail-actions-bar">
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

      {/* Content */}
      <div className="tr-detail-grid">
        <Section title="Description" full>
          <p>{treatment.description}</p>
        </Section>

        {/* Procedure steps */}
        <Section title={`Procedure steps (${treatment.steps.length})`} full>
          {treatment.steps.length === 0 ? (
            <p className="tr-empty-section">No procedure steps defined.</p>
          ) : (
            <div className="tr-steps-list">
              {treatment.steps.map((step) => (
                <div key={step.id} className="tr-step-item">
                  <div className="tr-step-order">{step.stepOrder}</div>
                  <div className="tr-step-content">
                    <div className="tr-step-header">
                      <span className="tr-step-title">{step.title}</span>
                      {step.durationMinutes && (
                        <span className="tr-step-duration">
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M6 3.5V6l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          {step.durationMinutes} min
                        </span>
                      )}
                    </div>
                    <p className="tr-step-desc">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Contraindications">
          <BulletList items={treatment.contraindications} empty="No contraindications documented" />
        </Section>

        <Section title="Clinical details">
          <div className="tr-clinical-grid">
            {treatment.estimatedDuration && (
              <div className="tr-clinical-item">
                <span className="tr-clinical-label">Estimated duration</span>
                <span className="tr-clinical-value">{treatment.estimatedDuration}</span>
              </div>
            )}
            {treatment.estimatedCost && (
              <div className="tr-clinical-item">
                <span className="tr-clinical-label">Estimated cost</span>
                <span className="tr-clinical-value">{treatment.estimatedCost}</span>
              </div>
            )}
            {treatment.successRate !== undefined && treatment.successRate !== null && (
              <div className="tr-clinical-item">
                <span className="tr-clinical-label">Success rate</span>
                <div className="tr-success-bar-wrap">
                  <div className="tr-success-bar">
                    <div className="tr-success-bar-fill" style={{ width: `${treatment.successRate}%` }} />
                  </div>
                  <span className="tr-clinical-value">{treatment.successRate}%</span>
                </div>
              </div>
            )}
          </div>
        </Section>

        {treatment.vetNotes && (
          <Section title="Veterinarian notes" full>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{treatment.vetNotes}</p>
          </Section>
        )}

        <Section title={`Linked diseases (${linkedDiseases.length})`} full>
          {linkedDiseases.length === 0 ? (
            <p className="tr-empty-section">This treatment is not linked to any disease yet.</p>
          ) : (
            <div className="tr-linked-diseases-grid">
              {linkedDiseases.map((dt) => (
                <div key={dt.id} className="tr-linked-disease-card">
                  <span className="tr-linked-disease-name">{dt.disease.name}</span>
                  <span className={`sev-badge sev-${dt.disease.severity.toLowerCase()}`}>
                    {dt.disease.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}