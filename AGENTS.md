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
- **Bundler per card:** Rsbuild (`@nx/rsbuild`) producing a single flat JS file for HA consumption
- **TypeScript:** root `tsconfig.base.json` (strict, ESNext, bundler module resolution); each package extends it; type-checking via `tsc --noEmit` (separate from the build)
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

### New card package template

Each `packages/<card>/` needs three files:

**`project.json`**

```json
{
  "name": "<card>",
  "targets": {
    "build": {
      "executor": "@nx/rsbuild:build",
      "options": { "rsbuildConfig": "packages/<card>/rsbuild.config.ts" }
    },
    "typecheck": {
      "executor": "nx:run-commands",
      "options": { "command": "tsc --noEmit -p packages/<card>/tsconfig.json" }
    }
  }
}
```

**`rsbuild.config.ts`**

```ts
import { defineConfig } from '@rsbuild/core'

export default defineConfig({
  source: { entry: { index: './src/index.ts' } },
  output: {
    distPath: { root: 'dist' },
    filename: { js: '[name].js' },
    minify: true,
  },
  tools: {
    bundlerChain(chain) {
      chain.output.library({ type: 'iife' })
    },
  },
})
```

**`tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

### New bubble card module template

Bubble Card modules live under `packages/bubble-<name>/` and compile TypeScript + CSS to
`dist/module.yaml` via a custom Rsbuild pipeline. Use `packages/bubble-example/` as the
reference implementation.

Each `packages/bubble-<name>/` needs these files:

**`module.json`** — module metadata (id, name, version, creator, editor fields, etc.)

**`project.json`**
```json
{
  "name": "bubble-<name>",
  "targets": {
    "build": {
      "executor": "@nx/rsbuild:build",
      "options": { "rsbuildConfig": "packages/bubble-<name>/rsbuild.config.ts" },
      "outputs": ["{projectRoot}/.tmp", "{projectRoot}/dist"]
    },
    "typecheck": {
      "executor": "nx:run-commands",
      "options": { "command": "tsc --noEmit -p packages/bubble-<name>/tsconfig.json" }
    }
  }
}
```

**`rsbuild.config.ts`**
```ts
import path from 'node:path'
import { defineConfig } from '@rsbuild/core'
import { pluginBubbleYaml } from '../../tools/bubble-yaml-plugin'

export default defineConfig({
  source: { entry: { index: './src/index.ts' } },
  output: {
    distPath: { root: '.tmp' },
    filename: { js: '[name].js', css: '[name].css' },
    minify: true,
    filenameHash: false,
    injectStyles: false,
  },
  tools: {
    bundlerChain(chain) { chain.output.library({ type: 'iife' }) },
  },
  plugins: [pluginBubbleYaml(path.resolve(__dirname))],
})
```

**`tsconfig.json`**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "types": [], "skipLibCheck": true },
  "include": ["src", "../../tools/bubble-card.d.ts"]
}
```

**`src/env.d.ts`** — narrows `thisCard` to this module's config type:
```ts
import type { BubbleCardThis } from '../../../tools/bubble-card'
interface ModuleConfig { /* editor field types */ }
declare const thisCard: BubbleCardThis<{ <module_id>?: ModuleConfig }>
```

**CSS import**: `src/styles.css` must be imported in `src/index.ts` (`import './styles.css'`)
for Rsbuild to pick it up and extract it to `.tmp/index.css`.

**CSS template expressions**: write `[[expr]]` in `.css` files where Bubble Card runtime
expressions are needed (e.g. `[[this.config.mod?.color]]`). The build plugin converts
`[[expr]]` → `${expr}`. Do NOT write `${...}` directly in CSS files — PostCSS rejects it.

**Runtime globals**: `state`, `entity`, `icon`, `card`, `hass`, `thisCard` — see
`tools/bubble-card.d.ts` for full types.

## AGENTS.md hierarchy

Context is layered — always read outward from where you are:

```
/AGENTS.md                            ← repo-wide rules (this file)
/bubble-modules/AGENTS.md             ← hand-authored Bubble Card YAML modules (no build)
/packages/<card>/AGENTS.md            ← HA card-specific rules and gotchas
/packages/bubble-<name>/AGENTS.md     ← compiled Bubble Card module rules and gotchas
```

- When working inside a package, read **both** that package's `AGENTS.md` and this root file. The root takes precedence on cross-cutting concerns (commit format, security, HA conventions); the package file specialises or adds to it.
- The root `AGENTS.md` must not duplicate package-level detail.
- Each `packages/<card>/AGENTS.md` should describe: what the card does, which HA entities/domains it targets, any non-obvious build constraints (e.g. output must be a single flat JS file), and known gotchas.
- `bubble-modules/` is for hand-authored YAML only — not an NX project. For TypeScript-compiled modules use `packages/bubble-<name>/` instead.

## What to fill in later

- Per-card notes in each `packages/<card>/AGENTS.md` and `README.md`.
- Release / versioning workflow.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
