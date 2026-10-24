# Use Bun for packages and scripts

Kana uses Bun, pinned to 1.4.0, to install dependencies and run scripts, instead of Node with pnpm. Bun is one tool to install and keep current, and a trial on a throwaway copy of the project ran install, dev server, production build, typecheck, Vitest and Biome with no failures under Bun 1.4.0. The code still runs in the browser, and Vite, Vitest and Biome do the real work: tests use Vitest, and linting and formatting use Biome. The app deploys to Cloudflare as static files at kana.ariiesaka.dev. Cloudflare's build image ships an older Bun (1.2.15 at the time of writing), so the build sets the same Bun version through its BUN_VERSION setting.

## Considered options

- Node 24 with pnpm: the setup the project started with and the one Vite and Vitest are tested against first; rejected because it needs a separate Node install for little benefit on a project this size.
- Bun for packages only, tools running on Node: no gain over the chosen option, since it still needs Node installed.

## Consequences

- The release-age guard that pnpm gave for new dependency versions is kept with Bun's `minimumReleaseAge` setting (one day), checked on Bun 1.4.0.
