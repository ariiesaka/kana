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
  // data from a newer version is ignored, so the next grade overwrites it;
  // fine while there is one version, worth revisiting when there are two
  const data: unknown = JSON.parse(raw)
  if (!isRecord(data) || data.version !== VERSION || !isRecord(data.progress)) {
    return {}
  }
  const valid: Record<string, CardProgress> = {}
  for (const [id, entry] of Object.entries(data.progress)) {
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
