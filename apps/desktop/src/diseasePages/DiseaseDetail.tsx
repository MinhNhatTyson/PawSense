import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Disease } from './diseaseAPI'
import { VerificationBadge } from '../components/VerificationBadge'
import { verificationAPI } from '../verificationPages/verificationAPI'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  disease: Disease
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

// ── Quick-view panel types ────────────────────────────────────────────────────
type PanelContent =
  | { kind: 'symptom'; data: NonNullable<Disease['diseaseSymptoms']>[number]['symptom'] }
  | { kind: 'treatment'; data: NonNullable<Disease['diseaseTreatments']>[number]['treatment'] }
  | null

// ── Sub-components ────────────────────────────────────────────────────────────
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

const COMMONALITY_CONFIG: Record<string, { label: string; class: string }> = {
  RARE:        { label: 'Rare',        class: 'sym-rare' },
  COMMON:      { label: 'Common',      class: 'sym-common' },
  VERY_COMMON: { label: 'Very Common', class: 'sym-very-common' },
}

const ONSET_LABELS: Record<string, string> = {
  ACUTE:    'Acute onset',
  SUBACUTE: 'Subacute onset',
  CHRONIC:  'Chronic onset',
}

// ── Shared close button ───────────────────────────────────────────────────────
function PanelCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close panel"
      style={{
        position: 'absolute', top: 16, right: 16,
        width: 32, height: 32,
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '50%',
        color: 'var(--cream)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  )
}

// ── Symptom panel content ─────────────────────────────────────────────────────
function SymptomPanel({
  symptom,
  onClose,
  scrollRef,
}: {
  symptom: NonNullable<Disease['diseaseSymptoms']>[number]['symptom']
  onClose: () => void
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  const commonality = COMMONALITY_CONFIG[symptom.commonality] ?? { label: symptom.commonality, class: 'sym-common' }
  const onsetLabel  = ONSET_LABELS[symptom.onsetSpeed] ?? symptom.onsetSpeed
  const areas: string[] = symptom.affectedBodyAreas ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-forest) 100%)',
        padding: '32px 28px 28px',
        position: 'relative',
        flexShrink: 0,
      }}>
        <PanelCloseButton onClose={onClose} />
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
          Symptom record
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--cream)', letterSpacing: '-0.01em', marginBottom: 12, lineHeight: 1.15 }}>
          {symptom.name}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className={`sym-badge ${commonality.class}`} style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.2)' }}>
            {commonality.label}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
            {onsetLabel}
          </span>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Description</div>
          <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.7 }}>{symptom.description}</p>
        </div>

        {areas.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>
              Affected body areas
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {areas.map(area => (
                <span key={area} className="sym-area-chip">{area}</span>
              ))}
            </div>
          </div>
        )}

        {symptom.notes && (
          <div style={{ background: '#fff', border: '1px solid var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Clinical notes</div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, fontStyle: 'italic' }}>{symptom.notes}</p>
          </div>
        )}

        <a
          href="/symptoms"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 20px',
            background: 'var(--green-deep)', color: 'var(--cream)',
            borderRadius: 'var(--radius-md)', textDecoration: 'none',
            fontSize: 14, fontWeight: 500,
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--green-forest)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--green-deep)')}
        >
          View full record in Symptom Library
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

