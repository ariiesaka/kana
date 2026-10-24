import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { type Group, groups } from '#/kana/kana'

type ScriptChoice = 'hiragana' | 'katakana' | 'both'

const scripts: Array<{
  id: ScriptChoice
  name: string
  example: string
  description: string
}> = [
  { id: 'hiragana', name: 'hiragana', example: 'あ', description: 'rounded' },
  { id: 'katakana', name: 'katakana', example: 'ア', description: 'angular' },
  {
    id: 'both',
    name: 'both',
    example: 'あ ア',
    description: 'one script per question',
  },
]

export const Route = createFileRoute('/multiple-choice')({
  head: () => ({ meta: [{ title: 'multiple choice · kana' }] }),
  component: MultipleChoiceSetup,
})

function compactRange(characters: string) {
  const glyphs = Array.from(characters)
  return glyphs.length < 4 ? characters : `${glyphs[0]}…${glyphs.at(-1)}`
}

const hiraganaOf = (group: Group) =>
  group.kana.map((entry) => entry.hiragana).join('')
const katakanaOf = (group: Group) =>
  group.kana.map((entry) => entry.katakana).join('')
const romajiOf = (group: Group) =>
  group.kana.map((entry) => entry.romaji).join(' ')

function groupSample(group: Group, script: ScriptChoice) {
  if (script === 'hiragana') return hiraganaOf(group)
  if (script === 'katakana') return katakanaOf(group)
  return `${compactRange(hiraganaOf(group))} / ${compactRange(katakanaOf(group))}`
}

function previewCharacters(characters: string) {
  const glyphs = Array.from(characters)
  if (glyphs.length <= 12) return glyphs.join(' ')
  return `${glyphs.slice(0, 12).join(' ')} +${glyphs.length - 12} more`
}

function MultipleChoiceSetup() {
  const [script, setScript] = useState<ScriptChoice>('hiragana')
  const [selectedIds, setSelectedIds] = useState(() => new Set(['vowels']))
  const selectedGroups = groups.filter((group) => selectedIds.has(group.id))
  const kanaPerScript = selectedGroups.reduce(
    (total, group) => total + group.kana.length,
    0,
  )
  const kanaCount = kanaPerScript * (script === 'both' ? 2 : 1)
  const groupStatus =
    selectedGroups.length === 0
      ? 'choose at least one group'
      : selectedGroups.length === 1
        ? selectedGroups[0].name
        : `${selectedGroups.length} groups selected`
  const showHiragana = script !== 'katakana'
  const showKatakana = script !== 'hiragana'
  const hiraganaPreview = previewCharacters(
    selectedGroups.map(hiraganaOf).join(''),
  )
  const katakanaPreview = previewCharacters(
    selectedGroups.map(katakanaOf).join(''),
  )
  const previewRows = [
    { name: 'hiragana', visible: showHiragana, characters: hiraganaPreview },
    { name: 'katakana', visible: showKatakana, characters: katakanaPreview },
  ].filter((row) => row.visible)

  function toggleGroup(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <>
      <header className="site-header setup-header">
        <Link className="brand" to="/" aria-label="kana home">
          kana
        </Link>
      </header>
      <main className="home setup">
        <Link className="back-link" to="/">
          ← activities
        </Link>
        <h1>multiple choice</h1>
        <p className="intro">choose a script and one or more groups</p>

        <fieldset className="script-fieldset">
          <legend>kana to practice</legend>
          <div className="script-choices">
            {scripts.map((item) => (
              <label className="script-choice" key={item.id}>
                <input
                  type="radio"
                  name="script"
                  value={item.id}
                  checked={script === item.id}
                  onChange={() => setScript(item.id)}
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

        <section className="groups-section" aria-labelledby="groups-heading">
          <h2 id="groups-heading">groups to practice</h2>
          <p className="group-guidance">
            start with vowels · other groups share a starting sound
          </p>
          <div className="compact-toolbar">
            <div className="compact-actions">
              <button
                type="button"
                onClick={() =>
                  setSelectedIds(new Set(groups.map((group) => group.id)))
                }
              >
                select all
              </button>
              <button type="button" onClick={() => setSelectedIds(new Set())}>
                clear
              </button>
            </div>
          </div>

          <fieldset className="compact-fieldset">
            <legend className="sr-only">kana groups</legend>
            <div className="group-options">
              {groups.map((group) => (
                <label className="group-toggle" key={group.id}>
                  <input
                    type="checkbox"
                    name="groups"
                    value={group.id}
                    checked={selectedIds.has(group.id)}
                    onChange={(event) =>
                      toggleGroup(group.id, event.target.checked)
                    }
                  />
                  <span className="group-name">{group.name}</span>
                  <span className="group-sample" lang="ja">
                    {groupSample(group, script)}
                  </span>
                  <span className="group-romaji">{romajiOf(group)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div
            className={`selected-preview${script === 'both' ? ' is-both' : ''}`}
          >
            <p className="selected-preview-label">selected kana</p>
            {previewRows.map((row) => (
              <div className="preview-row" key={row.name}>
                {script === 'both' && (
                  <span className="preview-script">{row.name}</span>
                )}
                <p className="selected-kana" lang="ja">
                  {row.characters || '—'}
                </p>
              </div>
            ))}
            <p
              className="selection-status"
              aria-live="polite"
              data-empty={selectedGroups.length === 0 ? 'true' : undefined}
            >
              {groupStatus} · {kanaCount} kana
            </p>
          </div>
        </section>

        <div className="session-footer">
          <div className="session-details">
            <p className="session-summary">five answer choices in romaji</p>
            <p className="romaji-note">
              romaji shows kana sounds with roman letters
            </p>
          </div>
          <button className="preview-start" type="button" disabled>
            practice coming soon
          </button>
        </div>
      </main>
    </>
  )
}
