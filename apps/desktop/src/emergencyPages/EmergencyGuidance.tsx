import { useState, useMemo } from 'react'
import { EMERGENCY_GUIDES, EMERGENCY_CATEGORIES, type EmergencyGuide } from './emergencyData'
import { Sidebar } from '../components/Sidebar'
import './EmergencyGuidance.css'

function UrgencyBadge({ urgency }: { urgency: 'CRITICAL' | 'URGENT' }) {
  return <span className={`eg-badge eg-badge-${urgency.toLowerCase()}`}>{urgency}</span>
}

function GuideCard({ guide, onOpen }: { guide: EmergencyGuide; onOpen: () => void }) {
  return (
    <button className="eg-card" onClick={onOpen}>
      <div className="eg-card-top">
        <span className="eg-card-title">{guide.title}</span>
        <UrgencyBadge urgency={guide.urgency} />
      </div>
      <p className="eg-card-summary">{guide.summary}</p>
      <div className="eg-card-footer">
        <span className="eg-card-category">{guide.category}</span>
        <span className="eg-card-link">
          View guide
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </button>
  )
}

function GuideDetail({ guide, onClose }: { guide: EmergencyGuide; onClose: () => void }) {
  return (
    <div className="eg-detail-overlay" onClick={onClose}>
      <div className="eg-detail-panel" onClick={e => e.stopPropagation()}>
        <div className={`eg-detail-hero eg-detail-hero-${guide.urgency.toLowerCase()}`}>
          <button className="eg-detail-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
          <UrgencyBadge urgency={guide.urgency} />
          <h2 className="eg-detail-title">{guide.title}</h2>
          <p className="eg-detail-summary">{guide.summary}</p>
        </div>

        <div className="eg-detail-body">
          <section className="eg-detail-section">
            <div className="eg-detail-section-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Emergency symptoms to watch for
            </div>
            <ul className="eg-list">
              {guide.emergencySymptoms.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>

          <section className="eg-detail-section">
            <div className="eg-detail-section-title eg-detail-section-title-action">
              First-aid steps
            </div>
            <ol className="eg-steps">
              {guide.firstAidSteps.map((s, i) => (
                <li key={i}>
                  <span className="eg-step-num">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="eg-detail-section eg-detail-section-warning">
            <div className="eg-detail-section-title eg-detail-section-title-warning">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L1 12h12L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M7 5.5v3M7 10.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Do NOT
            </div>
            <ul className="eg-list eg-list-warning">
              {guide.doNots.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>

          <section className="eg-detail-vetcall">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 3h3l1.5 4L7 8.5c1 2 2.5 3.5 4.5 4.5l1.5-1.5 4 1.5v3c0 1-1 1.5-2 1.5C8.5 17.5 .5 9.5.5 3.5c0-1 .5-2 1.5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            <div>
              <div className="eg-vetcall-label">When to seek veterinary care</div>
              <p className="eg-vetcall-text">{guide.whenToSeekVet}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function EmergencyGuidance() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [urgency, setUrgency] = useState('')
  const [activeGuide, setActiveGuide] = useState<EmergencyGuide | null>(null)

  const filtered = useMemo(() => {
    return EMERGENCY_GUIDES.filter(g => {
      const matchesSearch =
        !search ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.emergencySymptoms.some(s => s.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = !category || g.category === category
      const matchesUrgency = !urgency || g.urgency === urgency
      return matchesSearch && matchesCategory && matchesUrgency
    })
  }, [search, category, urgency])

  const criticalCount = EMERGENCY_GUIDES.filter(g => g.urgency === 'CRITICAL').length

  return (
    <div className="eg-shell">
      <Sidebar />

      <main className="eg-main">
        <div className="eg-page-header animate-in">
          <div>
            <h1 className="eg-title">Emergency Guidance</h1>
            <p className="eg-subtitle">
              Quick-reference first-aid protocols for common veterinary emergencies
            </p>
          </div>
        </div>

        <div className="eg-hotline-banner animate-in animate-in-delay-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10 5.5v5l3.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span>
            This reference does not replace hands-on veterinary care. For any life-threatening
            emergency, contact or transport to the nearest emergency veterinary facility immediately.
          </span>
        </div>

        <div className="eg-toolbar animate-in animate-in-delay-1">
          <div className="eg-search-wrap">
            <svg className="eg-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="eg-search"
              placeholder="Search emergencies or symptoms…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="eg-filter-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {EMERGENCY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="eg-filter-select" value={urgency} onChange={e => setUrgency(e.target.value)}>
            <option value="">All urgency levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="URGENT">Urgent</option>
          </select>

          {(search || category || urgency) && (
            <button
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '10px 14px', fontSize: 13 }}
              onClick={() => { setSearch(''); setCategory(''); setUrgency('') }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="eg-stats animate-in animate-in-delay-1">
          <div className="eg-stat-chip">
            <span className="eg-stat-dot" style={{ background: '#922b21' }} />
            <strong>{criticalCount}</strong> Critical protocols
          </div>
          <div className="eg-stat-chip">
            <span className="eg-stat-dot" style={{ background: '#8b6340' }} />
            <strong>{EMERGENCY_GUIDES.length - criticalCount}</strong> Urgent protocols
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="eg-empty">
            <p>No emergency guides match your search.</p>
          </div>
        ) : (
          <div className="eg-grid">
            {filtered.map((g, i) => (
              <div key={g.id} className="animate-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <GuideCard guide={g} onOpen={() => setActiveGuide(g)} />
              </div>
            ))}
          </div>
        )}

        {activeGuide && (
          <GuideDetail guide={activeGuide} onClose={() => setActiveGuide(null)} />
        )}
      </main>
    </div>
  )
}