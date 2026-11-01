"""Optional real-browser controller QA with backend injected from real engine, not Flask.
Requires playwright and Chromium; does not use internet. Fictional data only.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
from urllib.parse import urlparse
import json, sys
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root))
from engine import QUESTIONS,VERSION,assess,summary
from intake import interpret,KINDS
from evidence import modes, sanitized_png, analyze
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'],headless=True)
 page=b.new_page(viewport={'width':1300,'height':820},accept_downloads=True)
 def intercept(route):
  request=route.request;path=urlparse(request.url).path
  if request.method=='POST':
   try:
    payload=request.post_data_json
    if path=='/api/intake/interpret':out=interpret(payload.get('description',''),payload.get('category','unknown'))
    elif path=='/api/assess':out=assess(payload)
    elif path=='/api/summary':return route.fulfill(status=200,content_type='text/plain; charset=utf-8',body=summary(assess(payload)))
    else:return route.fulfill(status=404,body='Not found')
    return route.fulfill(status=200,content_type='application/json',body=json.dumps(out,ensure_ascii=False))
   except Exception as exc:return route.fulfill(status=400,content_type='application/json',body=json.dumps({'error':str(exc)}))
  if path=='/':path='/static/guided.html'
  if path=='/api/questions':return route.fulfill(status=200,content_type='application/json',body=json.dumps({'questions':QUESTIONS,'version':VERSION}))
  if path=='/api/intake/options':return route.fulfill(status=200,content_type='application/json',body=json.dumps({'categories':KINDS,'image':modes()}))
  f=root/path.lstrip('/')
  if f.is_file():return route.fulfill(status=200,body=f.read_bytes(),content_type={'html':'text/html','js':'text/javascript','css':'text/css','svg':'image/svg+xml'}.get(f.suffix[1:],'text/plain'))
  return route.fulfill(status=404,body='Not found')
 # Browser-internal test: load the actual HTML/CSS/JS into a document; delegate
 # HTTP API to the real Python engine in-process. No Flask claim is made.
 def api(path,body):
  if path=='/api/questions':return {'questions':QUESTIONS,'version':VERSION}
  if path=='/api/intake/options':return {'categories':KINDS,'image':modes()}
  if path=='/api/intake/interpret':return interpret(body.get('description',''),body.get('category','unknown'))
  if path=='/api/assess':return assess(body)
  if path=='/api/summary':return {'__plain':summary(assess(body))}
  if path=='/api/evidence/analyze':return analyze(sanitized_png(body['image']),body['mode'])
  return {'error':'Not supported'}
 page.expose_function('__api',api)
 page.set_content((root/'static/guided.html').read_text(encoding='utf-8'))
 page.add_style_tag(content=(root/'static/guided.css').read_text(encoding='utf-8'))
 page.evaluate("""window.fetch = async (url,opts={})=>{
    try { const result=await window.__api(String(url),opts.body?JSON.parse(opts.body):{});
      if(result&&result.__plain!==undefined) return new Response(result.__plain,{status:200,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      return new Response(JSON.stringify(result),{status:result.error?400:200,headers:{'Content-Type':'application/json'}});
    } catch(e){return new Response(JSON.stringify({error:String(e)}),{status:400,headers:{'Content-Type':'application/json'}});}
  }""")
 problems=[]
 page.on('pageerror',lambda e:problems.append(str(e)))
 page.add_script_tag(content=(root/'static/guided.js').read_text(encoding='utf-8'))
 page.wait_for_function("document.querySelector('#image-availability').textContent.indexOf('Checking')<0")
 print('HOME',page.title(),page.locator('#choose-description').is_visible())
 page.screenshot(path=str(root/'docs/v2/screenshots/FFA_2_1_Desktop.png'),full_page=True)
 page.click('#choose-description');page.fill('#description','I paid ₹4,500 through UPI to a seller who asked for more money.');page.click('#description-next')
 page.wait_for_selector('#proposals-screen:visible',timeout=10000)
 print('PROPOSALS',page.locator('#proposed-fields').inner_text())
 for c in page.locator('#proposed-fields input').all():c.check()
 page.click('#proposals-next');page.select_option('#triage-money','yes');page.click('#triage-next')
 chosen=['IN','yes','yes','upi','no','no','no','no']
 for v in chosen:page.select_option('#answer',v);page.click('#question-next')
 page.wait_for_selector('#review-screen:visible');page.click('#build-plan');page.wait_for_selector('#actions-screen:visible')
 print('COUNT',page.locator('.action').count())
 page.locator('[data-action-id="A06"] input').check()
 page.click('#edit-plan');page.click('#review-edit')
 for i,v in enumerate(chosen):page.select_option('#answer','yes' if i==5 else v);page.click('#question-next')
 page.click('#build-plan');page.wait_for_selector('#actions-screen:visible')
 print('COUNT 2',page.locator('.action').count(),'PRESERVED',page.locator('[data-action-id="A06"] input').is_checked())
 page.screenshot(path=str(root/'docs/v2/screenshots/FFA_2_1_Action_Centre.png'),full_page=True)
 page.click('#result-bank');page.select_option('#bank-filter','sbi');print('BANK',page.locator('#bank-selected').inner_text()[:110])
 page.click('#open-workspace');page.fill('#w-utr','FAKE-REF-5555');page.fill('#event-text','Called bank via official site');page.click('#add-event');page.fill('#w-reminder','2026-11-04')
 with page.expect_download() as d:page.click('#download-plan')
 d.value.save_as(str(root/'docs/v2/SAMPLE_FICTIONAL_REPORT.txt'))
 print('REPORT', 'FAKE-REF-5555' in Path(str(root/'docs/v2/SAMPLE_FICTIONAL_REPORT.txt')).read_text())
 page.screenshot(path=str(root/'docs/v2/screenshots/FFA_2_1_Incident_Workspace.png'),full_page=True)
 page.click('#clear-session');print('RESET',page.locator('#home').is_visible());assert page.locator('#bank-panel').get_attribute('open') is None
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(root/'docs/v2/screenshots/FFA_2_1_Mobile.png'),full_page=True)
 print('MOBILE OVERFLOW',page.evaluate('document.documentElement.scrollWidth>window.innerWidth'))
 # Optional real local OCR image-input test (provided by local Tesseract in this QA host).
 from PIL import Image, ImageDraw
 image=Image.new('RGB',(850,220),'white');draw=ImageDraw.Draw(image)
 draw.text((40,70),'UPI payment INR 4500 to seller',fill='black')
 imgpath=Path(str(root/'docs/v2/screenshots/local_ocr_fixture.png'));image.save(imgpath)
 page.click('#choose-image');page.locator('#image-input').set_input_files(str(imgpath))
 page.wait_for_selector('#canvas-wrap:visible')
 page.click('#image-analyze');print('CONSENT_REQUIRED',page.locator('#error').inner_text())
 page.check('#image-consent');page.click('#image-analyze')
 page.wait_for_selector('#proposals-screen:visible')
 print('OCR_PROPOSALS',page.locator('#proposed-fields').inner_text().replace('\n',' / '))
 print('JS_ERRORS',problems)
 assert not problems
 b.close()
