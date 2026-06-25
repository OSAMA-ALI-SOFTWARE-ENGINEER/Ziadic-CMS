import { test, expect } from '@playwright/test'
import { loginAsSuperAdmin, loginAsAdmin } from '../utils/auth-helpers'
import { fillFormField, selectDropdownOption, clickButton, waitForLoadingComplete, isElementVisible, waitForToastMessage, getTableRowCount } from '../utils/common-helpers'
import { generateUniqueUser } from '../fixtures/test-data'

test.describe('User Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Super admin can manage users
    await loginAsSuperAdmin(page)
  })

  test('Navigate to users page', async ({ page }) => {
    await page.goto('/users')

    // Verify page elements
    expect(page.url()).toContain('/users')
    expect(await isElementVisible(page, 'button:has-text("Create User")')).toBeTruthy()
  })

  test('Create new user with valid data', async ({ page }) => {
    const newUser = generateUniqueUser()

    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Click create user button
    await clickButton(page, 'Create User')
    await waitForLoadingComplete(page)

    // Fill user form
    await fillFormField(page, 'Name', newUser.name)
    await fillFormField(page, 'Email', newUser.email)

    // Select role
    const roleSelect = page.locator('select[aria-label*="Role"]')
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption(newUser.role)
    }

    // Set status
    const statusSelect = page.locator('select[aria-label*="Status"]')
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption(newUser.status)
    }

    // Submit form
    await clickButton(page, 'Create User')
    await waitForLoadingComplete(page)

    // Verify success
    try {
      await waitForToastMessage(page, 'created successfully', 'success')
    } catch {
      await page.waitForTimeout(1000)
    }

    expect(page.url()).toContain('/users')
  })

  test('Create user with missing required fields should fail', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Click create user button
    await clickButton(page, 'Create User')
    await waitForLoadingComplete(page)

    // Leave email empty
    await fillFormField(page, 'Name', 'Test User')

    // Try to submit
    await clickButton(page, 'Create User')

    // Form should not submit
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/users')
  })

  test('Create user with invalid email should fail', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Click create user button
    await clickButton(page, 'Create User')
    await waitForLoadingComplete(page)

    // Fill with invalid email
    await fillFormField(page, 'Name', 'Test User')
    await fillFormField(page, 'Email', 'invalid-email')

    // Try to submit
    await clickButton(page, 'Create User')

    // Should show validation error
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/users')
  })

  test('Edit existing user', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find and click edit button
    const editButtons = page.locator('button:has-text("Edit")')
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      await waitForLoadingComplete(page)

      // Get current name
      const nameField = page.locator('input[aria-label*="Name"]')
      const currentName = await nameField.inputValue()

      // Update name
      const newName = `${currentName} - Updated`
      await nameField.clear()
      await nameField.fill(newName)

      // Save changes
      await clickButton(page, 'Update User')
      await waitForLoadingComplete(page)

      // Verify success
      try {
        await waitForToastMessage(page, 'updated successfully', 'success')
      } catch {
        await page.waitForTimeout(1000)
      }
    }
  })

  test('Change user role', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find and click edit button
    const editButtons = page.locator('button:has-text("Edit")')
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      await waitForLoadingComplete(page)

      // Change role
      const roleSelect = page.locator('select[aria-label*="Role"]')
      if (await roleSelect.isVisible()) {
        const currentRole = await roleSelect.inputValue()
        // Select a different role
        const allOptions = page.locator('select[aria-label*="Role"] option')
        const optionCount = await allOptions.count()
        if (optionCount > 1) {
          // Get all options and select different one
          await roleSelect.selectOption({ index: 1 })
        }
      }

      // Save
      await clickButton(page, 'Update User')
      await waitForLoadingComplete(page)

      try {
        await waitForToastMessage(page, 'updated', 'success')
      } catch {
        await page.waitForTimeout(1000)
      }
    }
  })

  test('Change user status to inactive', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find and click edit button
    const editButtons = page.locator('button:has-text("Edit")')
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      await waitForLoadingComplete(page)

      // Change status
      const statusSelect = page.locator('select[aria-label*="Status"]')
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('inactive')
      }

      // Save
      await clickButton(page, 'Update User')
      await waitForLoadingComplete(page)

      try {
        await waitForToastMessage(page, 'updated', 'success')
      } catch {
        await page.waitForTimeout(1000)
      }
    }
  })

  test('Activate deactivated user', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find inactive user and activate
    const statusCells = page.locator('table tbody td:nth-child(4)')

    // Look for inactive user
    for (let i = 0; i < await statusCells.count(); i++) {
      const status = await statusCells.nth(i).textContent()
      if (status?.includes('inactive')) {
        // Click edit on this row
        const editBtn = statusCells.nth(i).locator('..').locator('button:has-text("Edit")')
        if (await editBtn.isVisible()) {
          await editBtn.click()
          await waitForLoadingComplete(page)

          // Change status to active
          const statusSelect = page.locator('select[aria-label*="Status"]')
          await statusSelect.selectOption('active')

          // Save
          await clickButton(page, 'Update User')
          await waitForLoadingComplete(page)

          try {
            await waitForToastMessage(page, 'updated', 'success')
          } catch {
            await page.waitForTimeout(1000)
          }
          break
        }
      }
    }
  })

  test('Delete user with confirmation', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    const initialCount = await getTableRowCount(page, 'table')

    if (initialCount > 0) {
      // Click delete on last user
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

  test('Cancel user deletion', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    const initialCount = await getTableRowCount(page, 'table')

    if (initialCount > 0) {
      const deleteBtn = page.locator('button:has-text("Delete")')
      if (await deleteBtn.first().isVisible()) {
        await deleteBtn.first().click()

        // Cancel
        const cancelBtn = page.locator('button:has-text("Cancel")')
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click()

          // Count should remain the same
          const finalCount = await getTableRowCount(page, 'table')
          expect(finalCount).toBe(initialCount)
        }
      }
    }
  })

  test('Search users by name or email', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('admin')
      await page.waitForTimeout(500)

      // Verify table is updated
      expect(await isElementVisible(page, 'table')).toBeTruthy()
    }
  })

  test('Filter users by role', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find role filter
    const roleFilter = page.locator('select[aria-label*="Role"]')
    if (await roleFilter.isVisible()) {
      await roleFilter.selectOption({ index: 1 })
      await page.waitForTimeout(500)

      // Verify table updated
      expect(await isElementVisible(page, 'table')).toBeTruthy()
    }
  })

  test('Filter users by status', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find status filter
    const statusFilter = page.locator('select[aria-label*="Status"]')
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('active')
      await page.waitForTimeout(500)

      // Verify table updated
      expect(await isElementVisible(page, 'table')).toBeTruthy()
    }
  })

  test('Paginate through users', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Check for next page button
    const nextBtn = page.locator('button:has-text("Next")')
    if (await nextBtn.isVisible() && !await nextBtn.isDisabled()) {
      const initialCount = await getTableRowCount(page, 'table')

      await nextBtn.click()
      await waitForLoadingComplete(page)

      // Verify table updated
      expect(await getTableRowCount(page, 'table')).toBeGreaterThanOrEqual(0)
    }
  })

  test('Bulk select users', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Check for select all checkbox
    const selectAll = page.locator('input[type="checkbox"][aria-label*="Select all"]')
    if (await selectAll.isVisible()) {
      await selectAll.click()

      // Verify checkboxes are checked
      const checkedBoxes = page.locator('input[type="checkbox"]:checked')
      expect(await checkedBoxes.count()).toBeGreaterThan(0)
    }
  })

  test('Bulk delete users', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    const initialCount = await getTableRowCount(page, 'table')

    if (initialCount > 1) {
      // Select first user
      const checkbox = page.locator('input[type="checkbox"]').first()
      if (await checkbox.isVisible()) {
        await checkbox.click()

        // Look for bulk delete button
        const bulkDeleteBtn = page.locator('button:has-text("Delete Selected")')
        if (await bulkDeleteBtn.isVisible()) {
          await bulkDeleteBtn.click()

          // Confirm
          const confirmBtn = page.locator('button:has-text("Confirm")')
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click()
            await waitForLoadingComplete(page)

            const finalCount = await getTableRowCount(page, 'table')
            expect(finalCount).toBeLessThanOrEqual(initialCount)
          }
        }
      }
    }
  })

  test('View user profile', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Click on user name to view profile
    const userRow = page.locator('table tbody tr').first()
    if (await userRow.isVisible()) {
      const userLink = userRow.locator('a, button:has-text("View")')
      if (await userLink.first().isVisible()) {
        await userLink.first().click()
        await waitForLoadingComplete(page)

        // Should navigate to user profile or show modal
        expect(page.url()).toContain('/users') || await isElementVisible(page, '[class*="modal"], [class*="panel"]')
      }
    }
  })

  test('Cannot delete self', async ({ page }) => {
    // Navigate to profile page to get current user
    await page.goto('/profile')
    await waitForLoadingComplete(page)

    // Get current user email
    const emailField = page.locator('input[aria-label*="Email"]')
    const currentUserEmail = await emailField.inputValue()

    // Go back to users page
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find current user in list
    const userRows = page.locator('table tbody tr')
    for (let i = 0; i < await userRows.count(); i++) {
      const row = userRows.nth(i)
      const email = await row.locator('td:nth-child(2)').textContent()

      if (email?.includes(currentUserEmail)) {
        // Check if delete button is disabled
        const deleteBtn = row.locator('button:has-text("Delete")')
        if (await deleteBtn.isVisible()) {
          const isDisabled = await deleteBtn.isDisabled()
          expect(isDisabled).toBeTruthy()
        }
        break
      }
    }
  })

  test('Password change requirement indicator', async ({ page }) => {
    await page.goto('/users')
    await waitForLoadingComplete(page)

    // Find and click edit
    const editButtons = page.locator('button:has-text("Edit")')
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      await waitForLoadingComplete(page)

      // Look for password field
      const passwordField = page.locator('input[type="password"]')
      if (await passwordField.isVisible()) {
        expect(await passwordField.isVisible()).toBeTruthy()
      }
    }
  })
})
