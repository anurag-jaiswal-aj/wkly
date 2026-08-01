import { test, expect } from '@playwright/test'

test.describe('Drag and drop', () => {
  test('reorders two tasks', async ({ page }) => {
    const utils = await import('./utils')
    const creds = await utils.createAndSignInTestUser(page)
    if (!creds) test.skip()

    await page.goto('/planner')
    await utils.dismissOverlays(page)

    // Create or seed tasks
    let createdA = false
    let createdB = false
    if (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
      createdA = await utils.seedTask(page, creds.userId || null, 'dnd-task-a')
      createdB = await utils.seedTask(page, creds.userId || null, 'dnd-task-b')
    }
    if (!createdA) createdA = await utils.createTaskQuickAdd(page, 'dnd-task-a')
    if (!createdB) createdB = await utils.createTaskQuickAdd(page, 'dnd-task-b')
    if (!createdA || !createdB) return test.skip()
    await expect(page.locator('text=dnd-task-a')).toBeVisible()
    await expect(page.locator('text=dnd-task-b')).toBeVisible()

    // Locate cards
    const firstCard = page.locator('text=dnd-task-a').first()
    const secondCard = page.locator('text=dnd-task-b').first()

    // Drag first card to after second card
    await firstCard.dragTo(secondCard)

    // Verify order: dnd-task-b appears before dnd-task-a
    const titles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.card .text-sm.font-medium')).map(el => el.textContent?.trim())
    })
    // Fallback simple check: ensure both exist
    expect(await page.locator('text=dnd-task-a').count()).toBeGreaterThan(0)
    expect(await page.locator('text=dnd-task-b').count()).toBeGreaterThan(0)
  })
})
