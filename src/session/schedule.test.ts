import { describe, expect, test } from 'vitest'
import { cardsOfGroup } from '#/kana/kana'
import {
  BOX_WAIT_DAYS,
  buildQueue,
  grade,
  NEW_CARDS_PER_DAY,
  type Progress,
  startSession,
  studyDay,
} from './session'

const vowels = cardsOfGroup('vowels', 'hiragana')
const kRow = cardsOfGroup('k', 'hiragana')
const pool = [...vowels, ...kRow]
const [a, i, u, e, o] = vowels

// local times, so the tests do not depend on the machine's time zone
const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 9, day, hour, minute)

const kanaOf = (cards: ReadonlyArray<{ kana: string }>) =>
  cards.map((card) => card.kana).join('')

describe('study day', () => {
  test('rolls over at 4 a.m. local time, not at midnight', () => {
    expect(studyDay(at(26, 3, 59))).toBe(studyDay(at(25, 23, 0)))
    expect(studyDay(at(26, 4, 0))).toBe(studyDay(at(26, 4, 1)))
    expect(studyDay(at(26, 4, 0))).toBe(studyDay(at(26, 3, 59)) + 1)
  })

  test('late-night practice and the early morning after count as one day', () => {
    expect(studyDay(at(26, 23, 50))).toBe(studyDay(at(27, 0, 10)))
  })

  test('counts consecutive days one apart', () => {
    expect(studyDay(at(27, 12))).toBe(studyDay(at(26, 12)) + 1)
    // across a month boundary
    expect(studyDay(new Date(2026, 10, 1, 12))).toBe(studyDay(at(31, 12)) + 1)
  })
})

describe('box waits', () => {
  test('boxes wait same day, 1 day, 3 days and 7 days', () => {
    expect(BOX_WAIT_DAYS).toEqual([0, 1, 3, 7])
  })

  test('knew it makes a card due after the wait of its new box', () => {
    const now = at(26, 10)
    const today = studyDay(now)
    const session = startSession([a], {
      [a.id]: { box: 1, due: today, introduced: today - 9 },
    })
    const next = grade(session, 'knew', now)
    expect(next.progress[a.id]).toEqual({
      box: 2,
      due: today + 1,
      introduced: today - 9,
    })
  })

  test('later boxes wait 3 days, then 7 days', () => {
    const now = at(26, 10)
    const today = studyDay(now)
    const inBox2 = startSession([a], {
      [a.id]: { box: 2, due: today, introduced: today - 9 },
    })
    const box3 = grade(inBox2, 'knew', now)
    expect(box3.progress[a.id]).toMatchObject({ box: 3, due: today + 3 })
    const inBox3 = startSession([a], box3.progress)
    expect(grade(inBox3, 'knew', now).progress[a.id]).toMatchObject({
      box: 4,
      due: today + 7,
    })
  })

  test('a missed card goes back to box 1 and is due the same day', () => {
    const now = at(26, 10)
    const today = studyDay(now)
    const session = startSession([a], {
      [a.id]: { box: 3, due: today, introduced: today - 9 },
    })
    expect(grade(session, 'missed', now).progress[a.id]).toMatchObject({
      box: 1,
      due: today,
    })
  })

  test('a card graded for the first time is marked as introduced that day', () => {
    const now = at(26, 10)
    const next = grade(startSession([a]), 'knew', now)
    expect(next.progress[a.id].introduced).toBe(studyDay(now))
  })

  test('later grades keep the day the card was first introduced', () => {
    const first = at(20, 10)
    const later = at(26, 10)
    const once = grade(startSession([a]), 'missed', first)
    const again = grade(startSession([a], once.progress), 'knew', later)
    expect(again.progress[a.id].introduced).toBe(studyDay(first))
  })
})

