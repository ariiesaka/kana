# kana

a small study tool for beginners learning to read hiragana and katakana. the aim is to make a short session easy to start, whenever there is time.

## current step

the home screen introduces three planned practice formats in order from more guidance to recall: multiple choice, matching, then flashcards. it explains each format and shows あ / ア → a as an example of the same reading in both scripts. flashcards practice hiragana, starting with the vowels: see a kana, show the answer, then say whether you knew it or missed it. boxes decide when a card comes back, the next group opens once most of the current one is reliable, and your progress is saved in this browser. multiple choice opens a setup screen to choose hiragana, katakana, or both. multiple choice practice and matching are coming soon.

kana is a static app at this stage, with no accounts. flashcards save progress and your script choice in this browser only; the settings screen resets them (see [the decision](docs/adr/0001-local-progress-in-browser-storage.md)). syncing across devices and streaks are ideas for later.

## run locally

use the bun version declared in [package.json](package.json).

    bun install
    bun run dev

the dev and preview servers both use port 3000 and exit if it is already occupied, so run one at a time. then open [http://localhost:3000](http://localhost:3000).

## other commands

    bun run build
    bun run typecheck
    bun run test
    bun run lint
    bun run format

`lint` checks the code with biome and `format` fixes what it can. new package versions are installed only after they have been published for a day (see [bunfig.toml](bunfig.toml)).

## deploy

kana deploys to cloudflare as static files. use `bun install` as the install command and `bun run build` as the build command, publish the `dist` folder at the domain root, and set `BUN_VERSION` to the version pinned in [package.json](package.json), because cloudflare's default bun is older. the app is client-only, so unknown paths must serve `index.html`; cloudflare pages does this when the project has no `404.html`.

## stack

React, TanStack Router, TypeScript, Vite, and Bun. the decisions behind this stack are recorded in [docs/adr](docs/adr).

## design

the interface defaults to dark mode and keeps the study choices in a compact, text-led list. visible copy stays lowercase. the colors, type, and spacing are design tokens described in [DESIGN.md](DESIGN.md).
