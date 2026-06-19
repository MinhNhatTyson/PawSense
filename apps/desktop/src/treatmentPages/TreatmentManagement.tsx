import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { treatmentAPI, type Treatment } from './treatmentAPI'
import { diseaseAPI, type Disease } from '../diseasePages/diseaseAPI'
import { useAuth } from '../contexts/AuthContext'
import { PawLogo } from '../components/PawLogo'
import TreatmentList from './TreatmentList'
import TreatmentDetail from './TreatmentDetail'
import TreatmentForm from './TreatmentForm'
import './TreatmentManagement.css'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

export default function TreatmentManagement() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [allDiseases, setAllDiseases] = useState<Disease[]>([])
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 12

  useEffect(() => { loadTreatments() }, [currentPage, search])
  useEffect(() => { loadAllDiseases() }, [])

  const loadTreatments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await treatmentAPI.list(
        currentPage * itemsPerPage,
        itemsPerPage,
        search || undefined
      )
      setTreatments(res.data.data)
      setTotalItems(res.data.pagination.total)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to load treatments')
    } finally {
      setLoading(false)
    }
  }

  const loadAllDiseases = async () => {
    try {
      const res = await diseaseAPI.list(0, 200)
      setAllDiseases(res.data.data)
    } catch {
      // non-critical
    }
  }

  const handleCreate = async (
    data: {
      name: string
      description: string
      contraindications: string[]
      vetNotes?: string
      estimatedDuration?: string
      estimatedCost?: string
      successRate?: number
      steps: { title: string; description: string; durationMinutes?: number }[]
      diseaseIds: string[]
    },
    imageFile?: File
  ) => {
    setLoading(true)
    setError(null)
    try {
      await treatmentAPI.create(data, imageFile)
      setViewMode('list')
      loadTreatments()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to create treatment')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (
    data: {
      name?: string
      description?: string
      contraindications?: string[]
      vetNotes?: string
      estimatedDuration?: string
      estimatedCost?: string
      successRate?: number
      steps?: { title: string; description: string; durationMinutes?: number }[]
      diseaseIds?: string[]
    },
    imageFile?: File
  ) => {
    if (!editingTreatment) return
    setLoading(true)
    setError(null)
    try {
      await treatmentAPI.update(editingTreatment.id, data, imageFile)
      setViewMode('list')
      setEditingTreatment(null)
      loadTreatments()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to update treatment')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this treatment protocol? This action cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      await treatmentAPI.delete(id)
      loadTreatments()
      setSelectedTreatment(null)
      setViewMode('list')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to delete treatment')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (treatment: Treatment) => {
    setLoading(true)
    try {
      const res = await treatmentAPI.getById(treatment.id)
      setSelectedTreatment(res.data)
      setViewMode('detail')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to load treatment details')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => { setSearch(q); setCurrentPage(0) }
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const SIDEBAR_NAV = [
    {
      to: '/dashboard', label: 'Dashboard',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
    },
    {
      to: '/diseases', label: 'Disease Library',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    },
    {
      to: '/symptoms', label: 'Symptom Library',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/></svg>
    },
    {
      to: '/treatments', label: 'Treatment Library', active: true,
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
    },
    {
      to: '/profile', label: 'My Profile',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    },
    {
      to: '/change-password', label: 'Change Password',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    },
  ]

  return (
    <div className="tr-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <PawLogo size={28} />
          <span className="sidebar-brand-name">Paw<span>Sense</span></span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_NAV.map(item => (
            item.active
              ? (
                <button
                  key={item.to}
                  className={`nav-item${viewMode !== 'list' ? '' : ' active'}`}
                  onClick={() => { setViewMode('list'); setSelectedTreatment(null); setEditingTreatment(null) }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="nav-item"
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="nav-item nav-danger"
          >
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

      {/* Main */}
      <main className="tr-main">
        {/* Page header — list only */}
        {viewMode === 'list' && (
          <div className="tr-page-header animate-in">
            <div className="tr-title-block">
              <h1 className="tr-title">Treatment Library</h1>
              <p className="tr-subtitle">
                {totalItems > 0
                  ? `${totalItems} protocol${totalItems !== 1 ? 's' : ''} in the knowledge base`
                  : 'Veterinary treatment protocol knowledge base'}
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
              New treatment
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="tr-error animate-in">
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
            {/* Toolbar */}
            <div className="tr-toolbar animate-in animate-in-delay-1">
              <div className="tr-search-wrap">
                <svg className="tr-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  className="tr-search"
                  placeholder="Search treatments, protocols, procedures…"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
              {search && (
                <button
                  className="btn btn-ghost"
                  style={{ width: 'auto', padding: '10px 14px', fontSize: 13 }}
                  onClick={() => handleSearch('')}
                >
                  Clear
                </button>
              )}
            </div>

            <TreatmentList
              treatments={treatments}
              loading={loading}
              onViewDetail={handleViewDetail}
              onEdit={t => { setEditingTreatment(t); setViewMode('edit') }}
              onDelete={handleDelete}
            />

            {totalItems > itemsPerPage && (
              <div className="tr-pagination">
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>
                <span className="tr-pagination-info">
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
        {viewMode === 'detail' && selectedTreatment && (
          <TreatmentDetail
            treatment={selectedTreatment}
            onEdit={() => { setEditingTreatment(selectedTreatment); setViewMode('edit') }}
            onDelete={() => handleDelete(selectedTreatment.id)}
            onBack={() => { setViewMode('list'); setSelectedTreatment(null) }}
          />
        )}

        {/* Create form */}
        {viewMode === 'create' && (
          <TreatmentForm
            allDiseases={allDiseases}
            onSubmit={handleCreate}
            loading={loading}
            onCancel={() => setViewMode('list')}
          />
        )}

        {/* Edit form */}
        {viewMode === 'edit' && editingTreatment && (
          <TreatmentForm
            treatment={editingTreatment}
            allDiseases={allDiseases}
            onSubmit={handleUpdate}
            loading={loading}
            onCancel={() => { setViewMode('list'); setEditingTreatment(null) }}
          />
        )}
      </main>
    </div>
  )
}