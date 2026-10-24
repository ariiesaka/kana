# Design

Kana shares the look of the personal site, [ariiesaka.dev](https://ariiesaka.dev): a neutral near-black ground, off-white text, IBM Plex Sans, a quiet single column, and links that are underlined in a muted tone. Product context lives in [PRODUCT.md](PRODUCT.md). The tokens live in [src/styles/tokens.css](src/styles/tokens.css) and every screen reads from them.

## Principles

- Text-led and restrained: hierarchy comes from weight, size and space, not decoration.
- Dark only for now. Tokens are structured so a light theme can replace the color values later without touching screens.
- Visible copy is lowercase with no sentence-ending periods.
- Meaning never depends on color alone: feedback colors always come with a text label.
- No color literals outside the tokens file.

## Reference from the personal site

| Role | Value |
| --- | --- |
| Background | `#111111` |
| Text | `#f5f5f5` |
| Link underline | `#888888`, becomes the text color on hover |
| Typeface | IBM Plex Sans 400 and 700 |
| Heading | 2rem, bold, `-0.035em` tracking, 1.2 line height |
| Measure | 65ch column |
| Focus | 2px outline in the text color, 0.2em offset |

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#111111` | page ground |
| `--color-surface-selected` | `#242424` | selected controls, disabled button |
| `--color-text` | `#f5f5f5` | text, selected borders, primary button |
| `--color-text-muted` | `#a3a3a3` | secondary text |
| `--color-line` | `#2e2e2e` | decorative dividers only |
| `--color-control-line` | `#7a7a7a` | borders that mark a control |
| `--color-link-underline` | `#888888` | link underlines |
| `--color-knew` | `#8fd6a5` | "knew it" feedback, always with a label |
| `--color-missed` | `#f0a783` | "missed" feedback, always with a label |
| `--color-attention` | `--color-missed` | warnings such as an empty selection |

### Contrast (WCAG 2.2, computed)

Text needs 4.5:1 and non-text parts of controls need 3:1.

| Pair | Ratio | Needs |
| --- | --- | --- |
| text on bg | 17.3 | 4.5 |
| text on surface-selected | 14.2 | 4.5 |
| text-muted on bg | 7.5 | 4.5 |
| text-muted on surface-selected | 6.2 | 4.5 |
| link underline on bg | 5.3 | 3 |
| control-line on bg | 4.4 | 3 |
| control-line on surface-selected | 3.6 | 3 |
| knew on bg | 11.1 | 4.5 |
| knew on surface-selected | 9.1 | 4.5 |
| missed on bg | 9.5 | 4.5 |
| missed on surface-selected | 7.8 | 4.5 |
| bg on text (primary button) | 17.3 | 4.5 |

`--color-attention` is an alias of `--color-missed`, so it shares those ratios. `--color-line` is about 1.4:1 and is only used for dividers that do not identify a control.

## Type

| Token | Value | Use |
| --- | --- | --- |
| `--font-sans` | IBM Plex Sans | interface text |
| `--font-kana` | IBM Plex Sans JP, then IBM Plex Sans | anything marked `lang="ja"` |
| `--text-xs` / `sm` / `base` / `lg` | 0.75 / 0.875 / 1 / 1.125rem | labels, secondary, body, emphasis |
| `--text-kana` | 1.375rem | kana in running content |
| `--text-title` | 2rem | page titles |
| `--text-display` | clamp(4.5rem, 22vw, 6rem) | the kana on a flashcard |
| `--weight-regular` / `bold` | 400 / 700 | the only two weights |

Fonts are self-hosted. IBM Plex Sans comes from the `@fontsource/ibm-plex-sans` package (latin, 400 and 700). IBM Plex Sans JP is limited to the 8 font slices that contain hiragana and katakana (each slice also carries some unrelated glyphs), copied from `@fontsource/ibm-plex-sans-jp` 5.3.1 into `src/fonts` with its license; the license for IBM Plex Sans is in the same folder. The app makes no third-party font request. Mark kana with `lang="ja"` so they use the kana font.

## Space, shape, and motion

- Space scale: 0.25, 0.5, 0.75, 1, 1.5, 2 and 3rem (`--space-1` to `--space-12`).
- `--measure` is 65ch and `--gutter` is 1rem on each side.
- `--target` is 44px, the minimum size of any control.
- Radius is small: 4px for tiles, 6px for buttons and choices.
- Hairline offsets and tile heights stay local to the component styles; they are layout details, not tokens. Colors, type, space steps, focus and motion are the tokens.
- The lowercase k favicon uses the same ground and text colors as the tokens.
- Transitions use `--duration-fast` (120ms) and `--ease-out`. Under `prefers-reduced-motion` the duration is 0.

## Feedback

Grading uses a subtle pair: `--color-knew` and `--color-missed`. Each appears next to the words "knew it" or "missed", and the pair is never the only signal.

## Not here

No component library and no light theme. Add a primitive only when a second screen needs the same thing.
