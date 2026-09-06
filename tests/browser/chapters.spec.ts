import { test, expect } from '@playwright/test'
import sharp from 'sharp'

for (const [route,profile] of [['/','home'],['/safety','safety'],['/legal/privacy','legal']]) {
test(`${profile} shows meaningful idle pixel motion and pause freezes the image`, async ({page}) => {
  test.setTimeout(90000)
    await page.goto(route)
    const world=page.locator('.mort-world')
    await expect(world).toHaveAttribute('data-scene-profile',profile)
    await expect(world).toHaveAttribute('data-frames',/\d+/,{timeout:30000})
    await page.waitForTimeout(1400)
    const clip={x:900,y:130,width:450,height:570}
    const a=await page.screenshot({clip,path:`qa-artifacts/idle-${profile}-a.png`})
    await page.waitForTimeout(3000)
    const b=await page.screenshot({clip,path:`qa-artifacts/idle-${profile}-b.png`})
    const pixelsA=await sharp(a).removeAlpha().raw().toBuffer()
    const pixelsB=await sharp(b).removeAlpha().raw().toBuffer()
    let changed=0
    for(let i=0;i<pixelsA.length;i+=3) if(Math.abs(pixelsA[i]-pixelsB[i])+Math.abs(pixelsA[i+1]-pixelsB[i+1])+Math.abs(pixelsA[i+2]-pixelsB[i+2])>20) changed++
    const fraction=changed/(pixelsA.length/3)
    console.log(`${profile}: ${(fraction*100).toFixed(2)}% materially changed idle pixels`)
    expect(fraction,`${profile} visible idle motion`).toBeGreaterThan(.012)
    await page.getByRole('button',{name:'Pause atmosphere',exact:true}).click()
    await page.waitForTimeout(500)
    const stillA=await page.screenshot({clip})
    await page.waitForTimeout(500)
    const stillB=await page.screenshot({clip})
    expect(stillA.equals(stillB)).toBe(true)
    await page.getByRole('button',{name:'Resume atmosphere',exact:true}).click()
})
}

test('Safety chapters, responsive composition and profile fallbacks retain readable content',async({page})=>{
  test.setTimeout(120000)
  await page.goto('/safety')
  await expect(page.getByRole('heading',{level:1})).toHaveText('MORT Safety')
  await expect(page.locator('.mort-world')).toHaveAttribute('data-frames',/\d+/)
  await page.getByRole('button',{name:'Pause atmosphere',exact:true}).click()
  for(const [width,height] of [[390,844],[430,932],[768,1024],[1024,768],[1366,768],[1440,900],[1920,1080],[2560,1080]]){
    await page.setViewportSize({width,height})
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),{message:`Safety overflow at ${width}px`}).toBe(true)
    await page.screenshot({path:`qa-artifacts/safety-${width}.png`})
  }
  await page.setViewportSize({width:1440,height:900})
  await page.getByRole('link',{name:'05 Know the limitations'}).click()
  await expect(page).toHaveURL(/#limits$/)
  await expect(page.getByRole('heading',{name:'Safeguards. Not guarantees.'})).toBeInViewport()
  await page.screenshot({path:'qa-artifacts/safety-limits.png'})
  await page.emulateMedia({reducedMotion:'reduce'})
  for(const [route,profile] of [['/','home'],['/safety','safety'],['/legal/privacy','legal'],['/login','auth']]){
    await page.goto(route)
    await expect(page.locator('.mort-world')).toHaveAttribute('data-scene-profile',profile)
    await expect(page.locator('.mort-world')).toHaveAttribute('data-scene-status','reduced')
    await expect(page.locator('.mort-world canvas')).toHaveCount(0)
    await page.screenshot({path:`qa-artifacts/fallback-${profile}.png`})
  }
  await page.goto('/privacy');await expect(page).toHaveURL(/\/legal\/privacy$/)
  await page.goto('/terms');await expect(page).toHaveURL(/\/legal\/terms$/)
})
