import './Skeleton.css'

export function SkeletonLine({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return <div className="skeleton-line" style={{ width, height }} />
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-image" />
      <div className="skeleton-card-body">
        <SkeletonLine width="70%" height={18} />
        <SkeletonLine width="40%" height={12} />
        <SkeletonLine width="100%" height={12} />
        <SkeletonLine width="90%" height={12} />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}