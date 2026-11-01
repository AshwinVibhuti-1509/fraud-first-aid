"""Local browser acceptance test with real engine + stdlib HTTP adapter.
Not a substitute for Flask HTTP tests or real official-site connectivity.
Requires playwright and a system Chromium binary (or PLAYWRIGHT_CHROMIUM)."""
import io
import os
import json
import sys
import threading
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from engine import assess, summary, QUESTIONS, VERSION
from intake import interpret, KINDS
from evidence import modes
from playwright.sync_api import sync_playwright
from PIL import Image

def check():
    errors=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
        context=browser.new_context(accept_downloads=True,viewport={'width':1280,'height':800})
        page=context.new_page();page.on('pageerror',lambda e: errors.append(str(e)))
        def api(path, body):
            if path=='/api/questions':return {'questions':QUESTIONS,'version':VERSION}
            if path=='/api/intake/options':return {'categories':KINDS,'image':modes()}
            if path=='/api/intake/interpret':return interpret(body.get('description',''),body.get('category','unknown'))
            if path=='/api/assess':return assess(body)
            if path=='/api/summary':return {'plain':summary(assess(body))}
            return {'error':'Unsupported API'}
        page.expose_function('__testapi',api)
        def boot():
            page.set_content((ROOT/'static/guided.html').read_text(encoding='utf8'))
            page.add_style_tag(content=(ROOT/'static/guided.css').read_text(encoding='utf8'))
            page.evaluate("""window.fetch=async(url,opts={})=>{try{const r=await window.__testapi(String(url),opts.body?JSON.parse(opts.body):{});if(r.plain!==undefined)return new Response(r.plain,{status:200,headers:{'Content-Type':'text/plain; charset=utf-8'}});return new Response(JSON.stringify(r),{status:r.error?400:200,headers:{'Content-Type':'application/json'}});}catch(e){return new Response(JSON.stringify({error:String(e)}),{status:400,headers:{'Content-Type':'application/json'}});}}""")
            page.add_script_tag(content=(ROOT/'static/guided.js').read_text(encoding='utf8'))
            page.add_script_tag(content=(ROOT/'static/casework.js').read_text(encoding='utf8'))
            page.wait_for_function('Boolean(window.FFA_CASE_HUB)')
        boot()
        page.screenshot(path=str(ROOT.parent/'FFA_2_2_Home.png'),full_page=True)
        assert page.get_by_text('Already filed a complaint?').count()==1
        page.locator('#open-followup-home').click()
        assert page.locator('#workspace-screen').is_visible()
        assert page.get_by_text('My complaint status').is_visible()
        page.locator('#w-date').fill('2026-10-28');page.locator('#w-time').fill('14:10')
        page.locator('#w-tx-date').fill('2026-10-28');page.locator('#w-tx-amount').fill('4500')
        page.locator('#w-bank').fill('Example Bank');page.locator('#w-utr').fill('123456789012')
        page.locator('#w-portal-draft').fill('A fictional example showing a suspicious UPI payment. '+'A fictitious seller requested another payment without explaining the charges. '*3)
        page.locator('#cw-id-ready').check()
        assert '✓ Incident narrative' in page.locator('#cw-readiness').inner_text()
        assert '✓ Transaction reference' in page.locator('#cw-readiness').inner_text()
        page.locator('#w-ack-police').fill('FAKE-ACK-001')
        page.locator('#cw-portal-stage').select_option('acknowledged')
        page.locator('#cw-status-text').fill('Example acknowledgement appeared on the official site')
        page.locator('#cw-checked-at').fill('2026-10-29T12:30')
        page.locator('#cw-portal-issue').select_option('delay')
        assert 'not independently checked' in page.locator('#cw-trust-label').inner_text().lower()
        page.locator('#cw-add-update').click()
        assert page.locator('#cw-updates li').count()==1
        page.screenshot(path=str(ROOT.parent/'FFA_2_2_Status.png'),full_page=True)
        page.locator('#cw-step-note').fill('Checked online status. No reply yet.')
        page.locator('#cw-save-step-note').click()
        assert 'Checked online status' in page.locator('#cw-step-notes').inner_text()
        page.locator('#event-date').fill('2026-10-28');page.locator('#event-text').fill('Example financial incident reported to bank')
        page.locator('#add-event').click();assert page.locator('#timeline li').count()==1
        image=Image.new('RGB',(160,70),'white');bi=io.BytesIO();image.save(bi,format='PNG')
        page.locator('#cw-proof-file').set_input_files({'name':'fictional-receipt.png','mimeType':'image/png','buffer':bi.getvalue()})
        page.locator('#cw-add-proof').click()
        page.wait_for_function("document.querySelector('.cw-proof') || document.querySelector('#cw-proof-message').textContent.includes('could not')")
        assert page.locator('.cw-proof').count()==1
        assert 'Nothing was uploaded' in page.locator('#cw-proof-message').inner_text()
        page.locator('#cw-refresh-ready').click()
        assert '✓ Relevant screenshots' in page.locator('#cw-readiness').inner_text()
        assert page.locator('a[href="https://cybercrime.gov.in/webform/chkackstatus.aspx"]').count()==1
        assert page.locator('a[href*="suspect_search_repository"]').count()==1
        with page.expect_download() as wait:page.locator('#cw-export').click()
        dl=wait.value
        with tempfile.TemporaryDirectory() as temp:
            dest=Path(temp)/'case.json';dl.save_as(dest)
            d=json.loads(dest.read_text())
            assert d['schema']=='fraud-first-aid-local-case-1'
            assert d['workspace']['w-ack-police']=='FAKE-ACK-001'
            assert len(d['proofs'])==1 and d['proofs'][0]['bytes']==len(bi.getvalue())
            assert len(d['timeline'])==1 and len(d['actionNotes'])==1
            page.locator('#clear-session').click()
            assert page.locator('.cw-proof').count()==0
            page.locator('#open-followup-home').click()
            page.locator('#cw-import').set_input_files(str(dest))
            page.wait_for_function("document.querySelector('#cw-save-status').textContent.includes('restored')")
            assert page.locator('#w-utr').input_value()=='123456789012'
            assert page.locator('#cw-updates li').count()==1
            assert page.locator('.cw-proof').count()==1
            assert page.locator('#timeline li').count()==1
            assert page.locator('#cw-step-notes').inner_text().count('Checked online status')==1
            # invalid import must preserve existing case data
            bad=Path(temp)/'bad.json';bad.write_text(json.dumps({**d,'proofs':[{'name':'x','data':'data:text/html;base64,PHNjcmlwdD4=','bytes':2,'type':'status','note':'','action':'portal'}]}))
            page.locator('#cw-import').set_input_files(str(bad))
            page.wait_for_function("document.querySelector('#cw-save-status').textContent.includes('Import rejected')")
            assert 'Import rejected' in page.locator('#cw-save-status').inner_text()
            assert page.locator('#cw-updates li').count()==1
            with page.expect_download() as wait2:page.locator('#download-plan').click()
            txt=Path(temp)/'report.txt';wait2.value.save_as(txt)
            report=txt.read_text(encoding='utf8')
            assert 'FAKE-ACK-001' in report and 'NOT independent confirmation' in report
            assert 'fictional-receipt.png' in report
        # Full assessment; action-level note button works.
        page.locator('#home-button').click()
        page.locator('#choose-category').click();page.locator('#category').select_option('payment')
        page.locator('#category-next').click();page.locator('#proposals-next').click()
        page.locator('#triage-money').select_option('yes')
        page.locator('#triage-next').click()
        assert page.locator('#question-screen').is_visible()
        # Country is selected in the header, leaving seven guided questions.
        vals=['yes','yes','upi','no','no','no','no']
        for val in vals:
            page.locator('#answer').select_option(val)
            page.locator('#question-next').click()
        assert page.locator('#review-screen').is_visible()
        page.locator('#transaction-kind').select_option('deceived')
        page.locator('#build-plan').click();page.locator('#actions-screen').wait_for(state='visible')
        assert page.locator('.action').count()>0
        page.screenshot(path=str(ROOT.parent/'FFA_2_2_Actions.png'),full_page=True)
        page.locator('.action button').filter(has_text='Record note / proof').first.click()
        assert page.locator('#workspace-screen').is_visible()
        assert page.locator('#cw-action').input_value().startswith('A')
        assert errors==[], f'Browser exceptions: {errors}'
        print('PASS desktop browser: status, official navigation, checklist, follow-up, notes, image evidence, export/import, rejection, downloadable report, full assessment, linked action')
        page.set_viewport_size({'width':375,'height':820});boot();page.locator('#open-followup-home').click()
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1'), 'Mobile page overflow'
        page.screenshot(path=str(ROOT.parent/'FFA_2_2_Mobile.png'),full_page=True)
        assert errors==[], f'Browser errors: {errors}'
        print('PASS mobile 375px: no horizontal overflow, no JS errors')
        page.set_viewport_size({'width':320,'height':800})
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1'), '320px viewport overflow'
        print('PASS mobile 320px: no horizontal overflow')
        browser.close()

if __name__=='__main__':check()
