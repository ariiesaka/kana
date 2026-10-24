import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cardsOfGroup, counterpart } from '#/kana/kana'
import {
  currentCard,
  type Grade,
  grade,
  isFinished,
  startSession,
} from '#/session/session'

export const Route = createFileRoute('/practice')({
  head: () => ({ meta: [{ title: 'flashcards · kana' }] }),
  component: Practice,
})

// the first session practices the vowels in hiragana
const firstCards = cardsOfGroup('vowels', 'hiragana')

function Practice() {
  const [session, setSession] = useState(() => startSession(firstCards))
  const [revealed, setRevealed] = useState(false)
  const faceRef = useRef<HTMLButtonElement>(null)
  const missedRef = useRef<HTMLButtonElement>(null)

  const card = currentCard(session)
  const finished = isFinished(session)

  const answer = useCallback((verdict: Grade) => {
    setSession((current) => grade(current, verdict))
    setRevealed(false)
  }, [])

  // keyboard: 1 or left arrow is missed, 2 or right arrow is knew it
  useEffect(() => {
    if (!revealed) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === '1' || event.key === 'ArrowLeft') {
        event.preventDefault()
        answer('missed')
      } else if (event.key === '2' || event.key === 'ArrowRight') {
        event.preventDefault()
        answer('knew')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [revealed, answer])

  // focus follows the flow: to the grade buttons after reveal, back to the card after grading
  useEffect(() => {
    if (finished) return
    if (revealed) missedRef.current?.focus()
    else faceRef.current?.focus()
  }, [revealed, finished])

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="kana home">
          kana
        </Link>
      </header>
      <main className="home practice">
        <Link className="back-link" to="/">
          ← activities
        </Link>
        <h1>flashcards</h1>

        {finished || !card ? (
          <section className="practice-done" aria-labelledby="done-heading">
            <h2 id="done-heading">done for now</h2>
            <p className="intro">
              you went through all {firstCards.length} cards
            </p>
            <button
              type="button"
              className="primary-action"
              onClick={() => {
                setSession(startSession(firstCards))
                setRevealed(false)
              }}
            >
              practice again
            </button>
          </section>
        ) : (
          <section className="flashcard" aria-label="flashcard">
            <p className="practice-count">{session.queue.length} left</p>

            {revealed ? (
              <div className="card-face is-revealed">
                <span className="card-kana" lang="ja">
                  {card.kana}
                </span>
                <p className="card-answer" aria-live="polite">
                  <span className="answer-romaji">{card.romaji}</span>
                  <span className="answer-other">
                    <span className="sr-only">also written </span>
                    <span lang="ja">{counterpart(card).kana}</span>
                  </span>
                </p>
              </div>
            ) : (
              <button
                ref={faceRef}
                type="button"
                className="card-face"
                onClick={() => setRevealed(true)}
              >
                <span className="card-kana" lang="ja">
                  {card.kana}
                </span>
                <span className="card-hint">tap or press space to show</span>
              </button>
            )}

            {revealed && (
              <fieldset className="grades">
                <legend className="sr-only">how did it go</legend>
                <button
                  ref={missedRef}
                  type="button"
                  className="grade grade-missed"
                  onClick={() => answer('missed')}
                >
                  missed <kbd>1</kbd>
                </button>
                <button
                  type="button"
                  className="grade grade-knew"
                  onClick={() => answer('knew')}
                >
                  knew it <kbd>2</kbd>
                </button>
              </fieldset>
            )}
          </section>
        )}
      </main>
    </>
  )
}
