import { createFileRoute } from '@tanstack/react-router'

const practiceModes = [
  {
    id: 'multiple-choice',
    name: 'multiple choice',
    description: 'choose the romaji that matches each kana.',
  },
  {
    id: 'matching',
    name: 'matching',
    description: 'pair romaji labels with kana.',
  },
  {
    id: 'flashcards',
    name: 'flashcards',
    description: 'try to recall the reading before revealing the answer.',
  },
]

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="/" aria-label="kana home">
          kana
        </a>
      </header>

      <main className="home">
        <h1>how would you like to practice?</h1>
        <p className="intro">choose a way to practice reading kana.</p>
        <p className="kana-example">
          <span className="example-label">for example</span>
          <span className="sr-only">hiragana </span>
          <span className="example-kana" lang="ja">
            あ
          </span>
          <span className="example-separator" aria-hidden="true">
            /
          </span>
          <span className="sr-only">or katakana </span>
          <span className="example-kana" lang="ja">
            ア
          </span>
          <span className="example-arrow" aria-hidden="true">
            →
          </span>
          <span className="sr-only">both read as </span>
          <span className="example-reading">a</span>
        </p>
        <p className="example-note">
          romaji uses roman letters to show how kana sound.
        </p>

        <p className="mode-status" id="mode-status">
          practice activities are coming soon.
        </p>
        <ul
          className="mode-list"
          aria-label="practice formats"
          aria-describedby="mode-status"
        >
          {practiceModes.map((mode) => (
            <li className="mode-choice" key={mode.id}>
              <span className="mode-name">{mode.name}</span>
              <span className="mode-description">{mode.description}</span>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
