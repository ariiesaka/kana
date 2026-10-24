import { describe, expect, test } from 'vitest'
import type { Progress } from '#/session/session'
import { DEFAULT_SETTINGS } from '#/settings/settings'
import { createProgressStore, STORAGE_KEY } from './progress-store'

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
}

describe('settings', () => {
  test('are hiragana only until the learner chooses otherwise', () => {
    expect(DEFAULT_SETTINGS).toEqual({ scripts: 'hiragana' })
    expect(createProgressStore(fakeStorage()).loadSettings()).toEqual(
      DEFAULT_SETTINGS,
    )
  })

  test('a saved choice is loaded again, also by a new store', () => {
    const storage = fakeStorage()
    createProgressStore(storage).saveSettings({ scripts: 'both' })
    expect(createProgressStore(storage).loadSettings()).toEqual({
      scripts: 'both',
    })
  })

  test('saving progress keeps the settings, and saving settings keeps the progress', () => {
    const storage = fakeStorage()
    const store = createProgressStore(storage)
    store.saveSettings({ scripts: 'both' })
    store.save(progress)
    expect(store.loadSettings()).toEqual({ scripts: 'both' })
    store.saveSettings({ scripts: 'hiragana' })
    expect(store.load()).toEqual(progress)
  })

  test('both are kept under the one key', () => {
    const storage = fakeStorage()
    const store = createProgressStore(storage)
    store.save(progress)
    store.saveSettings({ scripts: 'both' })
    expect([...storage.data.keys()]).toEqual([STORAGE_KEY])
  })

  test('progress saved before settings existed loads with the default settings', () => {
    const saved = JSON.stringify({ version: 1, progress })
    const store = createProgressStore(fakeStorage({ [STORAGE_KEY]: saved }))
    expect(store.load()).toEqual(progress)
    expect(store.loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  test('a choice that is not one of the two is ignored', () => {
    const saved = JSON.stringify({
      version: 1,
      progress,
      settings: { scripts: 'katakana' },
    })
    const store = createProgressStore(fakeStorage({ [STORAGE_KEY]: saved }))
    expect(store.loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(store.load()).toEqual(progress)
  })

  test('extra fields in saved settings are not kept', () => {
    const saved = JSON.stringify({
      version: 1,
      progress,
      settings: { scripts: 'both', theme: 'light' },
    })
    const store = createProgressStore(fakeStorage({ [STORAGE_KEY]: saved }))
    expect(store.loadSettings()).toEqual({ scripts: 'both' })
  })
})

describe('reset', () => {
  test('clears every card and puts the settings back to the defaults', () => {
    const store = createProgressStore(fakeStorage())
    store.save(progress)
    store.saveSettings({ scripts: 'both' })
    store.reset()
    expect(store.load()).toEqual({})
    expect(store.loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  test('also clears data this version cannot read', () => {
    const saved = JSON.stringify({ version: 99, progress })
    const storage = fakeStorage({ [STORAGE_KEY]: saved })
    createProgressStore(storage).reset()
    expect(createProgressStore(storage).load()).toEqual({})
  })
})

describe('data this version cannot read', () => {
  const newer = JSON.stringify({
    version: 99,
    progress,
    settings: { scripts: 'both' },
  })

  test('saving progress never overwrites data from a newer version', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: newer })
    createProgressStore(storage).save(progress)
    expect(storage.data.get(STORAGE_KEY)).toBe(newer)
  })

  test('saving settings never overwrites data from a newer version', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: newer })
    createProgressStore(storage).saveSettings({ scripts: 'hiragana' })
    expect(storage.data.get(STORAGE_KEY)).toBe(newer)
  })

  test('garbage that is not saved data is replaced by the next save', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{not json' })
    const store = createProgressStore(storage)
    store.save(progress)
    expect(createProgressStore(storage).load()).toEqual(progress)
  })
})

describe('whether reset worked', () => {
  test('says so when the saved data was cleared', () => {
    expect(createProgressStore(fakeStorage()).reset()).toBe(true)
  })

  test('says so when there is no storage, since there is nothing to clear', () => {
    expect(createProgressStore(undefined).reset()).toBe(true)
  })

  test('admits it when the browser refuses the write', () => {
    const store = createProgressStore({
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(store.reset()).toBe(false)
  })
})

describe('when browser storage is unavailable', () => {
  test('settings load as the defaults, and saving and resetting do nothing', () => {
    const store = createProgressStore(undefined)
    expect(store.loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(() => store.saveSettings({ scripts: 'both' })).not.toThrow()
    expect(() => store.reset()).not.toThrow()
  })

  test('a store that throws never breaks settings or reset', () => {
    const store = createProgressStore({
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('quota exceeded')
      },
    })
    expect(store.loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(() => store.saveSettings({ scripts: 'both' })).not.toThrow()
    expect(() => store.reset()).not.toThrow()
  })
})
