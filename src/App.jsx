import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Box from './components/Box'
import ConfirmModal from './components/ConfirmModal'
import QuestionModal from './components/QuestionModal'
import ResetConfirmModal from './components/ResetConfirmModal'
import { fetchQuestions, openBox, resetAll } from './utils/api'
import { playConfirm, playCancel } from './utils/sounds'
import './App.css'

export default function App() {
  const { data: questions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['questions'],
    queryFn: fetchQuestions,
    staleTime: 0,
    refetchInterval: 30_000,        // poll every 30 s
    refetchOnWindowFocus: true,     // refresh when the tab becomes active
  })

  // Local session state: tracks correct/wrong for boxes answered this session
  const [boxStates, setBoxStates] = useState(() => {
    try {
      const saved = localStorage.getItem('picker_box_states')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Persist boxStates to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('picker_box_states', JSON.stringify(boxStates))
  }, [boxStates])

  // Box waiting for confirmation (step 1 of 2)
  const [pendingBox, setPendingBox] = useState(null)

  // Box confirmed — question modal open (step 2 of 2)
  const [selectedBox, setSelectedBox] = useState(null)

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Derive per-box state: API "disabled" persists across refreshes;
  // local session correct/wrong takes precedence for the current session.
  const getBoxState = (index) => {
    const question = questions[index - 1]
    if (!question) return 'idle'
    if (question.box_status === 'disabled') return boxStates[index] || 'done'
    return boxStates[index] || 'idle'
  }

  const answeredCount = questions.filter((_, i) => getBoxState(i + 1) !== 'idle').length
  const correctCount  = Object.values(boxStates).filter((s) => s === 'correct').length
  const isGameComplete = questions.length > 0 && answeredCount === questions.length

  // Step 1: box clicked → show confirmation modal
  const handleBoxClick = (index) => {
    if (getBoxState(index) !== 'idle') return
    setPendingBox(index)
  }

  // Step 2a: confirmed → open question modal
  const handleConfirm = () => {
    playConfirm()
    setSelectedBox(pendingBox)
    setPendingBox(null)
  }

  // Step 2b: cancelled → dismiss
  const handleCancelConfirm = () => {
    playCancel()
    setPendingBox(null)
  }

  // Step 3: answer selected → update local state + persist to backend
  const handleAnswer = (selectedAnswer) => {
    const question = questions[selectedBox - 1]
    const isCorrect = selectedAnswer === question.correct

    setBoxStates((prev) => ({
      ...prev,
      [selectedBox]: isCorrect ? 'correct' : 'wrong',
    }))

    openBox(question.question_id).catch(console.error)
  }

  const handleCloseModal = () => {
    setSelectedBox(null)
    refetch()
  }

  // Reset: show the confirmation modal
  const handleResetRequest = () => {
    setShowResetConfirm(true)
  }

  // Reset: confirmed — call backend then refresh
  const handleResetConfirm = async () => {
    setIsResetting(true)
    try {
      await resetAll()
      setBoxStates({})
      await refetch()
    } catch (e) {
      console.error('Reset failed:', e)
    } finally {
      setIsResetting(false)
      setShowResetConfirm(false)
    }
  }

  const handleResetCancel = () => {
    setShowResetConfirm(false)
  }

  return (
    <>
    {/* Reset button — outside game-container so fixed positioning is never clipped */}
    <button className="reset-btn" onClick={handleResetRequest}>
      ↺ Reset
    </button>

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
                  state={getBoxState(index)}
                  onClick={handleBoxClick}
                />
              ))}
            </div>

            {isGameComplete && (
              <div className="game-complete">
                <div className="game-complete-card">
                  <p className="game-complete-title">Challenge Complete!</p>
                  <div className="results-grid">
                    {questions.map((_, i) => {
                      const boxIndex = i + 1
                      const state = getBoxState(boxIndex)
                      return (
                        <div key={boxIndex} className={`result-badge result-badge-${state}`}>
                          <span className="result-badge-num">{boxIndex}</span>
                          <span className="result-badge-mark">
                            {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <button className="restart-btn" onClick={handleResetRequest}>
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

      {showResetConfirm && (
        <ResetConfirmModal
          onConfirm={handleResetConfirm}
          onCancel={handleResetCancel}
          isResetting={isResetting}
        />
      )}
    </div>
    </>
  )
}
