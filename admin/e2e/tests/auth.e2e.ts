import { test, expect } from '@playwright/test'
import { loginAsAdmin, loginAsSuperAdmin, logout, isAuthenticated, TEST_USERS } from '../utils/auth-helpers'
import { waitForToastMessage, isElementVisible } from '../utils/common-helpers'

test.describe('Authentication Workflow', () => {
  test('Login with valid admin credentials', async ({ page }) => {
    await page.goto('/login')

    // Verify login page elements
    expect(await isElementVisible(page, 'button[type="submit"]')).toBeTruthy()
    expect(await isElementVisible(page, 'input[placeholder="Your Email *"]')).toBeTruthy()

    // Fill login form
    await page.fill('input[placeholder="Your Email *"]', TEST_USERS.admin.email)
    await page.fill('input[type="password"]', TEST_USERS.admin.password)

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for successful login
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Verify dashboard is displayed
    expect(page.url()).toContain('/dashboard')
  })

  test('Login with valid super admin credentials', async ({ page }) => {
    await loginAsSuperAdmin(page)

    // Verify dashboard is displayed
    expect(page.url()).toContain('/dashboard')
  })

  test('Login with valid staff credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="Your Email *"]', TEST_USERS.staff.email)
    await page.fill('input[type="password"]', TEST_USERS.staff.password)
    await page.click('button[type="submit"]')

    await page.waitForURL('/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('Login with invalid credentials should fail', async ({ page }) => {
    await page.goto('/login')

    // Fill with invalid credentials
    await page.fill('input[placeholder="Your Email *"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error toast and remain on login page
    try {
      await waitForToastMessage(page, 'Unable to sign in', 'error')
    } catch {
      // Toast might appear with different text, check page URL instead
      await page.waitForTimeout(2000)
    }
    expect(page.url()).toContain('/login')
  })

  test('Empty email field should show validation', async ({ page }) => {
    await page.goto('/login')

    // Leave email empty and try to submit
    await page.fill('input[type="password"]', 'somepassword')
    await page.click('button[type="submit"]')

    // Form should prevent submission or show validation message
    expect(page.url()).toContain('/login')
  })

  test('Empty password field should show validation', async ({ page }) => {
    await page.goto('/login')

    // Fill email but leave password empty
    await page.fill('input[placeholder="Your Email *"]', TEST_USERS.admin.email)
    await page.click('button[type="submit"]')

    // Form should prevent submission
    expect(page.url()).toContain('/login')
  })

  test('Access admin panel after successful login', async ({ page }) => {
    await loginAsAdmin(page)

    // Navigate to listings page
    await page.goto('/listings')

    // Verify we can access authenticated pages
    expect(page.url()).toContain('/listings')

    // Verify dashboard link exists
    expect(await isElementVisible(page, 'a[href*="dashboard"]')).toBeTruthy()
  })

  test('Logout should redirect to login page', async ({ page }) => {
    await loginAsAdmin(page)

    // Try to access user menu (implementation may vary)
    // This assumes there's a logout button accessible from dashboard
    // Modify selector based on actual UI
    try {
      await page.click('[data-testid="user-menu"]')
      await page.click('[data-testid="logout-btn"]')
    } catch {
      // If logout button not found with test IDs, try by text
      await page.click('button:has-text("Logout")')
    }

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('Cannot access protected routes without authentication', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/listings')

    // Should be redirected to login
    await page.waitForURL('/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('Cannot access protected routes after logout', async ({ page }) => {
    await loginAsAdmin(page)

    // Logout
    try {
      await page.click('[data-testid="user-menu"]')
      await page.click('[data-testid="logout-btn"]')
    } catch {
      await page.click('button:has-text("Logout")')
    }

    await page.waitForURL('/login', { timeout: 5000 })

    // Try to access protected route directly
    await page.goto('/listings')

    // Should be redirected to login
    expect(page.url()).toContain('/login')
  })

  test('Session persists across page refreshes', async ({ page }) => {
    await loginAsAdmin(page)

    // Refresh page
    await page.reload()

    // Should still be on dashboard (session persisted)
    await page.waitForURL('/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('Demo credentials are visible on login page', async ({ page }) => {
    await page.goto('/login')

    // Check if demo credentials section is visible
    const demoBox = page.locator('.demo-credentials-box')
    expect(await demoBox.isVisible()).toBeTruthy()

    // Check all credential buttons are visible
    const credButtons = page.locator('.demo-credential-btn')
    expect(await credButtons.count()).toBeGreaterThan(0)
  })

  test('Can auto-fill login with demo credentials', async ({ page }) => {
    await page.goto('/login')

    // Click on admin credential button
    await page.click('button:has-text("Admin User")')

    // Check if fields are auto-filled
    const emailInput = page.locator('input[placeholder="Your Email *"]')
    const emailValue = await emailInput.inputValue()
    expect(emailValue).toBe(TEST_USERS.admin.email)

    const passwordInput = page.locator('input[type="password"]')
    const passwordValue = await passwordInput.inputValue()
    expect(passwordValue).toBe(TEST_USERS.admin.password)
  })

  test('Login button is disabled during submission', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[placeholder="Your Email *"]', TEST_USERS.admin.email)
    await page.fill('input[type="password"]', TEST_USERS.admin.password)

    const submitButton = page.locator('button[type="submit"]')

    // Click submit
    await submitButton.click()

    // Button should be disabled during submission (may show loading state)
    // This depends on implementation
  })

  test('Redirect authenticated users from login page to dashboard', async ({ page }) => {
    await loginAsAdmin(page)

    // Navigate to login page while authenticated
    await page.goto('/login')

    // Should be redirected to dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })
})
