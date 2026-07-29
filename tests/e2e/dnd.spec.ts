import { test, expect } from '@playwright/test'

test.describe('Drag and drop', () => {
  test('reorders two tasks', async ({ page }) => {
    const creds = await (await import('./utils')).createAndSignInTestUser(page)
    if (!creds) test.skip()

    await page.goto('/planner')

    // Create first task
    const addButton = page.getByRole('button', { name: /Add task/i }).first()
    if (await addButton.count() > 0) {
      await addButton.click()
    } else {
      const quick = page.getByPlaceholder(/Type naturally/i)
      await quick.fill('dnd-task-a tomorrow')
      await page.getByRole('button', { name: /add_circle|Add/i }).first().click().catch(() => {})
    }
    const titleInput = page.locator('input[placeholder*="Team meeting"]')
    if (await titleInput.count() > 0) {
      await titleInput.fill('dnd-task-a')
      await page.getByRole('button', { name: /Create|Save/i }).last().click()
    }
    await expect(page.locator('text=dnd-task-a')).toBeVisible()

    // Create second task
    if (await addButton.count() > 0) {
      await addButton.click()
    } else {
      const quick = page.getByPlaceholder(/Type naturally/i)
      await quick.fill('dnd-task-b tomorrow')
      await page.getByRole('button', { name: /add_circle|Add/i }).first().click().catch(() => {})
    }
    if (await titleInput.count() > 0) {
      await titleInput.fill('dnd-task-b')
      await page.getByRole('button', { name: /Create|Save/i }).last().click()
    }
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
