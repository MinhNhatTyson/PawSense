import { useState, useEffect } from 'react'
import { emergencyAPI, type EmergencyGuide, type EmergencyGuideInput } from './emergencyAPI'
import { verificationAPI } from '../verificationPages/verificationAPI'
import { VerificationBadge } from '../components/VerificationBadge'
import { EMERGENCY_CATEGORIES } from './emergencyData'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar } from '../components/Sidebar'
import EmergencyGuideForm from './EmergencyGuideForm'
import './EmergencyGuidance.css'

type ViewMode = 'list' | 'create' | 'edit'

function UrgencyBadge({ urgency }: { urgency: 'CRITICAL' | 'URGENT' }) {
  return <span className={`eg-badge eg-badge-${urgency.toLowerCase()}`}>{urgency}</span>
}

function GuideCard({
  guide,
  isVet,
  onOpen,
  onEdit,
  onDelete,
}: {
  guide: EmergencyGuide
  isVet: boolean
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="eg-card">
      <button className="eg-card-clickable" onClick={onOpen}>
        <div className="eg-card-top">
          <span className="eg-card-title">{guide.title}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <UrgencyBadge urgency={guide.urgency} />
            <VerificationBadge status={guide.status} />
          </div>
        </div>
        <p className="eg-card-summary">{guide.summary}</p>
        <div className="eg-card-footer">
          <span className="eg-card-category">{guide.category}</span>
          <span className="eg-card-link">
            View guide
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </button>

      {isVet && (
        <div className="eg-card-actions">
          <button className="btn btn-secondary" style={{ fontSize: 12, flex: 1, padding: '6px 10px' }} onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-danger" style={{ fontSize: 12, flex: 1, padding: '6px 10px' }} onClick={onDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function FlagModal({
  guideId,
  onClose,
  onSuccess,
}: {
  guideId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!reason.trim()) { setError('Please describe the issue.'); return }
    setLoading(true)
    setError(null)
    try {
      await verificationAPI.raiseFlag({
        contentType: 'EMERGENCY_GUIDE',
        contentId: guideId,
        reason: reason.trim(),
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit flag.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="eg-detail-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="eg-flag-modal"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="eg-flag-modal-title">Flag an issue</h3>
        <p className="eg-flag-modal-desc">
          Describe what is incorrect or unsafe about this emergency guide. A veterinarian will review your report.
        </p>

        {error && <div className="eg-flag-modal-error">{error}</div>}

        <textarea
          className="dm-textarea"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. The first-aid step for bleeding recommends a tourniquet, which is unsafe without training…"
          rows={4}
          autoFocus
        />

        <div className="eg-flag-modal-actions">
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
          >
            {loading && <span className="spinner" />}
            Submit flag
          </button>
          <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function GuideDetail({
  guide,
  currentUserId,
  isVet,
  onClose,
  onStatusChange,
}: {
  guide: EmergencyGuide
  currentUserId?: string
  isVet: boolean
  onClose: () => void
  onStatusChange: () => void
}) {
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [approving, setApproving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isSelf = guide.createdById === currentUserId
  const isApproved = guide.status === 'APPROVED'
  const canApprove = isVet && !isSelf && !isApproved

  const handleApprove = async () => {
    setApproving(true)
    setActionError(null)
    try {
      await verificationAPI.approveEmergencyGuide(guide.id)
      onStatusChange()
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Approval failed.')
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="eg-detail-overlay" onClick={onClose}>
      <div className="eg-detail-panel" onClick={e => e.stopPropagation()}>
        <div className={`eg-detail-hero eg-detail-hero-${guide.urgency.toLowerCase()}`}>
          <button className="eg-detail-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <UrgencyBadge urgency={guide.urgency} />
            <VerificationBadge status={guide.status} />
          </div>
          <h2 className="eg-detail-title">{guide.title}</h2>
          <p className="eg-detail-summary">{guide.summary}</p>
        </div>

        <div className="eg-detail-body">
          {actionError && (
            <div className="eg-flag-modal-error" style={{ marginBottom: 0 }}>{actionError}</div>
          )}

          {/* Verification action bar */}
          <div className="eg-detail-verify-bar">
            {canApprove && (
              <button className="btn btn-primary" style={{ width: 'auto', background: 'var(--green-deep)' }} onClick={handleApprove} disabled={approving}>
                {approving ? (
                  <>
                    <span className="spinner" /> Approving…
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Approve as verified
                  </>
                )}
              </button>
            )}
            {isSelf && !isApproved && (
              <span className="eg-detail-self-note">
                You authored this guide — another veterinarian must approve it.
              </span>
            )}
            {guide.status !== 'FLAGGED' && (
              <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowFlagModal(true)}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M3 2v10M3 2l8 3.5L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Flag issue
              </button>
            )}
          </div>

          {guide.status === 'APPROVED' && guide.approvedBy && (
            <div className="eg-detail-verified-note">
              <VerificationBadge status="APPROVED" size="md" />
              <span>
                Approved by{' '}
                <strong>{guide.approvedBy.profile?.fullName || guide.approvedBy.email}</strong>
                {guide.approvedAt && (
                  <> on {new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(guide.approvedAt))}</>
                )}
              </span>
            </div>
          )}

          <section className="eg-detail-section">
            <div className="eg-detail-section-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Emergency symptoms to watch for
            </div>
            {guide.emergencySymptoms.length === 0 ? (
              <p className="eg-empty-inline">Not documented</p>
            ) : (
              <ul className="eg-list">
                {guide.emergencySymptoms.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
          </section>

          <section className="eg-detail-section">
            <div className="eg-detail-section-title eg-detail-section-title-action">
              First-aid steps
            </div>
            {guide.firstAidSteps.length === 0 ? (
              <p className="eg-empty-inline">Not documented</p>
            ) : (
              <ol className="eg-steps">
                {guide.firstAidSteps.map((s, i) => (
                  <li key={i}>
                    <span className="eg-step-num">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="eg-detail-section eg-detail-section-warning">
            <div className="eg-detail-section-title eg-detail-section-title-warning">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L1 12h12L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M7 5.5v3M7 10.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Do NOT
            </div>
            {guide.doNots.length === 0 ? (
              <p className="eg-empty-inline">Not documented</p>
            ) : (
              <ul className="eg-list eg-list-warning">
                {guide.doNots.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
          </section>

          <section className="eg-detail-vetcall">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 3h3l1.5 4L7 8.5c1 2 2.5 3.5 4.5 4.5l1.5-1.5 4 1.5v3c0 1-1 1.5-2 1.5C8.5 17.5 .5 9.5.5 3.5c0-1 .5-2 1.5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="eg-vetcall-label">When to seek veterinary care</div>
              <p className="eg-vetcall-text">{guide.whenToSeekVet}</p>
            </div>
          </section>
        </div>
      </div>

      {showFlagModal && (
        <FlagModal
          guideId={guide.id}
          onClose={() => setShowFlagModal(false)}
          onSuccess={onStatusChange}
        />
      )}
    </div>
  )
}

export default function EmergencyGuidance() {
  const { user } = useAuth()
  const isVet = user?.role === 'VET'

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [guides, setGuides] = useState<EmergencyGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [urgency, setUrgency] = useState('')

  const [activeGuide, setActiveGuide] = useState<EmergencyGuide | null>(null)
  const [editingGuide, setEditingGuide] = useState<EmergencyGuide | null>(null)

  useEffect(() => { loadGuides() }, [search, category, urgency])

  const loadGuides = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await emergencyAPI.list({
        search: search || undefined,
        category: category || undefined,
        urgency: urgency || undefined,
      })
      setGuides(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load emergency guides')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: EmergencyGuideInput, imageFile?: File) => {
    setSaving(true)
    setError(null)
    try {
      await emergencyAPI.create(data, imageFile)
      setViewMode('list')
      loadGuides()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create emergency guide')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: EmergencyGuideInput, imageFile?: File) => {
    if (!editingGuide) return
    setSaving(true)
    setError(null)
    try {
      await emergencyAPI.update(editingGuide.id, data, imageFile)
      setViewMode('list')
      setEditingGuide(null)
      loadGuides()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update emergency guide')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this emergency guide? This action cannot be undone.')) return
    setError(null)
    try {
      await emergencyAPI.delete(id)
      if (activeGuide?.id === id) setActiveGuide(null)
      loadGuides()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete emergency guide')
    }
  }

  // Refresh the currently-open detail panel + list after an approve/flag action
  const handleStatusChange = async () => {
    await loadGuides()
    if (activeGuide) {
      try {
        const res = await emergencyAPI.getById(activeGuide.id)
        setActiveGuide(res.data)
      } catch {
        setActiveGuide(null)
      }
    }
  }

  const criticalCount = guides.filter(g => g.urgency === 'CRITICAL').length

  if (viewMode === 'create') {
    return (
      <div className="eg-shell">
        <Sidebar />
        <main className="eg-main">
          {error && <div className="eg-error-banner">{error}</div>}
          <EmergencyGuideForm
            onSubmit={handleCreate}
            loading={saving}
            onCancel={() => setViewMode('list')}
          />
        </main>
      </div>
    )
  }

  if (viewMode === 'edit' && editingGuide) {
    return (
      <div className="eg-shell">
        <Sidebar />
        <main className="eg-main">
          {error && <div className="eg-error-banner">{error}</div>}
          <EmergencyGuideForm
            guide={editingGuide}
            onSubmit={handleUpdate}
            loading={saving}
            onCancel={() => { setViewMode('list'); setEditingGuide(null) }}
          />
        </main>
      </div>
    )
  }

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
          {isVet && (
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '12px 24px' }}
              onClick={() => setViewMode('create')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              New emergency guide
            </button>
          )}
        </div>

        <div className="eg-hotline-banner animate-in animate-in-delay-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 5.5v5l3.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>
            This reference does not replace hands-on veterinary care. For any life-threatening
            emergency, contact or transport to the nearest emergency veterinary facility immediately.
            Only guides marked <strong>Approved</strong> have been peer-reviewed by a second veterinarian.
          </span>
        </div>

        {error && (
          <div className="eg-error-banner animate-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <div className="eg-toolbar animate-in animate-in-delay-1">
          <div className="eg-search-wrap">
            <svg className="eg-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
            <strong>{guides.length - criticalCount}</strong> Urgent protocols
          </div>
          <div className="eg-stat-chip">
            <span className="eg-stat-dot" style={{ background: '#22c55e' }} />
            <strong>{guides.filter(g => g.status === 'APPROVED').length}</strong> Verified
          </div>
        </div>

        {loading ? (
          <div className="eg-loading">
            <span className="spinner spinner-dark" />
            Loading emergency guides…
          </div>
        ) : guides.length === 0 ? (
          <div className="eg-empty">
            <p>No emergency guides match your search.</p>
          </div>
        ) : (
          <div className="eg-grid">
            {guides.map((g, i) => (
              <div key={g.id} className="animate-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <GuideCard
                  guide={g}
                  isVet={isVet}
                  onOpen={() => setActiveGuide(g)}
                  onEdit={() => { setEditingGuide(g); setViewMode('edit') }}
                  onDelete={() => handleDelete(g.id)}
                />
              </div>
            ))}
          </div>
        )}

        {activeGuide && (
          <GuideDetail
            guide={activeGuide}
            currentUserId={user?.id}
            isVet={isVet}
            onClose={() => setActiveGuide(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  )
}