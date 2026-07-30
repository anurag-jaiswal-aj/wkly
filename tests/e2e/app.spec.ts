import { test, expect } from '@playwright/test'

// Skip tests by default unless RUN_E2E is explicitly set in the environment.
test.skip(!process.env.RUN_E2E, 'RUN_E2E environment variable not set')

test.describe('App smoke tests', () => {
  test('loads planner and opens TagPicker', async ({ page }) => {
    const utils = await import('./utils')
    const creds = await utils.createAndSignInTestUser(page)
    if (!creds) test.skip()
    await page.goto('/planner')
    await expect(page).toHaveTitle(/Wkly/)

    // Ensure planner is ready and create a task if none exist, then open it
    await utils.dismissOverlays(page)
    let created = false
    // Prefer seeding when service role key is available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
      created = await utils.seedTask(page, creds.userId || null, 'e2e-smoke-task')
    }
    if (!created) created = await utils.createTaskQuickAdd(page, 'e2e-smoke-task')
    if (!created) return test.skip()

    const taskCard = page.locator('text=e2e-smoke-task').first()
    await expect(taskCard).toBeVisible({ timeout: 7000 })
    await taskCard.click()

    const addTag = page.locator('text=Add tag').first()
    await expect(addTag).toBeVisible({ timeout: 5000 })
    await addTag.click()
    await expect(page.locator('text=Create New Tag')).toBeVisible()
  })

  test('create task and add tag', async ({ page }) => {
    const utils = await import('./utils')
    const creds = await utils.createAndSignInTestUser(page)
    if (!creds) test.skip()

    await page.goto('/planner')

    // Create task using helper
    await utils.dismissOverlays(page)
    let created = false
    if (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
      created = await utils.seedTask(page, creds.userId || null, 'E2E test task')
    }
    if (!created) created = await utils.createTaskQuickAdd(page, 'E2E test task')
    if (!created) return test.skip()

    // Wait for creation notification
    await expect(page.locator('text=Task created')).toBeVisible({ timeout: 5000 })

    // Find the task card and open it
    const taskCard = page.locator('text=E2E test task').first()
    await expect(taskCard).toBeVisible()
    await taskCard.click()

    // Open TagPicker and create a new tag
    await page.locator('button:has-text("Add tag")').click()
    await page.locator('button:has-text("Create new tag")').click()
    const tagNameInput = page.locator('input[placeholder="Tag name"]')
    await tagNameInput.fill('e2e-temp')
    await page.locator('button:has-text("Create")').click()

    // Save task
    await page.locator('button:has-text("Save")').click()
    await expect(page.locator('text=Task updated successfully')).toBeVisible({ timeout: 5000 })

    // Verify tag appears on task card in planner
    await expect(page.locator('text=e2e-temp')).toBeVisible()
  })
})

