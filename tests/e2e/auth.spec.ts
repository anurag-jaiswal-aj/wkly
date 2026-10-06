import { test, expect } from '@playwright/test'
import { createAndSignInTestUser } from './utils'

test('signs up and signs in with temporary credentials', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()
  // Prefer UI assertion, but fall back to checking stored session in localStorage
  const uiVisible = await page.locator(`text=${creds.email}`).isVisible().catch(() => false)
  if (!uiVisible) {
    const stored = await page.evaluate(() => {
      try { return localStorage.getItem('supabase.auth.token') || localStorage.getItem('sb:token') || null } catch { return null }
    })
    if (!stored) throw new Error('No session found in localStorage')
    if (!String(stored).includes(creds.email)) throw new Error('Stored session does not contain expected email')
  } else {
    await expect(page.locator(`text=${creds.email}`)).toBeVisible({ timeout: 7000 })
  }
})

test('unauthenticated user visiting /planner is redirected to /login', async ({ page }) => {
  await page.goto('/planner')
  await expect(page).toHaveURL(/.*\/login/)
})

test('authenticated user visiting /login is redirected to /planner', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  // After sign in, navigate to login
  await page.goto('/login')

  // Should redirect back to planner
  await expect(page).toHaveURL(/.*\/planner/)
})

test('authenticated user visiting /register is redirected to /planner', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  // After sign in, navigate to register
  await page.goto('/register')

  // Should redirect back to planner
  await expect(page).toHaveURL(/.*\/planner/)
})

test('login page exposes forgot password entry point', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('text=Forgot password?')).toBeVisible()
})

test('forgot password validates email and shows generic success message', async ({ page }) => {
  await page.goto('/forgot-password')

  // Submit empty
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Please enter your email')).toBeVisible()

  // Submit valid but non-existent email
  await page.fill('input[type="email"]', `nonexistent-${Date.now()}@example.com`)
  await page.click('button[type="submit"]')

  // Should show generic success message
  await expect(page.locator('text=Check your email')).toBeVisible()
  await expect(page.locator('text=If an account exists for')).toBeVisible()
})

test('update password validates password confirmation', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await page.goto('/update-password')

  await page.fill('input#password', 'newpassword123')
  await page.fill('input#confirmPassword', 'different123')
  await page.click('button[type="submit"]')

  await expect(page.locator('text=Passwords do not match')).toBeVisible()
})

test('update password successfully updates and navigates to planner', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await page.goto('/update-password')

  await page.fill('input#password', 'newpassword123')
  await page.fill('input#confirmPassword', 'newpassword123')
  await page.click('button[type="submit"]')

  await expect(page.locator('text=Password updated successfully!')).toBeVisible()
  await expect(page).toHaveURL(/.*\/planner/)
})

test('update password handles expired recovery link gracefully', async ({ page }) => {
  // Navigate to update password unauthenticated with an error hash
  await page.goto('/update-password#error=unauthorized_client&error_description=Email+link+is+invalid+or+has+expired')

  await expect(page.locator('text=Invalid Link')).toBeVisible()
  await expect(page.locator('text=This password reset link is invalid or has expired')).toBeVisible()
})

test('unauthenticated user cannot access /settings', async ({ page }) => {
  await page.goto('/settings')
  await expect(page).toHaveURL(/.*\/login/)
})

test('authenticated user can access /settings and see their email', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await page.goto('/settings')
  await expect(page).toHaveURL(/.*\/settings/)
  await expect(page.locator(`text=${creds.email}`)).toBeVisible()
})

test('settings validates email input', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await page.goto('/settings')

  // Same email
  await page.fill('input#email', creds.email)
  await page.click('button:has-text("Update Email")')
  await expect(page.locator('text=Please enter a new email address')).toBeVisible()
})

test('settings validates password confirmation', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await page.goto('/settings')

  await page.fill('input#newPassword', 'newpassword123')
  await page.fill('input#confirmPassword', 'different123')
  await page.click('button:has-text("Update Password")')

  await expect(page.locator('text=Passwords do not match')).toBeVisible()
})

test('settings updates email successfully', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await page.goto('/settings')

  await page.fill('input#email', `new-${creds.email}`)
  await page.click('button:has-text("Update Email")')

  // Supabase mock might return success
  await expect(page.locator('text=Check your new email address to confirm the change')).toBeVisible()
})

test('settings updates password successfully and clears fields', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await page.goto('/settings')

  await page.fill('input#newPassword', 'newpassword123')
  await page.fill('input#confirmPassword', 'newpassword123')
  await page.click('button:has-text("Update Password")')

  await expect(page.locator('text=Password updated successfully!')).toBeVisible()

  // Check if fields are cleared
  await expect(page.locator('input#newPassword')).toHaveValue('')
  await expect(page.locator('input#confirmPassword')).toHaveValue('')
})

test('settings displays danger zone and requires explicit confirmation for deletion', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await page.goto('/settings')

  await expect(page.locator('text=Danger Zone')).toBeVisible()
  await page.click('button:has-text("Delete Account")')

  await expect(page.locator('text=Are you sure you want to permanently delete your account?')).toBeVisible()

  // Cancel leaves it unchanged
  await page.click('button:has-text("Cancel")')
  await expect(page.locator('text=Are you sure you want to permanently delete your account?')).not.toBeVisible()
})

test('failed deletion does not falsely show success', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  // Mock the edge function to fail
  await page.route('**/functions/v1/delete-account', route => {
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Failed to delete account' })
    })
  })

  await page.goto('/settings')

  await page.click('button:has-text("Delete Account")')
  await page.click('button:has-text("Delete my account")')

  await expect(page.locator('text=Failed to delete account')).toBeVisible()
  await expect(page).toHaveURL(/.*\/settings/) // stays on settings
})

test('successful deletion produces logged-out state', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  // Mock the edge function to succeed
  await page.route('**/functions/v1/delete-account', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    })
  })

  await page.goto('/settings')

  await page.click('button:has-text("Delete Account")')
  await page.click('button:has-text("Delete my account")')

  await expect(page.locator('text=Account successfully deleted')).toBeVisible()
  await expect(page).toHaveURL(/.*\/login/)
})
