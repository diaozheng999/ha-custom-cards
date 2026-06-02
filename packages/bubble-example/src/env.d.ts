// Narrows `thisCard` to this module's specific config shape.
// Shadows the generic BubbleCardThis declaration from tools/bubble-card.d.ts.
import type { BubbleCardThis } from '../../../tools/bubble-card'

interface BubbleExampleConfig {
  color?: string
}

declare const thisCard: BubbleCardThis<{ bubble_example?: BubbleExampleConfig }>
