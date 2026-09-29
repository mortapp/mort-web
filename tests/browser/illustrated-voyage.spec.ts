import { test, expect } from '@playwright/test'
import sharp from 'sharp'

test('home presents a visibly warm illustrated twilight behind the moving voyage', async ({ page }) => {
  test.setTimeout(120000)
  await page.goto('/')
  await expect(page.locator('.mort-world')).toHaveAttribute('data-scene-profile', 'home')
  await expect(page.locator('.mort-world')).toHaveAttribute('data-webgl-ready', 'true', { timeout: 60000 })
  await expect(page.locator('.mort-world')).toHaveAttribute('data-frames', /\d+/, { timeout: 60000 })
  await page.waitForTimeout(1800)
  const clip = { x: 795, y: 95, width: 500, height: 310 }
  const image = await page.screenshot({ clip })
  const { data, info } = await sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  let warm = 0
  for (let i = 0; i < data.length; i += info.channels) {
    const [red, green, blue] = [data[i], data[i + 1], data[i + 2]]
    if (red > 75 && red > green * 1.12 && red > blue * 1.12) warm++
  }
  const fraction = warm / (info.width * info.height)
  console.log(`warm illustrated pixels: ${(fraction * 100).toFixed(2)}%`)
  expect(fraction).toBeGreaterThan(.08)
})
