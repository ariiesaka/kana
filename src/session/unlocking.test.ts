import { describe, expect, test } from 'vitest'
import { allCards, type Card, cardsOfGroup, groups } from '#/kana/kana'
import {
  buildQueue,
  type CardProgress,
  isGroupReliable,
  type Progress,
  RELIABLE_BOX,
  studyDay,
} from './session'

const pool = allCards('hiragana')
const NOW = new Date(2026, 9, 26, 10, 0)
const TODAY = studyDay(NOW)
const LATER = TODAY + 30

const kanaOf = (cards: ReadonlyArray<{ kana: string }>) =>
  cards.map((card) => card.kana).join('')

const groupCards = (index: number): Card[] =>
  cardsOfGroup(groups[index].id, 'hiragana')

// progress for cards that were introduced earlier and sit in a box
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

// the first `count` cards are reliable, the rest of the group is in box 1
function withReliableCount(cards: ReadonlyArray<Card>, count: number) {
  return merge(
    inBox(cards.slice(0, count), RELIABLE_BOX),
    inBox(cards.slice(count), 1),
  )
}

// every group before `count` is reliable and not due today
function reliableGroups(count: number): Progress {
  const parts: Progress[] = []
  for (let index = 0; index < count; index++) {
    parts.push(inBox(groupCards(index), RELIABLE_BOX))
  }
  return merge(...parts)
}

describe('when a group is reliable', () => {
  test('a card must be in a high enough box, so one box below is not enough', () => {
    const vowels = groupCards(0)
    expect(isGroupReliable(vowels, inBox(vowels, RELIABLE_BOX - 1))).toBe(false)
    expect(isGroupReliable(vowels, inBox(vowels, RELIABLE_BOX))).toBe(true)
    expect(isGroupReliable(vowels, inBox(vowels, RELIABLE_BOX + 1))).toBe(true)
  })

  test('4 of 5 cards (80%) is reliable and 3 of 5 is not', () => {
    const vowels = groupCards(0)
    expect(isGroupReliable(vowels, withReliableCount(vowels, 4))).toBe(true)
    expect(isGroupReliable(vowels, withReliableCount(vowels, 3))).toBe(false)
  })

  test('in a group of 3, two reliable cards are not enough', () => {
    const wGroup = groupCards(9)
    expect(isGroupReliable(wGroup, withReliableCount(wGroup, 2))).toBe(false)
    expect(isGroupReliable(wGroup, withReliableCount(wGroup, 3))).toBe(true)
  })

  test('cards that were never graded count as not reliable', () => {
    const vowels = groupCards(0)
    expect(isGroupReliable(vowels, inBox(vowels.slice(0, 3), 4))).toBe(false)
    expect(isGroupReliable(vowels, {})).toBe(false)
  })
})

describe('which group supplies new cards', () => {
  test('only the vowels at first, even though the pool holds every group', () => {
    expect(kanaOf(buildQueue(pool, {}, NOW))).toBe('あいうえお')
  })

  test('the next group stays locked while the vowels are not reliable', () => {
    // all five vowels were graded and none is due, but they are in box 2
    const progress = inBox(groupCards(0), RELIABLE_BOX - 1)
    expect(kanaOf(buildQueue(pool, progress, NOW))).toBe('')
  })

  test('the next group unlocks as soon as the vowels reach 80%', () => {
    const vowels = groupCards(0)
    expect(kanaOf(buildQueue(pool, withReliableCount(vowels, 3), NOW))).toBe('')
    expect(kanaOf(buildQueue(pool, withReliableCount(vowels, 4), NOW))).toBe(
      'かきくけこ',
    )
  })

  test.each(
    groups.slice(1).map((group, index) => ({ group, previous: index + 1 })),
  )(
    'the $group.name opens once the group before it is reliable',
    ({ group, previous }) => {
      const queue = buildQueue(pool, reliableGroups(previous), NOW)
      expect(kanaOf(queue)).toBe(
        kanaOf(cardsOfGroup(group.id, 'hiragana')).slice(0, 5),
      )
    },
  )

  test('the w group is the last to unlock', () => {
    expect(kanaOf(buildQueue(pool, reliableGroups(9), NOW))).toBe('わをん')
    const beforeW = merge(reliableGroups(8), inBox(groupCards(8), 1))
    expect(kanaOf(buildQueue(pool, beforeW, NOW))).toBe('')
  })

  test('once every group is reliable there is nothing new to introduce', () => {
    expect(kanaOf(buildQueue(pool, reliableGroups(10), NOW))).toBe('')
  })

  test('a card of the current group that was never graded comes first', () => {
    const progress = inBox(groupCards(0).slice(0, 4), RELIABLE_BOX)
    // 4 of 5 is reliable, so お comes first and the k group fills the rest
    expect(kanaOf(buildQueue(pool, progress, NOW))).toBe('おかきくけ')
  })

  test('the daily cap counts cards introduced today, whichever group they are in', () => {
    const progress = merge(
      reliableGroups(1),
      inBox(groupCards(1).slice(0, 3), 1, LATER, TODAY),
    )
    // three k cards started today leave room for two more
    expect(kanaOf(buildQueue(pool, progress, NOW))).toBe('けこ')
  })

  test('new cards still stop at the daily cap when a group unlocks', () => {
    expect(buildQueue(pool, reliableGroups(1), NOW)).toHaveLength(5)
  })
})

describe('reliability never removes cards from review', () => {
  test('a stubborn card in a reliable group still comes back when due', () => {
    const vowels = groupCards(0)
    const progress = merge(
      inBox(vowels.slice(1), RELIABLE_BOX),
      // あ keeps being missed: box 1, due today
      inBox(vowels.slice(0, 1), 1, TODAY),
    )
    // the vowels are reliable (4 of 5), so the review of あ mixes with the k group
    expect(kanaOf(buildQueue(pool, progress, NOW))).toBe('あかきくけこ')
  })

  test('reviews of earlier groups continue after later groups unlock', () => {
    const progress = merge(
      reliableGroups(2),
      inBox(groupCards(0).slice(0, 2), RELIABLE_BOX, TODAY),
    )
    // reviews あ い, mixed with the five new cards of the s group
    expect(kanaOf(buildQueue(pool, progress, NOW))).toBe('あさいしすせそ')
  })

  test('when a group slips below reliable, its next group stops supplying new cards but keeps its reviews', () => {
    const vowels = groupCards(0)
    const kGroup = groupCards(1)
    const progress = merge(
      // two vowels fell back to box 1, so the vowels are no longer reliable
      withReliableCount(vowels, 3),
      // the k group was already introduced; か is due today
      inBox(kGroup, 2),
      inBox(kGroup.slice(0, 1), 2, TODAY),
    )
    expect(kanaOf(buildQueue(pool, progress, NOW))).toBe('か')
  })
})
