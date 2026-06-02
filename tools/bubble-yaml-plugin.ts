import fs from 'node:fs'
import path from 'node:path'
import { stringify } from 'yaml'
import type { RsbuildPlugin } from '@rsbuild/core'

interface BubbleModuleMeta {
  id: string
  name: string
  version: string
  creator: string
  description?: string
  link?: string
  unsupported?: string[]
  editor?: unknown[]
}

// Rsbuild plugin that assembles dist/module.yaml from the compiled .tmp/ assets and module.json.
//
// CSS placeholder convention: write [[expr]] in .css files where ${expr} template expressions
// are needed. PostCSS rejects bare ${...}, but [[...]] passes through untouched. The plugin
// converts [[expr]] → ${expr} before embedding in the YAML code field.
//
// JS wrapping: the compiled IIFE is wrapped in ${(function(thisCard){ [iife] })(this)} so that:
//   - Bubble Card evaluates it as a template expression
//   - `this` (the card element with its .config) is available as `thisCard` in the module code
export function pluginBubbleYaml(packageRoot: string): RsbuildPlugin {
  return {
    name: 'plugin-bubble-yaml',
    setup(api) {
      api.onAfterBuild(async () => {
        const metaPath = path.join(packageRoot, 'module.json')
        const meta: BubbleModuleMeta = JSON.parse(
          fs.readFileSync(metaPath, 'utf8'),
        )

        const tmpDir = path.join(packageRoot, '.tmp')
        const distDir = path.join(packageRoot, 'dist')

        const jsPath = path.join(tmpDir, 'index.js')
        const cssPath = path.join(tmpDir, 'index.css')

        const js = fs.existsSync(jsPath)
          ? fs.readFileSync(jsPath, 'utf8').trim()
          : ''
        const rawCss = fs.existsSync(cssPath)
          ? fs.readFileSync(cssPath, 'utf8').trim()
          : ''

        // Restore CSS template expressions from [[expr]] placeholders.
        const css = rawCss.replace(/\[\[(.+?)\]\]/g, '$${$1}')

        // Wrap JS so Bubble Card executes it and `this` is available as `thisCard`.
        const jsExpr = js ? `\${(function(thisCard){${js}})(this)}` : ''

        const code = [css, jsExpr].filter(Boolean).join('\n')

        const moduleDoc: Record<string, unknown> = {
          name: meta.name,
          version: meta.version,
          creator: meta.creator,
          ...(meta.description ? { description: meta.description } : {}),
          ...(meta.link ? { link: meta.link } : {}),
          ...(meta.unsupported?.length ? { unsupported: meta.unsupported } : {}),
          code,
          ...(meta.editor?.length ? { editor: meta.editor } : {}),
        }

        fs.mkdirSync(distDir, { recursive: true })
        fs.writeFileSync(
          path.join(distDir, 'module.yaml'),
          stringify(
            { [meta.id]: moduleDoc },
            { blockQuote: 'literal', lineWidth: 0 },
          ),
        )

        console.log(`[bubble-yaml] wrote dist/module.yaml for ${meta.id}`)
      })
    },
  }
}
