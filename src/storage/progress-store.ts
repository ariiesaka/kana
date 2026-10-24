import { BOX_COUNT, type CardProgress, type Progress } from '#/session/session'
import {
  DEFAULT_SETTINGS,
  type Settings,
  toSettings,
} from '#/settings/settings'

// the only place that knows where progress and settings live; swap this module
// to change the backend (see ADR 0001)
export const STORAGE_KEY = 'kana:progress'
const VERSION = 1

// the part of window.localStorage this store needs
export type KeyValueStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type ProgressStore = {
  load(): Progress
  save(progress: Progress): void
  loadSettings(): Settings
  saveSettings(settings: Settings): void
  // forgets every card and puts the settings back to the defaults; false when
  // the browser refused to clear it
  reset(): boolean
}

type Saved = { progress: Progress; settings: Settings }

// what was found in storage: the data, and whether it came from a newer
// version of the app, which this version must not write over
type Found = { saved: Saved; newer: boolean }

const EMPTY: Saved = Object.freeze({
  progress: Object.freeze({}),
  settings: DEFAULT_SETTINGS,
})

// storage can be missing or throw (private modes, blocked cookies, full disk);
// the store then behaves as if nothing was saved, and the session still works
export function createProgressStore(
  storage: KeyValueStorage | undefined,
): ProgressStore {
  function read(): Found {
    try {
      const raw = storage?.getItem(STORAGE_KEY)
      return raw ? parse(raw) : { saved: EMPTY, newer: false }
    } catch {
      return { saved: EMPTY, newer: false }
    }
  }

  function write(saved: Saved): boolean {
    try {
      storage?.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: VERSION, ...saved }),
      )
      return true
    } catch {
      // nothing saved; the learner keeps practicing
      return false
    }
  }

  // changes one half of the saved data and keeps the other, unless the data
  // belongs to a newer version of the app: only a reset may replace that
  function update(change: Partial<Saved>) {
    const { saved, newer } = read()
    if (!newer) write({ ...saved, ...change })
  }

  return {
    load: () => read().saved.progress,
    save: (progress) => update({ progress }),
    loadSettings: () => read().saved.settings,
    saveSettings: (settings) => update({ settings }),
    reset: () => write(EMPTY),
  }
}

function parse(raw: string): Found {
  const data: unknown = JSON.parse(raw)
  if (!isRecord(data)) return { saved: EMPTY, newer: false }
  if (typeof data.version === 'number' && data.version > VERSION) {
    return { saved: EMPTY, newer: true }
  }
  if (data.version !== VERSION) return { saved: EMPTY, newer: false }
  return {
    saved: {
      progress: toProgress(data.progress),
      settings: toSettings(data.settings),
    },
    newer: false,
  }
}

function toProgress(value: unknown): Progress {
  if (!isRecord(value)) return {}
  const valid: Record<string, CardProgress> = {}
  for (const [id, entry] of Object.entries(value)) {
    const clean = toCardProgress(entry)
    if (clean) valid[id] = clean
  }
  return valid
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// keeps only the three known fields, and only when they make sense
function toCardProgress(value: unknown): CardProgress | undefined {
  if (!isRecord(value)) return undefined
  const { box, due, introduced } = value
  if (
    typeof box !== 'number' ||
    typeof due !== 'number' ||
    typeof introduced !== 'number'
  ) {
    return undefined
  }
  if (!Number.isInteger(box) || box < 1 || box > BOX_COUNT) return undefined
  if (!Number.isInteger(due) || !Number.isInteger(introduced)) return undefined
  return { box, due, introduced }
}

function browserStorage(): KeyValueStorage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export const progressStore = createProgressStore(browserStorage())
