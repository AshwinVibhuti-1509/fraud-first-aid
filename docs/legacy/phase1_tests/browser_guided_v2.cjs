// Optional real-browser acceptance; install Playwright separately, start Flask, then run.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.FFA_TEST_URL||'http://127.0.0.1:5062';
 await page.goto(base);await page.waitForResponse(()=>false,{timeout:100}).catch(()=>{});
 await page.locator('#choose-image').click();await page.locator('#demo-proposals').click();
 assert.equal(await page.locator('input[type=file]').count(),0);
 await page.locator('#apply-demo').click();
 const answers=['IN','yes','yes','upi','no','no','no','no'];
 for(const answer of answers){await page.locator('#answer').selectOption(answer);await page.locator('#question-next').click();}
 await page.locator('#share-notes').check();await page.locator('#build-plan').click();
 await page.locator('#actions-screen').waitFor({state:'visible'});
 assert.equal(await page.locator('#action-list > li').count(),7);
 await page.locator('[data-action-id="A06"] input').check();
 await page.locator('#edit-plan').click();await page.locator('#review-edit').click();
 for(const answer of ['IN','yes','yes','upi','no','yes','no','no']){await page.locator('#answer').selectOption(answer);await page.locator('#question-next').click();}
 await page.locator('#build-plan').click();await page.locator('#actions-screen').waitFor({state:'visible'});
 assert.equal(await page.locator('#action-list > li').count(),8);
 assert.equal(await page.locator('[data-action-id="A06"] input').isChecked(),true);
 assert.equal(await page.locator('[data-action-id="A05"] input').isChecked(),false);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download-plan').click()]);
 const summary=fs.readFileSync(await download.path(),'utf8');assert.ok(summary.includes('4500.00'));assert.equal((summary.match(/\nDONE — /g)||[]).length,1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('#clear-session').click();assert.equal(await page.locator('#home').isVisible(),true);assert.equal(await page.locator('#notes').inputValue(),'');
 await page.locator('#choose-category').click();await page.locator('#category-next').click();
 await page.locator('#answer').selectOption('OTHER');assert.equal(await page.locator('#urgent-links').isVisible(),false);
 await page.setViewportSize({width:1366,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS: real Chromium mobile/desktop, demo 7→8, completion, export, reset, jurisdiction, no JS errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
