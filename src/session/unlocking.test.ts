import { describe, expect, test } from 'vitest'
import { allCards, type Card, cardsOfGroup, groups } from '#/kana/kana'
import {
  buildQueue,
  isGroupReliable,
  type Progress,
  RELIABLE_BOX,
  studyDay,
} from './session'

const pool = allCards('hiragana')
const NOW = new Date(2026, 9, 26, 10, 0)
const TODAY = studyDay(NOW)

const kanaOf = (cards: ReadonlyArray<{ kana: string }>) =>
  cards.map((card) => card.kana).join('')

const groupCards = (index: number): Card[] =>
  cardsOfGroup(groups[index].id, 'hiragana')

// progress for cards that were introduced earlier and are in a box
const inBox = (cards: ReadonlyArray<Card>, box: number, due = TODAY + 30) =>
  Object.fromEntries(
    cards.map((card) => [card.id, { box, due, introduced: TODAY - 9 }]),
  ) as Progress

const merge = (...parts: Progress[]): Progress => Object.assign({}, ...parts)

// every group before `count` is reliable and not due today
const reliableGroups = (count: number): Progress =>
  merge(
    ...groups
      .slice(0, count)
      .map((_, index) => inBox(groupCards(index), RELIABLE_BOX)),
  )

describe('when a group is reliable', () => {
  test('a card is reliable from box 3 up, so box 2 is not enough', () => {
    const vowels = groupCards(0)
    expect(isGroupReliable(vowels, inBox(vowels, RELIABLE_BOX - 1))).toBe(false)
    expect(isGroupReliable(vowels, inBox(vowels, RELIABLE_BOX))).toBe(true)
    expect(isGroupReliable(vowels, inBox(vowels, 4))).toBe(true)
  })

  test('4 of 5 cards (80%) is reliable and 3 of 5 is not', () => {
    const vowels = groupCards(0)
    const reliable = (count: number) =>
      merge(
        inBox(vowels.slice(0, count), RELIABLE_BOX),
        inBox(vowels.slice(count), 1),
      )
    expect(isGroupReliable(vowels, reliable(4))).toBe(true)
    expect(isGroupReliable(vowels, reliable(3))).toBe(false)
  })

  test('in a group of 3, two reliable cards are not enough', () => {
    const wGroup = groupCards(9)
    const reliable = (count: number) =>
      merge(
        inBox(wGroup.slice(0, count), RELIABLE_BOX),
        inBox(wGroup.slice(count), 1),
      )
    expect(isGroupReliable(wGroup, reliable(2))).toBe(false)
    expect(isGroupReliable(wGroup, reliable(3))).toBe(true)
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
    const vowels = groupCards(0)
    const progress = inBox(vowels, 2, TODAY)
    const queue = buildQueue(pool, progress, NOW)
    expect(kanaOf(queue)).toBe('あいうえお')
  })

  test('the next group unlocks as soon as the vowels reach 80%', () => {
    const vowels = groupCards(0)
    const progress = merge(
      inBox(vowels.slice(0, 3), RELIABLE_BOX),
      inBox(vowels.slice(3), 1, TODAY + 30),
    )
    expect(kanaOf(buildQueue(pool, progress, NOW))).toBe('')

    const reliable = merge(
      inBox(vowels.slice(0, 4), RELIABLE_BOX),
      inBox(vowels.slice(4), 1, TODAY + 30),
    )
    expect(kanaOf(buildQueue(pool, reliable, NOW))).toBe('かきくけこ')
  })

  test('each group unlocks the next, in the full learning order', () => {
    for (let index = 0; index < groups.length - 1; index++) {
      const queue = buildQueue(pool, reliableGroups(index + 1), NOW)
      expect(kanaOf(queue)).toBe(kanaOf(groupCards(index + 1)).slice(0, 5))
    }
  })

  test('the w group is the last to unlock', () => {
    expect(kanaOf(buildQueue(pool, reliableGroups(9), NOW))).toBe('わをん')
    const beforeW = merge(
      reliableGroups(8),
      inBox(groupCards(8), 1, TODAY + 30),
    )
    expect(kanaOf(buildQueue(pool, beforeW, NOW))).toBe('')
  })

  test('once every group is reliable there is nothing new to introduce', () => {
    expect(kanaOf(buildQueue(pool, reliableGroups(10), NOW))).toBe('')
  })

  test('a card of the current group that was never graded comes first', () => {
    const vowels = groupCards(0)
    const progress = inBox(vowels.slice(0, 4), RELIABLE_BOX)
    // 4 of 5 is reliable, so お comes first and the k group fills the rest
    expect(kanaOf(buildQueue(pool, progress, NOW))).toBe('おかきくけ')
  })

  test('new cards still stop at the daily cap when a group unlocks', () => {
    const queue = buildQueue(pool, reliableGroups(1), NOW)
    expect(queue).toHaveLength(5)
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
    const queue = buildQueue(pool, progress, NOW)
    // the vowels are reliable (4 of 5), so the review of あ is mixed with the k group
    expect(kanaOf(queue)).toBe('あかきくけこ')
  })

  test('reviews of earlier groups continue after later groups unlock', () => {
    const progress = merge(
      reliableGroups(2),
      inBox(groupCards(0).slice(0, 2), RELIABLE_BOX, TODAY),
    )
    const queue = buildQueue(pool, progress, NOW)
    expect(kanaOf(queue).startsWith('あ')).toBe(true)
    expect(kanaOf(queue)).toContain('い')
    // two reviews, and new cards from the s group
    expect(queue).toHaveLength(7)
  })
})
