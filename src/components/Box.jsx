export default function Box({ index, state, onClick }) {
  const isAnswered = state === 'correct' || state === 'wrong'

  const handleClick = () => {
    if (!isAnswered) onClick(index)
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isAnswered) {
      e.preventDefault()
      onClick(index)
    }
  }

  return (
    <div
      className={`box-wrapper box-state-${state}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isAnswered ? -1 : 0}
      aria-label={`Box ${index}${isAnswered ? ` — ${state}` : ''}`}
      aria-disabled={isAnswered}
    >
      <div className="box-index-badge">{index}</div>

      <div className="box-image-container">
        <img
          src="/box-closed-green-2.png"
          alt={`Box ${index}`}
          className="box-image"
          draggable={false}
        />

        {isAnswered && (
          <div className={`box-result-overlay box-result-${state}`}>
            {state === 'correct' ? '✓' : '✗'}
          </div>
        )}
      </div>
    </div>
  )
}
