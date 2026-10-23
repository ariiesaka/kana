# project instructions

## project notes and issue tracker

Project decisions, research, feature specifications, and tickets live in the private Obsidian Knowledge vault. Before planning or implementing Kana work, read docs/agents/issue-tracker.md, then the Kana overview, tracker, and relevant feature spec and ticket. Keep private planning in the vault; publish only reviewed, project-safe material.

## triage labels

Use needs-triage, needs-info, ready-for-agent, ready-for-human, and wontfix. See docs/agents/triage-labels.md.

## domain docs

For settled domain terminology and architecture decisions, use root GLOSSARY.md and docs/adr/. See docs/agents/domain.md.

## branch and pull request workflow

- Work in the existing checkout on a short-lived feature branch; do not use Git worktrees.
- master is the default branch and is protected on GitHub. Do not push directly to master; changes land there through pull requests.
- Keep changes local until the user explicitly asks you to push a feature branch and open a pull request.
- Before opening a pull request, run the Matt Pocock code-review skill against the fixed point the user supplied. For PRs targeting master, use origin/master when the user confirms it. Review Standards and Spec separately, using the feature's Obsidian spec and ticket as the acceptance source. If the fixed point does not resolve or the diff is empty, stop and report that.
- Resolve review findings before opening the pull request, or get the user's decision on any finding that should remain.
- After the user asks for a pull request, push only the feature branch and target master.
- For every UI change, include real before/after browser screenshots in the PR description, including mobile when responsive behavior changes. Store local captures in .scratch/ and link or attach evidence in the PR; keep review-only images out of tracked files.
- Keep local editor settings in ignored .vscode/. Commit the app source, shared tool configuration, and dependency lockfile.
- Never push, force-push, or delete master; merge through a pull request.
