# Build Kana as a client-only React app, not on TanStack Start

Kana is a static app with a few screens and no server, and its progress lives in the browser (ADR 0001). TanStack Start adds server rendering and server functions that Kana does not use, and server rendering makes browser-only storage harder, since a server render cannot read localStorage and the first client render must match it. Kana moves to Vite, React and TanStack Router as a client-only app deployed as static files. The router, Vite, React, TypeScript and pnpm stay. A server can be added later if accounts or syncing arrive.

## Considered options

- Keep TanStack Start: the full-stack path, but it adds concepts and a hydration hazard this app does not need.
- Astro or Next.js: both solve problems Kana does not have; Next.js adds a server runtime and Astro adds a second component model.
