import type { Disease } from './diseaseAPI'

interface Props {
  disease: Disease
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

function SevBadge({ sev }: { sev: string }) {
  return <span className={`sev-badge sev-${sev.toLowerCase()}`}>{sev} Severity</span>
}

function Section({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`dm-section${full ? ' dm-section-full' : ''}`}>
      <div className="dm-section-title">{title}</div>
      <div className="dm-section-body">{children}</div>
    </div>
  )
}

function BulletList({ items, empty = 'Not documented' }: { items: string[]; empty?: string }) {
  if (!items || items.length === 0)
    return <p className="dm-empty-section">{empty}</p>
  return (
    <ul className="dm-list">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

export default function DiseaseDetail({ disease, onEdit, onDelete, onBack }: Props) {
  return (
    <div className="dm-detail">
      {/* Hero */}
      <div className="dm-detail-hero">
        {disease.imageUrl && (
          <img src={disease.imageUrl} alt={disease.name} className="dm-detail-hero-img" />
        )}
        <div className="dm-detail-hero-content">
          <h1 className="dm-detail-hero-name">{disease.name}</h1>
          <div className="dm-detail-hero-meta">
            <SevBadge sev={disease.severity} />
            {disease.recoveryPeriod && (
              <span className="dm-detail-hero-recovery">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {disease.recoveryPeriod}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="dm-detail-actions-bar">
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
        <button
          className="btn btn-danger"
          style={{ width: 'auto', padding: '9px 20px' }}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>

      {/* Content grid */}
      <div className="dm-detail-grid">
        <Section title="Description" full>
          <p>{disease.description}</p>
        </Section>

        <Section title="Causes">
          <BulletList items={disease.causes} empty="No causes documented" />
        </Section>

        <Section title="Symptoms">
          <BulletList items={disease.symptoms} empty="No symptoms documented" />
        </Section>

        <Section title="Prevention">
          <BulletList items={disease.preventionMethods} empty="No prevention methods documented" />
        </Section>

        <Section title="Treatment">
          <BulletList items={disease.treatmentMethods} empty="No treatment methods documented" />
        </Section>

        {disease.relatedDiseasesFrom && disease.relatedDiseasesFrom.length > 0 && (
          <Section title="Related Diseases" full>
            <div className="dm-related-chips">
              {disease.relatedDiseasesFrom.map((r) => (
                <span key={r.diseaseTo.id} className="dm-related-chip">{r.diseaseTo.name}</span>
              ))}
            </div>
          </Section>
        )}

        {disease.medicines && disease.medicines.length > 0 && (
          <Section title="Associated Medicines" full>
            <div className="dm-medicines-grid">
              {disease.medicines.map((med) => (
                <div key={med.id} className="dm-medicine-card">
                  <div className="dm-medicine-name">{med.name}</div>
                  <div className="dm-medicine-dosage">{med.dosage}</div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}