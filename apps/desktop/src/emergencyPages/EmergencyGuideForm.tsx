import { useState } from 'react'
import type { EmergencyGuide, EmergencyGuideInput, Urgency } from './emergencyAPI'
import { EMERGENCY_CATEGORIES } from './emergencyData'

interface Props {
  guide?: EmergencyGuide
  onSubmit: (data: EmergencyGuideInput, imageFile?: File) => void
  loading: boolean
  onCancel: () => void
}

export default function EmergencyGuideForm({ guide, onSubmit, loading, onCancel }: Props) {
  const [title, setTitle] = useState(guide?.title || '')
  const [category, setCategory] = useState(guide?.category || EMERGENCY_CATEGORIES[0])
  const [urgency, setUrgency] = useState<Urgency>(guide?.urgency || 'URGENT')
  const [summary, setSummary] = useState(guide?.summary || '')
  const [emergencySymptoms, setEmergencySymptoms] = useState(guide?.emergencySymptoms.join('\n') || '')
  const [firstAidSteps, setFirstAidSteps] = useState(guide?.firstAidSteps.join('\n') || '')
  const [doNots, setDoNots] = useState(guide?.doNots.join('\n') || '')
  const [whenToSeekVet, setWhenToSeekVet] = useState(guide?.whenToSeekVet || '')
  const [imageFile, setImageFile] = useState<File | undefined>()

  const isEditing = !!guide
  const parseLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title, category, urgency, summary,
      emergencySymptoms: parseLines(emergencySymptoms),
      firstAidSteps: parseLines(firstAidSteps),
      doNots: parseLines(doNots),
      whenToSeekVet,
    }, imageFile)
  }

  return (
    <div className="eg-form-shell">
      <div className="eg-form-header">
        <h2 className="eg-form-title">{isEditing ? `Edit: ${guide.title}` : 'New Emergency Guide'}</h2>
        <p className="eg-form-subtitle">
          {isEditing
            ? 'Saving will reset this record to Draft for peer re-review.'
            : 'New guides start as Draft and require approval from another veterinarian before showing as verified.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="eg-form-card">
          <div className="eg-form-section-title">Core information</div>

          <div className="form-field">
            <label className="form-label" htmlFor="eg-title">Emergency title *</label>
            <input id="eg-title" type="text" className="form-input" value={title}
              onChange={e => setTitle(e.target.value)} placeholder="e.g. Suspected Poisoning" required disabled={loading} />
          </div>

          <div className="eg-form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="eg-category">Category *</label>
              <select id="eg-category" className="eg-select" value={category}
                onChange={e => setCategory(e.target.value)} disabled={loading}>
                {EMERGENCY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="eg-urgency">Urgency *</label>
              <select id="eg-urgency" className="eg-select" value={urgency}
                onChange={e => setUrgency(e.target.value as Urgency)} disabled={loading}>
                <option value="CRITICAL">Critical</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="eg-summary">Summary *</label>
            <textarea id="eg-summary" className="eg-textarea" rows={3} value={summary}
              onChange={e => setSummary(e.target.value)} required disabled={loading}
              placeholder="One or two sentences describing the emergency and typical cause…" />
          </div>
        </div>

        <div className="eg-form-card">
          <div className="eg-form-section-title">Clinical detail</div>

          <div className="form-field">
            <label className="form-label" htmlFor="eg-symptoms">Emergency symptoms</label>
            <textarea id="eg-symptoms" className="eg-textarea" rows={5} value={emergencySymptoms}
              onChange={e => setEmergencySymptoms(e.target.value)} disabled={loading}
              placeholder={'Vomiting or drooling\nDisorientation\nSeizures'} />
            <span style={{ fontSize: 11, color: 'var(--text-light)' }}>One entry per line</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="eg-firstaid">First-aid steps</label>
            <textarea id="eg-firstaid" className="eg-textarea" rows={6} value={firstAidSteps}
              onChange={e => setFirstAidSteps(e.target.value)} disabled={loading}
              placeholder={'Move the animal away from the source\nCall emergency vet immediately'} />
            <span style={{ fontSize: 11, color: 'var(--text-light)' }}>One step per line, in order</span>
          </div>

          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="eg-donots">Do NOTs</label>
            <textarea id="eg-donots" className="eg-textarea" rows={4} value={doNots}
              onChange={e => setDoNots(e.target.value)} disabled={loading}
              placeholder={'Do not induce vomiting without guidance'} />
            <span style={{ fontSize: 11, color: 'var(--text-light)' }}>One entry per line</span>
          </div>
        </div>

        <div className="eg-form-card">
          <div className="eg-form-section-title">Escalation</div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="eg-whentovet">When to seek veterinary care *</label>
            <textarea id="eg-whentovet" className="eg-textarea" rows={2} value={whenToSeekVet}
              onChange={e => setWhenToSeekVet(e.target.value)} required disabled={loading} />
          </div>
        </div>

        <div className="eg-form-card">
          <div className="eg-form-section-title">Reference image (optional)</div>
          <input type="file" accept="image/*" disabled={loading}
            onChange={e => setImageFile(e.target.files?.[0])} />
        </div>

        <div className="eg-form-actions">
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', flex: 1 }} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Create guide (submits for review)'}
          </button>
          <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}