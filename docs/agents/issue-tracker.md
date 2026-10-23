# Kana notes and issue tracker

The private Obsidian Knowledge vault is the source of truth for project planning. Keep private planning in the vault and keep repository documentation safe for a public portfolio.

## note layout

- Projects/Kana/Overview.md is the project hub: goal, audience, settled decisions, and links to project notes.
- Projects/Kana/Tracker.md indexes feature status and links to specs and tickets.
- Each feature has Projects/Kana/Features/<slug>/spec.md and one or more numbered notes in its issues/ folder.
- Projects/Kana/Research.md holds background research separately from active work tracking.

## workflow

1. Before planning or implementing, read Overview.md, Tracker.md, and the relevant feature spec and ticket.
2. Update the existing note that owns a decision or status. Keep one canonical copy of each fact and link to it elsewhere.
3. For new work, create one feature spec with a goal, scope, and acceptance criteria; create one small numbered ticket per independently executable task; link both from Tracker.md.
4. Keep ticket comments under a Comments heading.
5. When a skill asks to publish or fetch a ticket, use the corresponding Obsidian feature notes and update Tracker.md. The ignored .scratch/ directory is temporary workspace, not the project tracker or a source of truth.

Allowed Work values are queued, in-progress, in-review, done, and cancelled. Status is for triage only; use the labels and meanings in docs/agents/triage-labels.md. Start new tickets at Status: needs-triage and Work: queued. When work is accepted, remove Status and set Work: in-progress. When a pull request opens, set Work: in-review and record its URL. After merge and verification, set Work: done; for rejected work, set Work: cancelled.

## code review handoff

Before a pull request, use the Matt Pocock code-review skill and provide the user-confirmed fixed point. The feature specification and ticket live in Obsidian, so provide their paths or contents to the Spec review. The repo-level project brief is context, not a substitute for feature acceptance criteria. Do not review until the fixed point resolves and the diff is non-empty.