describe('building a session', () => {
  test('a first session offers the first cards of the pool, up to the daily cap', () => {
    const queue = buildQueue(pool, {}, at(26, 10))
    expect(NEW_CARDS_PER_DAY).toBe(5)
    expect(kanaOf(queue)).toBe('あいうえお')
  })

  test('a card is due once its day arrives, and not before', () => {
    const now = at(26, 10)
    const today = studyDay(now)
    const progress: Progress = {
      [a.id]: { box: 2, due: today + 1, introduced: today },
    }
    expect(kanaOf(buildQueue([a], progress, now))).toBe('')
    expect(kanaOf(buildQueue([a], progress, at(27, 10)))).toBe('あ')
  })

  test('a card due at 3:59 a.m. waits until the study day rolls over', () => {
    const today = studyDay(at(26, 10))
    const progress: Progress = {
      [a.id]: { box: 2, due: today + 1, introduced: today },
    }
    expect(kanaOf(buildQueue([a], progress, at(27, 3, 59)))).toBe('')
    expect(kanaOf(buildQueue([a], progress, at(27, 4, 0)))).toBe('あ')
  })

  test('cards that have waited longest come back first', () => {
    const now = at(26, 10)
    const today = studyDay(now)
    const progress: Progress = {
      [a.id]: { box: 2, due: today - 1, introduced: today - 9 },
      [i.id]: { box: 2, due: today - 4, introduced: today - 9 },
      [u.id]: { box: 2, due: today - 2, introduced: today - 9 },
    }
    expect(kanaOf(buildQueue([a, i, u], progress, now))).toBe('いうあ')
  })

  test('no more than 5 new cards are introduced in one study day', () => {
    const morning = at(26, 9)
    const first = buildQueue(pool, {}, morning)
    expect(first).toHaveLength(5)
    // grade all five so they count as introduced today
    let session = startSession(first)
    for (let n = 0; n < 5; n++) session = grade(session, 'knew', morning)
    const later = buildQueue(pool, session.progress, at(26, 20))
    expect(kanaOf(later)).toBe('')
  })

  test('new cards that were only started, not graded, are offered again', () => {
    const now = at(26, 10)
    const session = grade(startSession(buildQueue(pool, {}, now)), 'knew', now)
    // one graded; four of today's five are still allowed
    const next = buildQueue(pool, session.progress, now)
    expect(kanaOf(next)).toBe('いうえお')
  })

  test('the cap resets when the next study day starts', () => {
    const day1 = at(26, 10)
    let session = startSession(buildQueue(pool, {}, day1))
    for (let n = 0; n < 5; n++) session = grade(session, 'knew', day1)
    expect(kanaOf(buildQueue(pool, session.progress, at(27, 3, 59)))).toBe('')
    const day2 = buildQueue(pool, session.progress, at(27, 4, 0))
    // the five vowels are due again (box 2 waits 1 day), and five new cards come in
    expect(day2).toHaveLength(10)
    expect(new Set(kanaOf(day2))).toEqual(new Set('あいうえおかきくけこ'))
  })

  test('due reviews and new cards are mixed, not shown as two blocks', () => {
    const now = at(26, 10)
    const today = studyDay(now)
    const progress: Progress = {
      [a.id]: { box: 2, due: today, introduced: today - 9 },
      [i.id]: { box: 2, due: today, introduced: today - 9 },
      [u.id]: { box: 2, due: today, introduced: today - 9 },
    }
    const queue = buildQueue([a, i, u, ...kRow], progress, now)
    // reviews あ い う and new か き く け こ alternate while both last
    expect(kanaOf(queue)).toBe('あかいきうくけこ')
  })

  test('with nothing due and nothing new the queue is empty', () => {
    expect(buildQueue([], {}, at(26, 10))).toEqual([])
  })

  test('the pool order is kept for new cards', () => {
    expect(kanaOf(buildQueue([...kRow, ...vowels], {}, at(26, 10)))).toBe(
      'かきくけこ',
    )
  })

  test('never offers the same card twice', () => {
    const queue = buildQueue(pool, {}, at(26, 10))
    expect(new Set(queue.map((card) => card.id)).size).toBe(queue.length)
    expect(queue.includes(e)).toBe(true)
    expect(queue.includes(o)).toBe(true)
  })
})
