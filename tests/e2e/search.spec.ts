import { test, expect } from '@playwright/test'
import * as utils from './utils'

// Skip tests by default unless RUN_E2E is explicitly set in the environment.
test.skip(!process.env.RUN_E2E, 'RUN_E2E environment variable not set')

test.describe('Search functionality', () => {
  test('search term filters tasks', async ({ page }) => {
    const creds = await utils.createAndSignInTestUser(page)
    if (!creds) test.skip()

    await page.goto('/planner')
    await utils.dismissOverlays(page)

    // Create a unique task for searching
    const uniqueTitle = `SearchableTask-${Date.now()}`
    let created = false
    if (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
      created = await utils.seedTask(page, creds.userId || null, uniqueTitle)
    }
    if (!created) created = await utils.createTaskQuickAdd(page, uniqueTitle)
    if (!created) return test.skip()

    // Wait for task to be visible
    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible({ timeout: 5000 })

    // Open search (assuming ctrl+k or clicking search input)
    // There should be a search input in the planner
    const searchInput = page.getByPlaceholder(/Search tasks/i)
    await expect(searchInput).toBeVisible()

    // Type the unique title
    await searchInput.fill(uniqueTitle)

    // Verify task is still visible
    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible()

    // Type a non-matching query
    await searchInput.fill('NonExistentTaskXYZ')

    // Verify task is hidden
    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeHidden()

    // Clear search
    await searchInput.fill('')

    // Verify task returns
    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible()
  })
})
