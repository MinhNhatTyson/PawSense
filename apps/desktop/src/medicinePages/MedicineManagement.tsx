import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { medicineAPI, type Medicine } from './medicineAPI'
import { diseaseAPI, type Disease } from '../diseasePages/diseaseAPI'
import { useAuth } from '../contexts/AuthContext'
import { PawLogo } from '../components/PawLogo'
import MedicineList from './MedicineList'
import MedicineDetail from './MedicineDetail'
import MedicineForm from './MedicineForm'
import './MedicineManagement.css'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

const SIDEBAR_NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/diseases',
    label: 'Disease Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/symptoms',
    label: 'Symptom Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/treatments',
    label: 'Treatment Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/medicines',
    label: 'Medicine Library',
    active: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 2h4a1 1 0 011 1v1H5V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" />
        <rect x="3" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7v4M6 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'My Profile',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/change-password',
    label: 'Change Password',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function MedicineManagement() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [allDiseases, setAllDiseases] = useState<Disease[]>([])
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 12

  useEffect(() => {
    loadMedicines()
  }, [currentPage, search])

  useEffect(() => {
    loadAllDiseases()
  }, [])

  const loadMedicines = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await medicineAPI.list(
        currentPage * itemsPerPage,
        itemsPerPage,
        search || undefined
      )
      setMedicines(res.data.data)
      setTotalItems(res.data.pagination.total)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to load medicines')
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
      dosage: string
      sideEffects: string[]
      usageInstructions: string
      warnings: string[]
      manufacturer?: string
      diseaseIds: string[]
    },
    imageFile?: File
  ) => {
    setLoading(true)
    setError(null)
    try {
      await medicineAPI.create(data, imageFile)
      setViewMode('list')
      loadMedicines()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to create medicine')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (
    data: {
      name?: string
      description?: string
      dosage?: string
      sideEffects?: string[]
      usageInstructions?: string
      warnings?: string[]
      manufacturer?: string
      diseaseIds?: string[]
    },
    imageFile?: File
  ) => {
    if (!editingMedicine) return
    setLoading(true)
    setError(null)
    try {
      await medicineAPI.update(editingMedicine.id, data, imageFile)
      setViewMode('list')
      setEditingMedicine(null)
      loadMedicines()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to update medicine')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this medicine record? This action cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      await medicineAPI.delete(id)
      loadMedicines()
      setSelectedMedicine(null)
      setViewMode('list')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to delete medicine')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (medicine: Medicine) => {
    setLoading(true)
    try {
      const res = await medicineAPI.getById(medicine.id)
      setSelectedMedicine(res.data)
      setViewMode('detail')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to load medicine details')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    setCurrentPage(0)
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="med-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <PawLogo size={28} />
          <span className="sidebar-brand-name">
            Paw<span>Sense</span>
          </span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item${item.active ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="nav-item nav-danger"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign out
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.profile?.fullName || 'User'}</div>
          <div className="sidebar-user-role">
            {user?.role === 'VET' ? 'Veterinarian' : 'Pet Owner'}
          </div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
      </aside>

      {/* Main */}
      <main className="med-main">
        {/* Page header — list only */}
        {viewMode === 'list' && (
          <div className="med-page-header animate-in">
            <div>
              <h1 className="med-title">Medicine Library</h1>
              <p className="med-subtitle">
                {totalItems > 0
                  ? `${totalItems} medicine${totalItems !== 1 ? 's' : ''} in the knowledge base`
                  : 'Veterinary medicine knowledge base'}
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '12px 24px' }}
              onClick={() => setViewMode('create')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1v12M1 7h12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              New medicine
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="med-error animate-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 5v3.5M8 11h.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {error}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <>
            <div className="med-toolbar animate-in animate-in-delay-1">
              <div className="med-search-wrap">
                <svg
                  className="med-search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M11 11l3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  className="med-search"
                  placeholder="Search medicines, manufacturers…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
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

            <MedicineList
              medicines={medicines}
              loading={loading}
              onViewDetail={handleViewDetail}
              onEdit={(m) => {
                setEditingMedicine(m)
                setViewMode('edit')
              }}
              onDelete={handleDelete}
            />

            {totalItems > itemsPerPage && (
              <div className="med-pagination">
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>
                <span className="med-pagination-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Detail view */}
        {viewMode === 'detail' && selectedMedicine && (
          <MedicineDetail
            medicine={selectedMedicine}
            onEdit={() => {
              setEditingMedicine(selectedMedicine)
              setViewMode('edit')
            }}
            onDelete={() => handleDelete(selectedMedicine.id)}
            onBack={() => {
              setViewMode('list')
              setSelectedMedicine(null)
            }}
          />
        )}

        {/* Create form */}
        {viewMode === 'create' && (
          <MedicineForm
            allDiseases={allDiseases}
            onSubmit={handleCreate}
            loading={loading}
            onCancel={() => setViewMode('list')}
          />
        )}

        {/* Edit form */}
        {viewMode === 'edit' && editingMedicine && (
          <MedicineForm
            medicine={editingMedicine}
            allDiseases={allDiseases}
            onSubmit={handleUpdate}
            loading={loading}
            onCancel={() => {
              setViewMode('list')
              setEditingMedicine(null)
            }}
          />
        )}
      </main>
    </div>
  )
}