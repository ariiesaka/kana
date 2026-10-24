import { BOX_COUNT, type CardProgress, type Progress } from '#/session/session'

// the only place that knows where progress lives; swap this module to change
// the backend (see ADR 0001)
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
}

// storage can be missing or throw (private modes, blocked cookies, full disk);
// the store then behaves as if nothing was saved, and the session still works
export function createProgressStore(
  storage: KeyValueStorage | undefined,
): ProgressStore {
  return {
    load() {
      try {
        const raw = storage?.getItem(STORAGE_KEY)
        return raw ? parse(raw) : {}
      } catch {
        return {}
      }
    },
    save(progress) {
      try {
        storage?.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: VERSION, progress }),
        )
      } catch {
        // nothing saved; the learner keeps practicing
      }
    },
  }
}

function parse(raw: string): Progress {
  const data: unknown = JSON.parse(raw)
  if (!isRecord(data) || data.version !== VERSION || !isRecord(data.progress)) {
    return {}
  }
  const valid: Record<string, CardProgress> = {}
  for (const [id, entry] of Object.entries(data.progress)) {
    if (isCardProgress(entry)) valid[id] = entry
  }
  return valid
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCardProgress(value: unknown): value is CardProgress {
  return (
    isRecord(value) &&
    Number.isInteger(value.box) &&
    (value.box as number) >= 1 &&
    (value.box as number) <= BOX_COUNT &&
    Number.isFinite(value.due) &&
    Number.isFinite(value.introduced)
  )
}

function browserStorage(): KeyValueStorage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export const progressStore = createProgressStore(browserStorage())
