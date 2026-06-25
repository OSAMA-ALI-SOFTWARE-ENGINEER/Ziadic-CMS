import { Page } from '@playwright/test'

export const TEST_USERS = {
  superAdmin: {
    email: 'superadmin@kukaqka.com',
    password: 'password',
    name: 'Super Admin',
    role: 'super-admin',
  },
  admin: {
    email: 'admin@kukaqka.com',
    password: 'password',
    name: 'Admin User',
    role: 'admin',
  },
  staff: {
    email: 'staff@kukaqka.com',
    password: 'password',
    name: 'Staff Editor',
    role: 'staff',
  },
  client: {
    email: 'client@kukaqka.com',
    password: 'password',
    name: 'Client Account',
    role: 'client',
  },
}

/**
 * Login to the admin panel with given credentials
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[placeholder="Your Email *"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 })
}

/**
 * Login as super admin
 */
export async function loginAsSuperAdmin(page: Page) {
  await login(page, TEST_USERS.superAdmin.email, TEST_USERS.superAdmin.password)
}

/**
 * Login as admin
 */
export async function loginAsAdmin(page: Page) {
  await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
}

/**
 * Login as staff
 */
export async function loginAsStaff(page: Page) {
  await login(page, TEST_USERS.staff.email, TEST_USERS.staff.password)
}

/**
 * Login as client
 */
export async function loginAsClient(page: Page) {
  await login(page, TEST_USERS.client.email, TEST_USERS.client.password)
}

/**
 * Logout from admin panel
 */
export async function logout(page: Page) {
  // Click on user menu (usually in top-right)
  await page.click('[data-testid="user-menu"]')
  // Click logout button
  await page.click('[data-testid="logout-btn"]')

  // Wait for redirect to login
  await page.waitForURL('/login', { timeout: 5000 })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 2000 })
    return true
  } catch {
    return false
  }
}
