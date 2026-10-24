# Save study progress in browser storage

Spaced repetition is the main way kana helps a learner remember, so v1 saves each card's box and next due date in the browser's localStorage, behind a single storage module. This replaces the earlier "static app, no saved progress" stance. Accounts and server-backed progress stay out of scope, and progress is lost if the learner clears site data or switches device.

## Considered options

- No saved progress: simplest, but every session would start from scratch and spacing would be impossible.
- Export and import as a file: deferred, not rejected; the storage module keeps this a small addition.
- IndexedDB with a fuller history log: more than 92 small card records need.
