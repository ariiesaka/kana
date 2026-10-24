# Save study progress in browser storage

Spaced repetition is the main way kana helps a learner remember, so v1 saves each card's box and next due date, plus the learner's settings, in the browser's localStorage, behind a single storage module. This replaces the earlier "static app, no saved progress" stance. Accounts and server-backed progress stay out of scope, progress is lost if the learner clears site data or switches device, and a session still works, unsaved, when storage is unavailable. The learner can reset everything from the settings screen, which is the only action allowed to replace saved data written by a newer version of the app.

## Considered options

- No saved progress: simplest, but every session would start from scratch and spacing would be impossible.
- Export and import as a file: out of scope for v1; the storage module keeps it a small addition later.
- IndexedDB with a fuller history log: more machinery than the 92 small card records need (46 kana in two scripts).
