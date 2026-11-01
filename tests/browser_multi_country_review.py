"""Browser acceptance: header country, multi-image intake, consent, local locker batches.
Runs with a controlled API mock for image extraction and the real Python rule engine.
Not evidence of a live provider integration, bank or government verification.
"""
import io,json,os,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from engine import QUESTIONS, assess, summary, VERSION
from intake import interpret, KINDS
from PIL import Image
from playwright.sync_api import sync_playwright


def fixture(name):
    im=Image.new('RGB',(160,80),'white')
    out=io.BytesIO();im.save(out,format='PNG')
    return {'name':name,'mimeType':'image/png','buffer':out.getvalue()}


def check():
    errors=[];calls=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
        page=browser.new_page(accept_downloads=True,viewport={'width':1280,'height':850})
        page.on('pageerror',lambda e:errors.append(str(e)))
        def adapter(path,body):
            if path=='/api/questions':return {'questions':QUESTIONS,'version':VERSION}
            if path=='/api/intake/options':return {'categories':KINDS,'image':{'local_ocr':True,'ai_vision':False}}
            if path=='/api/intake/interpret':return interpret(body.get('description',''),body.get('category','unknown'))
            if path=='/api/assess':return assess(body)
            if path=='/api/summary':return {'plain':summary(assess(body))}
            if path=='/api/evidence/analyze':
                assert body['consent'] is True and body['sanitized_preview_confirmed'] is True
                assert body['image'].startswith('data:image/png;base64,')
                calls.append(path)
                return {'observations':['Example text'], 'proposed_facts':{'payment_channel':'upi'},'proposed_amount_inr':None}
            raise ValueError('Unexpected '+path)
        page.expose_function('__testapi',adapter)
        page.set_content((ROOT/'static/guided.html').read_text('utf8'))
        page.add_style_tag(content=(ROOT/'static/guided.css').read_text('utf8'))
        page.evaluate("""window.fetch=async(url,opts={})=>{try{const d=await window.__testapi(String(url),opts.body?JSON.parse(opts.body):{});return d.plain===undefined?new Response(JSON.stringify(d),{status:200,headers:{'Content-Type':'application/json'}}):new Response(d.plain,{status:200});}catch(e){return new Response(JSON.stringify({error:String(e)}),{status:400,headers:{'Content-Type':'application/json'}});}}""")
        page.add_script_tag(content=(ROOT/'static/guided.js').read_text('utf8'))
        page.add_script_tag(content=(ROOT/'static/casework.js').read_text('utf8'))
        page.wait_for_function('Boolean(window.FFA_CASE_HUB)')

        # Country setting is outside the guided question flow; no India links for unsupported country.
        page.locator('#guidance-country').select_option('OTHER')
        assert page.locator('#urgent').is_hidden()
        assert page.locator('.top-actions').is_hidden()
        page.locator('#guidance-country').select_option('IN')
        assert page.locator('#urgent').is_visible()
        page.screenshot(path=str(ROOT.parent/'FFA_2_3_Country_Home.png'),full_page=True)

        page.locator('#choose-image').click()
        page.locator('#image-input').set_input_files([fixture('first.png'),fixture('second.png')])
        page.wait_for_function("document.querySelector('#image-position').textContent.includes('1 of 2') && !document.querySelector('#canvas-wrap').hidden")
        assert '0 reviewed' in page.locator('#image-count').inner_text()
        page.locator('#image-analyze').click()
        assert 'Review and mark each' in page.locator('#error').inner_text()
        assert len(calls)==0
        page.locator('#image-review').click()
        page.locator('#image-next').click()
        assert '2 of 2' in page.locator('#image-position').inner_text()
        page.locator('#image-review').click()
        assert '2 reviewed' in page.locator('#image-count').inner_text()
        page.screenshot(path=str(ROOT.parent/'FFA_2_3_Multi_Review.png'),full_page=True)
        # Redacting a previously reviewed picture invalidates that picture's review and the batch consent.
        page.locator('#image-consent').check()
        page.locator('#image-previous').click()
        assert not page.locator('#image-consent').is_checked(), 'Changing previews must clear processing consent'
        box=page.locator('#evidence-canvas').bounding_box()
        assert box
        x,y=box['x']+box['width']*.3,box['y']+box['height']*.3
        page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+25,y+12);page.mouse.up()
        assert 'Preview not yet reviewed' in page.locator('#image-review-status').inner_text()
        page.locator('#image-review').click()
        assert '2 reviewed' in page.locator('#image-count').inner_text()
        page.locator('#image-consent').check()
        page.locator('#image-analyze').click()
        page.locator('#proposals-screen').wait_for(state='visible')
        assert len(calls)==2,(len(calls),errors)
        assert page.locator('#proposed-fields input[data-field="payment_channel"]').count()==1

        # User confirms only what they choose; full assessment has 7 questions not country.
        page.locator('#proposals-next').click()
        page.locator('#triage-next').click()
        assert '1 / 7' in page.locator('#step-label').inner_text()
        for v in ['yes','yes','upi','no','no','no','no']:
            page.locator('#answer').select_option(v);page.locator('#question-next').click()
        assert page.locator('#review-screen').is_visible()
        assert 'India' in page.locator('#review-facts').inner_text()
        page.locator('#build-plan').click()
        page.locator('#actions-screen').wait_for(state='visible')
        assert page.locator('.action').count()>0

        # Changing jurisdiction invalidates any existing plan, without deleting case locker records.
        page.locator('#guidance-country').select_option('OTHER')
        assert page.locator('#home').is_visible()
        assert page.locator('#urgent').is_hidden()

        # User can pick 3 images at once and attach all with same action, all stay local.
        page.locator('#open-followup-home').click()
        page.locator('#cw-action').select_option('portal')
        page.locator('#cw-evidence-type').select_option('status')
        files=[fixture('evidence-1.png'),fixture('evidence-2.png'),fixture('evidence-3.png')]
        page.locator('#cw-proof-file').set_input_files(files)
        assert '3 screenshots selected' in page.locator('#cw-file-count').inner_text()
        page.locator('#cw-add-proof').click()
        page.wait_for_function("document.querySelectorAll('.cw-proof').length===3")
        assert '3 screenshots added' in page.locator('#cw-proof-message').inner_text()
        assert all('portal · status' in x for x in page.locator('.cw-proof-meta').all_inner_texts())
        page.screenshot(path=str(ROOT.parent/'FFA_2_3_Evidence_Locker.png'),full_page=True)
        # Atomic rejection: a corrupt file must not partially change the local locker.
        page.locator('#cw-proof-file').set_input_files([fixture('valid.png'),{'name':'broken.png','mimeType':'image/png','buffer':b'not-an-image'}])
        page.locator('#cw-add-proof').click()
        page.wait_for_function("document.querySelector('#cw-proof-message').textContent.includes('Nothing was attached')")
        assert 'Nothing was attached' in page.locator('#cw-proof-message').inner_text()
        assert page.locator('.cw-proof').count()==3
        with page.expect_download() as dl:page.locator('#cw-export').click()
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)/'case.json';dl.value.save_as(out)
            saved=json.loads(out.read_text('utf8'))
            assert len(saved['proofs'])==3
            assert all(x['action']=='portal' and x['type']=='status' for x in saved['proofs'])
            page.locator('#clear-session').click()
            page.locator('#open-followup-home').click()
            page.locator('#cw-import').set_input_files(str(out))
            page.wait_for_function("document.querySelector('#cw-save-status').textContent.includes('restored')")
            assert page.locator('.cw-proof').count()==3
        page.set_viewport_size({'width':320,'height':850})
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1')
        assert not errors, errors
        print('PASS: country dropdown and 7-question flow; 2-image reviewed opt-in analysis; 3-image local evidence batch; JSON roundtrip; 320px viewport; zero JS page errors')
        browser.close()

if __name__=='__main__':check()
