import { useState } from 'react'
import Box from './components/Box'
import ConfirmModal from './components/ConfirmModal'
import QuestionModal from './components/QuestionModal'
import { playConfirm, playCancel } from './utils/sounds'
import './App.css'

// ---------------------------------------------------------------------------
// Placeholder questions — swap this for your real API fetch when ready.
// Box index N maps to questions[N - 1]  (box 1 → questions[0], etc.)
// ---------------------------------------------------------------------------
const PLACEHOLDER_QUESTIONS = [
  {
    id: 1,
    question: 'What does SDG stand for?',
    answers: {
      A: 'Sustainable Development Goals',
      B: 'Social Development Groups',
      C: 'Strategic Digital Growth',
      D: 'Safaricom Digital Guidance',
    },
    correct: 'A',
  },
  {
    id: 2,
    question: 'By which year does the UN aim to achieve the Sustainable Development Goals?',
    answers: { A: '2025', B: '2030', C: '2035', D: '2040' },
    correct: 'B',
  },
  {
    id: 3,
    question: 'How many Sustainable Development Goals are there in total?',
    answers: { A: '10', B: '15', C: '17', D: '20' },
    correct: 'C',
  },
  {
    id: 4,
    question: "Which SDG focuses on 'Zero Hunger'?",
    answers: { A: 'SDG 1', B: 'SDG 2', C: 'SDG 3', D: 'SDG 4' },
    correct: 'B',
  },
  {
    id: 5,
    question: "Which SDG is about 'Good Health and Well-being'?",
    answers: { A: 'SDG 2', B: 'SDG 3', C: 'SDG 4', D: 'SDG 5' },
    correct: 'B',
  },
  {
    id: 6,
    question: "Which SDG addresses 'Quality Education'?",
    answers: { A: 'SDG 3', B: 'SDG 4', C: 'SDG 5', D: 'SDG 6' },
    correct: 'B',
  },
  {
    id: 7,
    question: "Which SDG focuses on 'Climate Action'?",
    answers: { A: 'SDG 11', B: 'SDG 12', C: 'SDG 13', D: 'SDG 14' },
    correct: 'C',
  },
  {
    id: 8,
    question: "Which SDG is about 'Affordable and Clean Energy'?",
    answers: { A: 'SDG 5', B: 'SDG 6', C: 'SDG 7', D: 'SDG 8' },
    correct: 'C',
  },
  {
    id: 9,
    question: "Which SDG covers 'Reduced Inequalities'?",
    answers: { A: 'SDG 8', B: 'SDG 9', C: 'SDG 10', D: 'SDG 11' },
    correct: 'C',
  },
  {
    id: 10,
    question: "Which SDG focuses on 'Life on Land'?",
    answers: { A: 'SDG 13', B: 'SDG 14', C: 'SDG 15', D: 'SDG 16' },
    correct: 'C',
  },
]

export default function App() {
  // When you have the real API, replace PLACEHOLDER_QUESTIONS with a fetch
  // e.g. useEffect(() => { fetch('/api/questions').then(...).then(setQuestions) }, [])
  const [questions] = useState(PLACEHOLDER_QUESTIONS)

  // { [boxIndex]: 'correct' | 'wrong' }
  const [boxStates, setBoxStates] = useState({})

  // Box waiting for confirmation (step 1 of 2)
  const [pendingBox, setPendingBox] = useState(null)

  // Box confirmed — question modal open (step 2 of 2)
  const [selectedBox, setSelectedBox] = useState(null)

  const answeredCount = Object.keys(boxStates).length
  const correctCount = Object.values(boxStates).filter((s) => s === 'correct').length
  const isGameComplete = answeredCount === questions.length

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
