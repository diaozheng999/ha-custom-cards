// Type declarations for the Bubble Card module evaluation context.
// Included by each bubble-* package's tsconfig.json.
//
// home-assistant-frontend-types is a third-party auto-generated mirror of HA frontend types,
// versioned to HA releases. All imports are `import type` — erased at compile time, zero
// bundle impact.
import type { HomeAssistant } from 'home-assistant-frontend-types'
import type { HassEntity } from 'home-assistant-js-websocket'

export type { HomeAssistant, HassEntity }

// Generic interface for the card element's config. Each bubble package narrows this by
// re-declaring `thisCard` in its own `src/env.d.ts`.
export interface BubbleCardThis<
  TConfig extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
> {
  config: TConfig
}

declare global {
  // Injected by Bubble Card into the template literal evaluation context.
  const state: string
  const entity: string
  const icon: HTMLElement | null
  const card: HTMLElement
  const hass: HomeAssistant
  const subButtonState: Record<number, string>
  const subButtonIcon: Record<number, HTMLElement | null>
  function getWeatherIcon(): string
  function checkConditionsMet(
    conditions: unknown[],
    hass: HomeAssistant,
  ): boolean

  // NOT a real Bubble Card global — injected by the build plugin via:
  //   (function(thisCard){ [compiled IIFE] })(this)
  // so module code can reference the card config without casting `this`.
  // Narrowed per-package by `src/env.d.ts`.
  const thisCard: BubbleCardThis
}