// ── Treatment panel content ───────────────────────────────────────────────────
function TreatmentPanel({
  treatment,
  onClose,
  scrollRef,
}: {
  treatment: NonNullable<Disease['diseaseTreatments']>[number]['treatment']
  onClose: () => void
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-forest) 100%)',
        padding: '32px 28px 28px',
        position: 'relative',
        flexShrink: 0,
      }}>
        <PanelCloseButton onClose={onClose} />
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
          Treatment protocol
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--cream)', letterSpacing: '-0.01em', marginBottom: 12, lineHeight: 1.15 }}>
          {treatment.name}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {treatment.steps?.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 100, fontSize: 12, color: 'var(--cream)',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {treatment.steps.length} step{treatment.steps.length !== 1 ? 's' : ''}
            </span>
          )}
          {treatment.estimatedDuration && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
              {treatment.estimatedDuration}
            </span>
          )}
          {treatment.successRate != null && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
              {treatment.successRate}% success
            </span>
          )}
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {treatment.steps && treatment.steps.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 14 }}>
              Procedure steps
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {treatment.steps.map((step, idx) => (
                <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--green-deep)', color: 'var(--cream)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 2,
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {step.title}
                    </div>
                    {step.durationMinutes && (
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 4 }}>
                        {step.durationMinutes} min
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <a
          href="/treatments"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 20px',
            background: 'var(--green-deep)', color: 'var(--cream)',
            borderRadius: 'var(--radius-md)', textDecoration: 'none',
            fontSize: 14, fontWeight: 500,
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--green-forest)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--green-deep)')}
        >
          View full record in Treatment Library
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

// ── Quick-view panel — rendered via portal directly into document.body ────────
function QuickViewPanel({ panel, onClose }: { panel: NonNullable<PanelContent>; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0 })
    })
    // Lock the dm-main scroll container, not body
    const mainEl = document.querySelector('.dm-main') as HTMLElement | null
    if (mainEl) mainEl.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(frame)
      if (mainEl) mainEl.style.overflow = ''
    }
  }, [panel])

  const portalContent = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,58,42,0.18)',
          backdropFilter: 'blur(2px)',
          zIndex: 9998,
          animation: 'fadeIn 0.18s ease both',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(520px, 100vw)',
        background: 'var(--cream)',
        borderLeft: '1px solid var(--warm-white)',
        boxShadow: '-12px 0 48px rgba(26,58,42,0.12)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.22s var(--ease-out) both',
        overflow: 'hidden',
      }}>
        {panel.kind === 'symptom'
          ? <SymptomPanel symptom={panel.data} onClose={onClose} scrollRef={scrollRef} />
          : <TreatmentPanel treatment={panel.data} onClose={onClose} scrollRef={scrollRef} />
        }
      </div>
    </>
  )

  return createPortal(portalContent, document.body)
}

