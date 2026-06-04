import type { BubbleCardThis } from '../../../tools/bubble-card'

interface FrigatePlayerConfig {
  param?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
}

declare const thisCard: BubbleCardThis<{ frigate_player?: FrigatePlayerConfig }>
