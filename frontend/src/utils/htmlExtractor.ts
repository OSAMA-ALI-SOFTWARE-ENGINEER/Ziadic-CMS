/**
 * Helper utilities for extracting HTML content from legacy Webflow files
 * Used during Phase 1: Legacy HTML to Vue migration
 */

/**
 * Extract body content from HTML string
 * Removes <!DOCTYPE>, <html>, <head>, closing tags
 * Returns just the content from <body> ... </body>
 */
export function extractBodyContent(htmlContent: string): string {
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return bodyMatch ? bodyMatch[1].trim() : htmlContent
}

/**
 * Extract CSS link tags from HTML head
 * Returns array of href values
 */
export function extractCssLinks(htmlContent: string): string[] {
  const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  if (!headMatch) return []

  const linkMatches = headMatch[1].matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)
  return Array.from(linkMatches).map(match => match[1])
}

/**
 * Extract script tags from HTML
 * Returns array of {src?, content}
 */
export function extractScripts(htmlContent: string): Array<{ src?: string; content?: string }> {
  const scriptMatches = htmlContent.matchAll(/<script[^>]*(?:src=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/script>/gi)
  return Array.from(scriptMatches).map(match => ({
    src: match[1],
    content: match[2]
  }))
}

/**
 * Extract all style tags from HTML
 * Returns combined CSS content
 */
export function extractStyles(htmlContent: string): string {
  const styleMatches = htmlContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)
  const styles = Array.from(styleMatches).map(match => match[1])
  return styles.join('\n\n')
}

/**
 * Extract meta tags (for SEO)
 * Returns object with title, description, etc.
 */
export function extractMetaTags(htmlContent: string): Record<string, string> {
  const meta: Record<string, string> = {}

  // Extract title
  const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i)
  if (titleMatch) meta.title = titleMatch[1]

  // Extract meta descriptions
  const metaMatches = htmlContent.matchAll(/<meta[^>]*name=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi)
  for (const match of metaMatches) {
    meta[match[1]] = match[2]
  }

  return meta
}

/**
 * Cleanup extracted HTML
 * - Remove data-wf-* attributes
 * - Remove Webflow-specific classes if needed
 * - Fix relative paths
 */
export function cleanupHtml(html: string, options: {
  removeWebflowAttrs?: boolean
  fixPaths?: boolean
} = {}): string {
  let cleaned = html

  // Optionally remove Webflow data attributes (can break animations!)
  if (options.removeWebflowAttrs) {
    cleaned = cleaned.replace(/\s+data-w[^=]*="[^"]*"/g, '')
  }

  // Fix relative paths (convert ../legacy/ to /legacy/)
  if (options.fixPaths) {
    cleaned = cleaned.replace(/\.\.\/legacy\//g, '/legacy/')
    cleaned = cleaned.replace(/^\/+/gm, '/') // Remove leading slashes for relative paths
  }

  return cleaned
}

/**
 * Create Vue component template from extracted parts
 */
export function createVueComponent(
  bodyHtml: string,
  styles: string
): string {
  return `<template>
  <div class="page-wrapper">
    ${bodyHtml}
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

onMounted(() => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger)

  // Initialize Webflow interactions
  window.Webflow?.destroy?.()
  window.Webflow?.ready?.()
  window.Webflow?.require?.('ix2')?.init?.()

  // Cleanup triggers on unmount
  return () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }
})
</script>

<style scoped>
${styles}
</style>
`
}
