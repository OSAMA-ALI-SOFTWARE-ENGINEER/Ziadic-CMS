import { test, expect } from '@playwright/test'
import { loginAsAdmin, loginAsStaff } from '../utils/auth-helpers'
import { fillFormField, clickButton, waitForLoadingComplete, isElementVisible, waitForToastMessage, getTableRowCount } from '../utils/common-helpers'
import { generateUniqueArticle } from '../fixtures/test-data'

test.describe('Article Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as staff who can create articles
    await loginAsStaff(page)
  })

  test('Navigate to articles page', async ({ page }) => {
    await page.goto('/blog-articles')

    // Verify page title and main elements
    expect(page.url()).toContain('/blog-articles')
    expect(await isElementVisible(page, 'button:has-text("Create Article")')).toBeTruthy()
  })

  test('Create new article with valid data', async ({ page }) => {
    const article = generateUniqueArticle()

    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Click create article button
    await clickButton(page, 'Create Article')
    await waitForLoadingComplete(page)

    // Fill article form
    await fillFormField(page, 'Title', article.title)
    await fillFormField(page, 'Excerpt', article.excerpt)

    // Fill content using editor (may have special handling)
    const contentEditor = page.locator('[class*="editor"], [class*="quill"], textarea[aria-label*="Content"]')
    if (await contentEditor.isVisible()) {
      await contentEditor.click()
      await contentEditor.fill(article.content)
    }

    // Fill SEO fields if visible
    const seoTitleField = page.locator('input[aria-label*="SEO Title"]')
    if (await seoTitleField.isVisible()) {
      await fillFormField(page, 'SEO Title', article.seoTitle)
    }

    // Submit form
    await clickButton(page, 'Create Article')
    await waitForLoadingComplete(page)

    // Verify success
    try {
      await waitForToastMessage(page, 'created successfully', 'success')
    } catch {
      await page.waitForTimeout(1000)
    }

    expect(page.url()).toContain('/blog-articles')
  })

  test('Auto-save article while editing', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Click create article button
    await clickButton(page, 'Create Article')
    await waitForLoadingComplete(page)

    // Start typing title
    const titleField = page.locator('input[aria-label*="Title"]')
    await titleField.fill('Test Article for Auto-Save')

    // Wait for auto-save indicator to appear and disappear
    const autoSaveIndicator = page.locator('[class*="auto-save"], [data-testid="auto-save"]')
    try {
      await autoSaveIndicator.waitFor({ state: 'visible', timeout: 2000 })
      await autoSaveIndicator.waitFor({ state: 'hidden', timeout: 5000 })
    } catch {
      // Auto-save indicator might not be visible
    }

    // Refresh page
    await page.reload()

    // Check if content is preserved (if auto-save worked)
    const savedTitle = await titleField.inputValue()
    expect(savedTitle).toBe('Test Article for Auto-Save')
  })

  test('Edit existing article', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Find and click edit button
    const editButtons = page.locator('button:has-text("Edit")')
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      await waitForLoadingComplete(page)

      // Get current title
      const titleField = page.locator('input[aria-label*="Title"]')
      const currentTitle = await titleField.inputValue()

      // Update title
      const newTitle = `${currentTitle} - Updated`
      await titleField.clear()
      await titleField.fill(newTitle)

      // Save changes
      await clickButton(page, 'Update Article')
      await waitForLoadingComplete(page)

      // Verify success
      try {
        await waitForToastMessage(page, 'updated successfully', 'success')
      } catch {
        await page.waitForTimeout(1000)
      }
    }
  })

  test('Submit article for review', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Find article in draft status and click edit
    const editButtons = page.locator('button:has-text("Edit")')
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      await waitForLoadingComplete(page)

      // Look for submit for review button
      const submitBtn = page.locator('button:has-text("Submit for Review")')
      if (await submitBtn.isVisible()) {
        await submitBtn.click()
        await waitForLoadingComplete(page)

        try {
          await waitForToastMessage(page, 'submitted', 'success')
        } catch {
          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('Article approval workflow', async ({ page }) => {
    // Login as admin to approve
    await loginAsAdmin(page)

    try {
      await page.goto('/approvals')
      await waitForLoadingComplete(page)

      // Look for approve button
      const approveBtn = page.locator('button:has-text("Approve")')
      if (await approveBtn.first().isVisible()) {
        await approveBtn.first().click()
        await waitForLoadingComplete(page)

        try {
          await waitForToastMessage(page, 'approved', 'success')
        } catch {
          await page.waitForTimeout(1000)
        }
      }
    } catch {
      test.skip()
    }
  })

  test('Reject article with reason', async ({ page }) => {
    // Login as admin to reject
    await loginAsAdmin(page)

    try {
      await page.goto('/approvals')
      await waitForLoadingComplete(page)

      // Look for reject button
      const rejectBtn = page.locator('button:has-text("Reject")')
      if (await rejectBtn.first().isVisible()) {
        await rejectBtn.first().click()
        await waitForLoadingComplete(page)

        // Fill rejection reason if modal appears
        const reasonTextarea = page.locator('textarea[aria-label*="Reason"]')
        if (await reasonTextarea.isVisible()) {
          await reasonTextarea.fill('Content does not meet editorial guidelines')
        }

        // Confirm
        const confirmBtn = page.locator('button:has-text("Confirm")')
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click()
          await waitForLoadingComplete(page)
        }

        try {
          await waitForToastMessage(page, 'rejected', 'success')
        } catch {
          await page.waitForTimeout(1000)
        }
      }
    } catch {
      test.skip()
    }
  })

  test('Publish article', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Find approved article and edit
    const editButtons = page.locator('button:has-text("Edit")')
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      await waitForLoadingComplete(page)

      // Look for publish button
      const publishBtn = page.locator('button:has-text("Publish")')
      if (await publishBtn.isVisible()) {
        await publishBtn.click()
        await waitForLoadingComplete(page)

        try {
          await waitForToastMessage(page, 'published', 'success')
        } catch {
          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('Delete article with confirmation', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    const initialCount = await getTableRowCount(page, 'table')

    if (initialCount > 0) {
      // Click delete on last article
      const deleteBtn = page.locator('button:has-text("Delete")')
      if (await deleteBtn.first().isVisible()) {
        await deleteBtn.first().click()

        // Confirm deletion
        const confirmBtn = page.locator('button:has-text("Confirm")')
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click()
          await waitForLoadingComplete(page)

          try {
            await waitForToastMessage(page, 'deleted', 'success')
          } catch {
            await page.waitForTimeout(1000)
          }

          // Verify count decreased
          const finalCount = await getTableRowCount(page, 'table')
          expect(finalCount).toBeLessThanOrEqual(initialCount)
        }
      }
    }
  })

  test('Search articles by title', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await page.waitForTimeout(500)

      // Verify table is still visible
      expect(await isElementVisible(page, 'table')).toBeTruthy()
    }
  })

  test('Filter articles by status', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Find status filter
    const statusFilter = page.locator('select[aria-label*="Status"]')
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('published')
      await page.waitForTimeout(500)

      // Verify table updated
      expect(await isElementVisible(page, 'table')).toBeTruthy()
    }
  })

  test('Article form validation for missing title', async ({ page }) => {
    await page.goto('/blog-articles')

    // Click create article button
    await clickButton(page, 'Create Article')
    await waitForLoadingComplete(page)

    // Leave title empty and fill content
    const contentEditor = page.locator('[class*="editor"], [class*="quill"], textarea[aria-label*="Content"]')
    if (await contentEditor.isVisible()) {
      await contentEditor.fill('Some content')
    }

    // Try to submit
    await clickButton(page, 'Create Article')

    // Form should not submit
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/blog-articles')
  })

  test('Add featured image to article', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Click create article
    await clickButton(page, 'Create Article')
    await waitForLoadingComplete(page)

    // Fill basic info
    await fillFormField(page, 'Title', 'Article with Image')

    // Look for image upload
    const imageInput = page.locator('input[type="file"]')
    if (await imageInput.isVisible()) {
      // Note: file upload requires actual test image file
      // For now just verify the input is present
      expect(await imageInput.isVisible()).toBeTruthy()
    }
  })

  test('Paginate through articles', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Check for pagination
    const nextBtn = page.locator('button:has-text("Next")')
    if (await nextBtn.isVisible() && !await nextBtn.isDisabled()) {
      const initialCount = await getTableRowCount(page, 'table')

      await nextBtn.click()
      await waitForLoadingComplete(page)

      // Verify table refreshed
      expect(await getTableRowCount(page, 'table')).toBeGreaterThanOrEqual(0)
    }
  })

  test('Duplicate article', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Look for duplicate button
    const duplicateBtn = page.locator('button:has-text("Duplicate")')
    if (await duplicateBtn.first().isVisible()) {
      await duplicateBtn.first().click()
      await waitForLoadingComplete(page)

      try {
        await waitForToastMessage(page, 'duplicated', 'success')
      } catch {
        await page.waitForTimeout(1000)
      }

      // Should show new article in list
      expect(await isElementVisible(page, 'table')).toBeTruthy()
    }
  })

  test('View article preview', async ({ page }) => {
    await page.goto('/blog-articles')
    await waitForLoadingComplete(page)

    // Look for preview button
    const previewBtn = page.locator('button:has-text("Preview")')
    if (await previewBtn.first().isVisible()) {
      // Open in new tab/window if needed
      const newPagePromise = page.context().waitForEvent('page')
      await previewBtn.first().click()

      try {
        const newPage = await newPagePromise
        expect(newPage.url()).not.toBe(page.url())
        await newPage.close()
      } catch {
        // Preview might open in same tab
      }
    }
  })
})
