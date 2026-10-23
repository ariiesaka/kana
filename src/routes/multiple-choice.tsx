import { Link, createFileRoute } from '@tanstack/react-router'

const scripts = [
  { id: 'hiragana', name: 'hiragana', example: 'あ', description: 'rounded' },
  { id: 'katakana', name: 'katakana', example: 'ア', description: 'angular' },
  { id: 'both', name: 'both', example: 'あ ア', description: 'mixed' },
]

export const Route = createFileRoute('/multiple-choice')({
  head: () => ({ meta: [{ title: 'multiple choice · kana' }] }),
  component: MultipleChoiceSetup,
})

function MultipleChoiceSetup() {
  return (
    <>
      <header className="site-header setup-header">
        <Link className="brand" to="/" aria-label="kana home">kana</Link>
      </header>
      <main className="home setup">
        <Link className="setup-back" to="/">← activities</Link>
        <h1>multiple choice</h1>
        <p className="intro">choose which kana you’d like to read</p>

        <fieldset className="script-fieldset">
          <legend>kana to practice</legend>
          <div className="script-choices">
            {scripts.map((script) => (
              <label className="script-choice" key={script.id}>
                <input
                  type="radio"
                  name="script"
                  value={script.id}
                  defaultChecked={script.id === 'hiragana'}
                />
                <span className="script-example" lang="ja" aria-hidden="true">{script.example}</span>
                <span className="script-name">{script.name}</span>
                <span className="script-description">{script.description}</span>
                <span className="script-dot" aria-hidden="true" />
              </label>
            ))}
          </div>
        </fieldset>
        <p className="setup-caption">new to kana? hiragana is a good place to begin</p>
        <div className="setup-footer">
          <div className="setup-instructions">
            <p className="setup-hint">choose the matching romaji</p>
            <p className="setup-definition">romaji uses roman letters to show how kana sound</p>
          </div>
          <button className="start-practice" type="button" disabled aria-describedby="practice-status">
            start practice <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="practice-status" id="practice-status">practice is coming soon</p>
      </main>
    </>
  )
}
