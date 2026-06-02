import path from 'node:path'
import { defineConfig } from '@rsbuild/core'
import { pluginBubbleYaml } from '../../tools/bubble-yaml-plugin'

export default defineConfig({
  source: {
    entry: { index: './src/index.ts' },
  },
  output: {
    // Intermediate assets go to .tmp/ — the plugin assembles dist/module.yaml from them.
    // Flatten output — put JS and CSS directly in .tmp/ (no static/js/ subdirs).
    distPath: { root: '.tmp', js: '', css: '' },
    filename: { js: '[name].js', css: '[name].css' },
    minify: true,
    filenameHash: false,
    // Keep CSS as a separate file so the plugin can read and embed it into the YAML.
    injectStyles: false,
  },
  tools: {
    bundlerChain(chain) {
      // IIFE output: code executes immediately when Bubble Card evaluates the template.
      chain.output.library({ type: 'iife' })
    },
  },
  plugins: [pluginBubbleYaml(path.resolve(__dirname))],
})
