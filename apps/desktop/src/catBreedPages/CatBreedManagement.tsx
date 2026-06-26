import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { catBreedAPI, type CatBreed } from './catBreedAPI'
import { useAuth } from '../contexts/AuthContext'
import { PawLogo } from '../components/PawLogo'
import CatBreedList from './CatBreedList'
import CatBreedDetail from './CatBreedDetail'
import CatBreedForm from './CatBreedForm'
import { Sidebar } from '../components/Sidebar'
import './CatBreedManagement.css'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

const SIDEBAR_NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: '/diseases',
    label: 'Disease Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/symptoms',
    label: 'Symptom Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: '/treatments',
    label: 'Treatment Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: '/medicines',
    label: 'Medicine Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 2h4a1 1 0 011 1v1H5V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="3" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 7v4M6 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/cat-breeds',
    label: 'Cat Breeds',
    active: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <polygon points="4.5,4 3,1 6,3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
        <polygon points="11.5,4 13,1 10,3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
        <path d="M2 14c0-3.314 2.686-4.5 6-4.5s6 1.186 6 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'My Profile',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/change-password',
    label: 'Change Password',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function CatBreedManagement() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [breeds, setBreeds] = useState<CatBreed[]>([])
  const [selectedBreed, setSelectedBreed] = useState<CatBreed | null>(null)
  const [editingBreed, setEditingBreed] = useState<CatBreed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 12

  useEffect(() => { loadBreeds() }, [currentPage, search])

  const loadBreeds = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await catBreedAPI.list(
        currentPage * itemsPerPage,
        itemsPerPage,
        search || undefined
      )
      setBreeds(res.data.data)
      setTotalItems(res.data.pagination.total)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to load cat breeds')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (
    data: {
      name: string
      origin: string
      description: string
      physicalAppearance: string
      weightRange: string
      lifespan: string
      temperament: string[]
      personality: string
      existingImageUrls?: string[]
    },
    imageFiles?: File[]
  ) => {
    setLoading(true)
    setError(null)
    try {
      await catBreedAPI.create(data, imageFiles)
      setViewMode('list')
      loadBreeds()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to create cat breed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (
    data: {
      name?: string
      origin?: string
      description?: string
      physicalAppearance?: string
      weightRange?: string
      lifespan?: string
      temperament?: string[]
      personality?: string
      existingImageUrls?: string[]
    },
    imageFiles?: File[]
  ) => {
    if (!editingBreed) return
    setLoading(true)
    setError(null)
    try {
      await catBreedAPI.update(editingBreed.id, data, imageFiles)
      setViewMode('list')
      setEditingBreed(null)
      loadBreeds()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to update cat breed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this cat breed record? This action cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      await catBreedAPI.delete(id)
      loadBreeds()
      setSelectedBreed(null)
      setViewMode('list')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to delete cat breed')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (breed: CatBreed) => {
    setLoading(true)
    try {
      const res = await catBreedAPI.getById(breed.id)
      setSelectedBreed(res.data)
      setViewMode('detail')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to load breed details')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => { setSearch(q); setCurrentPage(0) }
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="cb-shell">
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <main className="cb-main">
        {/* Page header — list only */}
        {viewMode === 'list' && (
          <div className="cb-page-header animate-in">
            <div>
              <h1 className="cb-title">Cat Breeds</h1>
              <p className="cb-subtitle">
                {totalItems > 0
                  ? `${totalItems} breed${totalItems !== 1 ? 's' : ''} in the knowledge base`
                  : 'Feline breed knowledge base'}
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
              Add breed
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="cb-error animate-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* ── List view ── */}
        {viewMode === 'list' && (
          <>
            <div className="cb-toolbar animate-in animate-in-delay-1">
              <div className="cb-search-wrap">
                <svg className="cb-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  className="cb-search"
                  placeholder="Search breeds, origins, personality traits…"
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

            <CatBreedList
              breeds={breeds}
              loading={loading}
              onViewDetail={handleViewDetail}
              onEdit={b => { setEditingBreed(b); setViewMode('edit') }}
              onDelete={handleDelete}
            />

            {totalItems > itemsPerPage && (
              <div className="cb-pagination">
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>
                <span className="cb-pagination-info">
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

        {/* ── Detail view ── */}
        {viewMode === 'detail' && selectedBreed && (
          <CatBreedDetail
            breed={selectedBreed}
            onEdit={() => { setEditingBreed(selectedBreed); setViewMode('edit') }}
            onDelete={() => handleDelete(selectedBreed.id)}
            onBack={() => { setViewMode('list'); setSelectedBreed(null) }}
          />
        )}

        {/* ── Create form ── */}
        {viewMode === 'create' && (
          <CatBreedForm
            onSubmit={handleCreate}
            loading={loading}
            onCancel={() => setViewMode('list')}
          />
        )}

        {/* ── Edit form ── */}
        {viewMode === 'edit' && editingBreed && (
          <CatBreedForm
            breed={editingBreed}
            onSubmit={handleUpdate}
            loading={loading}
            onCancel={() => { setViewMode('list'); setEditingBreed(null) }}
          />
        )}
      </main>
    </div>
  )
}