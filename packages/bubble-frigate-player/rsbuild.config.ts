import path from 'node:path'
import { defineConfig } from '@rsbuild/core'
import { pluginBubbleYaml } from '../../tools/bubble-yaml-plugin'

export default defineConfig({
  source: {
    entry: { index: './src/index.ts' },
  },
  output: {
    distPath: { root: '.tmp', js: '', css: '' },
    filename: { js: '[name].js', css: '[name].css' },
    minify: true,
    filenameHash: false,
    injectStyles: false,
  },
  tools: {
    bundlerChain(chain) {
      chain.output.library({ type: 'iife' })
    },
  },
  plugins: [pluginBubbleYaml(path.resolve(__dirname))],
})
