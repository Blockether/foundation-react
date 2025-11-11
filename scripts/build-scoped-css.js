#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import postcss from 'postcss'
import postcssPrefix from 'postcss-prefix-selector'

const __dirname = dirname(fileURLToPath(import.meta.url))

const inputFile = resolve(__dirname, '../dist/foundation-react.css')
const outputFile = resolve(__dirname, '../dist/foundation-react.scoped.css')

console.log('Creating scoped CSS version...')

// Read the unscoped CSS
const css = readFileSync(inputFile, 'utf8')

// Apply postcss-prefix-selector with custom :root transformation
postcss([
  postcssPrefix({
    prefix: '.blockether-foundation',
    exclude: [
      // Keep these as they are at-rules or need to stay global
      /@keyframes/,
      /@layer/,
      /@media/,
      /@supports/,
    ],
    transform: (prefix, selector, prefixedSelector) => {
      // Don't double-prefix
      if (selector.includes('.blockether-foundation')) {
        return selector
      }

      // Transform :root to our prefix class to scope CSS variables
      if (selector === ':root') {
        return '.blockether-foundation'
      }

      // Handle complex selector groups that contain universal selectors
      if (selector.includes('*')) {
        // Split by comma and process each selector individually
        const selectors = selector.split(',').map(s => s.trim())
        const filteredSelectors = selectors.filter(s => {
          // Remove selectors that are just *, html, or body
          return !/^(html|body|\*)($|[,\s[:.#])/.test(s)
        })

        // If all selectors were filtered out, return null
        if (filteredSelectors.length === 0) {
          return null
        }

        // Join back the filtered selectors and prefix normally
        return filteredSelectors.join(', ').split(', ').map(s => `${prefix} ${s}`).join(', ')
      }

      // Remove global html, body selectors entirely
      if (/^(html|body)($|[,\s[:.#])/.test(selector)) {
        return null // Skip this rule entirely
      }

      // For pseudo-elements, we need to be careful
      // ::backdrop, ::placeholder, etc. need to be prefixed differently
      if (selector.startsWith('::')) {
        return `${prefix} ${selector}`
      }

      // Default: prefix normally
      return `${prefix} ${selector}`
    },
  }),
])
  .process(css, { from: inputFile, to: outputFile })
  .then((result) => {
    // Clean up any dangling commas and invalid CSS syntax
    let cleanedCSS = result.css

    // Fix dangling comma at the beginning of selector list: {.blockether-foundation :before, -> .blockether-foundation :before,
    cleanedCSS = cleanedCSS.replace(/\{\s*,/g, '{')

    // Fix missing commas between selectors in complex selector groups
    // This handles cases like: .class1.class2 -> .class1, .class2
    cleanedCSS = cleanedCSS.replace(/(\.blockether-foundation[^\s,{}]+)(\.blockether-foundation)/g, '$1, $2')

    // Fix multiple consecutive commas and trim whitespace
    cleanedCSS = cleanedCSS.replace(/,\s*,/g, ',').replace(/\s+/g, ' ')

    writeFileSync(outputFile, cleanedCSS)
    console.log('✓ Created foundation-react.scoped.css')
  })
  .catch((error) => {
    console.error('Error creating scoped CSS:', error)
    process.exit(1)
  })
