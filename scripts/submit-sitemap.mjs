import { chromium } from '@playwright/test'

const SITEMAP_URL = 'https://www.reylong.com/sitemap.xml'
const GSC_URL = 'https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fwww.reylong.com%2F'
const GOOGLE_EMAIL = 'william19840805@gmail.com'

const browser = await chromium.launch({ headless: false, slowMo: 150 })
const page = await (await browser.newContext()).newPage()

console.log('')
console.log('================================================')
console.log('  ⚠️  請切換到剛開啟的瀏覽器視窗並輸入密碼  ⚠️')
console.log('================================================')
console.log('')

await page.goto('https://accounts.google.com/signin', { waitUntil: 'domcontentloaded', timeout: 30000 })

// 預填 email
try {
  const emailInput = page.locator('input[type="email"]')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await emailInput.fill(GOOGLE_EMAIL)
  await page.keyboard.press('Enter')
  console.log(`已預填 email: ${GOOGLE_EMAIL}`)
  console.log('請在瀏覽器中輸入密碼完成登入，等待最多 5 分鐘…')
} catch {
  console.log('請在瀏覽器中手動輸入 Google 帳號與密碼，等待最多 5 分鐘…')
}

// 等待登入成功（hostname 變成 myaccount.google.com 或 search.google.com）
await page.waitForURL(
  url => ['myaccount.google.com', 'search.google.com'].includes(url.hostname),
  { timeout: 300000 }
)
console.log('✅ 登入成功！正在前往 Search Console…')

// 導向 GSC Sitemaps
await page.goto(GSC_URL, { waitUntil: 'networkidle', timeout: 30000 })
await page.screenshot({ path: 'scripts/gsc-sitemaps.png' })
console.log('截圖已儲存 scripts/gsc-sitemaps.png')

// 填入並提交 sitemap
try {
  const input = page.locator([
    'input[placeholder*="sitemap" i]',
    '[role="textbox"]',
    'input[type="text"]:visible'
  ].join(', ')).first()

  await input.waitFor({ state: 'visible', timeout: 15000 })
  await input.click()
  await page.keyboard.selectAll()
  await input.fill(SITEMAP_URL)
  console.log('已填入:', SITEMAP_URL)

  const btn = page.locator([
    'button:has-text("Submit")',
    'button:has-text("提交")',
    '[aria-label*="Submit" i]'
  ].join(', ')).first()
  await btn.click()
  console.log('✅ 已點擊提交！')

  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'scripts/gsc-submitted.png' })
  console.log('✅ 完成！截圖儲存至 scripts/gsc-submitted.png')
} catch {
  console.log('⚠️  請在瀏覽器中手動輸入並提交:')
  console.log('   Sitemap URL:', SITEMAP_URL)
  await page.waitForTimeout(120000).catch(() => {})
}

await browser.close()
