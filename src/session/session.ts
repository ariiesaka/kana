import { type Card, cardsOfGroup } from '#/kana/kana'

export type Grade = 'knew' | 'missed'

// days a card waits in each box before it is due again: box 1 is the same
// day, then 1, 3 and 7 days; tunable
export const BOX_WAIT_DAYS = [0, 1, 3, 7] as const

// the review schedule has this many boxes, numbered from 1
export const BOX_COUNT = BOX_WAIT_DAYS.length

// a missed card comes back after this many other cards; tunable
export const MISS_RETURN_GAP = 3

// at most this many new cards are introduced per study day; tunable
export const NEW_CARDS_PER_DAY = 5

// a study day starts at this local hour, not at midnight
const DAY_STARTS_AT_HOUR = 4

// a card is reliable from this box up; tunable
export const RELIABLE_BOX = 3

// a group is reliable when at least this share of its cards are; tunable
const RELIABLE_SHARE = 0.8

export type CardProgress = {
  readonly box: number
  // the study day on which the card is due
  readonly due: number
  // the study day on which the card was first graded
  readonly introduced: number
}

export type Progress = Readonly<Record<string, CardProgress>>

export type Session = {
  // cards still to show; the first one is the current card
  readonly queue: ReadonlyArray<Card>
  readonly progress: Progress
}

// the number of the study day that contains this moment; local time, with the
// day starting at DAY_STARTS_AT_HOUR
export function studyDay(now: Date): number {
  const shifted = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours() - DAY_STARTS_AT_HOUR,
    now.getMinutes(),
  )
  const utcMidnight = Date.UTC(
    shifted.getFullYear(),
    shifted.getMonth(),
    shifted.getDate(),
  )
  return Math.floor(utcMidnight / 86_400_000)
}

// the cards to practice now: due reviews, oldest first, mixed with new cards
// from the pool (in its order) up to the daily cap
export function buildQueue(
  pool: ReadonlyArray<Card>,
  progress: Progress,
  now: Date,
): Card[] {
  const today = studyDay(now)

  const reviews = pool
    .flatMap((card, index) => {
      const due = progress[card.id]?.due
      return due !== undefined && due <= today ? [{ card, index, due }] : []
    })
    .sort((x, y) => x.due - y.due || x.index - y.index)
    .map((item) => item.card)

  const introducedToday = pool.filter(
    (card) => progress[card.id]?.introduced === today,
  ).length
  const room = Math.max(0, NEW_CARDS_PER_DAY - introducedToday)
  const newCards = pickNewCards(pool, progress, room)

  return interleave(reviews, newCards)
}

// a group is reliable when enough of its cards sit in a high enough box; a
// card that was never graded counts as not reliable
export function isGroupReliable(
  cards: ReadonlyArray<Card>,
  progress: Progress,
): boolean {
  if (cards.length === 0) return false
  const reliable = cards.filter(
    (card) => (progress[card.id]?.box ?? 0) >= RELIABLE_BOX,
  ).length
  return reliable / cards.length >= RELIABLE_SHARE
}

// new cards come from the earliest group that still has cards never graded,
// and the next group only opens once the one before it is reliable; groups
// follow the order of the pool, so the pool is one script in learning order
function pickNewCards(
  pool: ReadonlyArray<Card>,
  progress: Progress,
  room: number,
): Card[] {
  const picked: Card[] = []
  const groupIds = [...new Set(pool.map((card) => card.groupId))]
  for (const groupId of groupIds) {
    if (picked.length >= room) break
    const inPool = pool.filter((card) => card.groupId === groupId)
    for (const card of inPool) {
      if (!progress[card.id] && picked.length < room) picked.push(card)
    }
    // reliability looks at the whole group, not only its part of the pool
    const whole = cardsOfGroup(groupId, inPool[0].script)
    if (!isGroupReliable(whole, progress)) break
  }
  return picked
}

// alternate the two lists while both last, reviews first, then the rest
function interleave<T>(first: ReadonlyArray<T>, second: ReadonlyArray<T>): T[] {
  const mixed: T[] = []
  const longest = Math.max(first.length, second.length)
  for (let n = 0; n < longest; n++) {
    if (n < first.length) mixed.push(first[n])
    if (n < second.length) mixed.push(second[n])
  }
  return mixed
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

export function grade(session: Session, verdict: Grade, now: Date): Session {
  const card = currentCard(session)
  if (!card) return session

  const today = studyDay(now)
  const rest = session.queue.slice(1)
  if (verdict === 'knew') {
    const box = Math.min(boxOf(session, card) + 1, BOX_COUNT)
    return {
      queue: rest,
      progress: withBox(session.progress, card, box, today),
    }
  }

  // missed: back to box 1, and shown again after a few other cards
  const gap = Math.min(MISS_RETURN_GAP, rest.length)
  return {
    queue: [...rest.slice(0, gap), card, ...rest.slice(gap)],
    progress: withBox(session.progress, card, 1, today),
  }
}

function withBox(
  progress: Progress,
  card: Card,
  box: number,
  today: number,
): Progress {
  const introduced = progress[card.id]?.introduced ?? today
  return {
    ...progress,
    [card.id]: { box, due: today + BOX_WAIT_DAYS[box - 1], introduced },
  }
}
