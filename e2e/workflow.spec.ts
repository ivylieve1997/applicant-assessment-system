import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
test('manual import, bulk screenshot review, persistence, and real PDF downloads',async({page})=>{
 const source=await PDFDocument.create();source.addPage();const bytes=Buffer.from(await source.save());
 await page.route('**/api/extract',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'AI extraction is not configured. Use manual entry.'})}));
 await page.goto('/');await expect(page.getByRole('heading',{name:'Assessment overview'})).toBeVisible();await page.screenshot({path:'/tmp/applicant-atlas-dashboard.png',fullPage:true});
 await page.locator('input[type=file][accept="application/pdf"]').setInputFiles({name:'screening.pdf',mimeType:'application/pdf',buffer:bytes});
 const modal=page.getByRole('dialog');await expect(modal.getByText('AI extraction is not configured.',{exact:false})).toBeVisible();
 await modal.getByLabel('name',{exact:true}).fill('Alex Chen');await modal.getByLabel('score',{exact:true}).fill('087 / 100');await modal.getByLabel('rank',{exact:true}).fill('#02 (tie)');await modal.getByLabel('assessment',{exact:true}).fill('Original assessment unchanged.');await modal.getByLabel('Exact source quote').fill('Alex Chen — 087 / 100');
 await modal.getByRole('button',{name:'Add to review'}).click();await modal.getByRole('checkbox').check();await modal.getByRole('button',{name:'Confirm import',exact:false}).click();
 await expect(page.getByRole('cell',{name:'087 / 100',exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'#02 (tie)',exact:true})).toBeVisible();
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=','base64');
 await page.locator('input[type=file][multiple]').setInputFiles([{name:'alex.png',mimeType:'image/png',buffer:png},{name:'unknown.png',mimeType:'image/png',buffer:png}]);
 await expect(page.getByRole('heading',{name:'Review personality matches'})).toBeVisible();await expect(page.locator('.match-card')).toHaveCount(2);
 const card=page.locator('.match-card').first();await card.getByRole('button',{name:'Confirm applicant & result'}).click();await expect(page.getByRole('status').filter({hasText:'Select an applicant'})).toBeVisible();await card.getByLabel('Personality type').selectOption('INTJ');await card.getByLabel('Variant').selectOption('A');await card.getByLabel('Match to applicant').selectOption({label:'Alex Chen · Rank #02 (tie)'});await card.getByRole('button',{name:'Confirm applicant & result'}).click();await expect(card.getByRole('button',{name:'Confirmed · click to reopen'})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Reports',exact:true}).click();await expect(page.getByText('INTJ-A',{exact:true})).toBeVisible();
 for(const button of [page.getByRole('button',{name:'Consolidated PDF'}),page.getByRole('button',{name:'Download report for Alex Chen'})]){const event=page.waitForEvent('download');await button.click();const download=await event;const path=await download.path();expect(path).toBeTruthy();const pdf=await PDFDocument.load(await readFile(path!));expect(pdf.getPageCount()).toBe(2);}
 await page.getByRole('button',{name:'Storage & privacy',exact:true}).click();await expect(page.getByRole('dialog').getByText('Individual PDFs include the complete screening source',{exact:false})).toBeVisible();
});
test('dashboard remains usable on mobile',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.getByRole('heading',{name:'Assessment overview'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);});
