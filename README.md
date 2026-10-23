# kana

a small study tool for beginners learning to read hiragana and katakana. the aim is to make a short session easy to start, whenever there is time.

## current step

the home screen introduces three planned practice formats in order from more guidance to recall: multiple choice, matching, then flashcards. it explains each format and shows あ / ア → a as an example of the same reading in both scripts. the activities are marked as coming soon and remain non-interactive in this step.

kana is a static app at this stage. accounts, saved progress, and streaks are ideas for later.

## run locally

    pnpm install
    pnpm dev

then open [http://localhost:3000](http://localhost:3000).

## stack

React, TanStack Start, TypeScript, Vite, and pnpm.

## design

the interface defaults to dark mode and keeps the study choices in a compact, text-led list. visible copy stays lowercase.