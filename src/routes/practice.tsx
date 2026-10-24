import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { counterpart } from '#/kana/kana'
import {
  buildQueue,
  currentCard,
  type Grade,
  grade,
  isFinished,
  poolFor,
  startSession,
} from '#/session/session'
import { progressStore } from '#/storage/progress-store'

export const Route = createFileRoute('/practice')({
  head: () => ({ meta: [{ title: 'flashcards · kana' }] }),
  component: Practice,
})

function Practice() {
  // saved progress decides what is due today; this runs once, when the screen opens
  const [initial] = useState(() => {
    const progress = progressStore.load()
    // the script choice decides which cards can be practiced; new cards come
    // from one group at a time as the earlier groups become reliable
    const pool = poolFor(progressStore.loadSettings().scripts)
    const queue = buildQueue(pool, progress, new Date())
    return { session: startSession(queue, progress), count: queue.length }
  })
  const [session, setSession] = useState(initial.session)
  const [revealed, setRevealed] = useState(false)
  const faceRef = useRef<HTMLButtonElement>(null)
  const missedRef = useRef<HTMLButtonElement>(null)
  const homeRef = useRef<HTMLAnchorElement>(null)

  const card = currentCard(session)
  const finished = isFinished(session)

  const answer = useCallback((verdict: Grade) => {
    const now = new Date()
    setSession((current) => grade(current, verdict, now))
    setRevealed(false)
  }, [])

  // save after every grade; nothing is saved until the progress has changed,
  // so unreadable saved data is not overwritten before anything is graded
  useEffect(() => {
    if (session.progress === initial.session.progress) return
    progressStore.save(session.progress)
  }, [session.progress, initial])

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
    if (finished) homeRef.current?.focus()
    else if (revealed) missedRef.current?.focus()
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
        <Link className="back-link settings-link" to="/settings">
          settings
        </Link>
        <h1>flashcards</h1>

        {!card ? (
          <section className="practice-done" aria-labelledby="done-heading">
            <h2 id="done-heading">
              {initial.count === 0 ? 'nothing due right now' : 'done for now'}
            </h2>
            <p className="intro">
              {initial.count === 0
                ? 'come back later for the next cards'
                : "you went through today's cards"}
            </p>
            <Link ref={homeRef} to="/" className="primary-action">
              back to activities
            </Link>
          </section>
        ) : (
          <section className="flashcard" aria-label="flashcard">
            <p className="practice-count">{session.queue.length} left</p>
            {/* always mounted so screen readers announce what appears on reveal */}
            <p className="sr-only" aria-live="polite">
              {revealed
                ? `${card.romaji}, also written ${counterpart(card).kana}`
                : ''}
            </p>

            {revealed ? (
              <div className="card-face is-revealed">
                <span className="card-kana" lang="ja">
                  {card.kana}
                </span>
                <p className="card-answer">
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
