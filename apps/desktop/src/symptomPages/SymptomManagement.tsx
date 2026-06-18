import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { symptomAPI, type Symptom } from './symptomAPI'
import { diseaseAPI, type Disease } from '../diseasePages/diseaseAPI'
import { useAuth } from '../contexts/AuthContext'
import { PawLogo } from '../components/PawLogo'
import SymptomList from './SymptomList'
import SymptomDetail from './SymptomDetail'
import SymptomForm from './SymptomForm'
import './SymptomManagement.css'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

const COMMONALITY_COLORS: Record<string, string> = {
  RARE: '#8b6340',
  COMMON: '#2d5a3d',
  VERY_COMMON: '#1a3a2a',
}

export default function SymptomManagement() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [allDiseases, setAllDiseases] = useState<Disease[]>([])
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null)
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [commonalityFilter, setCommonalityFilter] = useState('')
  const [onsetFilter, setOnsetFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 12

  useEffect(() => { loadSymptoms() }, [currentPage, search, commonalityFilter, onsetFilter])
  useEffect(() => { loadAllDiseases() }, [])

  const loadSymptoms = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await symptomAPI.list(
        currentPage * itemsPerPage,
        itemsPerPage,
        search || undefined,
        commonalityFilter || undefined,
        onsetFilter || undefined
      )
      setSymptoms(res.data.data)
      setTotalItems(res.data.pagination.total)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load symptoms')
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
    formData: Omit<Symptom, 'id' | 'createdAt' | 'updatedAt'> & { diseaseIds?: string[] }
  ) => {
    setLoading(true)
    setError(null)
    try {
      await symptomAPI.create(formData)
      setViewMode('list')
      loadSymptoms()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create symptom')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (
    formData: Partial<Symptom> & { diseaseIds?: string[] }
  ) => {
    if (!editingSymptom) return
    setLoading(true)
    setError(null)
    try {
      await symptomAPI.update(editingSymptom.id, formData)
      setViewMode('list')
      setEditingSymptom(null)
      loadSymptoms()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update symptom')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this symptom record? This action cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      await symptomAPI.delete(id)
      loadSymptoms()
      setSelectedSymptom(null)
      setViewMode('list')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete symptom')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (symptom: Symptom) => {
    setLoading(true)
    try {
      const res = await symptomAPI.getById(symptom.id)
      setSelectedSymptom(res.data)
      setViewMode('detail')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load symptom details')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => { setSearch(q); setCurrentPage(0) }
  const handleCommonality = (c: string) => { setCommonalityFilter(c); setCurrentPage(0) }
  const handleOnset = (o: string) => { setOnsetFilter(o); setCurrentPage(0) }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const counts = symptoms.reduce((acc, s) => {
    acc[s.commonality] = (acc[s.commonality] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const COMMONALITY_LABELS: Record<string, string> = {
    RARE: 'Rare',
    COMMON: 'Common',
    VERY_COMMON: 'Very Common',
  }

  return (
    <div className="sym-shell">
      {/* Sidebar */}
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
          <Link to="/diseases" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Disease Library
          </Link>
          <Link to="/symptoms" className="nav-item active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Symptom Library
          </Link>
          <Link to="/treatments" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Treatment Library
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

      {/* Main */}
      <main className="sym-main">
        {/* Page header */}
        {viewMode === 'list' && (
          <div className="sym-page-header animate-in">
            <div className="sym-title-block">
              <h1 className="sym-title">Symptom Library</h1>
              <p className="sym-subtitle">
                {totalItems > 0
                  ? `${totalItems} symptom${totalItems !== 1 ? 's' : ''} in the knowledge base`
                  : 'Veterinary symptom knowledge base'}
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
              New symptom
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="sym-error animate-in">
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
            {/* Commonality stat chips */}
            {totalItems > 0 && (
              <div className="sym-stats animate-in animate-in-delay-1">
                {Object.entries(counts).map(([c, count]) => (
                  <div
                    key={c}
                    className="sym-stat-chip"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCommonality(commonalityFilter === c ? '' : c)}
                  >
                    <span className="sym-stat-dot" style={{ background: COMMONALITY_COLORS[c] }} />
                    <strong>{count}</strong>
                    {COMMONALITY_LABELS[c]}
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="sym-toolbar animate-in animate-in-delay-1">
              <div className="sym-search-wrap">
                <svg className="sym-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  className="sym-search"
                  placeholder="Search symptoms, body areas, descriptions…"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>

              <select
                className="sym-filter-select"
                value={commonalityFilter}
                onChange={e => handleCommonality(e.target.value)}
              >
                <option value="">All commonalities</option>
                <option value="RARE">Rare</option>
                <option value="COMMON">Common</option>
                <option value="VERY_COMMON">Very Common</option>
              </select>

              <select
                className="sym-filter-select"
                value={onsetFilter}
                onChange={e => handleOnset(e.target.value)}
              >
                <option value="">All onset speeds</option>
                <option value="ACUTE">Acute</option>
                <option value="SUBACUTE">Subacute</option>
                <option value="CHRONIC">Chronic</option>
              </select>

              {(search || commonalityFilter || onsetFilter) && (
                <button
                  className="btn btn-ghost"
                  style={{ width: 'auto', padding: '10px 14px', fontSize: 13 }}
                  onClick={() => { handleSearch(''); handleCommonality(''); handleOnset('') }}
                >
                  Clear filters
                </button>
              )}
            </div>

            <SymptomList
              symptoms={symptoms}
              loading={loading}
              onViewDetail={handleViewDetail}
              onEdit={s => { setEditingSymptom(s); setViewMode('edit') }}
              onDelete={handleDelete}
            />

            {totalItems > itemsPerPage && (
              <div className="sym-pagination">
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>
                <span className="sym-pagination-info">
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
        {viewMode === 'detail' && selectedSymptom && (
          <SymptomDetail
            symptom={selectedSymptom}
            onEdit={() => { setEditingSymptom(selectedSymptom); setViewMode('edit') }}
            onDelete={() => handleDelete(selectedSymptom.id)}
            onBack={() => { setViewMode('list'); setSelectedSymptom(null) }}
          />
        )}

        {/* Create form */}
        {viewMode === 'create' && (
          <SymptomForm
            allDiseases={allDiseases}
            onSubmit={handleCreate}
            loading={loading}
            onCancel={() => setViewMode('list')}
          />
        )}

        {/* Edit form */}
        {viewMode === 'edit' && editingSymptom && (
          <SymptomForm
            symptom={editingSymptom}
            allDiseases={allDiseases}
            onSubmit={handleUpdate}
            loading={loading}
            onCancel={() => { setViewMode('list'); setEditingSymptom(null) }}
          />
        )}
      </main>
    </div>
  )
}