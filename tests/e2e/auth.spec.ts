import { test, expect } from '@playwright/test'

// Requires TEST_USER_EMAIL and TEST_USER_PASSWORD to be set in CI/local env
test.skip(!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD not set')

test('signs in with provided credentials', async ({ page }) => {
  await page.goto('/login')

  const email = process.env.TEST_USER_EMAIL as string
  const pass = process.env.TEST_USER_PASSWORD as string

  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(pass)
  await page.locator('button:has-text("Sign in")').click()

  // Expect header to show signed-in user email or a sign-out button
  await expect(page.locator(`text=${email}`)).toBeVisible({ timeout: 7000 })
})
