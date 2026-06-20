import { chromium } from 'playwright'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dir, '..', 'public', 'screenshots')

const sites = [
  { file: 'dreamresidencelux.jpg', url: 'file:///C:/Users/nikol/Desktop/dreamresidencelux/index.html' },
  { file: 'gasthaus_lippnwirt.jpg', url: 'file:///C:/Users/nikol/Desktop/gasthaus_lippnwirt/index.html' },
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })

for (const site of sites) {
  console.log(`Screenshotting ${site.url} …`)
  await page.goto(site.url, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1500)
  await page.screenshot({
    path: join(outDir, site.file),
    type: 'jpeg',
    quality: 85,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  })
  console.log(`  ✓ saved ${site.file}`)
}

await browser.close()
