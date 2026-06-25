import { useState } from 'react'
import type { CatBreed } from './catBreedAPI'

interface Props {
  breed: CatBreed
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
}

export default function CatBreedDetail({ breed, onEdit, onDelete, onBack }: Props) {
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  const hasImages = breed.imageUrls.length > 0

  return (
    <div className="cb-detail">
      {/* Hero */}
      <div className="cb-detail-hero">
        {hasImages && (
          <img
            src={breed.imageUrls[activeImageIdx]}
            alt={breed.name}
            className="cb-detail-hero-img"
          />
        )}
        <div className="cb-detail-hero-content">
          <div className="cb-detail-hero-eyebrow">
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 1a4 4 0 014 4c0 3-4 7-4 7S2 8 2 5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {breed.origin}
          </div>
          <h1 className="cb-detail-hero-name">{breed.name}</h1>
          <div className="cb-detail-hero-meta">
            <span className="cb-detail-hero-badge">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l3 5-3 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {breed.weightRange}
            </span>
            <span className="cb-detail-hero-badge">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {breed.lifespan}
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="cb-detail-actions-bar">
        <button className="btn btn-ghost" style={{ width: 'auto', padding: '9px 14px' }} onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to list
        </button>
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '9px 20px' }} onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
          Edit record
        </button>
        <button className="btn btn-danger" style={{ width: 'auto', padding: '9px 20px' }} onClick={onDelete}>
          Delete
        </button>
      </div>

      {/* Image gallery */}
      {breed.imageUrls.length > 1 && (
        <div className="cb-gallery">
          {breed.imageUrls.map((url, idx) => (
            <button
              key={idx}
              className={`cb-gallery-thumb${idx === activeImageIdx ? ' active' : ''}`}
              onClick={() => setActiveImageIdx(idx)}
            >
              <img src={url} alt={`${breed.name} ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}

      {/* Content grid */}
      <div className="cb-detail-grid">
        {/* Description */}
        <div className="cb-section cb-section-full">
          <div className="cb-section-title">About this breed</div>
          <div className="cb-section-body">
            <p>{breed.description}</p>
          </div>
        </div>

        {/* Physical Appearance */}
        <div className="cb-section">
          <div className="cb-section-title">Physical appearance</div>
          <div className="cb-section-body">
            <p>{breed.physicalAppearance}</p>
          </div>
        </div>

        {/* Personality */}
        <div className="cb-section">
          <div className="cb-section-title">Personality</div>
          <div className="cb-section-body">
            <p>{breed.personality}</p>
          </div>
        </div>

        {/* Vital stats */}
        <div className="cb-section">
          <div className="cb-section-title">Vital statistics</div>
          <div className="cb-section-body">
            <div className="cb-stats-grid">
              <div className="cb-stat-item">
                <div className="cb-stat-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <span className="cb-stat-item-label">Origin</span>
                  <span className="cb-stat-item-value">{breed.origin}</span>
                </div>
              </div>
              <div className="cb-stat-item">
                <div className="cb-stat-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h12M8 2l4 6-4 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <span className="cb-stat-item-label">Weight range</span>
                  <span className="cb-stat-item-value">{breed.weightRange}</span>
                </div>
              </div>
              <div className="cb-stat-item">
                <div className="cb-stat-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <span className="cb-stat-item-label">Lifespan</span>
                  <span className="cb-stat-item-value">{breed.lifespan}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Temperament */}
        <div className="cb-section">
          <div className="cb-section-title">Temperament traits</div>
          <div className="cb-section-body">
            {breed.temperament.length === 0 ? (
              <p className="cb-empty-section">No temperament traits documented.</p>
            ) : (
              <div className="cb-trait-chips-large">
                {breed.temperament.map((trait, idx) => (
                  <span key={idx} className="cb-trait-chip-lg">{trait}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}