import fetch from 'node-fetch'
import { Page } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

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
  const resp = await fetch(`${cleanUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cleanAnon,
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await resp.json().catch(() => null)

  // If a service role key is provided, try admin signup + seed data for deterministic tests
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  if (serviceRole) {
    try {
      const svc = String(serviceRole).trim().replace(/^"|"$/g, '')
      // Admin sign up (creates user immediately)
      const adminResp = await fetch(`${cleanUrl}/auth/v1/admin/sign_up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: svc,
          Authorization: `Bearer ${svc}`
        },
        body: JSON.stringify({ email, password }),
      }).catch(() => null)

      const adminData = adminResp ? await adminResp.json().catch(() => null) : null
      const userObj = adminData && adminData.user ? adminData.user : (data && data.user ? data.user : null)

      // Exchange for token using password grant to get access_token for client session
      let tokenData = null
      try {
        const tokenResp = await fetch(`${cleanUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: cleanAnon },
          body: JSON.stringify({ email, password }),
        })
        tokenData = await tokenResp.json().catch(() => null)
      } catch (e) { tokenData = null }

      // If we have a user id and a service role, try to seed a task row using common owner column names
      if (userObj && svc) {
        const seedBodies = [
          { title: 'E2E seeded task', owner: userObj.id },
          { title: 'E2E seeded task', user_id: userObj.id },
          { title: 'E2E seeded task', created_by: userObj.id },
        ]
        for (const body of seedBodies) {
          try {
            await fetch(`${cleanUrl}/rest/v1/tasks`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: svc,
                Authorization: `Bearer ${svc}`,
                Prefer: 'return=representation'
              },
              body: JSON.stringify(body),
            }).catch(() => null)
          } catch (e) {}
        }
      }

      // If tokenData returned an access token, use it to set localStorage below via tokenData
      if (tokenData && tokenData.access_token) {
        // attach tokenData to data for downstream flow
        Object.assign(data || {}, tokenData)
      }
    } catch (e) {
      // proceed with existing flow on any admin errors
    }
  }

  // Try exchanging credentials for a token (password grant) — more reliable
  let tokenData = data
  try {
    const tokenResp = await fetch(`${cleanUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cleanAnon },
      body: JSON.stringify({ email, password }),
    })
    const tokenJson = await tokenResp.json().catch(() => null)
    if (tokenJson && tokenJson.access_token) tokenData = tokenJson
  } catch (e) {}

  // If we have a token and user, set localStorage directly
  if (tokenData && tokenData.access_token) {
    // If user not present in tokenData, try to fetch user info from /user endpoint
    if (!tokenData.user) {
      try {
        const userResp = await fetch(`${cleanUrl}/auth/v1/user`, {
          method: 'GET',
          headers: { apikey: cleanAnon, Authorization: `Bearer ${tokenData.access_token}` },
        })
        const userJson = await userResp.json().catch(() => null)
        if (userJson) tokenData.user = userJson
      } catch {}
    }
  }

  if (tokenData && tokenData.access_token && tokenData.user) {
    // Build a token object compatible with supabase-js localStorage shape
    const tokenObj = {
      currentSession: {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in || 3600,
        expires_at: Math.floor(Date.now() / 1000) + (tokenData.expires_in || 3600),
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'bearer'
      },
      currentUser: tokenData.user
    }

    await page.goto('/login')
    await page.evaluate(({ key, value }) => {
      try { localStorage.setItem(key, value) } catch (e) {}
    }, { key: 'supabase.auth.token', value: JSON.stringify(tokenObj) })
    // Also set legacy key just in case
    await page.evaluate(({ key, value }) => {
      try { localStorage.setItem(key, value) } catch (e) {}
    }, { key: 'sb:token', value: JSON.stringify(tokenObj) })
    // Reload so the app picks up the session from localStorage
    await page.reload()
    // Dump the stored session to an artifact for debugging
    try {
      const stored = await page.evaluate(() => {
        try { return localStorage.getItem('supabase.auth.token') || localStorage.getItem('sb:token') || null } catch (e) { return null }
      })
      try {
        const dir = path.join(process.cwd(), 'tests', 'e2e', 'artifacts')
        await fs.mkdir(dir, { recursive: true })
        await fs.writeFile(path.join(dir, `session-${Date.now()}.json`), String(stored || 'null'))
      } catch (e) {}
      console.debug('[E2E] stored session=', stored)
    } catch (e) {}
    const userId = tokenData.user?.id || data?.user?.id || null
    return { email, password, userId }
  }

  // Fallback: Sign in via UI if REST flow didn't return a token
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /Sign in/i }).click()

  // No reliable userId available in UI fallback
  return { email, password, userId: null }
}

