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
  // forgets every card and puts the settings back to the defaults
  reset(): void
}

type Saved = { progress: Progress; settings: Settings }

const EMPTY: Saved = { progress: {}, settings: DEFAULT_SETTINGS }

// storage can be missing or throw (private modes, blocked cookies, full disk);
// the store then behaves as if nothing was saved, and the session still works
export function createProgressStore(
  storage: KeyValueStorage | undefined,
): ProgressStore {
  function read(): Saved {
    try {
      const raw = storage?.getItem(STORAGE_KEY)
      return raw ? parse(raw) : EMPTY
    } catch {
      return EMPTY
    }
  }

  function write(saved: Saved) {
    try {
      storage?.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: VERSION, ...saved }),
      )
    } catch {
      // nothing saved; the learner keeps practicing
    }
  }

  return {
    load: () => read().progress,
    save: (progress) => write({ ...read(), progress }),
    loadSettings: () => read().settings,
    saveSettings: (settings) => write({ ...read(), settings }),
    reset: () => write(EMPTY),
  }
}

function parse(raw: string): Saved {
  // data from a newer version is ignored, so the next write overwrites it;
  // fine while there is one version, worth revisiting when there are two
  const data: unknown = JSON.parse(raw)
  if (!isRecord(data) || data.version !== VERSION) return EMPTY
  return {
    progress: toProgress(data.progress),
    settings: toSettings(data.settings),
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
