type VerificationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'FLAGGED'

interface Props {
  status: VerificationStatus
  size?: 'sm' | 'md'
}

const CONFIG = {
  DRAFT:    { label: 'Draft',    bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
  PENDING:  { label: 'Pending',  bg: '#fefce8', color: '#854d0e', dot: '#eab308' },
  APPROVED: { label: 'Approved', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  FLAGGED:  { label: 'Flagged',  bg: '#fdf2f8', color: '#c0392b', dot: '#ef4444' },
}

export function VerificationBadge({ status, size = 'sm' }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.DRAFT
  const pad = size === 'md' ? '5px 12px' : '3px 9px'
  const fs = size === 'md' ? 12 : 11

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: pad,
      background: cfg.bg,
      color: cfg.color,
      borderRadius: 100,
      fontSize: fs,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  )
}