export async function seedTask(page: Page, userId: string | null, title = 'E2E seeded task') {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRole) return false
  const cleanUrl = String(supabaseUrl).trim()
  const svc = String(serviceRole).trim().replace(/^"|"$/g, '')
  // Try several common owner column names
  const bodies = []
  if (userId) bodies.push({ title, user_id: userId }, { title, owner: userId }, { title, created_by: userId })
  else bodies.push({ title })

  for (const body of bodies) {
    try {
      const resp = await fetch(`${cleanUrl}/rest/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: svc,
          Authorization: `Bearer ${svc}`,
          Prefer: 'return=representation'
        },
        body: JSON.stringify(body),
      })
      if (resp && (resp.status === 201 || resp.status === 200)) return true
    } catch (e) {}
  }
  return false
}

export async function createTaskQuickAdd(page: Page, text: string) {
  // Ensure planner is ready
  // Ensure we have a desktop-sized viewport so header quick-add is visible
  try { await page.setViewportSize({ width: 1400, height: 900 }) } catch {}
  // Wait for the main content element; use aria-label rather than visible text
  await page.waitForSelector('main[aria-label="Task planner"]', { timeout: 7000 }).catch(() => null)

  // Try multiple quick-add input variants
  const quickSelector = 'input[placeholder*="Type naturally"], input[placeholder*="Quick add"], input[placeholder*="Add a task"], input[aria-label="Quick add"], input[placeholder*="What\'s up"]'
  // First try the quick-add container used in the Planner header
  const headerQuick = await page.waitForSelector('[data-tour="quick-add"] input', { timeout: 1000 }).catch(() => null)
  const quick = headerQuick || await page.waitForSelector(quickSelector, { timeout: 3000 }).catch(() => null)
  console.debug('[E2E] createTaskQuickAdd: quick selector match=', !!quick)
  if (quick) {
    try {
      await quick.fill(text)
      // Try several ways to submit the quick add: Enter, click nearby add buttons, or press Enter twice
      await quick.press('Enter').catch(() => {})
      await page.waitForTimeout(200)
      await quick.press('Enter').catch(() => {})
      // Try clicking the form submit button near the quick input
      try {
        const submitBtn = await page.$('button[type="submit"]')
        console.debug('[E2E] createTaskQuickAdd: found submit button=', !!submitBtn)
        if (submitBtn) await submitBtn.click().catch(() => {})
      } catch {}
      // Try clicking the material icon add button if present
      try {
        const iconBtn = await page.$('button:has-text("add_circle")')
        console.debug('[E2E] createTaskQuickAdd: found icon add button=', !!iconBtn)
        if (iconBtn) await iconBtn.click().catch(() => {})
      } catch {}
      // Wait briefly for task to appear
      await page.waitForSelector(`text=${text}`, { timeout: 5000 }).catch(() => null)
      return true
    } catch {
      // continue to fallback
    }
  }

  // Fallback: try to click a visible "Add task" button and use modal inputs
  const addButton = page.getByRole('button', { name: /Add task|Add Task/i }).first()
  console.debug('[E2E] createTaskQuickAdd: addButton count=', await addButton.count())
  if ((await addButton.count()) > 0) {
    try {
      await addButton.click()
      const titleInput = await page.waitForSelector('input[placeholder*="Title"], input[placeholder*="Team meeting"], input[placeholder*="Task title"]', { timeout: 5000 }).catch(() => null)
      if (titleInput) {
        await titleInput.fill(text)
        await page.getByRole('button', { name: /Create|Save|Add/i }).last().click().catch(() => {})
        await page.waitForSelector(`text=${text}`, { timeout: 5000 }).catch(() => null)
        return true
      }
    } catch {
      // ignore and return false
    }
  }

  // Try keyboard shortcut to open the Add Task modal (Ctrl/Cmd+N)
  try {
    await page.keyboard.press('Control+N').catch(() => {})
    await page.keyboard.press('Meta+N').catch(() => {})
    const modalInput = await page.waitForSelector('input[placeholder*="Team meeting"], input[placeholder*="Title"], input[placeholder*="Task title"]', { timeout: 2000 }).catch(() => null)
    if (modalInput) {
      await modalInput.fill(text).catch(() => {})
      await page.getByRole('button', { name: /Create|Save|Add/i }).last().click().catch(() => {})
      await page.waitForSelector(`text=${text}`, { timeout: 5000 }).catch(() => null)
      return true
    }
  } catch {}

  // Final fallback: try any global Add buttons (floating action buttons, icons)
  const globalAdd = await page.$('button[aria-label*="add"], button[title*="Add"], button:has-text("+")')
  console.debug('[E2E] createTaskQuickAdd: globalAdd found=', !!globalAdd)
  if (globalAdd) {
    try {
      await globalAdd.click()
      await page.waitForTimeout(200)
      const anyInput = await page.$('input')
      if (anyInput) {
        try { await anyInput.fill(text) } catch {}
        await page.keyboard.press('Enter').catch(() => {})
        await page.waitForSelector(`text=${text}`, { timeout: 5000 }).catch(() => null)
        return true
      }
    } catch {}
  }

  // Capture debug artifacts to help diagnose why QuickAdd wasn't found
  try {
    await captureDebug(page, 'createTaskQuickAdd-failed')
  } catch (e) {}
  return false
}

export async function captureDebug(page: Page, name = 'debug') {
  try {
    const dir = path.join(process.cwd(), 'tests', 'e2e', 'artifacts')
    await fs.mkdir(dir, { recursive: true })
    const ts = Date.now()
    const screenshotPath = path.join(dir, `${name}-${ts}.png`)
    const htmlPath = path.join(dir, `${name}-${ts}.html`)
    try { await page.screenshot({ path: screenshotPath, fullPage: true }) } catch (e) {}
    try { const html = await page.content(); await fs.writeFile(htmlPath, html) } catch (e) {}
    // Also dump console logs if available
    return { screenshotPath, htmlPath }
  } catch (e) {
    return null
  }
}

export async function dismissOverlays(page: Page) {
  // Common overlay selectors/buttons to close tours, modals, or notifications
  const closeSelectors = [
    'button:has-text("Skip tour")',
    'button:has-text("Dismiss")',
    'button:has-text("Close")',
    'button:has-text("Got it")',
    'button[aria-label="Close dialog"]',
    '.tour-close',
  ]

  for (const sel of closeSelectors) {
    const el = await page.$(sel)
    if (el) {
      try { await el.click() } catch {}
    }
  }

  // Dismiss any notifications 'Dismiss notification' button
  const notif = await page.$('button:has-text("Dismiss notification")')
  if (notif) try { await notif.click() } catch {}
}
