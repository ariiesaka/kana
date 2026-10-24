import { describe, expect, test } from 'vitest'
import type { Progress } from '#/session/session'
import { createProgressStore, STORAGE_KEY } from './progress-store'

// a minimal stand-in for window.localStorage
function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

const progress: Progress = {
  'hiragana:あ': { box: 2, due: 20_000, introduced: 19_999 },
  'hiragana:い': { box: 1, due: 20_000, introduced: 20_000 },
}

describe('progress store', () => {
  test('loads nothing when nothing was saved', () => {
    expect(createProgressStore(fakeStorage()).load()).toEqual({})
  })

  test('what was saved is loaded again', () => {
    const storage = fakeStorage()
    createProgressStore(storage).save(progress)
    expect(createProgressStore(storage).load()).toEqual(progress)
  })

  test('saving replaces the earlier progress', () => {
    const storage = fakeStorage()
    const store = createProgressStore(storage)
    store.save(progress)
    store.save({ 'hiragana:う': { box: 3, due: 20_003, introduced: 20_000 } })
    expect(Object.keys(store.load())).toEqual(['hiragana:う'])
  })

  test('progress is kept under one key in the browser', () => {
    const storage = fakeStorage()
    createProgressStore(storage).save(progress)
    expect([...storage.data.keys()]).toEqual([STORAGE_KEY])
  })

  test('unreadable saved data loads as no progress', () => {
    expect(
      createProgressStore(fakeStorage({ [STORAGE_KEY]: '{not json' })).load(),
    ).toEqual({})
    expect(
      createProgressStore(fakeStorage({ [STORAGE_KEY]: '[1,2,3]' })).load(),
    ).toEqual({})
  })

  test('entries that are not valid cards are dropped, the rest kept', () => {
    const saved = JSON.stringify({
      version: 1,
      progress: {
        'hiragana:あ': { box: 2, due: 5, introduced: 4 },
        'hiragana:い': { box: 'two', due: 5, introduced: 4 },
        'hiragana:う': { box: 9, due: 5, introduced: 4 },
        'hiragana:え': null,
      },
    })
    const loaded = createProgressStore(
      fakeStorage({ [STORAGE_KEY]: saved }),
    ).load()
    expect(Object.keys(loaded)).toEqual(['hiragana:あ'])
  })

  test('saved data from a newer version is ignored', () => {
    const saved = JSON.stringify({ version: 99, progress: progress })
    expect(
      createProgressStore(fakeStorage({ [STORAGE_KEY]: saved })).load(),
    ).toEqual({})
  })
})

describe('when browser storage is unavailable', () => {
  test('there is no storage at all: loads nothing and saving does nothing', () => {
    const store = createProgressStore(undefined)
    expect(store.load()).toEqual({})
    expect(() => store.save(progress)).not.toThrow()
  })

  test('reading throws: loads nothing', () => {
    const store = createProgressStore({
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {},
    })
    expect(store.load()).toEqual({})
  })

  test('writing throws (full or blocked): saving does not break the session', () => {
    const store = createProgressStore({
      getItem: () => null,
      setItem: () => {
        throw new Error('quota exceeded')
      },
    })
    expect(() => store.save(progress)).not.toThrow()
  })
})
