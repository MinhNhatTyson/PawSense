import { useState, useEffect } from 'react'
import { verificationAPI, type ContentFlag, type PendingContent } from './verificationAPI'
import { VerificationBadge } from '../components/VerificationBadge'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

type TabId = 'pending' | 'flags'

export default function VerificationManagement() {
  const { user } = useAuth()
  const [tab, setTab] = useState<TabId>('pending')
  const [pending, setPending] = useState<PendingContent>({ diseases: [], medicines: [] })
  const [flags, setFlags] = useState<ContentFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolveModal, setResolveModal] = useState<{ flag: ContentFlag; action: 'resolve' | 'dismiss' } | null>(null)
  const [resolverNote, setResolverNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const showToast = useToast()

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, f] = await Promise.all([
        verificationAPI.listPending(),
        verificationAPI.listFlags({ status: 'OPEN' }),
      ])
      setPending(p.data)
      setFlags(f.data)
    } catch {
      setError('Failed to load verification data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (type: 'disease' | 'medicine', id: string) => {
    try {
      if (type === 'disease') await verificationAPI.approveDisease(id)
      else await verificationAPI.approveMedicine(id)
      await loadAll()
      showToast(`${type === 'disease' ? 'Disease' : 'Medicine'} record approved`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Approval failed')
    }
  }

  const handleFlagAction = async () => {
    if (!resolveModal) return
    const actionTaken = resolveModal.action
    setActionLoading(true)
    try {
      if (resolveModal.action === 'resolve') {
        await verificationAPI.resolveFlag(resolveModal.flag.id, resolverNote || undefined)
      } else {
        await verificationAPI.dismissFlag(resolveModal.flag.id, resolverNote || undefined)
      }
      setResolveModal(null)
      setResolverNote('')
      await loadAll()
      showToast(actionTaken === 'resolve' ? 'Flag resolved' : 'Flag dismissed')
    } catch {
      setError('Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const pendingTotal = pending.diseases.length + pending.medicines.length
  const openFlagsTotal = flags.length

  const formatName = (u?: { email: string; profile?: { fullName?: string } }) =>
    u?.profile?.fullName || u?.email || 'Unknown'

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ padding: '48px 56px', background: 'var(--cream)', minHeight: '100vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>
              Knowledge Verification
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Review and approve medical content — ensure accuracy before it reaches pet owners
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 'var(--radius-md)', fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Stat chips */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'Awaiting review', value: pendingTotal, color: '#854d0e', bg: '#fefce8', dot: '#eab308' },
            { label: 'Open flags', value: openFlagsTotal, color: '#c0392b', bg: '#fdf0ee', dot: '#ef4444' },
            { label: 'Diseases pending', value: pending.diseases.length, color: 'var(--text-muted)', bg: '#fff', dot: 'var(--warm-white)' },
            { label: 'Medicines pending', value: pending.medicines.length, color: 'var(--text-muted)', bg: '#fff', dot: 'var(--warm-white)' },
          ].map(chip => (
            <div key={chip.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: chip.bg, border: '1px solid var(--warm-white)', borderRadius: 100, fontSize: 13, color: chip.color, boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: chip.dot, flexShrink: 0 }} />
              <strong>{chip.value}</strong>
              {chip.label}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--ivory)', borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content' }}>
          {([
            { id: 'pending', label: 'Pending Review', count: pendingTotal },
            { id: 'flags', label: 'Open Flags', count: openFlagsTotal },
          ] as { id: TabId; label: string; count: number }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: tab === t.id ? 500 : 400,
                cursor: 'pointer',
                boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{ padding: '1px 7px', background: tab === t.id ? 'var(--green-pale)' : 'var(--warm-white)', color: tab === t.id ? 'var(--green-forest)' : 'var(--text-light)', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '80px 20px', color: 'var(--text-muted)', fontSize: 15 }}>
            <span className="spinner spinner-dark" /> Loading…
          </div>
        ) : tab === 'pending' ? (
          <PendingTab
            pending={pending}
            currentUserId={user?.id || ''}
            onApprove={handleApprove}
            formatName={formatName}
            formatDate={formatDate}
          />
        ) : (
          <FlagsTab
            flags={flags}
            onResolve={(flag) => { setResolveModal({ flag, action: 'resolve' }); setResolverNote('') }}
            onDismiss={(flag) => { setResolveModal({ flag, action: 'dismiss' }); setResolverNote('') }}
            formatName={formatName}
            formatDate={formatDate}
          />
        )}
      </main>

      {/* Resolve / Dismiss Modal */}
      {resolveModal && (
        <>
          <div
            onClick={() => setResolveModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,42,0.18)', backdropFilter: 'blur(2px)', zIndex: 9998 }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 'var(--radius-xl)', padding: 32,
            width: 'min(480px, 90vw)', boxShadow: 'var(--shadow-lg)', zIndex: 9999,
            animation: 'fadeUp 0.2s var(--ease-out) both',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 8 }}>
              {resolveModal.action === 'resolve' ? 'Resolve Flag' : 'Dismiss Flag'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              {resolveModal.action === 'resolve'
                ? 'Mark this flag as resolved. The record will return to Draft status for review.'
                : 'Dismiss this flag as invalid. The record will return to Draft status.'}
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                Note <span style={{ color: 'var(--text-light)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                value={resolverNote}
                onChange={e => setResolverNote(e.target.value)}
                placeholder="Explain your decision…"
                rows={3}
                style={{ width: '100%', padding: '12px 16px', background: 'var(--ivory)', border: '1.5px solid var(--warm-white)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleFlagAction}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{ width: 'auto', flex: 1, background: resolveModal.action === 'dismiss' ? 'var(--error)' : undefined }}
              >
                {actionLoading && <span className="spinner" />}
                {resolveModal.action === 'resolve' ? 'Resolve' : 'Dismiss'}
              </button>
              <button onClick={() => setResolveModal(null)} className="btn btn-secondary" style={{ width: 'auto' }}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Pending Tab ───────────────────────────────────────────────────────────────
function PendingTab({
  pending, currentUserId, onApprove, formatName, formatDate,
}: {
  pending: PendingContent
  currentUserId: string
  onApprove: (type: 'disease' | 'medicine', id: string) => void
  formatName: (u?: any) => string
  formatDate: (d: string) => string
}) {
  const allEmpty = pending.diseases.length === 0 && pending.medicines.length === 0

  if (allEmpty) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ width: 56, height: 56, background: 'var(--green-pale)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--green-forest)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize: 15 }}>All caught up — no records awaiting review.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {pending.diseases.length > 0 && (
        <section>
          <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            Diseases <span style={{ padding: '1px 8px', background: 'var(--ivory)', borderRadius: 100, fontWeight: 600 }}>{pending.diseases.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.diseases.map(d => (
              <PendingRow
                key={d.id}
                item={d}
                type="disease"
                currentUserId={currentUserId}
                onApprove={() => onApprove('disease', d.id)}
                formatName={formatName}
                formatDate={formatDate}
              />
            ))}
          </div>
        </section>
      )}

      {pending.medicines.length > 0 && (
        <section>
          <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            Medicines <span style={{ padding: '1px 8px', background: 'var(--ivory)', borderRadius: 100, fontWeight: 600 }}>{pending.medicines.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.medicines.map(m => (
              <PendingRow
                key={m.id}
                item={m}
                type="medicine"
                currentUserId={currentUserId}
                onApprove={() => onApprove('medicine', m.id)}
                formatName={formatName}
                formatDate={formatDate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function PendingRow({
  item, type, currentUserId, onApprove, formatName, formatDate,
}: {
  item: any
  type: 'disease' | 'medicine'
  currentUserId: string
  onApprove: () => void
  formatName: (u?: any) => string
  formatDate: (d: string) => string
}) {
  const isSelf = item.createdBy?.id === currentUserId
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#fff', border: '1px solid var(--warm-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: type === 'disease' ? 'var(--error-bg)' : 'rgba(196,149,106,0.12)', color: type === 'disease' ? 'var(--error)' : 'var(--gold-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {type === 'disease'
          ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2h4a1 1 0 011 1v1H5V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><rect x="3" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</span>
          <VerificationBadge status={item.status} />
          {item.severity && <span className={`sev-badge sev-${item.severity.toLowerCase()}`}>{item.severity}</span>}
          {item.dosage && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.dosage}</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
          Created by {formatName(item.createdBy)} · {formatDate(item.createdAt)}
          {isSelf && <span style={{ marginLeft: 8, padding: '1px 7px', background: 'var(--ivory)', color: 'var(--text-muted)', borderRadius: 100, fontSize: 11 }}>You</span>}
        </div>
      </div>
      <button
        onClick={onApprove}
        disabled={isSelf}
        title={isSelf ? 'You cannot approve your own record' : 'Approve this record'}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px',
          background: isSelf ? 'var(--ivory)' : 'var(--green-deep)',
          color: isSelf ? 'var(--text-light)' : 'var(--cream)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          cursor: isSelf ? 'not-allowed' : 'pointer',
          opacity: isSelf ? 0.6 : 1,
          transition: 'background 0.15s',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {isSelf ? 'Cannot self-approve' : 'Approve'}
      </button>
    </div>
  )
}

// ── Flags Tab ─────────────────────────────────────────────────────────────────
function FlagsTab({
  flags, onResolve, onDismiss, formatName, formatDate,
}: {
  flags: ContentFlag[]
  onResolve: (flag: ContentFlag) => void
  onDismiss: (flag: ContentFlag) => void
  formatName: (u?: any) => string
  formatDate: (d: string) => string
}) {
  if (flags.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ width: 56, height: 56, background: 'var(--green-pale)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--green-forest)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 3l18 18M5 5v14l6-3 6 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize: 15 }}>No open flags — all content looks good.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {flags.map(flag => (
        <div key={flag.id} style={{ padding: '18px 20px', background: '#fff', border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: '#fdf0ee', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 2v12M3 2l9 4-9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--error)', padding: '2px 8px', background: '#fdf0ee', borderRadius: 100 }}>
                  {flag.contentType}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-light)', fontFamily: 'monospace' }}>{flag.contentId.slice(0, 8)}…</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 8 }}>
                {flag.reason}
              </p>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                Flagged by {formatName(flag.raisedBy)} · {formatDate(flag.createdAt)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => onResolve(flag)}
                style={{ padding: '8px 14px', background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(45,122,79,0.2)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              >
                Resolve
              </button>
              <button
                onClick={() => onDismiss(flag)}
                style={{ padding: '8px 14px', background: 'var(--ivory)', color: 'var(--text-muted)', border: '1px solid var(--warm-white)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}