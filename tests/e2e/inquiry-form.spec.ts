import { test, expect } from '@playwright/test'

test.describe('Inquiry Form', () => {
  test('submits successfully with valid data', async ({ page }) => {
    await page.route('/api/inquiries', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    )

    await page.goto('/contact')

    await page.fill('[name="name"]', 'Carlos Mendez')
    await page.fill('[name="email"]', 'carlos@fabrica.mx')
    await page.fill('[name="company"]', 'Fabrica de Bolsas SA')
    await page.fill('[name="country"]', 'Mexico')
    await page.fill('[name="message"]', 'We are interested in 3 circular loom machines for our new factory.')

    await page.click('[type="submit"]')

    await expect(page.locator('[data-testid="form-success"]')).toBeVisible({ timeout: 10000 })
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', 'not-an-email')
    await page.fill('[name="company"]', 'Test Co')
    await page.fill('[name="country"]', 'USA')
    await page.fill('[name="message"]', 'Testing the form validation')

    await page.click('[type="submit"]')

    await expect(page.locator('[data-testid="form-error"]')).toBeVisible({ timeout: 5000 })
  })
})
