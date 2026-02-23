import { useState } from 'react'

const OPTION_KEYS = ['A', 'B', 'C', 'D']

export default function QuestionModal({ question, onAnswer, onClose }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const hasAnswered = selectedAnswer !== null

  const handleSelect = (key) => {
    if (hasAnswered) return
    setSelectedAnswer(key)
    onAnswer(key)
  }

  const getOptionClass = (key) => {
    if (!hasAnswered) return 'option-btn'
    if (key === question.correct) return 'option-btn option-correct'
    if (key === selectedAnswer) return 'option-btn option-wrong'
    return 'option-btn option-dimmed'
  }

  const resultMessage =
    hasAnswered && selectedAnswer === question.correct
      ? 'Correct!'
      : hasAnswered
      ? `Wrong — the answer was ${question.correct}`
      : null

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-question"
    >
      <div className="modal-card">

        <div className="modal-question-section">
          <div className="modal-header">
            <span className="modal-box-label">Box {question.id}</span>
          </div>
          <p id="modal-question" className="modal-question">
            {question.question}
          </p>
        </div>

        <div className="modal-answers-section">
          <div className="modal-options" role="group" aria-label="Answer options">
            {OPTION_KEYS.map((key) => (
              <button
                key={key}
                className={getOptionClass(key)}
                onClick={() => handleSelect(key)}
                disabled={hasAnswered}
                aria-pressed={selectedAnswer === key}
              >
                <span className="option-letter">{key}</span>
                <span className="option-text">{question.answers[key]}</span>
              </button>
            ))}
          </div>

          {hasAnswered && (
            <div className={`modal-result modal-result-${selectedAnswer === question.correct ? 'correct' : 'wrong'}`}>
              {resultMessage}
            </div>
          )}

          {hasAnswered && (
            <button className="continue-btn" onClick={onClose} autoFocus>
              Continue
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
