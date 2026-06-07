import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { diseaseAPI, type Disease } from './diseaseAPI'
import { useAuth } from './contexts/AuthContext'
import { PawLogo } from './components/PawLogo'
import DiseaseList from './DiseaseList'
import DiseaseDetail from './DiseaseDetail'
import DiseaseForm from './DiseaseForm'
import './DiseaseManagement.css'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

const SEV_COLORS: Record<string, string> = {
  LOW: '#2d7a4f',
  MEDIUM: '#8b6340',
  HIGH: '#c0392b',
  CRITICAL: '#922b21',
}

export default function DiseaseManagement() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 12

  useEffect(() => { loadDiseases() }, [currentPage, search, severity])

  const loadDiseases = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await diseaseAPI.list(
        currentPage * itemsPerPage, itemsPerPage,
        search || undefined, severity || undefined
      )
      setDiseases(res.data.data)
      setTotalItems(res.data.pagination.total)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load diseases')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (
    formData: Omit<Disease, 'id' | 'createdAt' | 'updatedAt'> & { relatedDiseaseIds?: string[] },
    imageFile?: File
  ) => {
    setLoading(true); setError(null)
    try {
      await diseaseAPI.create(formData, imageFile)
      setViewMode('list'); loadDiseases()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create disease')
    } finally { setLoading(false) }
  }

  const handleUpdate = async (
    formData: Partial<Disease> & { relatedDiseaseIds?: string[] },
    imageFile?: File
  ) => {
    if (!editingDisease) return
    setLoading(true); setError(null)
    try {
      await diseaseAPI.update(editingDisease.id, formData, imageFile)
      setViewMode('list'); setEditingDisease(null); loadDiseases()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update disease')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this disease record? This action cannot be undone.')) return
    setLoading(true); setError(null)
    try {
      await diseaseAPI.delete(id)
      loadDiseases(); setSelectedDisease(null); setViewMode('list')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete disease')
    } finally { setLoading(false) }
  }

  const handleViewDetail = async (disease: Disease) => {
    setLoading(true)
    try {
      const res = await diseaseAPI.getById(disease.id)
      setSelectedDisease(res.data); setViewMode('detail')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load disease details')
    } finally { setLoading(false) }
  }

  const handleSearch = (q: string) => { setSearch(q); setCurrentPage(0) }
  const handleSeverity = (s: string) => { setSeverity(s); setCurrentPage(0) }
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Severity counts for stat chips
  const counts = diseases.reduce((acc, d) => {
    acc[d.severity] = (acc[d.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="dm-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <PawLogo size={28} />
          <span className="sidebar-brand-name">Paw<span>Sense</span></span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Dashboard
          </Link>
          <Link to="/diseases" className="nav-item active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Disease Library
          </Link>
          <Link to="/profile" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            My Profile
          </Link>
          <Link to="/change-password" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Change Password
          </Link>
          <div style={{ flex: 1 }} />
          <button onClick={() => { logout(); navigate('/login') }} className="nav-item nav-danger">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.profile?.fullName || 'User'}</div>
          <div className="sidebar-user-role">{user?.role === 'VET' ? 'Veterinarian' : 'Pet Owner'}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dm-main">
        {/* Header */}
        {viewMode === 'list' && (
          <div className="dm-page-header animate-in">
            <div className="dm-title-block">
              <h1 className="dm-title">Disease Library</h1>
              <p className="dm-subtitle">
                {totalItems > 0
                  ? `${totalItems} record${totalItems !== 1 ? 's' : ''} in the knowledge base`
                  : 'Veterinary knowledge base'}
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '12px 24px' }}
              onClick={() => setViewMode('create')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              New disease
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="dm-error animate-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <>
            {/* Severity stat chips */}
            {totalItems > 0 && (
              <div className="dm-stats animate-in animate-in-delay-1">
                {Object.entries(counts).map(([sev, count]) => (
                  <div
                    key={sev}
                    className="dm-stat-chip"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSeverity(severity === sev ? '' : sev)}
                  >
                    <span
                      className="dm-stat-dot"
                      style={{ background: SEV_COLORS[sev] }}
                    />
                    <strong>{count}</strong>
                    {sev.charAt(0) + sev.slice(1).toLowerCase()}
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="dm-toolbar animate-in animate-in-delay-1">
              <div className="dm-search-wrap">
                <svg className="dm-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  className="dm-search"
                  placeholder="Search diseases, symptoms, causes…"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>

              <select
                className="dm-filter-select"
                value={severity}
                onChange={e => handleSeverity(e.target.value)}
              >
                <option value="">All severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>

              {(search || severity) && (
                <button
                  className="btn btn-ghost"
                  style={{ width: 'auto', padding: '10px 14px', fontSize: 13 }}
                  onClick={() => { handleSearch(''); handleSeverity('') }}
                >
                  Clear filters
                </button>
              )}
            </div>

            <DiseaseList
              diseases={diseases}
              loading={loading}
              onViewDetail={handleViewDetail}
              onEdit={d => { setEditingDisease(d); setViewMode('edit') }}
              onDelete={handleDelete}
            />

            {totalItems > itemsPerPage && (
              <div className="dm-pagination">
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>
                <span className="dm-pagination-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Detail view */}
        {viewMode === 'detail' && selectedDisease && (
          <DiseaseDetail
            disease={selectedDisease}
            onEdit={() => { setEditingDisease(selectedDisease); setViewMode('edit') }}
            onDelete={() => handleDelete(selectedDisease.id)}
            onBack={() => { setViewMode('list'); setSelectedDisease(null) }}
          />
        )}

        {/* Create form */}
        {viewMode === 'create' && (
          <DiseaseForm
            allDiseases={diseases}
            onSubmit={handleCreate}
            loading={loading}
            onCancel={() => setViewMode('list')}
          />
        )}

        {/* Edit form */}
        {viewMode === 'edit' && editingDisease && (
          <DiseaseForm
            disease={editingDisease}
            allDiseases={diseases}
            onSubmit={handleUpdate}
            loading={loading}
            onCancel={() => { setViewMode('list'); setEditingDisease(null) }}
          />
        )}
      </main>
    </div>
  )
}