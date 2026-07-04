import { useState, useEffect } from 'react'
import { catFoodAPI, type CatFood, type FoodCategory, type FoodType } from './catFoodAPI'
import { diseaseAPI, type Disease } from '../diseasePages/diseaseAPI'
import { Sidebar } from '../components/Sidebar'
import CatFoodList, { CATEGORY_CONFIG, FOOD_TYPE_LABELS } from './CatFoodList'
import CatFoodDetail from './CatFoodDetail'
import CatFoodForm from './CatFoodForm'
import type { CatFoodInput } from './catFoodAPI'
import './CatFoodManagement.css'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

const CATEGORY_COLORS: Record<FoodCategory, string> = {
  KITTEN:       '#4338ca',
  ADULT:        '#2d7a4f',
  SENIOR:       '#8b6340',
  PRESCRIPTION: '#c0392b',
}

export default function CatFoodManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [foods, setFoods] = useState<CatFood[]>([])
  const [allDiseases, setAllDiseases] = useState<Disease[]>([])
  const [selectedFood, setSelectedFood] = useState<CatFood | null>(null)
  const [editingFood, setEditingFood] = useState<CatFood | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [foodTypeFilter, setFoodTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 12

  useEffect(() => { loadFoods() }, [currentPage, search, categoryFilter, foodTypeFilter])
  useEffect(() => { loadAllDiseases() }, [])

  const loadFoods = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await catFoodAPI.list(
        currentPage * itemsPerPage,
        itemsPerPage,
        search || undefined,
        categoryFilter || undefined,
        foodTypeFilter || undefined,
      )
      setFoods(res.data.data)
      setTotalItems(res.data.pagination.total)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to load cat food records')
    } finally {
      setLoading(false)
    }
  }

  const loadAllDiseases = async () => {
    try {
      const res = await diseaseAPI.list(0, 200)
      setAllDiseases(res.data.data)
    } catch { /* non-critical */ }
  }

  const handleCreate = async (data: CatFoodInput, imageFile?: File) => {
    setLoading(true)
    setError(null)
    try {
      await catFoodAPI.create(data, imageFile)
      setViewMode('list')
      loadFoods()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to create cat food record')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (data: CatFoodInput, imageFile?: File) => {
    if (!editingFood) return
    setLoading(true)
    setError(null)
    try {
      await catFoodAPI.update(editingFood.id, data, imageFile)
      setViewMode('list')
      setEditingFood(null)
      loadFoods()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to update cat food record')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this cat food record? This action cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      await catFoodAPI.delete(id)
      loadFoods()
      setSelectedFood(null)
      setViewMode('list')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to delete cat food record')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (food: CatFood) => {
    setLoading(true)
    try {
      const res = await catFoodAPI.getById(food.id)
      setSelectedFood(res.data)
      setViewMode('detail')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Failed to load food details')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q: string) => { setSearch(q); setCurrentPage(0) }
  const handleCategoryFilter = (c: string) => { setCategoryFilter(c); setCurrentPage(0) }
  const handleFoodTypeFilter = (t: string) => { setFoodTypeFilter(t); setCurrentPage(0) }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Count per category for stat chips
  const categoryCounts = foods.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="cf-shell">
      <Sidebar />

      <main className="cf-main">
        {/* Page header */}
        {viewMode === 'list' && (
          <div className="cf-page-header animate-in">
            <div>
              <h1 className="cf-title">Cat Food Library</h1>
              <p className="cf-subtitle">
                {totalItems > 0
                  ? `${totalItems} product${totalItems !== 1 ? 's' : ''} in the knowledge base`
                  : 'Feline nutrition knowledge base'}
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
              New food product
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="cf-error animate-in">
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
            {/* Category stat chips */}
            {totalItems > 0 && (
              <div className="cf-stats animate-in animate-in-delay-1">
                {(Object.keys(categoryCounts) as FoodCategory[]).map(cat => (
                  <div
                    key={cat}
                    className={`cf-stat-chip${categoryFilter === cat ? ' active' : ''}`}
                    onClick={() => handleCategoryFilter(categoryFilter === cat ? '' : cat)}
                  >
                    <span className="cf-stat-dot" style={{ background: CATEGORY_COLORS[cat] }} />
                    <strong>{categoryCounts[cat]}</strong>
                    {CATEGORY_CONFIG[cat].label}
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="cf-toolbar animate-in animate-in-delay-1">
              <div className="cf-search-wrap">
                <svg className="cf-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  className="cf-search"
                  placeholder="Search foods, brands, descriptions…"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>

              <select
                className="cf-filter-select"
                value={categoryFilter}
                onChange={e => handleCategoryFilter(e.target.value)}
              >
                <option value="">All categories</option>
                <option value="KITTEN">Kitten</option>
                <option value="ADULT">Adult</option>
                <option value="SENIOR">Senior</option>
                <option value="PRESCRIPTION">Prescription</option>
              </select>

              <select
                className="cf-filter-select"
                value={foodTypeFilter}
                onChange={e => handleFoodTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                {(Object.keys(FOOD_TYPE_LABELS) as FoodType[]).map(t => (
                  <option key={t} value={t}>{FOOD_TYPE_LABELS[t]}</option>
                ))}
              </select>

              {(search || categoryFilter || foodTypeFilter) && (
                <button
                  className="btn btn-ghost"
                  style={{ width: 'auto', padding: '10px 14px', fontSize: 13 }}
                  onClick={() => { handleSearch(''); handleCategoryFilter(''); handleFoodTypeFilter('') }}
                >
                  Clear filters
                </button>
              )}
            </div>

            <CatFoodList
              foods={foods}
              loading={loading}
              onViewDetail={handleViewDetail}
              onEdit={f => { setEditingFood(f); setViewMode('edit') }}
              onDelete={handleDelete}
            />

            {totalItems > itemsPerPage && (
              <div className="cf-pagination">
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '9px 18px', fontSize: 13 }}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>
                <span className="cf-pagination-info">
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
        {viewMode === 'detail' && selectedFood && (
          <CatFoodDetail
            food={selectedFood}
            onEdit={() => { setEditingFood(selectedFood); setViewMode('edit') }}
            onDelete={() => handleDelete(selectedFood.id)}
            onBack={() => { setViewMode('list'); setSelectedFood(null) }}
          />
        )}

        {/* Create form */}
        {viewMode === 'create' && (
          <CatFoodForm
            allDiseases={allDiseases}
            onSubmit={handleCreate}
            loading={loading}
            onCancel={() => setViewMode('list')}
          />
        )}

        {/* Edit form */}
        {viewMode === 'edit' && editingFood && (
          <CatFoodForm
            food={editingFood}
            allDiseases={allDiseases}
            onSubmit={handleUpdate}
            loading={loading}
            onCancel={() => { setViewMode('list'); setEditingFood(null) }}
          />
        )}
      </main>
    </div>
  )
}