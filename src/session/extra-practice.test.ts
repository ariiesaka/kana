import { describe, expect, test } from 'vitest'
import { allCards, type Card } from '#/kana/kana'
import {
  buildExtraQueue,
  buildQueue,
  type CardProgress,
  continueSession,
  currentCard,
  EXTRA_PRACTICE_SIZE,
  grade,
  isFinished,
  type Progress,
  poolFor,
  SUMMARY_AFTER,
  startSession,
  studyDay,
  summaryDue,
} from './session'

const NOW = new Date(2026, 9, 26, 10, 0)
const TODAY = studyDay(NOW)
const pool = poolFor('hiragana')

const kanaOf = (cards: ReadonlyArray<{ kana: string }>) =>
  cards.map((card) => card.kana).join('')

function saved(
  box: number,
  introduced: number,
  due = TODAY + 30,
): CardProgress {
  return { box, due, introduced }
}

// answers the current card until the summary shows or the queue ends
function answerUntilStop(
  start: ReturnType<typeof startSession>,
  verdict: 'knew' | 'missed',
) {
  let session = start
  let steps = 0
  while (!isFinished(session) && !summaryDue(session) && steps < 200) {
    session = grade(session, verdict, NOW)
    steps++
  }
  return { session, steps }
}

describe('the soft stop summary', () => {
  const many = allCards('hiragana').slice(0, 15)

  test('appears after about 10 cards', () => {
    expect(SUMMARY_AFTER).toBe(10)
    const { session, steps } = answerUntilStop(startSession(many), 'knew')
    expect(steps).toBe(SUMMARY_AFTER)
    expect(summaryDue(session)).toBe(true)
    expect(isFinished(session)).toBe(false)
  })

  test('does not appear before that', () => {
    const session = grade(startSession(many), 'knew', NOW)
    expect(summaryDue(session)).toBe(false)
  })

  test('lists the cards missed since the last stop, once each', () => {
    let session = startSession(many)
    session = grade(session, 'missed', NOW)
    session = grade(session, 'knew', NOW)
    session = grade(session, 'knew', NOW)
    session = grade(session, 'knew', NOW)
    // the first card comes back and is missed again
    expect(currentCard(session)?.kana).toBe(many[0].kana)
    session = grade(session, 'missed', NOW)
    const { session: stop } = answerUntilStop(session, 'knew')
    expect(summaryDue(stop)).toBe(true)
    expect(kanaOf(stop.missed)).toBe(many[0].kana)
  })

  test('continue resumes the same queue and starts a new count', () => {
    const { session: stop } = answerUntilStop(startSession(many), 'knew')
    const resumed = continueSession(stop)
    expect(resumed.queue).toBe(stop.queue)
    expect(resumed.progress).toBe(stop.progress)
    expect(summaryDue(resumed)).toBe(false)
    expect(resumed.missed).toEqual([])
    const { steps } = answerUntilStop(resumed, 'knew')
    // only 5 cards were left, so the queue ends before another summary
    expect(steps).toBe(many.length - SUMMARY_AFTER)
  })

  test('is not shown when the last card ends the session', () => {
    const ten = many.slice(0, SUMMARY_AFTER)
    const { session } = answerUntilStop(startSession(ten), 'knew')
    expect(isFinished(session)).toBe(true)
    expect(summaryDue(session)).toBe(false)
  })

  test('leaving at the stop loses nothing that was graded', () => {
    const { session } = answerUntilStop(startSession(many), 'knew')
    expect(Object.keys(session.progress)).toHaveLength(SUMMARY_AFTER)
  })
})

describe('extra practice', () => {
  test('offers recently missed cards first, then the newest', () => {
    const [a, i, u, e, o, ka] = pool
    const progress: Progress = {
      [a.id]: saved(3, TODAY - 5),
      [i.id]: saved(2, TODAY - 4),
      [u.id]: saved(1, TODAY - 3),
      [e.id]: saved(2, TODAY - 1),
      [o.id]: saved(1, TODAY - 2),
      [ka.id]: saved(3, TODAY),
    }
    expect(kanaOf(buildExtraQueue(pool, progress))).toBe(
      [o, u, ka, e, i, a].map((card) => card.kana).join(''),
    )
  })

  test('holds at most a short stretch of cards', () => {
    const progress: Progress = Object.fromEntries(
      pool.map((card, index) => [card.id, saved(2, TODAY - index)]),
    )
    expect(buildExtraQueue(pool, progress)).toHaveLength(EXTRA_PRACTICE_SIZE)
  })

  test('is empty when nothing was ever graded', () => {
    expect(buildExtraQueue(pool, {})).toEqual([])
  })

  test('only offers cards in the pool', () => {
    const katakana: Card = allCards('katakana')[0]
    const progress: Progress = { [katakana.id]: saved(1, TODAY) }
    expect(buildExtraQueue(pool, progress)).toEqual([])
  })

  test('never changes boxes, due days, or introduced days', () => {
    const [a, i, u] = pool
    const progress: Progress = {
      [a.id]: saved(1, TODAY - 2),
      [i.id]: saved(2, TODAY - 1),
      [u.id]: saved(3, TODAY),
    }
    let session = startSession(buildExtraQueue(pool, progress), progress, {
      extra: true,
    })
    for (const verdict of ['knew', 'missed', 'knew', 'knew', 'knew'] as const) {
      session = grade(session, verdict, NOW)
    }
    expect(session.progress).toBe(progress)
  })

  test('does not use up the new cards of the day', () => {
    const progress: Progress = { [pool[0].id]: saved(1, TODAY - 1, TODAY + 1) }
    const before = kanaOf(buildQueue(pool, progress, NOW))
    let session = startSession(buildExtraQueue(pool, progress), progress, {
      extra: true,
    })
    session = grade(session, 'knew', NOW)
    expect(kanaOf(buildQueue(pool, session.progress, NOW))).toBe(before)
  })

  test('a missed card still comes back within the session', () => {
    const [a, i, u, e] = pool
    const progress: Progress = {
      [a.id]: saved(1, TODAY - 1),
      [i.id]: saved(1, TODAY - 2),
      [u.id]: saved(1, TODAY - 3),
      [e.id]: saved(1, TODAY - 4),
    }
    let session = startSession(buildExtraQueue(pool, progress), progress, {
      extra: true,
    })
    const first = currentCard(session)
    session = grade(session, 'missed', NOW)
    expect(session.queue).toContain(first)
  })

  test('still shows the summary after about 10 cards', () => {
    const progress: Progress = Object.fromEntries(
      pool.map((card, index) => [card.id, saved(1, TODAY - index)]),
    )
    const { session } = answerUntilStop(
      startSession(pool.slice(0, 12), progress, { extra: true }),
      'knew',
    )
    expect(summaryDue(session)).toBe(true)
  })
})
