# AGENTS.md — guidance for AI agents working in this repo

## What this repo is

A monorepo of custom Home Assistant Lovelace (frontend) cards written in TypeScript. Each card is an independent package under `packages/`.

## Key conventions

- **One package per card.** Cards do not depend on each other; shared utilities live in a dedicated `packages/shared` package (to be created).
- **Built output is committed.** Home Assistant loads cards from `dist/` via a URL; the compiled JS must be present in the repo so users can reference it directly from their HA config.
- **No card touches HA config files.** Cards are pure frontend — they render state but never write to `configuration.yaml` or `.storage/`.

## Working with Home Assistant

This repo includes an MCP server (`homeassistant-custom`) that provides direct access to a live HA instance for testing. Before writing any automation, dashboard, or card configuration, read the best-practices skill:

```
skill://home-assistant-best-practices/SKILL.md
```

## Commit messages

Keep messages succinct — a short imperative subject line, no body unless genuinely necessary.

Every commit message must end with a parenthetical identifying the editor and model that produced it:

```
feat: implement xxx (claude code, sonnet-4.6)
feat: implement xxx (cursor, gpt-4o)
feat: implement xxx (antigravity, claude-opus-4)
```

Use lowercase. The editor is the tool (e.g. `claude code`, `cursor`, `antigravity`); the model is the specific model version it used. If a commit spans multiple agents, list each: `(claude code, sonnet-4.6; cursor, gpt-4o)`.

## Toolchain

- **Package manager:** pnpm with workspaces (`pnpm-workspace.yaml`)
- **Monorepo orchestration:** NX — task caching, dependency graph, `run-many`
- **Bundler per card:** Vite (`@nx/vite`) producing a single flat JS file for HA consumption
- **TypeScript:** root `tsconfig.base.json` (strict, ESNext, bundler module resolution); each package extends it
- **Lint:** ESLint 9 flat config (`eslint.config.js`) with `@nx/eslint-plugin`
- **Format:** Prettier (`.prettierrc`)

Common commands:
```bash
pnpm install                       # install all deps
pnpm build                         # build all packages
pnpm exec nx build <card-name>     # build one card
pnpm exec nx show projects         # list all NX projects
pnpm exec nx graph                 # visualise dependency graph
```

## AGENTS.md hierarchy

Context is layered — always read outward from where you are:

```
/AGENTS.md                          ← repo-wide rules (this file)
/bubble-modules/AGENTS.md           ← Bubble Card YAML module authoring (no build)
/packages/<card>/AGENTS.md          ← card-specific rules and gotchas
```

- When working inside a package, read **both** that package's `AGENTS.md` and this root file. The root takes precedence on cross-cutting concerns (commit format, security, HA conventions); the package file specialises or adds to it.
- The root `AGENTS.md` must not duplicate package-level detail.
- Each `packages/<card>/AGENTS.md` should describe: what the card does, which HA entities/domains it targets, any non-obvious build constraints (e.g. output must be a single flat JS file), and known gotchas.
- `bubble-modules/` is YAML-only and not an NX project — its `AGENTS.md` is self-contained.

## What to fill in later

- Per-card notes in each `packages/<card>/AGENTS.md` and `README.md`.
- Release / versioning workflow.
