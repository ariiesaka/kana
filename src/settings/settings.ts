// which scripts the learner practices
export type ScriptChoice = 'hiragana' | 'both'

export type Settings = {
  readonly scripts: ScriptChoice
}

export const DEFAULT_SETTINGS: Settings = { scripts: 'hiragana' }

// keeps only the known field, and only when it holds a known value
export function toSettings(value: unknown): Settings {
  if (typeof value !== 'object' || value === null) return DEFAULT_SETTINGS
  const { scripts } = value as { scripts?: unknown }
  return scripts === 'hiragana' || scripts === 'both'
    ? { scripts }
    : DEFAULT_SETTINGS
}
