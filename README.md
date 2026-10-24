# kana

a small study tool for beginners learning to read hiragana and katakana. the aim is to make a short session easy to start, whenever there is time.

## current step

the home screen introduces three planned practice formats in order from more guidance to recall: multiple choice, matching, then flashcards. it explains each format and shows あ / ア → a as an example of the same reading in both scripts. multiple choice opens a setup screen to choose hiragana, katakana, or both. practice sessions, matching, and flashcards are coming soon.

kana is a static app at this stage, with no accounts. the first practice loop, flashcards, will save progress in this browser only (see [the decision](docs/adr/0001-local-progress-in-browser-storage.md)). syncing across devices and streaks are ideas for later.

## run locally

use node.js 24 and the pnpm version declared in [package.json](package.json).

    pnpm install
    pnpm dev

the dev and preview servers both use port 3000 and exit if it is already occupied, so run one at a time. then open [http://localhost:3000](http://localhost:3000).

## stack

React, TanStack Start, TypeScript, Vite, and pnpm.

## design

the interface defaults to dark mode and keeps the study choices in a compact, text-led list. visible copy stays lowercase.
