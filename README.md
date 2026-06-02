# ha-custom-cards

A monorepo of custom Home Assistant frontend (Lovelace) cards.

## Overview

This repository collects bespoke dashboard cards built for Home Assistant. Each card lives in its own package under `packages/`, sharing common tooling and utilities from the workspace root.

## Structure

```
packages/
  <card-name>/        # One directory per card
    src/              # TypeScript source
    dist/             # Built output (committed for HA consumption)
    package.json
    project.json      # NX project config
    vite.config.ts
    tsconfig.json
    AGENTS.md         # Card-specific agent guidance
    README.md         # Card docs, config reference, screenshots
bubble-modules/       # Bubble Card YAML modules (no build step)
```

## Development

**Prerequisites:** Node 20+, [pnpm](https://pnpm.io)

```bash
# Install dependencies
pnpm install

# Build all cards
pnpm build

# Lint all packages
pnpm lint

# Type-check all packages
pnpm typecheck

# Operate on a single package
pnpm exec nx build <card-name>
pnpm exec nx lint <card-name>
```

NX caches build and lint results — re-runs are fast when inputs haven't changed.

## License

MIT — see [LICENSE](LICENSE).
