import { test, expect } from '@playwright/test'
import { createAndSignInTestUser } from './utils'

test('signs up and signs in with temporary credentials', async ({ page }) => {
  const creds = await createAndSignInTestUser(page)
  if (!creds) test.skip()

  await expect(page.locator(`text=${creds.email}`)).toBeVisible({ timeout: 7000 })
})
