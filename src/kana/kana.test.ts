import { describe, expect, test } from 'vitest'
import { allCards, cardsOfGroup, counterpart, getCard, groups } from './kana'

const kanaOf = (cards: ReadonlyArray<{ kana: string }>) =>
  cards.map((card) => card.kana).join('')

describe('learning order', () => {
  test('lists the ten groups in the order they are introduced', () => {
    expect(groups.map((group) => group.id)).toEqual([
      'vowels',
      'k',
      's',
      't',
      'n',
      'h',
      'm',
      'y',
      'r',
      'w',
    ])
  })

  test('names groups the way the interface shows them', () => {
    expect(groups[0].name).toBe('vowels')
    expect(groups[1].name).toBe('k group')
  })
})

describe('group contents', () => {
  test('the vowels group is exactly あ い う え お in hiragana', () => {
    expect(kanaOf(cardsOfGroup('vowels', 'hiragana'))).toBe('あいうえお')
  })

  test('the w group holds わ を ん, so ん is not a vowel', () => {
    expect(kanaOf(cardsOfGroup('w', 'hiragana'))).toBe('わをん')
    expect(kanaOf(cardsOfGroup('w', 'katakana'))).toBe('ワヲン')
    expect(kanaOf(cardsOfGroup('vowels', 'hiragana'))).not.toContain('ん')
    expect(kanaOf(cardsOfGroup('vowels', 'katakana'))).not.toContain('ン')
  })

  test('the k group is か き く け こ and the y group has only three kana', () => {
    expect(kanaOf(cardsOfGroup('k', 'hiragana'))).toBe('かきくけこ')
    expect(kanaOf(cardsOfGroup('y', 'katakana'))).toBe('ヤユヨ')
  })

  test('there are 46 kana in each script and none repeat', () => {
    for (const script of ['hiragana', 'katakana'] as const) {
      const cards = allCards(script)
      expect(cards).toHaveLength(46)
      expect(new Set(kanaOf(cards)).size).toBe(46)
    }
  })

  test('hiragana cards come back in learning order', () => {
    expect(kanaOf(allCards('hiragana'))).toBe(
      'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',
    )
  })

  test('katakana cards come back in the same learning order', () => {
    expect(kanaOf(allCards('katakana'))).toBe(
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
    )
  })
})

describe('romaji', () => {
  test('reads every kana in learning order, the same in both scripts', () => {
    const sequence =
      'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'
    for (const script of ['hiragana', 'katakana'] as const) {
      expect(
        allCards(script)
          .map((card) => card.romaji)
          .join(' '),
      ).toBe(sequence)
    }
  })

  test('uses the common reading for the irregular kana', () => {
    const romajiOf = (script: 'hiragana' | 'katakana', kana: string) =>
      allCards(script).find((card) => card.kana === kana)?.romaji
    expect(romajiOf('hiragana', 'し')).toBe('shi')
    expect(romajiOf('hiragana', 'ち')).toBe('chi')
    expect(romajiOf('hiragana', 'つ')).toBe('tsu')
    expect(romajiOf('hiragana', 'ふ')).toBe('fu')
    expect(romajiOf('hiragana', 'を')).toBe('wo')
    expect(romajiOf('hiragana', 'ん')).toBe('n')
    expect(romajiOf('katakana', 'シ')).toBe('shi')
  })
})

describe('cards', () => {
  test('a card is one kana in one script with its group', () => {
    const [first] = cardsOfGroup('vowels', 'hiragana')
    expect(first).toMatchObject({
      kana: 'あ',
      script: 'hiragana',
      romaji: 'a',
      groupId: 'vowels',
    })
  })

  test('every card has its own id that finds the same card again', () => {
    const cards = [...allCards('hiragana'), ...allCards('katakana')]
    expect(new Set(cards.map((card) => card.id)).size).toBe(92)
    for (const card of cards) expect(getCard(card.id)).toEqual(card)
  })

  test('an unknown id finds nothing', () => {
    expect(getCard('hiragana:x')).toBeUndefined()
  })
})

describe('counterpart', () => {
  test('あ and ア are each other counterparts with the same reading and group', () => {
    const hiragana = allCards('hiragana')[0]
    const katakana = counterpart(hiragana)
    expect(katakana).toMatchObject({
      kana: 'ア',
      script: 'katakana',
      romaji: 'a',
      groupId: 'vowels',
    })
    expect(counterpart(katakana)).toEqual(hiragana)
  })

  test('every card has a counterpart in the other script', () => {
    for (const card of allCards('hiragana')) {
      const other = counterpart(card)
      expect(other.script).toBe('katakana')
      expect(other.romaji).toBe(card.romaji)
      expect(other.groupId).toBe(card.groupId)
    }
  })
})
