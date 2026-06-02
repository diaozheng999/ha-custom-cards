import './styles.css'

// Module JS logic. Runs inside Bubble Card's template literal evaluation context.
// Available globals: state, entity, icon, card, hass — see tools/bubble-card.d.ts.
// Use `thisCard.config.bubble_example` to access this module's editor config.
// CSS lives in styles.css and is merged into the YAML code field at build time.

const config = thisCard.config.bubble_example

if (card) {
  card.classList.toggle('bubble-example--active', state === 'on')
  if (config?.color) {
    card.style.setProperty('--bubble-example-color', `var(--${config.color}-color)`)
  }
}
