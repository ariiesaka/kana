import { Fragment, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'

type Script = 'hiragana' | 'katakana' | 'both'

const scripts: Array<{
  id: Script
  name: string
  example: string
  description: string
}> = [
  { id: 'hiragana', name: 'hiragana', example: 'あ', description: 'rounded' },
  { id: 'katakana', name: 'katakana', example: 'ア', description: 'angular' },
  { id: 'both', name: 'both', example: 'あ ア', description: 'both scripts' },
]

const groups = [
  { id: 'vowels', name: 'vowels + n', hira: 'あいうえおん', kata: 'アイウエオン' },
  { id: 'k', name: 'k-row', hira: 'かきくけこ', kata: 'カキクケコ' },
  { id: 's', name: 's-row', hira: 'さしすせそ', kata: 'サシスセソ' },
  { id: 't', name: 't-row', hira: 'たちつてと', kata: 'タチツテト' },
  { id: 'n', name: 'n-row', hira: 'なにぬねの', kata: 'ナニヌネノ' },
  { id: 'h', name: 'h-row', hira: 'はひふへほ', kata: 'ハヒフヘホ' },
  { id: 'm', name: 'm-row', hira: 'まみむめも', kata: 'マミムメモ' },
  { id: 'y', name: 'y-row', hira: 'やゆよ', kata: 'ヤユヨ' },
  { id: 'r', name: 'r-row', hira: 'らりるれろ', kata: 'ラリルレロ' },
  { id: 'w', name: 'w-row', hira: 'わを', kata: 'ワヲ' },
  { id: 'g', name: 'g-row', hira: 'がぎぐげご', kata: 'ガギグゲゴ' },
  { id: 'z', name: 'z-row', hira: 'ざじずぜぞ', kata: 'ザジズゼゾ' },
  { id: 'd', name: 'd-row', hira: 'だぢづでど', kata: 'ダヂヅデド' },
  { id: 'b', name: 'b-row', hira: 'ばびぶべぼ', kata: 'バビブベボ' },
  { id: 'p', name: 'p-row', hira: 'ぱぴぷぺぽ', kata: 'パピプペポ' },
]

const voicedGroupsStart = 10

export const Route = createFileRoute('/multiple-choice')({
  head: () => ({ meta: [{ title: 'multiple choice · kana' }] }),
  component: MultipleChoiceSetup,
})

function compactRange(characters: string) {
  const glyphs = Array.from(characters)
  return glyphs.length < 4 ? characters : `${glyphs[0]}…${glyphs.at(-1)}`
}

function groupSample(group: (typeof groups)[number], script: Script) {
  if (script === 'hiragana') return group.hira
  if (script === 'katakana') return group.kata
  return compactRange(group.hira)
}

function previewCharacters(characters: string) {
  const glyphs = Array.from(characters)
  if (glyphs.length <= 12) return glyphs.join(' ')
  return `${glyphs.slice(0, 12).join(' ')} +${glyphs.length - 12} more`
}

function MultipleChoiceSetup() {
  const [script, setScript] = useState<Script>('hiragana')
  const [selectedIds, setSelectedIds] = useState(() => new Set(['vowels']))
  const selectedGroups = groups.filter((group) => selectedIds.has(group.id))
  const kanaPerScript = selectedGroups.reduce(
    (total, group) => total + Array.from(group.hira).length,
    0,
  )
  const kanaCount = kanaPerScript * (script === 'both' ? 2 : 1)
  const groupStatus = selectedGroups.length === 0
    ? 'choose at least one group'
    : selectedGroups.length === 1
      ? selectedGroups[0].name
      : `${selectedGroups.length} groups · shuffled`
  const showHiragana = script !== 'katakana'
  const showKatakana = script !== 'hiragana'
  const hiraganaPreview = previewCharacters(selectedGroups.map((group) => group.hira).join(''))
  const katakanaPreview = previewCharacters(selectedGroups.map((group) => group.kata).join(''))

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
        <Link className="brand" to="/" aria-label="kana home">kana</Link>
      </header>
      <main className="home setup">
        <Link className="setup-back" to="/">← activities</Link>
        <h1>multiple choice</h1>
        <p className="intro" id="practice-status">setup preview · practice is coming soon</p>

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
                <span className="script-example" lang="ja" aria-hidden="true">{item.example}</span>
                <span className="script-name">{item.name}</span>
                <span className="script-description">{item.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="groups-section" aria-labelledby="groups-heading">
          <h2 id="groups-heading">groups to practice</h2>
          <div className="compact-toolbar">
            <span>choose one or more</span>
            <div className="compact-actions">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(groups.map((group) => group.id)))}
              >
                select all
              </button>
              <button type="button" onClick={() => setSelectedIds(new Set())}>clear</button>
            </div>
          </div>

          <fieldset className="compact-fieldset">
            <legend className="sr-only">kana groups</legend>
            <div className="compact-groups">
              {groups.map((group, index) => (
                <Fragment key={group.id}>
                {index === 0 && (
                  <div className="group-divider basic-divider">
                    <span className="group-category-label">basic kana</span>
                  </div>
                )}
                  {index === voicedGroupsStart && (
                    <div className="group-divider">
                    <span className="group-category-label">sound-marked kana</span>
                    <span className="voiced-help">small marks · か→が は→ぱ</span>
                    </div>
                  )}
                  <label className="group-toggle">
                    <input
                      type="checkbox"
                      name="groups"
                      value={group.id}
                      aria-label={`${group.name}: ${groupSample(group, script)}`}
                      checked={selectedIds.has(group.id)}
                      onChange={(event) => toggleGroup(group.id, event.target.checked)}
                    />
                    <span className="group-name">
                      {group.id === 'vowels' ? group.name : `${group.id}-row`}
                    </span>
                    <span className="group-sample" lang="ja">{groupSample(group, script)}</span>
                  </label>
                </Fragment>
              ))}
            </div>
          </fieldset>

          <div className={`selected-preview${script === 'both' ? ' is-both' : ''}`}>
            {showHiragana && (
              <div className="preview-row">
                {script === 'both' && <span className="preview-script">hiragana</span>}
                <p className="selected-kana" lang="ja">{hiraganaPreview || '—'}</p>
              </div>
            )}
            {showKatakana && (
              <div className="preview-row">
                {script === 'both' && <span className="preview-script">katakana</span>}
                <p className="selected-kana" lang="ja">{katakanaPreview || '—'}</p>
              </div>
            )}
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
            <p className="session-summary">{kanaCount} kana · five romaji choices</p>
            <p className="romaji-note">romaji shows kana sounds with roman letters</p>
          </div>
          <button className="preview-start" type="button" disabled aria-describedby="practice-status">
            practice coming soon
          </button>
        </div>
      </main>
    </>
  )
}
