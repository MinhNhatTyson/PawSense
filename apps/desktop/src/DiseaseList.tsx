import { Disease } from './diseaseAPI'

interface DiseaseListProps {
  diseases: Disease[]
  loading: boolean
  onViewDetail: (disease: Disease) => void
  onEdit: (disease: Disease) => void
  onDelete: (id: string) => void
}

export default function DiseaseList({
  diseases,
  loading,
  onViewDetail,
  onEdit,
  onDelete,
}: DiseaseListProps) {
  if (loading && diseases.length === 0) {
    return <div className="loading">Loading diseases...</div>
  }

  if (diseases.length === 0) {
    return (
      <div className="empty-state">
        <p>No diseases found. Create your first disease record.</p>
      </div>
    )
  }

  return (
    <div className="disease-list">
      {diseases.map((disease) => (
        <div key={disease.id} className="disease-card">
          <div className="disease-card-header">
            <h3>{disease.name}</h3>
            <span className={`severity-badge severity-${disease.severity.toLowerCase()}`}>
              {disease.severity}
            </span>
          </div>

          {disease.imageUrl && (
            <img src={disease.imageUrl} alt={disease.name} className="disease-image" />
          )}

          <p className="disease-description">{disease.description}</p>

          <div className="disease-info">
            <div className="info-item">
              <strong>Symptoms:</strong>
              <span>{disease.symptoms.join(', ') || 'N/A'}</span>
            </div>
            <div className="info-item">
              <strong>Recovery:</strong>
              <span>{disease.recoveryPeriod}</span>
            </div>
          </div>

          <div className="disease-actions">
            <button
              className="btn btn-secondary"
              onClick={() => onViewDetail(disease)}
            >
              View Details
            </button>
            <button
              className="btn btn-info"
              onClick={() => onEdit(disease)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => onDelete(disease.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
