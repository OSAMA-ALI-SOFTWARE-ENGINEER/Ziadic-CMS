import { Page } from '@playwright/test'

/**
 * Fill and submit a form field
 */
export async function fillFormField(page: Page, label: string, value: string) {
  // Try different selectors for form fields
  const input = page.locator(`input[aria-label="${label}"]`)
  if (await input.isVisible()) {
    await input.fill(value)
    return
  }

  // Try placeholder selector
  const inputByPlaceholder = page.locator(`input[placeholder*="${label}"]`)
  if (await inputByPlaceholder.isVisible()) {
    await inputByPlaceholder.fill(value)
    return
  }

  // Try generic text input near label
  const label_element = page.locator(`label:has-text("${label}")`)
  if (await label_element.isVisible()) {
    const input = label_element.locator('..').locator('input, textarea, select')
    await input.fill(value)
    return
  }

  throw new Error(`Could not find form field with label: ${label}`)
}

/**
 * Select an option from a dropdown/select element
 */
export async function selectDropdownOption(page: Page, label: string, value: string) {
  const select = page.locator(`select[aria-label="${label}"]`)
  if (await select.isVisible()) {
    await select.selectOption(value)
    return
  }

  // Try by label
  const label_element = page.locator(`label:has-text("${label}")`)
  if (await label_element.isVisible()) {
    const dropdown = label_element.locator('..').locator('select')
    await dropdown.selectOption(value)
    return
  }

  throw new Error(`Could not find dropdown with label: ${label}`)
}

/**
 * Click a button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.click(`button:has-text("${text}")`)
}

/**
 * Click a link by text
 */
export async function clickLink(page: Page, text: string) {
  await page.click(`a:has-text("${text}")`)
}

/**
 * Check if element is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    return await page.locator(selector).isVisible({ timeout: 2000 })
  } catch {
    return false
  }
}

/**
 * Check if element contains text
 */
export async function doesElementContainText(page: Page, selector: string, text: string): Promise<boolean> {
  try {
    const element = page.locator(selector)
    const content = await element.textContent()
    return content?.includes(text) || false
  } catch {
    return false
  }
}

/**
 * Get text content of element
 */
export async function getElementText(page: Page, selector: string): Promise<string | null> {
  return await page.locator(selector).textContent()
}

/**
 * Wait for toast notification and verify message
 */
export async function waitForToastMessage(page: Page, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
  const toast = page.locator(`[role="status"]`, { hasText: message })
  await toast.waitFor({ state: 'visible', timeout: 5000 })
  return true
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingComplete(page: Page, timeout = 10000) {
  // Wait for any spinners/loaders to appear and disappear
  const loaders = page.locator('[data-testid="loader"], .spinner, .loading')
  try {
    await loaders.first().waitFor({ state: 'visible', timeout: 2000 })
    await loaders.first().waitFor({ state: 'hidden', timeout })
  } catch {
    // Loader might not appear at all, which is fine
  }
}

/**
 * Confirm a modal/dialog
 */
export async function confirmModal(page: Page, confirmText = 'Confirm') {
  await clickButton(page, confirmText)
}

/**
 * Cancel a modal/dialog
 */
export async function cancelModal(page: Page, cancelText = 'Cancel') {
  await clickButton(page, cancelText)
}

/**
 * Wait for navigation
 */
export async function waitForNavigation(page: Page, urlPattern: string | RegExp, timeout = 10000) {
  await page.waitForURL(urlPattern, { timeout })
}

/**
 * Check if currently on a specific page
 */
export async function isOnPage(page: Page, pageName: string): Promise<boolean> {
  try {
    await page.waitForURL(new RegExp(pageName), { timeout: 2000 })
    return true
  } catch {
    return false
  }
}

/**
 * Clear and fill input field
 */
export async function clearAndFill(page: Page, selector: string, value: string) {
  await page.locator(selector).clear()
  await page.locator(selector).fill(value)
}

/**
 * Upload file
 */
export async function uploadFile(page: Page, inputSelector: string, filePath: string) {
  const fileInput = page.locator(inputSelector)
  await fileInput.setInputFiles(filePath)
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded()
}

/**
 * Wait for specific text on page
 */
export async function waitForText(page: Page, text: string, timeout = 5000) {
  await page.waitForSelector(`text="${text}"`, { timeout })
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page, tableSelector = 'table'): Promise<number> {
  const rows = page.locator(`${tableSelector} tbody tr`)
  return await rows.count()
}

/**
 * Get cell value from table
 */
export async function getTableCellValue(page: Page, rowIndex: number, cellIndex: number, tableSelector = 'table'): Promise<string | null> {
  const cell = page.locator(`${tableSelector} tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`)
  return await cell.textContent()
}
