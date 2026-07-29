import fetch from 'node-fetch'
import { Page } from '@playwright/test'

export async function createAndSignInTestUser(page: Page) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return null

  const email = `e2e+${Date.now()}@example.com`
  const password = 'Test1234!'

  // Create user via Supabase Auth REST
  await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
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