// ── Main DiseaseDetail component ──────────────────────────────────────────────
export default function DiseaseDetail({ disease, onEdit, onDelete, onBack }: Props) {
  const [panel, setPanel] = useState<PanelContent>(null)

  const linkedSymptoms   = disease.diseaseSymptoms   ?? []
  const linkedTreatments = disease.diseaseTreatments ?? []

  const openSymptom = (symptom: NonNullable<Disease['diseaseSymptoms']>[number]['symptom']) =>
    setPanel({ kind: 'symptom', data: symptom })

  const openTreatment = (treatment: NonNullable<Disease['diseaseTreatments']>[number]['treatment']) =>
    setPanel({ kind: 'treatment', data: treatment })

  return (
    <div className="dm-detail">
      {panel && <QuickViewPanel panel={panel} onClose={() => setPanel(null)} />}

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
        <button className="btn btn-danger" style={{ width: 'auto', padding: '9px 20px' }} onClick={onDelete}>
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

        <Section title="Symptoms (free text)">
          <BulletList items={disease.symptoms} empty="No symptoms documented" />
        </Section>

        <Section title="Prevention">
          <BulletList items={disease.preventionMethods} empty="No prevention methods documented" />
        </Section>

        <Section title="Treatment">
          <BulletList items={disease.treatmentMethods} empty="No treatment methods documented" />
        </Section>

        {/* Linked Symptoms */}
        <Section title={`Linked symptoms from library (${linkedSymptoms.length})`} full>
          {linkedSymptoms.length === 0 ? (
            <p className="dm-empty-section">No symptoms from the symptom library are linked to this disease yet.</p>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12, fontStyle: 'italic' }}>
                Click any symptom to preview its full record.
              </p>
              <div className="dm-linked-symptoms-grid">
                {linkedSymptoms.map((ds: any) => {
                  const symptom     = ds.symptom
                  const commonality = COMMONALITY_CONFIG[symptom.commonality] ?? { label: symptom.commonality, class: 'sym-common' }
                  return (
                    <button
                      key={ds.id}
                      className="dm-linked-symptom-card"
                      onClick={() => openSymptom(symptom)}
                      style={{ cursor: 'pointer', textAlign: 'left', width: '100%', border: 'none', background: 'none', padding: 0 }}
                      title={`Preview: ${symptom.name}`}
                    >
                      <div className="dm-linked-symptom-top">
                        <span className="dm-linked-symptom-name">{symptom.name}</span>
                        <span className={`sym-badge ${commonality.class}`}>{commonality.label}</span>
                      </div>
                      <div className="dm-linked-symptom-meta">
                        {symptom.affectedBodyAreas?.length > 0 && (
                          <span className="dm-linked-symptom-area">{symptom.affectedBodyAreas[0]}</span>
                        )}
                        <span className="dm-linked-symptom-onset">
                          {ONSET_LABELS[symptom.onsetSpeed] ?? symptom.onsetSpeed}
                        </span>
                      </div>
                      {symptom.description && (
                        <p className="dm-linked-symptom-desc">{symptom.description}</p>
                      )}
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--green-sage)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Preview
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </Section>

        {/* Linked Treatments */}
        <Section title={`Linked treatment protocols (${linkedTreatments.length})`} full>
          {linkedTreatments.length === 0 ? (
            <p className="dm-empty-section">No treatment protocols from the library are linked to this disease yet.</p>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12, fontStyle: 'italic' }}>
                Click any treatment to preview its full record.
              </p>
              <div className="dm-linked-symptoms-grid">
                {linkedTreatments.map((dt: any) => {
                  const t = dt.treatment
                  return (
                    <button
                      key={dt.id}
                      className="dm-linked-symptom-card"
                      onClick={() => openTreatment(t)}
                      style={{ cursor: 'pointer', textAlign: 'left', width: '100%', border: 'none', background: 'none', padding: 0 }}
                      title={`Preview: ${t.name}`}
                    >
                      <div className="dm-linked-symptom-top">
                        <span className="dm-linked-symptom-name">{t.name}</span>
                        {t.steps?.length > 0 && (
                          <span style={{
                            fontSize: 10, padding: '2px 8px',
                            background: 'var(--green-pale)', color: 'var(--green-forest)',
                            borderRadius: 100, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                          }}>
                            {t.steps.length} step{t.steps.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="dm-linked-symptom-meta">
                        {t.estimatedDuration && (
                          <span className="dm-linked-symptom-onset">{t.estimatedDuration}</span>
                        )}
                        {t.successRate != null && (
                          <span className="dm-linked-symptom-onset">{t.successRate}% success</span>
                        )}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--green-sage)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Preview
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </Section>

        {disease.relatedDiseasesFrom && disease.relatedDiseasesFrom.length > 0 && (
          <Section title="Related Diseases" full>
            <div className="dm-related-chips">
              {disease.relatedDiseasesFrom.map((r: any) => (
                <span key={r.diseaseTo.id} className="dm-related-chip">{r.diseaseTo.name}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Linked Medicines */}
        {(() => {
          const linkedMedicines = (disease as any).diseaseMedicines || []
          return (
            <Section title={`Linked medicines (${linkedMedicines.length})`} full>
              {linkedMedicines.length === 0 ? (
                <p className="dm-empty-section">
                  No medicines from the library are linked to this disease yet.
                </p>
              ) : (
                <div className="dm-medicines-grid">
                  {linkedMedicines.map((dm: any) => {
                    const med = dm.medicine
                    return (
                      <div key={dm.id} className="dm-medicine-card">
                        <div className="dm-medicine-name">{med.name}</div>
                        <div className="dm-medicine-dosage">{med.dosage}</div>
                        {med.manufacturer && (
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--text-light)',
                              marginTop: 2,
                            }}
                          >
                            {med.manufacturer}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>
          )
        })()}
      </div>
    </div>
  )
}