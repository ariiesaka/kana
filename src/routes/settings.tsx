import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  type ScriptChoice,
  type Settings,
} from '#/settings/settings'
import { progressStore } from '#/storage/progress-store'

export const Route = createFileRoute('/settings')({
  head: () => ({ meta: [{ title: 'settings · kana' }] }),
  component: SettingsScreen,
})

const choices: Array<{
  id: ScriptChoice
  name: string
  example: string
  description: string
}> = [
  {
    id: 'hiragana',
    name: 'hiragana only',
    example: 'あ',
    description: 'rounded',
  },
  {
    id: 'both',
    name: 'hiragana and katakana',
    example: 'あ ア',
    description: 'katakana follows each group',
  },
]

function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(() =>
    progressStore.loadSettings(),
  )
  const [confirming, setConfirming] = useState(false)
  // what the reset screen says: nothing yet, done, or refused by the browser
  const [resetResult, setResetResult] = useState<'done' | 'failed' | null>(null)
  // true once the learner has used the reset buttons, so focus goes back to them
  const [returnFocus, setReturnFocus] = useState(false)
  const resetRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  // focus follows the flow: confirming starts on the safe button, and leaving
  // the confirmation returns to the reset button
  useEffect(() => {
    if (confirming) cancelRef.current?.focus()
    else if (returnFocus) resetRef.current?.focus()
  }, [confirming, returnFocus])

  function choose(scripts: ScriptChoice) {
    const next = { scripts }
    setSettings(next)
    setResetResult(null)
    progressStore.saveSettings(next)
  }

  function askToReset() {
    setResetResult(null)
    setReturnFocus(false)
    setConfirming(true)
  }

  function cancelReset() {
    setReturnFocus(true)
    setConfirming(false)
  }

  function reset() {
    const worked = progressStore.reset()
    if (worked) setSettings(DEFAULT_SETTINGS)
    setResetResult(worked ? 'done' : 'failed')
    setReturnFocus(true)
    setConfirming(false)
  }

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="kana home">
          kana
        </Link>
      </header>
      <main className="home settings">
        <Link className="back-link" to="/practice">
          ← flashcards
        </Link>
        <h1>settings</h1>

        <fieldset className="script-fieldset">
          <legend>kana to practice</legend>
          <div className="script-choices">
            {choices.map((item) => (
              <label className="script-choice" key={item.id}>
                <input
                  type="radio"
                  name="scripts"
                  value={item.id}
                  checked={settings.scripts === item.id}
                  onChange={() => choose(item.id)}
                />
                <span className="script-indicator" aria-hidden="true" />
                <span className="script-example" lang="ja" aria-hidden="true">
                  {item.example}
                </span>
                <span className="script-name">{item.name}</span>
                <span className="script-description">{item.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="reset" aria-labelledby="reset-heading">
          <h2 id="reset-heading">reset progress</h2>
          <p className="intro">
            clears the progress of every card and puts your settings back to the
            defaults
          </p>
          {confirming ? (
            <div className="reset-confirm" role="alert">
              <p>this cannot be undone</p>
              <div className="reset-actions">
                <button
                  ref={cancelRef}
                  type="button"
                  className="secondary-action"
                  onClick={cancelReset}
                >
                  cancel
                </button>
                <button type="button" className="danger-action" onClick={reset}>
                  yes, reset everything
                </button>
              </div>
            </div>
          ) : (
            <button
              ref={resetRef}
              type="button"
              className="secondary-action"
              onClick={askToReset}
            >
              reset progress
            </button>
          )}
          <p className="reset-status" aria-live="polite">
            {resetResult === 'done' ? 'progress reset' : ''}
            {resetResult === 'failed'
              ? 'this browser would not let kana reset'
              : ''}
          </p>
        </section>
      </main>
    </>
  )
}
