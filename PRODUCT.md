# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React with TanStack Router, TypeScript, Vite, and Bun, as a client-only app (see docs/adr/0002-client-only-app-without-start.md and docs/adr/0003-bun-for-packages-and-scripts.md). The initial release is a static single-page app; accounts and server-backed progress are long-term ideas, not part of the initial release.

## Users

The primary user is a beginner learning to read Japanese kana, with study time that varies from day to day. The tool should also be approachable to other beginners and serve as a portfolio project.

## Product Purpose

Help a complete beginner become comfortable reading hiragana and katakana fluently. Success means recognizing the characters while reading; speaking and handwriting are outside the goal.

## Positioning

Open decision: the product's specific distinguishing mechanism beyond beginner-friendly kana reading practice. Planned practice formats are multiple choice, matching, and flashcards, ordered from more guidance to recall; flashcards have a first session, and the other two are not shipped yet.

## Operating Context

Study sessions need to be easy to start and stop because available time varies. A future deployment may use kana.ariiesaka.dev.

## Capabilities and Constraints

- Initial release is static and does not require accounts.
- The home screen offers multiple choice, matching, and flashcards as practice-format choices, ordered from more guidance to recall.
- Flashcards open a session on the vowels in hiragana; the learner's progress is saved in this browser. Multiple choice opens a kana-led setup with hiragana, katakana, or both; its practice is coming soon.
- Study progress is saved in this browser only; see docs/adr/0001-local-progress-in-browser-storage.md.
- Login, syncing across devices, and streaks are long-term ideas.
- The home screen is designed before its practice flows.

## Brand Commitments

- Product name: Kana.
- The user prefers dark mode as the default theme.
- Use the Quiet Reader direction: a minimalist, compact, text-led activity list.
- Share the look of the personal site, ariiesaka.dev: neutral near-black ground, off-white text, and IBM Plex Sans. This replaces the earlier green-tinted palette and serif headlines; see DESIGN.md.
- Keep visible interface copy lowercase and omit sentence-ending periods.
- Use the lowercase k favicon.

## Evidence on Hand

No deployed product, user research, testimonials, or outcome data exists yet.

## Product Principles

- Center practice on reading recognition.
- Make practice easy to begin and pause.
- Keep instructions approachable for complete beginners.
- Build for the project owner first while remaining useful to other beginners.

## Accessibility & Inclusion

- Everything is usable by keyboard alone.
- Text meets WCAG AA contrast in the dark theme.
- Transitions are under 200ms and are removed under reduced motion.
- Revealing a flashcard is announced to screen readers, and focus moves to the first grade button.
