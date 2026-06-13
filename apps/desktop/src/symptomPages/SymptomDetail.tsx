import type { Symptom } from './symptomAPI'

interface Props {
  symptom: Symptom
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

const COMMONALITY_CONFIG = {
  RARE: { label: 'Rare', class: 'sym-rare' },
  COMMON: { label: 'Common', class: 'sym-common' },
  VERY_COMMON: { label: 'Very Common', class: 'sym-very-common' },
}

const ONSET_CONFIG = {
  ACUTE: { label: 'Acute onset', desc: 'Appears suddenly, often within hours or days' },
  SUBACUTE: { label: 'Subacute onset', desc: 'Develops over days to weeks' },
  CHRONIC: { label: 'Chronic onset', desc: 'Develops slowly over weeks, months or years' },
}

function Section({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`sym-section${full ? ' sym-section-full' : ''}`}>
      <div className="sym-section-title">{title}</div>
      <div className="sym-section-body">{children}</div>
    </div>
  )
}

export default function SymptomDetail({ symptom, onEdit, onDelete, onBack }: Props) {
  const linkedDiseases = symptom.diseaseSymptoms || []
  const commonality = COMMONALITY_CONFIG[symptom.commonality]
  const onset = ONSET_CONFIG[symptom.onsetSpeed]

  return (
    <div className="sym-detail">
      {/* Hero */}
      <div className="sym-detail-hero">
        <div className="sym-detail-hero-content">
          <h1 className="sym-detail-hero-name">{symptom.name}</h1>
          <div className="sym-detail-hero-meta">
            <span className={`sym-badge sym-badge-lg ${commonality.class}`}>
              {commonality.label}
            </span>
            {symptom.affectedBodyArea && (
              <span className="sym-detail-hero-area">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 13c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {symptom.affectedBodyArea}
              </span>
            )}
            <span className="sym-detail-hero-onset">
              {onset.label}
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="sym-detail-actions-bar">
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
      <div className="sym-detail-grid">
        <Section title="Description" full>
          <p>{symptom.description}</p>
        </Section>

        <Section title="Clinical profile">
          <div className="sym-detail-profile-grid">
            <div className="sym-detail-profile-item">
              <span className="sym-detail-profile-label">Commonality</span>
              <span className={`sym-badge ${commonality.class}`}>{commonality.label}</span>
            </div>
            <div className="sym-detail-profile-item">
              <span className="sym-detail-profile-label">Onset speed</span>
              <span className="sym-detail-profile-value">{onset.label}</span>
              <span className="sym-detail-profile-desc">{onset.desc}</span>
            </div>
            {symptom.affectedBodyArea && (
              <div className="sym-detail-profile-item">
                <span className="sym-detail-profile-label">Affected area</span>
                <span className="sym-detail-profile-value">{symptom.affectedBodyArea}</span>
              </div>
            )}
          </div>
        </Section>

        {symptom.notes && (
          <Section title="Clinical notes">
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{symptom.notes}</p>
          </Section>
        )}

        <Section title={`Linked diseases (${linkedDiseases.length})`} full>
          {linkedDiseases.length === 0 ? (
            <p className="sym-empty-section">This symptom is not linked to any disease yet.</p>
          ) : (
            <div className="sym-linked-diseases-grid">
              {linkedDiseases.map((ds) => (
                <div key={ds.id} className="sym-linked-disease-card">
                  <div className="sym-linked-disease-name">{ds.disease.name}</div>
                  <span className={`sev-badge sev-${ds.disease.severity.toLowerCase()}`}>
                    {ds.disease.severity}
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