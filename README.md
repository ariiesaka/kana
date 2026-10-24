# kana

a small study tool for beginners learning to read hiragana and katakana. the aim is to make a short session easy to start, whenever there is time.

## current step

the home screen introduces three planned practice formats in order from more guidance to recall: multiple choice, matching, then flashcards. it explains each format and shows あ / ア → a as an example of the same reading in both scripts. multiple choice opens a setup screen to choose hiragana, katakana, or both. practice sessions, matching, and flashcards are coming soon.

kana is a static app at this stage, with no accounts. the first practice loop, flashcards, will save progress in this browser only (see [the decision](docs/adr/0001-local-progress-in-browser-storage.md)). syncing across devices and streaks are ideas for later.

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

## stack

React, TanStack Router, TypeScript, Vite, and Bun. the decisions behind this stack are recorded in [docs/adr](docs/adr).

## design

the interface defaults to dark mode and keeps the study choices in a compact, text-led list. visible copy stays lowercase.
