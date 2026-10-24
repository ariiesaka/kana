import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'

type Script = 'hiragana' | 'katakana' | 'both'
type GroupCategory = 'basic' | 'sound-marked'

type KanaGroup = {
  id: string
  name: string
  romaji: string
  hira: string
  kata: string
  category: GroupCategory
}

const scripts: Array<{
  id: Script
  name: string
  example: string
  description: string
}> = [
  { id: 'hiragana', name: 'hiragana', example: 'あ', description: 'rounded' },
  { id: 'katakana', name: 'katakana', example: 'ア', description: 'angular' },
  { id: 'both', name: 'both', example: 'あ ア', description: 'one script per question' },
]

const groups: KanaGroup[] = [
  { id: 'vowels', name: 'vowels + n', romaji: 'a i u e o n', hira: 'あいうえおん', kata: 'アイウエオン', category: 'basic' },
  { id: 'k', name: 'k group', romaji: 'ka ki ku ke ko', hira: 'かきくけこ', kata: 'カキクケコ', category: 'basic' },
  { id: 's', name: 's group', romaji: 'sa shi su se so', hira: 'さしすせそ', kata: 'サシスセソ', category: 'basic' },
  { id: 't', name: 't group', romaji: 'ta chi tsu te to', hira: 'たちつてと', kata: 'タチツテト', category: 'basic' },
  { id: 'n', name: 'n group', romaji: 'na ni nu ne no', hira: 'なにぬねの', kata: 'ナニヌネノ', category: 'basic' },
  { id: 'h', name: 'h group', romaji: 'ha hi fu he ho', hira: 'はひふへほ', kata: 'ハヒフヘホ', category: 'basic' },
  { id: 'm', name: 'm group', romaji: 'ma mi mu me mo', hira: 'まみむめも', kata: 'マミムメモ', category: 'basic' },
  { id: 'y', name: 'y group', romaji: 'ya yu yo', hira: 'やゆよ', kata: 'ヤユヨ', category: 'basic' },
  { id: 'r', name: 'r group', romaji: 'ra ri ru re ro', hira: 'らりるれろ', kata: 'ラリルレロ', category: 'basic' },
  { id: 'w', name: 'w group', romaji: 'wa wo', hira: 'わを', kata: 'ワヲ', category: 'basic' },
  { id: 'g', name: 'g group', romaji: 'ga gi gu ge go', hira: 'がぎぐげご', kata: 'ガギグゲゴ', category: 'sound-marked' },
  { id: 'z', name: 'z group', romaji: 'za ji zu ze zo', hira: 'ざじずぜぞ', kata: 'ザジズゼゾ', category: 'sound-marked' },
  { id: 'd', name: 'd group', romaji: 'da ji zu de do', hira: 'だぢづでど', kata: 'ダヂヅデド', category: 'sound-marked' },
  { id: 'b', name: 'b group', romaji: 'ba bi bu be bo', hira: 'ばびぶべぼ', kata: 'バビブベボ', category: 'sound-marked' },
  { id: 'p', name: 'p group', romaji: 'pa pi pu pe po', hira: 'ぱぴぷぺぽ', kata: 'パピプペポ', category: 'sound-marked' },
]

const groupCategoryNames: Record<GroupCategory, string> = {
  basic: 'kana without marks',
  'sound-marked': 'kana with marks',
}
const groupCategories = Array.from(new Set(groups.map((group) => group.category)))

export const Route = createFileRoute('/multiple-choice')({
  head: () => ({ meta: [{ title: 'multiple choice · kana' }] }),
  component: MultipleChoiceSetup,
})

function compactRange(characters: string) {
  const glyphs = Array.from(characters)
  return glyphs.length < 4 ? characters : `${glyphs[0]}…${glyphs.at(-1)}`
}

function groupSample(group: KanaGroup, script: Script) {
  if (script === 'hiragana') return group.hira
  if (script === 'katakana') return group.kata
  return `${compactRange(group.hira)} / ${compactRange(group.kata)}`
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
      : `${selectedGroups.length} groups selected`
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
                <span className="script-example" lang="ja" aria-hidden="true">{item.example}</span>
                <span className="script-name">{item.name}</span>
                <span className="script-description">{item.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="groups-section" aria-labelledby="groups-heading">
          <h2 id="groups-heading">groups to practice</h2>
          <p className="group-guidance">start with vowels + n · other groups share a starting sound</p>
          <div className="compact-toolbar">
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
              {groupCategories.map((category) => (
                <fieldset className="group-category" key={category}>
                  <legend className="group-divider" data-category={category}>
                    <span className="group-category-label">{groupCategoryNames[category]}</span>
                    {category === 'sound-marked' && (
                      <span className="sound-marked-help">marks change sounds · ka → ga · ha → pa</span>
                    )}
                  </legend>
                  <div className="group-options">
                    {groups
                      .filter((group) => group.category === category)
                      .map((group) => (
                        <label className="group-toggle" key={group.id}>
                          <input
                            type="checkbox"
                            name="groups"
                            value={group.id}
                            checked={selectedIds.has(group.id)}
                            onChange={(event) => toggleGroup(group.id, event.target.checked)}
                          />
                          <span className="group-name">{group.name}</span>
                          <span className="group-sample" lang="ja">{groupSample(group, script)}</span>
                          <span className="group-romaji">{group.romaji}</span>
                        </label>
                      ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </fieldset>

          <div className={`selected-preview${script === 'both' ? ' is-both' : ''}`}>
            <p className="selected-preview-label">selected kana</p>
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
            {selectedGroups.length > 0 && (
              <p className="session-summary">five answer choices in romaji</p>
            )}
            <p className="romaji-note">romaji shows kana sounds with roman letters</p>
          </div>
          <button className="preview-start" type="button" disabled>
            practice coming soon
          </button>
        </div>
      </main>
    </>
  )
}
