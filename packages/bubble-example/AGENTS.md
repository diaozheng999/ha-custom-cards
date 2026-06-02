# AGENTS.md — bubble-example

## What this module does

Demonstrates the bubble module build scaffolding. Toggles a CSS class on the card
based on entity state, and applies a configurable accent color from the Module Editor.

## Writing module code

- `src/index.ts` — TypeScript with access to all Bubble Card runtime globals
  (`state`, `entity`, `card`, `hass`, `thisCard`). Compiled to an IIFE and wrapped
  in `${(function(thisCard){ ... })(this)}` by the build plugin.
- `src/styles.css` — Static CSS. Use `[[expr]]` placeholders where Bubble Card
  template expressions are needed. The plugin converts `[[expr]]` → `${expr}`.
  Do NOT write `${...}` directly in CSS — PostCSS will reject it.
- `src/env.d.ts` — Narrows `thisCard`'s config type to this module's schema.
  Update the `BubbleExampleConfig` interface when editor fields change.

## Module config

Access via `thisCard.config.bubble_example?.fieldName`.

## Build output

- `.tmp/index.js` and `.tmp/index.css` — intermediate compiled assets (gitignored)
- `dist/module.yaml` — the deployable artifact (committed to repo)

## Renaming this module

If copying as a template, update:
- `module.json` — `id`, `name`, `version`, `creator`, `description`, editor fields
- `package.json` — `name`
- `project.json` — `name`, both `rsbuildConfig` and `command` paths
- `src/env.d.ts` — interface name, config key, import depth if moved
- `src/index.ts` — config access key
