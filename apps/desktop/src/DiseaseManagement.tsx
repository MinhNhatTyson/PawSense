import { useState, useEffect } from 'react'
import { diseaseAPI, Disease } from './diseaseAPI'
import DiseaseList from './DiseaseList'
import DiseaseDetail from './DiseaseDetail'
import DiseaseForm from './DiseaseForm'
import './DiseaseManagement.css'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

export default function DiseaseManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    loadDiseases()
  }, [currentPage, search, severity])

  const loadDiseases = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await diseaseAPI.list(
        currentPage * itemsPerPage,
        itemsPerPage,
        search || undefined,
        severity || undefined
      )
      setDiseases(response.data.data)
      setTotalItems(response.data.pagination.total)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load diseases')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDisease = async (
    formData: Omit<Disease, 'id' | 'createdAt' | 'updatedAt'> & {
      relatedDiseaseIds?: string[]
    },
    imageFile?: File
  ) => {
    setLoading(true)
    setError(null)
    try {
      await diseaseAPI.create(formData, imageFile)
      setViewMode('list')
      loadDiseases()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create disease')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDisease = async (
    formData: Partial<Disease> & { relatedDiseaseIds?: string[] },
    imageFile?: File
  ) => {
    if (!editingDisease) return
    setLoading(true)
    setError(null)
    try {
      await diseaseAPI.update(editingDisease.id, formData, imageFile)
      setViewMode('list')
      setEditingDisease(null)
      loadDiseases()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update disease')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDisease = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this disease?')) return

    setLoading(true)
    setError(null)
    try {
      await diseaseAPI.delete(id)
      loadDiseases()
      setSelectedDisease(null)
      setViewMode('list')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete disease')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (disease: Disease) => {
    setLoading(true)
    try {
      const response = await diseaseAPI.getById(disease.id)
      setSelectedDisease(response.data)
      setViewMode('detail')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load disease details')
    } finally {
      setLoading(false)
    }
  }

  const handleEditDisease = (disease: Disease) => {
    setEditingDisease(disease)
    setViewMode('edit')
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    setCurrentPage(0)
  }

  const handleSeverityChange = (newSeverity: string) => {
    setSeverity(newSeverity)
    setCurrentPage(0)
  }

  return (
    <div className="disease-management">
      <header className="disease-header">
        <h1>Disease Management</h1>
        {viewMode === 'list' && (
          <button
            className="btn btn-primary"
            onClick={() => setViewMode('create')}
          >
            + New Disease
          </button>
        )}
      </header>

      {error && <div className="error-banner">{error}</div>}

      {viewMode === 'list' && (
        <>
          <div className="filters">
            <input
              type="text"
              placeholder="Search diseases..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={severity}
              onChange={(e) => handleSeverityChange(e.target.value)}
              className="severity-filter"
            >
              <option value="">All Severity Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <DiseaseList
            diseases={diseases}
            loading={loading}
            onViewDetail={handleViewDetail}
            onEdit={handleEditDisease}
            onDelete={handleDeleteDisease}
          />

          {totalItems > itemsPerPage && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </button>
              <span>
                Page {currentPage + 1} of {Math.ceil(totalItems / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={
                  (currentPage + 1) * itemsPerPage >= totalItems
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {viewMode === 'detail' && selectedDisease && (
        <DiseaseDetail
          disease={selectedDisease}
          onEdit={() => handleEditDisease(selectedDisease)}
          onDelete={() => handleDeleteDisease(selectedDisease.id)}
          onBack={() => {
            setViewMode('list')
            setSelectedDisease(null)
          }}
        />
      )}

      {viewMode === 'create' && (
        <DiseaseForm
          onSubmit={handleCreateDisease}
          loading={loading}
          allDiseases={diseases}
          onCancel={() => setViewMode('list')}
        />
      )}

      {viewMode === 'edit' && editingDisease && (
        <DiseaseForm
          disease={editingDisease}
          onSubmit={handleUpdateDisease}
          loading={loading}
          allDiseases={diseases}
          onCancel={() => {
            setViewMode('list')
            setEditingDisease(null)
          }}
        />
      )}
    </div>
  )
}
