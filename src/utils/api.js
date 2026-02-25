const API_URL      = 'https://www.gamify.co.ke/api/load_boxes.php'
const OPEN_BOX_URL = 'https://www.gamify.co.ke/api/open_box.php'
const RESET_URL    = 'https://www.gamify.co.ke/api/reset_all.php'

// Transform one API question into the internal shape the game expects.
function transformQuestion(apiQuestion, index) {
  const answers = {}
  let correct = ''

  for (const ans of apiQuestion.answers) {
    answers[ans.answer_letter] = ans.answer_text.trim()
    if (ans.answer_status === 'C') correct = ans.answer_letter
  }

  return {
    id: index + 1,                        // box number (1-based)
    question_id: apiQuestion.question_id, // original API id for open_box calls
    box_status: apiQuestion.box_status,   // "open" | "disabled"
    question: apiQuestion.question_title,
    points: apiQuestion.points_displayed, // points awarded for this question
    answers,
    correct,
  }
}

export async function fetchQuestions() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  const data = await res.json()
  return data.map(transformQuestion)
}

// Call after a question is answered to persist the box as done in the backend.
export async function openBox(questionId) {
  const res = await fetch(OPEN_BOX_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: String(questionId) }),
  })
  if (!res.ok) throw new Error(`open_box failed (${res.status})`)
  return res.json()
}

// Reset all boxes back to available.
export async function resetAll() {
  const res = await fetch(RESET_URL, { method: 'POST' })
  if (!res.ok) throw new Error(`reset_all failed (${res.status})`)
  return res.json()
}
