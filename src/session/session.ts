import type { Card } from '#/kana/kana'

export type Grade = 'knew' | 'missed'

// the review schedule has this many boxes, numbered from 1; tunable
export const BOX_COUNT = 4

// a missed card comes back after this many other cards; tunable
export const MISS_RETURN_GAP = 3

export type Progress = Readonly<Record<string, { box: number }>>

export type Session = {
  // cards still to show; the first one is the current card
  readonly queue: ReadonlyArray<Card>
  readonly progress: Progress
}

export function startSession(
  cards: ReadonlyArray<Card>,
  progress: Progress = {},
): Session {
  return { queue: cards, progress }
}

export function currentCard(session: Session): Card | undefined {
  return session.queue[0]
}

export function isFinished(session: Session): boolean {
  return session.queue.length === 0
}

export function boxOf(session: Session, card: Card): number {
  return session.progress[card.id]?.box ?? 1
}

export function grade(session: Session, verdict: Grade): Session {
  const card = currentCard(session)
  if (!card) return session

  const rest = session.queue.slice(1)
  if (verdict === 'knew') {
    const box = Math.min(boxOf(session, card) + 1, BOX_COUNT)
    return { queue: rest, progress: withBox(session.progress, card, box) }
  }

  // missed: back to box 1, and shown again after a few other cards
  const gap = Math.min(MISS_RETURN_GAP, rest.length)
  return {
    queue: [...rest.slice(0, gap), card, ...rest.slice(gap)],
    progress: withBox(session.progress, card, 1),
  }
}

function withBox(progress: Progress, card: Card, box: number): Progress {
  return { ...progress, [card.id]: { box } }
}
