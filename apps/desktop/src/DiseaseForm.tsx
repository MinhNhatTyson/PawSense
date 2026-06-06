import { useState } from 'react'
import type { Disease } from './diseaseAPI'

interface DiseaseFormProps {
  disease?: Disease
  allDiseases: Disease[]
  onSubmit: (
    formData: Omit<Disease, 'id' | 'createdAt' | 'updatedAt'> & {
      relatedDiseaseIds?: string[]
    },
    imageFile?: File
  ) => void
  loading: boolean
  onCancel: () => void
}

export default function DiseaseForm({
  disease,
  allDiseases,
  onSubmit,
  loading,
  onCancel,
}: DiseaseFormProps) {
  const [formData, setFormData] = useState({
    name: disease?.name || '',
    description: disease?.description || '',
    causes: disease?.causes.join('\n') || '',
    symptoms: disease?.symptoms.join('\n') || '',
    severity: disease?.severity || 'MEDIUM',
    preventionMethods: disease?.preventionMethods.join('\n') || '',
    treatmentMethods: disease?.treatmentMethods.join('\n') || '',
    recoveryPeriod: disease?.recoveryPeriod || '',
    relatedDiseaseIds: disease?.relatedDiseasesFrom?.map(r => r.diseaseTo.id) || [],
  })

  const [imageFile, setImageFile] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    disease?.imageUrl
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRelatedDiseaseToggle = (diseaseId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedDiseaseIds: prev.relatedDiseaseIds.includes(diseaseId)
        ? prev.relatedDiseaseIds.filter((id) => id !== diseaseId)
        : [...prev.relatedDiseaseIds, diseaseId],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      name: formData.name,
      description: formData.description,
      causes: formData.causes
        .split('\n')
        .map((c) => c.trim())
        .filter((c) => c),
      symptoms: formData.symptoms
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s),
      severity: formData.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      preventionMethods: formData.preventionMethods
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p),
      treatmentMethods: formData.treatmentMethods
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t),
      recoveryPeriod: formData.recoveryPeriod,
      relatedDiseaseIds: formData.relatedDiseaseIds,
    }

    onSubmit(submitData, imageFile)
  }

  return (
    <div className="disease-form-container">
      <form className="disease-form" onSubmit={handleSubmit}>
        <h2>{disease ? 'Edit Disease' : 'Create New Disease'}</h2>

        <div className="form-section">
          <label>
            Disease Name *
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              placeholder="e.g., Canine Parvovirus"
            />
          </label>

          <label>
            Description *
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              required
              placeholder="Detailed description of the disease"
              rows={4}
            />
          </label>

          <label>
            Severity Level *
            <select
              value={formData.severity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, severity: e.target.value }))
              }
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </label>
        </div>

        <div className="form-section">
          <label>
            Causes (one per line)
            <textarea
              value={formData.causes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, causes: e.target.value }))
              }
              placeholder="Viral infection&#10;Bacterial contamination"
              rows={3}
            />
          </label>

          <label>
            Symptoms (one per line) *
            <textarea
              value={formData.symptoms}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, symptoms: e.target.value }))
              }
              placeholder="Fever&#10;Vomiting&#10;Diarrhea"
              rows={3}
              required
            />
          </label>

          <label>
            Prevention Methods (one per line)
            <textarea
              value={formData.preventionMethods}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preventionMethods: e.target.value,
                }))
              }
              placeholder="Regular vaccination&#10;Proper hygiene"
              rows={3}
            />
          </label>

          <label>
            Treatment Methods (one per line) *
            <textarea
              value={formData.treatmentMethods}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  treatmentMethods: e.target.value,
                }))
              }
              placeholder="Antibiotics&#10;Supportive care"
              rows={3}
              required
            />
          </label>

          <label>
            Recovery Period *
            <input
              type="text"
              value={formData.recoveryPeriod}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  recoveryPeriod: e.target.value,
                }))
              }
              placeholder="e.g., 7-14 days"
              required
            />
          </label>
        </div>

        <div className="form-section">
          <label>
            Disease Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Disease preview" />
            </div>
          )}
        </div>

        {allDiseases.length > 0 && (
          <div className="form-section">
            <label>Related Diseases</label>
            <div className="related-diseases-list">
              {allDiseases
                .filter((d) => d.id !== disease?.id)
                .map((d) => (
                  <label key={d.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.relatedDiseaseIds.includes(d.id)}
                      onChange={() => handleRelatedDiseaseToggle(d.id)}
                    />
                    {d.name}
                  </label>
                ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : disease ? 'Update Disease' : 'Create Disease'}
          </button>
        </div>
      </form>
    </div>
  )
}
