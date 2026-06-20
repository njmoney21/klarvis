import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const out = join(__dir, '..', 'public', 'screenshots')
mkdirSync(out, { recursive: true })

const sites = [
  { file: 'koliba.jpg',    url: 'https://koliba-sepia.vercel.app/' },
  { file: 'remcosmetics.jpg', url: 'https://remcosmetics.vercel.app/' },
  { file: 'runly.jpg',     url: 'https://runly-six.vercel.app/' },
  { file: 'lalocanda.jpg', url: 'https://lalocandadinino.de/' },
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })

for (const site of sites) {
  console.log(`Screenshotting ${site.url} …`)
  try {
    await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: join(out, site.file), type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 1280, height: 800 } })
    console.log(`  ✓ saved ${site.file}`)
  } catch (e) {
    console.error(`  ✗ failed: ${e.message}`)
  }
}

await browser.close()
console.log('Done.')
