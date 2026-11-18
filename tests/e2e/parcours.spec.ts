import { expect, test, type Page } from '@playwright/test'

/* Joue tout le parcours de Gaillon : splash, histoire, profil, 8 étapes, fin, certificat, carnet. */
async function resoudre(page: Page, i: number) {
  const p = await page.evaluate(() => fetch('sites/gaillon/parcours.json').then((r) => r.json()))
  const e = p.etapes[i]
  const qs = page.locator('#etape .bd-question')
  for (let k = 0; k < (await qs.count()); k++) await qs.nth(k).locator('.bd-choix').nth(e.questions[k].bonne).click()
  await page.click('#go-page')
  await page.click('#go-jeu')
  const j = e.jeu
  if (j.t === 'mot') {
    const donne = new Set<number>(j.donne)
    for (let n = 0; n < j.mot.length; n++) {
      if (donne.has(n)) continue
      await page.locator('#jeu-zone .clavier button[data-i]:not(.used)', { hasText: new RegExp('^' + j.mot[n] + '$') }).first().click()
    }
  } else if (j.t === 'code') {
    for (const c of j.code) await page.click(`.pave button[data-k="${c}"]`)
    await page.click('.pave button[data-k="OK"]')
  } else if (j.t === 'photo') await page.click('#pclic')
  else if (j.t === 'cherche') {
    const b = (await page.locator('.cherche').boundingBox())!
    for (const [x, y] of Object.values(j.cibles) as [number, number][]) await page.mouse.click(b.x + x * b.width, b.y + y * b.height)
  } else if (j.t === 'relie') {
    for (const [n, m] of j.paires) {
      await page.locator('.nom', { hasText: n }).click()
      await page.locator('.met', { hasText: m }).click()
    }
  } else if (j.t === 'puzzle') {
    for (let t = 0; t < 9; t++) {
      const v = await page.locator('.puzzle button').evaluateAll((b) => b.map((x) => Number((x as HTMLElement).dataset.v)))
      const k = v.indexOf(t)
      if (k !== t) {
        await page.locator('.puzzle button').nth(t).click()
        await page.locator('.puzzle button').nth(k).click()
      }
    }
  }
  await expect(page.locator('#tampon')).toBeVisible({ timeout: 5000 })
}

test('parcours complet de Gaillon', async ({ page }) => {
  await page.goto('./')
  await page.click('#explorer', { force: true })
  await page.click('#passer')
  await page.click('#go-start')
  await page.fill('#pn', 'Jules')
  await page.click('#go-profil')
  await page.locator('.pin[data-lieu="gaillon"]').click()
  await page.click('#lancer')
  for (let i = 0; i < 8; i++) {
    await page.click('#go-scan')
    await page.click('#simu')
    await expect(page.locator('#etape')).toBeVisible()
    await resoudre(page, i)
    await expect(page.locator('.mot-secret span.ok')).toHaveCount(i + 1)
    await page.click('#suivante')
  }
  await expect(page.locator('#conclusion')).toBeVisible()
  await page.getByRole('button', { name: 'Mon certificat' }).click()
  await expect(page.locator('#certificat')).toContainText('Jules')
  await page.getByRole('button', { name: 'Voir mon carnet' }).click()
  await expect(page.locator('.pg-mini:not(.vide)')).toHaveCount(8)
})
