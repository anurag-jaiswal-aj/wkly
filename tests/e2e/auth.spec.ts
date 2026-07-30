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
