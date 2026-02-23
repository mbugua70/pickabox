const API_URL = 'https://gamify.co.ke/api/load_boxes.php'

// Transform one API question into the internal shape the game expects:
// { id, question, answers: { A, B, C, D }, correct }
function transformQuestion(apiQuestion, index) {
  const answers = {}
  let correct = ''

  for (const ans of apiQuestion.answers) {
    answers[ans.answer_letter] = ans.answer_text.trim()
    if (ans.answer_status === 'C') correct = ans.answer_letter
  }

  return {
    id: index + 1,               // box number (1-based)
    question: apiQuestion.question_title,
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
