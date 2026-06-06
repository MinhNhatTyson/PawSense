import type { Disease } from './diseaseAPI'

interface DiseaseDetailProps {
  disease: Disease
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

export default function DiseaseDetail({
  disease,
  onEdit,
  onDelete,
  onBack,
}: DiseaseDetailProps) {
  return (
    <div className="disease-detail-container">
      <div className="detail-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to List
        </button>
        <div className="detail-actions">
          <button className="btn btn-info" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="disease-detail">
        <div className="detail-main">
          <div className="detail-header-section">
            <h1>{disease.name}</h1>
            <span className={`severity-badge severity-${disease.severity.toLowerCase()}`}>
              {disease.severity} Severity
            </span>
          </div>

          {disease.imageUrl && (
            <img src={disease.imageUrl} alt={disease.name} className="detail-image" />
          )}

          <section className="detail-section">
            <h2>Description</h2>
            <p>{disease.description}</p>
          </section>

          <section className="detail-section">
            <h2>Causes</h2>
            <ul>
              {disease.causes.length > 0 ? (
                disease.causes.map((cause, idx) => (
                  <li key={idx}>{cause}</li>
                ))
              ) : (
                <li>No causes documented</li>
              )}
            </ul>
          </section>

          <section className="detail-section">
            <h2>Symptoms</h2>
            <ul>
              {disease.symptoms.length > 0 ? (
                disease.symptoms.map((symptom, idx) => (
                  <li key={idx}>{symptom}</li>
                ))
              ) : (
                <li>No symptoms documented</li>
              )}
            </ul>
          </section>

          <section className="detail-section">
            <h2>Prevention Methods</h2>
            <ul>
              {disease.preventionMethods.length > 0 ? (
                disease.preventionMethods.map((method, idx) => (
                  <li key={idx}>{method}</li>
                ))
              ) : (
                <li>No prevention methods documented</li>
              )}
            </ul>
          </section>

          <section className="detail-section">
            <h2>Treatment Methods</h2>
            <ul>
              {disease.treatmentMethods.length > 0 ? (
                disease.treatmentMethods.map((method, idx) => (
                  <li key={idx}>{method}</li>
                ))
              ) : (
                <li>No treatment methods documented</li>
              )}
            </ul>
          </section>

          <section className="detail-section">
            <h2>Recovery Period</h2>
            <p>{disease.recoveryPeriod}</p>
          </section>

          {disease.relatedDiseasesFrom && disease.relatedDiseasesFrom.length > 0 && (
            <section className="detail-section">
              <h2>Related Diseases</h2>
              <ul>
                {disease.relatedDiseasesFrom.map((relation) => (
                  <li key={relation.diseaseTo.id}>{relation.diseaseTo.name}</li>
                ))}
              </ul>
            </section>
          )}

          {disease.medicines && disease.medicines.length > 0 && (
            <section className="detail-section">
              <h2>Associated Medicines</h2>
              <div className="medicines-list">
                {disease.medicines.map((medicine) => (
                  <div key={medicine.id} className="medicine-item">
                    <strong>{medicine.name}</strong>
                    <span>{medicine.dosage}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
