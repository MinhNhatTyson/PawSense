import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'
import './VetOnboarding.css'

const STORAGE_PREFIX = 'pawsense_vet_onboarding_seen_'

interface Step {
  kicker: string
  title: string
  description: string
  icon: React.ReactNode
}

const STEPS: Step[] = [
  {
    kicker: 'Step 1 · Welcome',
    title: 'Your clinical knowledge base',
    description:
      'PawSense centralises everything your practice needs — diseases, symptoms, treatments and medicines — in one searchable, veterinarian-curated library.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 14c-5-4-13-5-19-3v34c6-2 14-1 19 3 5-4 13-5 19-3V11c-6-2-14-1-19 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M32 14v34" stroke="currentColor" strokeWidth="1.6" />
        <ellipse cx="32" cy="27" rx="4.5" ry="4" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="26" cy="21" r="1.8" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="38" cy="21" r="1.8" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    kicker: 'Step 2 · Diagnose',
    title: 'Disease & symptom library',
    description:
      "Browse detailed disease records linked to real symptoms, severities and recovery periods — or search by what you're observing in the exam room.",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="27" cy="27" r="14" stroke="currentColor" strokeWidth="1.6" />
        <path d="M37 37l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M27 20v14M20 27h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    kicker: 'Step 3 · Treat',
    title: 'Treatments & medicines',
    description:
      'Reference step-by-step treatment protocols and medicine dosages, each cross-linked to the diseases they address for faster clinical decisions.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="26" width="32" height="16" rx="8" stroke="currentColor" strokeWidth="1.6" transform="rotate(-35 32 34)" />
        <path d="M26 24l14 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" transform="rotate(-35 32 34)" />
        <path d="M32 12v6M26 15h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    kicker: 'Step 4 · Collaborate',
    title: 'AI diagnosis & verification',
    description:
      'Run AI-assisted differential diagnoses from observed symptoms, then help keep the knowledge base accurate by approving or flagging peer-submitted records.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 10l18 7v13c0 12-8 19-18 24-10-5-18-12-18-24V17z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M24 32l6 6 12-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function VetOnboarding() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'VET') return
    const seen = localStorage.getItem(STORAGE_PREFIX + user.id)
    if (!seen) setOpen(true)
  }, [user])

  if (!open || !user) return null

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]!

  function finish() {
    localStorage.setItem(STORAGE_PREFIX + user!.id, '1')
    setOpen(false)
  }

  function handleNext() {
    if (isLast) finish()
    else setStep(s => s + 1)
  }

  return createPortal(
    <div className="vo-backdrop">
      <div className="vo-modal" role="dialog" aria-modal="true" aria-label="Veterinarian onboarding">
        <div className="vo-header">
          <span className="vo-kicker">{current.kicker}</span>
          <button type="button" className="vo-skip" onClick={finish}>
            Skip
          </button>
        </div>

        <div className="vo-icon-wrap">{current.icon}</div>

        <h2 className="vo-title">{current.title}</h2>
        <p className="vo-desc">{current.description}</p>

        <div className="vo-footer">
          <div className="vo-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`vo-dot${i === step ? ' active' : ''}`} />
            ))}
          </div>
          <button type="button" className="btn btn-primary vo-next-btn" onClick={handleNext}>
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}