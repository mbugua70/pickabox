import { useEffect } from 'react'
import { playBoxSelect } from '../utils/sounds'

export default function ConfirmModal({ boxIndex, onConfirm, onCancel }) {
  // Play the dramatic select sound the moment the modal mounts
  useEffect(() => {
    playBoxSelect()
  }, [])

  return (
    <div className="confirm-backdrop" role="dialog" aria-modal="true" aria-label={`Confirm Box ${boxIndex}`}>
      <div className="confirm-card">

        <p className="confirm-eyebrow">You have selected</p>

        {/* Glowing box image */}
        <div className="confirm-box-stage">
          <div className="confirm-glow-ring" />
          <img
            src="/box-closed-green-2.png"
            alt={`Box ${boxIndex}`}
            className="confirm-box-img"
            draggable={false}
          />
          <div className="confirm-box-badge">{boxIndex}</div>
        </div>

        <h2 className="confirm-box-name">BOX {boxIndex}</h2>
        <p className="confirm-question-text">Are you sure you want to open this box?</p>

        <div className="confirm-actions">
          <button className="confirm-yes" onClick={onConfirm}>
            <span className="confirm-btn-icon">✓</span> Open the Box!
          </button>
          <button className="confirm-no" onClick={onCancel}>
            <span className="confirm-btn-icon">✕</span> Change My Mind
          </button>
        </div>

      </div>
    </div>
  )
}
