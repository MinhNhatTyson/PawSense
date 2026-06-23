import type { Medicine } from './medicineAPI'

interface Props {
  medicine: Medicine
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

function Section({
  title,
  children,
  full,
}: {
  title: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <div className={`med-section${full ? ' med-section-full' : ''}`}>
      <div className="med-section-title">{title}</div>
      <div className="med-section-body">{children}</div>
    </div>
  )
}

function BulletList({
  items,
  empty = 'Not documented',
  warning = false,
}: {
  items: string[]
  empty?: string
  warning?: boolean
}) {
  if (!items || items.length === 0)
    return <p className="med-empty-section">{empty}</p>
  return (
    <ul className={`med-list${warning ? ' med-list-warning' : ''}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export default function MedicineDetail({ medicine, onEdit, onDelete, onBack }: Props) {
  const linkedDiseases = medicine.diseaseMedicines || []

  return (
    <div className="med-detail">
      {/* Hero */}
      <div className="med-detail-hero">
        {medicine.imageUrl && (
          <img
            src={medicine.imageUrl}
            alt={medicine.name}
            className="med-detail-hero-img"
          />
        )}
        <div className="med-detail-hero-content">
          <h1 className="med-detail-hero-name">{medicine.name}</h1>
          <div className="med-detail-hero-meta">
            <span className="med-detail-hero-badge med-detail-hero-badge-gold">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1v12M1 7h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {medicine.dosage}
            </span>
            {medicine.manufacturer && (
              <span className="med-detail-hero-badge">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="2"
                    y="4"
                    width="10"
                    height="8"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5 4V3a2 2 0 014 0v1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                {medicine.manufacturer}
              </span>
            )}
            {linkedDiseases.length > 0 && (
              <span className="med-detail-hero-badge">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4 7h6M7 4v6"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                {linkedDiseases.length} linked disease{linkedDiseases.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="med-detail-actions-bar">
        <button
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '9px 14px' }}
          onClick={onBack}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 2L4 7l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to list
        </button>
        <button
          className="btn btn-secondary"
          style={{ width: 'auto', padding: '9px 20px' }}
          onClick={onEdit}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          Edit record
        </button>
        <button
          className="btn btn-danger"
          style={{ width: 'auto', padding: '9px 20px' }}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>

      {/* Content grid */}
      <div className="med-detail-grid">
        <Section title="Description" full>
          <p>{medicine.description}</p>
        </Section>

        <Section title="Usage instructions" full>
          <p style={{ whiteSpace: 'pre-line' }}>{medicine.usageInstructions}</p>
        </Section>

        <Section title="Dosage">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 16px',
              background: 'rgba(196,149,106,0.08)',
              border: '1px solid rgba(196,149,106,0.2)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2v14M2 9h14"
                stroke="var(--gold)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--gold-deep)',
              }}
            >
              {medicine.dosage}
            </span>
          </div>
        </Section>

        {medicine.manufacturer && (
          <Section title="Manufacturer">
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
              {medicine.manufacturer}
            </p>
          </Section>
        )}

        <Section title="Side effects">
          <BulletList
            items={medicine.sideEffects}
            empty="No side effects documented"
          />
        </Section>

        <Section title="Warnings">
          <BulletList
            items={medicine.warnings}
            empty="No warnings documented"
            warning
          />
        </Section>

        <Section
          title={`Linked diseases (${linkedDiseases.length})`}
          full
        >
          {linkedDiseases.length === 0 ? (
            <p className="med-empty-section">
              This medicine is not linked to any disease yet.
            </p>
          ) : (
            <div className="med-linked-diseases-grid">
              {linkedDiseases.map((dm) => (
                <div key={dm.id} className="med-linked-disease-card">
                  <span className="med-linked-disease-name">{dm.disease.name}</span>
                  <span
                    className={`sev-badge sev-${dm.disease.severity.toLowerCase()}`}
                  >
                    {dm.disease.severity}
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