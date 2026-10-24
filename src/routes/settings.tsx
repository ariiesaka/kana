import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
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
  const [resetDone, setResetDone] = useState(false)
  const resetRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  function choose(scripts: ScriptChoice) {
    const next = { scripts }
    setSettings(next)
    progressStore.saveSettings(next)
  }

  function askToReset() {
    setResetDone(false)
    setConfirming(true)
    // wait for the confirm buttons to exist, then start on the safe one
    requestAnimationFrame(() => cancelRef.current?.focus())
  }

  function cancelReset() {
    setConfirming(false)
    requestAnimationFrame(() => resetRef.current?.focus())
  }

  function reset() {
    progressStore.reset()
    setSettings(DEFAULT_SETTINGS)
    setConfirming(false)
    setResetDone(true)
    requestAnimationFrame(() => resetRef.current?.focus())
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
            {resetDone ? 'progress reset' : ''}
          </p>
        </section>
      </main>
    </>
  )
}
