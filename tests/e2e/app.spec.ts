import { test, expect } from '@playwright/test'

// Skip tests by default unless RUN_E2E is explicitly set in the environment.
test.skip(!process.env.RUN_E2E, 'RUN_E2E environment variable not set')

test.describe('App smoke tests', () => {
  test('loads planner and opens TagPicker', async ({ page }) => {
    const creds = await (await import('./utils')).createAndSignInTestUser(page)
    if (!creds) test.skip()

    await page.goto('/planner')
    await expect(page).toHaveTitle(/Wkly/)

    const addTag = page.locator('text=Add tag')
    await expect(addTag).toBeVisible()
    await addTag.click()
    await expect(page.locator('text=Create New Tag')).toBeVisible()
  })

  test('create task and add tag', async ({ page }) => {
    const creds = await (await import('./utils')).createAndSignInTestUser(page)
    if (!creds) test.skip()

    await page.goto('/planner')

    // Create task using helper
    await (await import('./utils')).dismissOverlays(page)
    const created = await (await import('./utils')).createTaskQuickAdd(page, 'E2E test task')
    if (!created) throw new Error('Failed to create task via QuickAdd or Add Task modal')

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

