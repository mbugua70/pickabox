export default function ResetConfirmModal({ onConfirm, onCancel, isResetting }) {
  return (
    <div
      className="confirm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm Reset"
    >
      <div className="confirm-card reset-confirm-card">
        <p className="confirm-eyebrow">Admin Action</p>

        <h2 className="reset-confirm-title">Reset All Boxes?</h2>
        <p className="confirm-question-text">
          All boxes will be returned to their available state.<br />
          This cannot be undone.
        </p>

        <div className="confirm-actions">
          <button
            className="reset-confirm-yes"
            onClick={onConfirm}
            disabled={isResetting}
          >
            <span className="confirm-btn-icon">{isResetting ? '…' : '↺'}</span>
            {isResetting ? 'Resetting…' : 'Yes, Reset All'}
          </button>
          <button
            className="confirm-no"
            onClick={onCancel}
            disabled={isResetting}
          >
            <span className="confirm-btn-icon">✕</span> Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
