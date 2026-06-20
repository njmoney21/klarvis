import { chromium } from 'playwright'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dir, '..', 'public', 'screenshots')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })

const filePath = 'file:///C:/Users/nikol/Desktop/banicki-site/index.html'
console.log(`Screenshotting ${filePath} …`)
await page.goto(filePath, { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(1500)
await page.screenshot({
  path: join(outDir, 'banicki.jpg'),
  type: 'jpeg',
  quality: 85,
  clip: { x: 0, y: 0, width: 1280, height: 800 },
})
console.log('✓ saved banicki.jpg')
await browser.close()
