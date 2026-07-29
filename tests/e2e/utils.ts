import fetch from 'node-fetch'
import { Page } from '@playwright/test'

export async function createAndSignInTestUser(page: Page) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return null

  const email = `e2e+${Date.now()}@example.com`
  const password = 'Test1234!'

  // Sanitize keys (remove quotes/newlines) to avoid invalid header values
  const cleanAnon = String(anonKey).trim().replace(/^"|"$/g, '').split(/\s+/)[0]
  const cleanUrl = String(supabaseUrl).trim()

  // Create user via Supabase Auth REST
  await fetch(`${cleanUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cleanAnon,
    },
    body: JSON.stringify({ email, password }),
  })

  // Sign in via UI
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /Sign in/i }).click()

  return { email, password }
}

export async function createTaskQuickAdd(page: Page, text: string) {
  // Wait for quick add input to appear
  const quick = await page.waitForSelector('input[placeholder*="Type naturally"]', { timeout: 5000 }).catch(() => null)
  if (quick) {
    await page.getByPlaceholder(/Type naturally/i).fill(text)
    // Try clicking quick add button
    const addBtn = page.getByRole('button', { name: /add_circle|Add/i }).first()
    await addBtn.click().catch(() => {})
    return true
  }

  // Fallback: try to click a day "Add task" button
  const addButton = page.getByRole('button', { name: /Add task/i }).first()
  if ((await addButton.count()) > 0) {
    await addButton.click()
    const titleInput = await page.waitForSelector('input[placeholder*="Team meeting"]', { timeout: 5000 }).catch(() => null)
    if (titleInput) {
      await titleInput.fill(text)
      await page.getByRole('button', { name: /Create|Save/i }).last().click().catch(() => {})
      return true
    }
  }

  return false
}
