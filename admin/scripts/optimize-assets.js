#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, '../dist')
const assetsDir = path.join(distDir, 'assets')

// Remove unused font formats (keep only woff2 and woff)
const fontsToRemove = ['ttf', 'eot', 'svg']
let removedCount = 0
let totalSaved = 0

if (fs.existsSync(assetsDir)) {
  fs.readdirSync(assetsDir).forEach(file => {
    fontsToRemove.forEach(ext => {
      const pattern = new RegExp(`primeicons-.*\\.${ext}$`)
      if (pattern.test(file)) {
        const filePath = path.join(assetsDir, file)
        try {
          const stats = fs.statSync(filePath)
          const sizeKB = (stats.size / 1024).toFixed(2)
          totalSaved += stats.size
          fs.unlinkSync(filePath)
          console.log(`[OPTIMIZE] Removed: ${file} (${sizeKB} KB)`)
          removedCount++
        } catch (err) {
          console.warn(`[OPTIMIZE] Failed to remove ${file}: ${err.message}`)
        }
      }
    })
  })
}

const totalSavedKB = (totalSaved / 1024).toFixed(2)
console.log(`[OPTIMIZE] Asset optimization complete! (${removedCount} files removed, ${totalSavedKB} KB saved)`)
