import { test, expect } from '@playwright/test'

// Skip tests by default unless RUN_E2E is explicitly set in the environment.
test.skip(!process.env.RUN_E2E, 'RUN_E2E environment variable not set')

test.describe('App smoke tests', () => {
  test('loads planner and opens TagPicker', async ({ page }) => {
    await page.goto('/planner')
    await expect(page).toHaveTitle(/Wkly/)

    const addTag = page.locator('text=Add tag')
    await expect(addTag).toBeVisible()
    await addTag.click()
    await expect(page.locator('text=Create New Tag')).toBeVisible()
  })
})
