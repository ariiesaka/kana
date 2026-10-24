export type Script = 'hiragana' | 'katakana'

export type GroupId =
  | 'vowels'
  | 'k'
  | 's'
  | 't'
  | 'n'
  | 'h'
  | 'm'
  | 'y'
  | 'r'
  | 'w'

export type Group = {
  id: GroupId
  name: string
  kana: ReadonlyArray<{ hiragana: string; katakana: string; romaji: string }>
}

export type Card = {
  id: string
  kana: string
  script: Script
  romaji: string
  groupId: GroupId
}

// one entry per kana: hiragana, katakana, romaji
const row = (...entries: Array<[string, string, string]>) =>
  entries.map(([hiragana, katakana, romaji]) => ({
    hiragana,
    katakana,
    romaji,
  }))

// the learning order: groups are introduced in this sequence
export const groups: ReadonlyArray<Group> = [
  {
    id: 'vowels',
    name: 'vowels',
    kana: row(
      ['あ', 'ア', 'a'],
      ['い', 'イ', 'i'],
      ['う', 'ウ', 'u'],
      ['え', 'エ', 'e'],
      ['お', 'オ', 'o'],
    ),
  },
  {
    id: 'k',
    name: 'k group',
    kana: row(
      ['か', 'カ', 'ka'],
      ['き', 'キ', 'ki'],
      ['く', 'ク', 'ku'],
      ['け', 'ケ', 'ke'],
      ['こ', 'コ', 'ko'],
    ),
  },
  {
    id: 's',
    name: 's group',
    kana: row(
      ['さ', 'サ', 'sa'],
      ['し', 'シ', 'shi'],
      ['す', 'ス', 'su'],
      ['せ', 'セ', 'se'],
      ['そ', 'ソ', 'so'],
    ),
  },
  {
    id: 't',
    name: 't group',
    kana: row(
      ['た', 'タ', 'ta'],
      ['ち', 'チ', 'chi'],
      ['つ', 'ツ', 'tsu'],
      ['て', 'テ', 'te'],
      ['と', 'ト', 'to'],
    ),
  },
  {
    id: 'n',
    name: 'n group',
    kana: row(
      ['な', 'ナ', 'na'],
      ['に', 'ニ', 'ni'],
      ['ぬ', 'ヌ', 'nu'],
      ['ね', 'ネ', 'ne'],
      ['の', 'ノ', 'no'],
    ),
  },
  {
    id: 'h',
    name: 'h group',
    kana: row(
      ['は', 'ハ', 'ha'],
      ['ひ', 'ヒ', 'hi'],
      ['ふ', 'フ', 'fu'],
      ['へ', 'ヘ', 'he'],
      ['ほ', 'ホ', 'ho'],
    ),
  },
  {
    id: 'm',
    name: 'm group',
    kana: row(
      ['ま', 'マ', 'ma'],
      ['み', 'ミ', 'mi'],
      ['む', 'ム', 'mu'],
      ['め', 'メ', 'me'],
      ['も', 'モ', 'mo'],
    ),
  },
  {
    id: 'y',
    name: 'y group',
    kana: row(['や', 'ヤ', 'ya'], ['ゆ', 'ユ', 'yu'], ['よ', 'ヨ', 'yo']),
  },
  {
    id: 'r',
    name: 'r group',
    kana: row(
      ['ら', 'ラ', 'ra'],
      ['り', 'リ', 'ri'],
      ['る', 'ル', 'ru'],
      ['れ', 'レ', 're'],
      ['ろ', 'ロ', 'ro'],
    ),
  },
  {
    id: 'w',
    name: 'w group',
    kana: row(['わ', 'ワ', 'wa'], ['を', 'ヲ', 'wo'], ['ん', 'ン', 'n']),
  },
]

const cardId = (script: Script, kana: string) => `${script}:${kana}`

function cardsFor(group: Group, script: Script): Card[] {
  return group.kana.map((entry) => ({
    id: cardId(script, entry[script]),
    kana: entry[script],
    script,
    romaji: entry.romaji,
    groupId: group.id,
  }))
}

const cardsById = new Map<string, Card>(
  groups.flatMap((group) =>
    (['hiragana', 'katakana'] as const).flatMap((script) =>
      cardsFor(group, script).map((card): [string, Card] => [card.id, card]),
    ),
  ),
)

export function cardsOfGroup(groupId: GroupId, script: Script): Card[] {
  const group = groups.find((item) => item.id === groupId)
  return group ? cardsFor(group, script) : []
}

export function allCards(script: Script): Card[] {
  return groups.flatMap((group) => cardsFor(group, script))
}

export function getCard(id: string): Card | undefined {
  return cardsById.get(id)
}

// the same kana in the other script
export function counterpart(card: Card): Card {
  const group = groups.find((item) => item.id === card.groupId)
  const entry = group?.kana.find((item) => item[card.script] === card.kana)
  if (!group || !entry) throw new Error(`unknown card ${card.id}`)
  return cardsFor(group, otherScript(card.script)).find(
    (item) => item.romaji === entry.romaji,
  ) as Card
}

function otherScript(script: Script): Script {
  return script === 'hiragana' ? 'katakana' : 'hiragana'
}
