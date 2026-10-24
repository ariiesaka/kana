import { describe, expect, test } from 'vitest'
import { cardsOfGroup } from '#/kana/kana'
import {
  BOX_COUNT,
  boxOf,
  currentCard,
  grade,
  isFinished,
  type Session,
  startSession,
} from './session'

const vowels = cardsOfGroup('vowels', 'hiragana')
const [a, i, u, e, o] = vowels

// grade the current card with each grade in turn, returning the kana shown
function play(session: Session, grades: Array<'knew' | 'missed'>) {
  const shown: string[] = []
  let next = session
  for (const verdict of grades) {
    shown.push(currentCard(next)?.kana ?? '')
    next = grade(next, verdict)
  }
  shown.push(currentCard(next)?.kana ?? '')
  return { shown, session: next }
}

describe('starting a session', () => {
  test('shows the first card first, and every card starts in box 1', () => {
    const session = startSession(vowels)
    expect(currentCard(session)).toEqual(a)
    for (const card of vowels) expect(boxOf(session, card)).toBe(1)
    expect(isFinished(session)).toBe(false)
  })

  test('an empty session is finished with no current card', () => {
    const session = startSession([])
    expect(currentCard(session)).toBeUndefined()
    expect(isFinished(session)).toBe(true)
  })

  test('keeps boxes the learner already has', () => {
    const session = startSession(vowels, { [i.id]: { box: 3 } })
    expect(boxOf(session, i)).toBe(3)
    expect(boxOf(session, a)).toBe(1)
  })
})

describe('knew it', () => {
  test('moves the card up one box and shows the next card', () => {
    const next = grade(startSession(vowels), 'knew')
    expect(boxOf(next, a)).toBe(2)
    expect(currentCard(next)).toEqual(i)
  })

  test('never goes past the top box', () => {
    const top = startSession([a], { [a.id]: { box: BOX_COUNT } })
    expect(boxOf(grade(top, 'knew'), a)).toBe(BOX_COUNT)
  })

  test('leaves the other cards in their boxes', () => {
    const next = grade(startSession(vowels), 'knew')
    for (const card of [i, u, e, o]) expect(boxOf(next, card)).toBe(1)
  })

  test('a card that was known does not come back in the session', () => {
    const { shown } = play(startSession(vowels), [
      'knew',
      'knew',
      'knew',
      'knew',
      'knew',
    ])
    expect(shown).toEqual(['あ', 'い', 'う', 'え', 'お', ''])
  })
})

describe('missed', () => {
  test('puts the card back in box 1', () => {
    const session = startSession(vowels, { [a.id]: { box: 3 } })
    expect(boxOf(grade(session, 'missed'), a)).toBe(1)
  })

  test('brings the card back after 3 other cards', () => {
    const { shown } = play(startSession(vowels), [
      'missed',
      'knew',
      'knew',
      'knew',
    ])
    expect(shown).toEqual(['あ', 'い', 'う', 'え', 'あ'])
  })

  test('brings it back after 3 more cards if it is missed again', () => {
    const { shown } = play(startSession(vowels), [
      'missed',
      'knew',
      'knew',
      'knew',
      'missed',
      'knew',
      'knew',
    ])
    expect(shown).toEqual(['あ', 'い', 'う', 'え', 'あ', 'お', 'あ', ''])
  })

  test('with fewer than 3 other cards left, it returns after the others', () => {
    const { shown } = play(startSession([a, i, u]), ['missed', 'knew', 'knew'])
    expect(shown).toEqual(['あ', 'い', 'う', 'あ'])
  })

  test('the last card left comes straight back when missed', () => {
    const { shown } = play(startSession([a]), ['missed', 'missed', 'knew'])
    expect(shown).toEqual(['あ', 'あ', 'あ', ''])
  })
})

describe('finishing', () => {
  test('is finished when every card has been known', () => {
    const { session } = play(startSession([a, i]), ['knew', 'knew'])
    expect(isFinished(session)).toBe(true)
    expect(currentCard(session)).toBeUndefined()
  })

  test('grading a finished session changes nothing', () => {
    const { session } = play(startSession([a]), ['knew'])
    expect(grade(session, 'missed')).toEqual(session)
  })

  test('grading never changes the session it was given', () => {
    const session = startSession(vowels)
    grade(session, 'missed')
    expect(currentCard(session)).toEqual(a)
    expect(boxOf(session, a)).toBe(1)
  })
})
