import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Box from './components/Box'
import ConfirmModal from './components/ConfirmModal'
import QuestionModal from './components/QuestionModal'
import { fetchQuestions } from './utils/api'
import { playConfirm, playCancel } from './utils/sounds'
import './App.css'

export default function App() {
  const { data: questions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['questions'],
    queryFn: fetchQuestions,
    staleTime: 5 * 60 * 1000,
  })

  // { [boxIndex]: 'correct' | 'wrong' }
  const [boxStates, setBoxStates] = useState({})

  // Box waiting for confirmation (step 1 of 2)
  const [pendingBox, setPendingBox] = useState(null)

  // Box confirmed — question modal open (step 2 of 2)
  const [selectedBox, setSelectedBox] = useState(null)

  const answeredCount = Object.keys(boxStates).length
  const correctCount = Object.values(boxStates).filter((s) => s === 'correct').length
  const isGameComplete = questions.length > 0 && answeredCount === questions.length

  // Step 1: box clicked → show confirmation modal + play select sound
  const handleBoxClick = (index) => {
    if (boxStates[index]) return
    setPendingBox(index)
  }

  // Step 2a: user confirmed → open question modal + play confirm sound
  const handleConfirm = () => {
    playConfirm()
    setSelectedBox(pendingBox)
    setPendingBox(null)
  }

  // Step 2b: user cancelled → dismiss + play cancel sound
  const handleCancelConfirm = () => {
    playCancel()
    setPendingBox(null)
  }

  const handleAnswer = (selectedAnswer) => {
    const question = questions[selectedBox - 1]
    const isCorrect = selectedAnswer === question.correct
    setBoxStates((prev) => ({
      ...prev,
      [selectedBox]: isCorrect ? 'correct' : 'wrong',
    }))
  }

  const handleCloseModal = () => {
    setSelectedBox(null)
  }

  const handleRestart = () => {
    setBoxStates({})
    setPendingBox(null)
    setSelectedBox(null)
  }

  return (
    <div className="game-container">
      {/* The ::before pseudo-element in CSS handles the blurred background image */}

      <div className="game-content">
        <header className="game-header">
          <div className="header-titles">
            <p className="game-eyebrow">Race to 2030 · SDG Challenge</p>
            <h1 className="game-title">PICK A BOX</h1>
            <p className="game-subtitle">Choose a box to reveal your question</p>
          </div>

          {answeredCount > 0 && !isGameComplete && (
            <div className="score-tracker">
              <div className="score-item score-correct">
                <span className="score-num">{correctCount}</span>
                <span className="score-label">Correct</span>
              </div>
              <div className="score-sep" />
              <div className="score-item score-total">
                <span className="score-num">{answeredCount} / {questions.length}</span>
                <span className="score-label">Answered</span>
              </div>
            </div>
          )}
        </header>

        {isLoading && (
          <div className="fetch-state">
            <div className="fetch-spinner" />
            <p className="fetch-text">Loading questions…</p>
          </div>
        )}

        {isError && (
          <div className="fetch-state">
            <p className="fetch-error">Couldn't load questions. Check your connection and try again.</p>
            <button className="restart-btn" onClick={() => refetch()}>Retry</button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="boxes-grid" role="grid" aria-label="Pick a box">
              {Array.from({ length: questions.length }, (_, i) => i + 1).map((index) => (
                <Box
                  key={index}
                  index={index}
                  state={boxStates[index] || 'idle'}
                  onClick={handleBoxClick}
                />
              ))}
            </div>

            {isGameComplete && (
              <div className="game-complete">
                <div className="game-complete-card">
                  <p className="game-complete-title">Challenge Complete!</p>
                  <p className="game-complete-score">
                    You scored{' '}
                    <strong>
                      {correctCount} / {questions.length}
                    </strong>
                  </p>
                  <button className="restart-btn" onClick={handleRestart}>
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </>

)}
      </div>

      {pendingBox !== null && (
        <ConfirmModal
          boxIndex={pendingBox}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />
      )}

      {selectedBox !== null && (
        <QuestionModal
          question={questions[selectedBox - 1]}
          onAnswer={handleAnswer}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
