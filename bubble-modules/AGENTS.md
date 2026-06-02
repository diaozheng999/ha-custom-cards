# AGENTS.md — bubble-modules

This folder contains custom [Bubble Card](https://github.com/Clooos/Bubble-Card) modules. Each module is a single YAML file that adds reusable styles, behaviour, or editor-configurable features to Bubble Card cards.

## What a module is

A Bubble Card module is a YAML document keyed by the module's ID. It is loaded by the Bubble Card Tools integration and applied to cards either individually or globally. The module code runs in the same context as a card's `styles` section.

## Module file structure

Each module lives in its own `.yaml` file named after the module ID:

```
bubble-modules/
  my-module-id.yaml
```

## Top-level YAML schema

```yaml
<module_id>:
  name: 'Human-readable module name'
  version: v1.0
  creator: Your Name
  link: https://...          # optional — discussion thread or docs URL
  description: |
    Shown in the Module Editor. Supports basic HTML for formatting.
  unsupported:               # optional — card types this module cannot target
    - horizontal-buttons-stack
    - separator
  code: |
    /* CSS and JS template literals go here — same syntax as a card's `styles` field */
  editor:                    # optional — renders a config form in the Module Editor
    - name: field_key
      label: Field Label
      selector:
        text: {}
```

### Top-level fields

| Field | Required | Description |
|---|---|---|
| `name` | yes | Display name shown in the Module Editor |
| `version` | yes | Version string, e.g. `v1.0` |
| `creator` | yes | Author name |
| `description` | no | Markdown/HTML description shown in the editor |
| `link` | no | URL to documentation or discussion thread |
| `unsupported` | no | List of card types the module cannot be applied to |
| `code` | yes | CSS + JS template literal code (see below) |
| `editor` | no | Array of form field definitions (see below) |

Valid card type names for `unsupported`: `button`, `climate`, `cover`, `horizontal-buttons-stack`, `media-player`, `pop-up`, `select`, `separator`, `sub-buttons`.

## Writing `code`

The `code` field is evaluated as a JavaScript template literal. Use it exactly like the `styles` field of a Bubble Card card.

### Available variables

| Variable | Description |
|---|---|
| `state` | Current entity state string |
| `entity` | Entity ID |
| `icon` | Icon DOM element |
| `card` | Card DOM element |
| `hass` | Home Assistant object (access any entity via `hass.states`) |
| `this` | Dashboard/card config — access module config via `this.config.<module_id>` |
| `subButtonState[n]` | State of the nth sub-button |
| `subButtonIcon[n]` | Icon element of the nth sub-button |

### Available helper functions

| Function | Description |
|---|---|
| `getWeatherIcon()` | Returns weather icon name based on entity state |
| `hass.formatEntityState(stateObj)` | Translates a state value |
| `hass.formatEntityAttributeValue(stateObj, attr)` | Translates an attribute value |
| `checkConditionsMet(conditions, hass)` | Evaluates a HA conditions array |

### Accessing editor config values

```yaml
code: |
  .bubble-icon-container {
    background: var(--${this.config.<module_id>?.color}-color) !important;
    --mdc-icon-size: ${this.config.<module_id>?.size || 24}px;
  }
```

Always use optional chaining (`?.`) — the config may be undefined if the user hasn't set a value.

## Editor schema

The `editor` array defines the configuration form shown in the Module Editor. Each entry is a field:

```yaml
editor:
  - name: field_key      # key used in this.config.<module_id>.field_key
    label: "Label"
    required: false      # optional
    default: "value"     # optional
    selector:
      <selector_type>: {}
```

### Common selector types

| Selector | Usage |
|---|---|
| `text: {}` | Free text input |
| `number: {min, max, step, unit_of_measurement}` | Numeric input |
| `boolean: {}` | Toggle |
| `select: {options: [{label, value}], multiple, mode}` | Dropdown / list |
| `ui_color: {include_none, include_state}` | HA colour picker |
| `icon: {}` | MDI icon picker |
| `entity: {filter: {domain}}` | Entity selector |
| `condition: {}` | HA conditions builder |

Use `type: grid` or `type: expandable` to group fields:

```yaml
editor:
  - type: expandable
    title: "Advanced"
    icon: "mdi:tune"
    expanded: false
    schema:
      - name: animation_speed
        label: "Speed"
        selector:
          number: {min: 1, max: 10}
```

Full selector reference: [editor-schema-docs.md](https://github.com/Clooos/Bubble-Card/blob/main/src/modules/editor-schema-docs.md)

## Complete example

```yaml
icon_container_color:
  name: 'Customize icon container color'
  version: v1.0
  creator: Clooos
  link: https://github.com/Clooos/Bubble-Card/discussions/1231
  unsupported:
    - horizontal-buttons-stack
    - separator
  description: |
    Applies a predefined HA colour to the icon container.
  code: |
    .bubble-icon-container {
      opacity: 1 !important;
      background: var(--${this.config.icon_container_color?.color}-color) !important;
    }
  editor:
    - name: color
      label: Color
      selector:
        ui_color:
          include_none: true
```

## Conventions for this repo

- One module per file, filename = module ID, e.g. `icon-container-color.yaml`.
- Module IDs use kebab-case.
- Keep `code` focused — one concern per module. Compose via multiple modules rather than one large one.
- Every commit follows the root [AGENTS.md commit message format](../AGENTS.md#commit-messages).
