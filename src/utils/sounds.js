// ---------------------------------------------------------------------------
// Game-show sound effects via Web Audio API — no audio files needed.
// AudioContext is created lazily on first use (satisfies browser autoplay policy).
// ---------------------------------------------------------------------------

let ctx = null

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(ac, { freq, freqEnd, type = 'sine', start, dur, peak = 0.25 }) {
  const osc  = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, start + dur)

  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.02, dur * 0.15))
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)

  osc.start(start)
  osc.stop(start + dur + 0.01)
}

// ---------------------------------------------------------------------------
// 1. Box clicked → confirmation modal opens
//    Dramatic ascending whoosh + sparkle arpeggio
// ---------------------------------------------------------------------------
export function playBoxSelect() {
  const ac  = getCtx()
  const now = ac.currentTime

  // Low rising whoosh
  tone(ac, { freq: 120, freqEnd: 520, type: 'sine', start: now,        dur: 0.22, peak: 0.18 })
  // Arpeggio sparkle: C5 E5 G5 C6
  ;[523, 659, 784, 1047].forEach((freq, i) => {
    tone(ac, { freq, type: 'sine', start: now + 0.14 + i * 0.075, dur: 0.32, peak: 0.17 })
  })
}

// ---------------------------------------------------------------------------
// 2. User confirms their pick → question modal opens
//    Triumphant short fanfare
// ---------------------------------------------------------------------------
export function playConfirm() {
  const ac  = getCtx()
  const now = ac.currentTime

  // Rising chord stagger C5 → E5 → G5 → C6 → E6
  ;[523, 659, 784, 1047, 1319].forEach((freq, i) => {
    tone(ac, { freq, type: 'sine', start: now + i * 0.07, dur: 0.5, peak: 0.2 })
  })
  // Punchy low hit underneath
  tone(ac, { freq: 130, freqEnd: 80, type: 'triangle', start: now, dur: 0.18, peak: 0.3 })
}

// ---------------------------------------------------------------------------
// 3. User cancels / changes mind
//    Soft descending "nope" blip
// ---------------------------------------------------------------------------
export function playCancel() {
  const ac  = getCtx()
  const now = ac.currentTime

  tone(ac, { freq: 420, freqEnd: 200, type: 'sine',     start: now,        dur: 0.22, peak: 0.18 })
  tone(ac, { freq: 320, freqEnd: 140, type: 'triangle', start: now + 0.06, dur: 0.22, peak: 0.12 })
}
