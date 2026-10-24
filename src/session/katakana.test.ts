import { describe, expect, test } from 'vitest'
import { allCards, type Card, cardsOfGroup, groups } from '#/kana/kana'
import {
  buildQueue,
  type CardProgress,
  grade,
  type Progress,
  poolFor,
  RELIABLE_BOX,
  startSession,
  studyDay,
} from './session'

const NOW = new Date(2026, 9, 26, 10, 0)
const TODAY = studyDay(NOW)
const LATER = TODAY + 30

const both = poolFor('both')
const hiraganaOnly = poolFor('hiragana')

const kanaOf = (cards: ReadonlyArray<{ kana: string }>) =>
  cards.map((card) => card.kana).join('')

const groupCards = (index: number, script: 'hiragana' | 'katakana'): Card[] =>
  cardsOfGroup(groups[index].id, script)

function inBox(
  cards: ReadonlyArray<Card>,
  box: number,
  due = LATER,
  introduced = TODAY - 9,
): Progress {
  const entries: Array<[string, CardProgress]> = cards.map((card) => [
    card.id,
    { box, due, introduced },
  ])
  return Object.fromEntries(entries)
}

const merge = (...parts: Progress[]): Progress => Object.assign({}, ...parts)

// the hiragana of the first `count` groups is reliable and not due today
function reliableHiragana(count: number): Progress {
  const parts: Progress[] = []
  for (let index = 0; index < count; index++) {
    parts.push(inBox(groupCards(index, 'hiragana'), RELIABLE_BOX))
  }
  return merge(...parts)
}

describe('the cards a script choice offers', () => {
  test('hiragana only offers the 46 hiragana cards', () => {
    expect(hiraganaOnly).toEqual(allCards('hiragana'))
  })

  test('both offers hiragana first and then katakana, in learning order', () => {
    expect(both).toHaveLength(92)
    expect(both.slice(0, 46)).toEqual(allCards('hiragana'))
    expect(both.slice(46)).toEqual(allCards('katakana'))
  })
})

describe('katakana never appears with hiragana only', () => {
  test('not as a new card, even when every hiragana group is reliable', () => {
    const progress = reliableHiragana(10)
    expect(kanaOf(buildQueue(hiraganaOnly, progress, NOW))).toBe('')
  })

  test('not as a review, even when a katakana card is due', () => {
    const progress = merge(
      reliableHiragana(1),
      inBox(groupCards(0, 'katakana').slice(0, 1), 1, TODAY),
    )
    // only the k hiragana is offered; the due katakana review is left out
    const queue = buildQueue(hiraganaOnly, progress, NOW)
    expect(kanaOf(queue)).toBe('かきくけこ')
    expect(queue.every((card) => card.script === 'hiragana')).toBe(true)
  })
})

describe('with both scripts on', () => {
  test('a first session still starts with hiragana only', () => {
    expect(kanaOf(buildQueue(both, {}, NOW))).toBe('あいうえお')
  })

  test('a group katakana waits until the same group hiragana is reliable', () => {
    const vowels = groupCards(0, 'hiragana')
    const almost = merge(
      inBox(vowels.slice(0, 3), RELIABLE_BOX),
      inBox(vowels.slice(3), 1),
    )
    expect(kanaOf(buildQueue(both, almost, NOW))).toBe('')

    const reliable = reliableHiragana(1)
    expect(kanaOf(buildQueue(both, reliable, NOW))).toBe('アイウエオ')
  })

  test('the earlier group comes first: its katakana before the next hiragana group', () => {
    // vowels hiragana is reliable, so the vowels katakana and the k hiragana
    // are both open; the earlier group fills the day first
    const queue = buildQueue(both, reliableHiragana(1), NOW)
    expect(kanaOf(queue)).toBe('アイウエオ')
  })

  test('the next day the k hiragana follows, and k katakana is still locked', () => {
    const progress = merge(
      reliableHiragana(1),
      inBox(groupCards(0, 'katakana'), 1, LATER),
    )
    const queue = buildQueue(both, progress, NOW)
    expect(kanaOf(queue)).toBe('かきくけこ')
  })

  test('katakana of a group needs that group hiragana, not the katakana before it', () => {
    // vowels and k hiragana are reliable but no katakana was met yet
    const queue = buildQueue(both, reliableHiragana(2), NOW)
    expect(kanaOf(queue)).toBe('アイウエオ')
    // once the vowels katakana is introduced, the k katakana is next
    const next = buildQueue(
      both,
      merge(reliableHiragana(2), inBox(groupCards(0, 'katakana'), 1, LATER)),
      NOW,
    )
    expect(kanaOf(next)).toBe('カキクケコ')
  })

  test('a group whose hiragana is not reliable offers no katakana, whatever comes before', () => {
    const progress = merge(
      reliableHiragana(1),
      inBox(groupCards(0, 'katakana'), RELIABLE_BOX),
      inBox(groupCards(1, 'hiragana'), 2, LATER),
    )
    expect(kanaOf(buildQueue(both, progress, NOW))).toBe('')
  })
})

describe('hiragana and katakana of the same sound are separate cards', () => {
  test('grading ア leaves あ untouched, and each has its own box and due day', () => {
    const [a] = groupCards(0, 'hiragana')
    const [katakanaA] = groupCards(0, 'katakana')
    const hiraganaDone = grade(startSession([a]), 'knew', NOW)
    const bothDone = grade(
      startSession([katakanaA], hiraganaDone.progress),
      'missed',
      NOW,
    )
    expect(bothDone.progress[a.id]).toEqual(hiraganaDone.progress[a.id])
    expect(bothDone.progress[a.id]).toMatchObject({ box: 2, due: TODAY + 1 })
    expect(bothDone.progress[katakanaA.id]).toMatchObject({
      box: 1,
      due: TODAY,
    })
  })

  test('a katakana review comes back on its own due day', () => {
    const progress = merge(
      inBox(groupCards(0, 'hiragana'), RELIABLE_BOX),
      inBox(groupCards(0, 'katakana').slice(0, 2), 2, TODAY),
    )
    expect(kanaOf(buildQueue(both, progress, NOW)).startsWith('ア')).toBe(true)
  })
})

describe('changing the script choice', () => {
  test('switching on later offers katakana for groups already reliable, earliest first', () => {
    const progress = reliableHiragana(3)
    expect(kanaOf(buildQueue(both, progress, NOW))).toBe('アイウエオ')
    // after that day's cards, the next group follows on the next day
    const later = merge(progress, inBox(groupCards(0, 'katakana'), 1, LATER))
    expect(kanaOf(buildQueue(both, later, NOW))).toBe('カキクケコ')
  })

  test('switching off stops katakana but keeps its progress', () => {
    const katakanaProgress = inBox(groupCards(0, 'katakana'), 2, TODAY)
    const progress = merge(reliableHiragana(1), katakanaProgress)
    const off = buildQueue(hiraganaOnly, progress, NOW)
    expect(off.every((card) => card.script === 'hiragana')).toBe(true)
    // nothing was removed: switching back on shows the due katakana again
    expect(progress).toMatchObject(katakanaProgress)
    const on = buildQueue(both, progress, NOW)
    expect(kanaOf(on).startsWith('ア')).toBe(true)
    expect(on.some((card) => card.script === 'katakana')).toBe(true)
  })
})
