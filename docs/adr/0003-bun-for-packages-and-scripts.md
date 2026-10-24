# Use Bun for packages and scripts

Kana uses Bun, pinned to 1.4.0, to install dependencies and run scripts, instead of Node with pnpm. Bun is one tool to install and keep current, it was already on the developer's machine, and a trial of install, dev server, production build, typecheck, Vitest and Biome all passed under Bun 1.4.0. The code still runs in the browser, and Vite, Vitest and Biome do the real work. The app deploys to Cloudflare as static files, and Cloudflare's build image ships an older Bun, so the build sets the same Bun version explicitly. This replaces ADR 0002's statement that pnpm stays.

## Considered options

- Node 24 with pnpm: the setup the project started with and the one Vite and Vitest are tested against first; rejected because it needs a separate Node install for little benefit on a project this size.
- Bun for packages only, tools running on Node: no gain over the chosen option, since it still needs Node installed.

## Consequences

- If a tool misbehaves under Bun, the first diagnostic step is to run it under Node to separate the tool from the runtime.
- The pnpm dependency release-age guard has no confirmed Bun equivalent yet; ticket 01 decides the replacement.
