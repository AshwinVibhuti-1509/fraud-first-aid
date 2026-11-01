'use strict';
const $ = id => document.getElementById(id);
const labels = {IN:'India',OTHER:'Another country',yes:'Yes',no:'No',unknown:'Not sure',bank_transfer:'Bank transfer',upi:'UPI',card:'Debit / credit card',wallet:'Payment wallet',crypto:'Cryptocurrency',gift_card:'Gift card',cash:'Cash'};
let questions = [], result = null, completed = {}, revision = 0, controller = null, active = false;
const base = {country:'IN',suspected_fraud:'unknown',money_moved:'unknown',payment_channel:'unknown',credentials_exposed:'unknown',remote_access:'unknown',bank_reported:'unknown',official_reported:'unknown'};
const examples = {
 payment:{facts:{...base,suspected_fraud:'yes',money_moved:'yes',payment_channel:'upi',credentials_exposed:'no',remote_access:'no',bank_reported:'no',official_reported:'no'},amount:'4500',notes:'Fictional demo: I paid a seller by UPI, then they requested an extra fee and stopped responding.'},
 credentials:{facts:{...base,suspected_fraud:'yes',money_moved:'no',credentials_exposed:'yes',remote_access:'no',bank_reported:'no',official_reported:'no'},amount:'',notes:'Fictional demo: I entered a reused password on a suspicious page. No known payment.'},
 routine:{facts:{...base,suspected_fraud:'no',money_moved:'yes',payment_channel:'upi',credentials_exposed:'no',remote_access:'no',bank_reported:'no',official_reported:'no'},amount:'250',notes:'Fictional demo: A payment is pending. I have not noticed deception or unauthorised access.'},
 unknown:{facts:{...base},amount:'',notes:'Fictional demo: I received a strange payment message and do not yet know what happened.'}
};
function el(tag, text, cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function facts(){return Object.fromEntries(questions.map(q=>[q.field,$('q-'+q.field).value]));}
function payload(){return {facts:facts(),details:{amount_inr:$('amount').value||null,reference:$('reference').value,notes:$('notes').value},completed};}
function reportError(message){$('error').textContent=message;$('error').hidden=false;const formError=$('form-error');if(formError){formError.textContent=message;formError.hidden=false;}}
function updateUrgent(){const other=$('q-country')?.value==='OTHER';$('urgent').hidden=other;for(const id of ['header-1930','india-resources']){const node=$(id);if(node)node.hidden=other;}}
function showStage(stage){
 const showingForm = stage === 'form';
 $('form-panel').hidden = !showingForm;
 $('results-panel').hidden = showingForm;
 // Scrolling is optional: the checklist still works in browsers without smooth scrolling.
 const target = showingForm ? $('form-panel') : $('results-panel');
 if(target.scrollIntoView) target.scrollIntoView({behavior:'smooth',block:'start'});
}
async function jsonResponse(response){let data;try{data=await response.json();}catch{throw new Error('The server returned an unreadable response. Please retry.');}if(!response.ok)throw new Error(data.error||'The request failed.');return data;}
async function assess(navigate=false){
 const current=++revision;controller?.abort();controller=new AbortController();
 active=true;
 $('result').hidden=true;
 $('error').hidden=true;if($('form-error'))$('form-error').hidden=true;
 if(!$('incident-form').reportValidity()){$('result').hidden=true;result=null;$('download').disabled=true;$('status').textContent='Correct the highlighted field, then build your steps again.';return;}
 $('error').hidden=true;if($('form-error'))$('form-error').hidden=true;$('status').textContent='Updating your steps…';$('download').disabled=true;
 for(const checkbox of $('actions').querySelectorAll('input'))checkbox.disabled=true;
 try{
  const data=await jsonResponse(await fetch('/api/assess',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload()),signal:controller.signal}));
  if(current!==revision)return;
  result=data;completed=data.completed;active=true;render();$('status').textContent='Steps updated. Review them at your own pace.';if(navigate)showStage('steps');
 }catch(e){if(e.name==='AbortError')return;if(current===revision){reportError(e.message+' Your answers are still here.');$('status').textContent='Could not update the checklist. Please retry.';$('result').hidden=true;result=null;}}
 finally{if(current===revision)$('download').disabled=!result;}
}
function render(){
 $('empty').hidden=true;$('result').hidden=false;$('actions').replaceChildren();$('notices').replaceChildren();
 for(const message of result.notices)$('notices').append(el('p',message,'notice'));
 for(const a of result.actions){
  const item=el('li',undefined,a.completed?'done':'');const head=el('div',undefined,'action-head');
  const check=document.createElement('input');check.type='checkbox';check.id='action-'+a.action_id;check.checked=a.completed;check.setAttribute('aria-label','Mark '+a.title+' as done');
  const label=el('label',a.title);label.htmlFor=check.id;head.append(check,label);item.append(head);
  const body=el('div',undefined,'action-body');body.append(el('p',a.action_text));
  const provenance=a.origin.includes('adaptation')?'Adapted general guidance':a.origin==='official_plus_workflow_design'?'Official guidance + team workflow':a.source?'Indian official source':'Team-designed suggestion';
  body.append(el('span',provenance,'origin'));const more=el('details');more.append(el('summary','Why this step? · View source'));more.append(el('p',a.reason));
  if(a.source){const link=el('a',a.source.publisher+' ↗');link.href=a.source.url;link.target='_blank';link.rel='noopener noreferrer';more.append(link);if(a.source.country!=='IN')more.append(el('p','General protective advice adapted for this prototype; foreign legal rights and reporting contacts do not apply.'));}
  else more.append(el('p','An organisational suggestion from our team, not an official instruction.'));
  body.append(more);item.append(body);$('actions').append(item);
  check.addEventListener('change',()=>{if(check.checked)completed[a.action_id]=a.completion_token;else delete completed[a.action_id];a.completed=check.checked;item.classList.toggle('done',check.checked);progress();});
 }
 $('unknowns').replaceChildren(...result.unknown_questions.map(q=>el('li',q)));$('unknown-box').hidden=!result.unknown_questions.length;progress();
}
function progress(){const count=result.actions.filter(a=>!!completed[a.action_id]).length;$('progress-label').textContent=count+' of '+result.actions.length+' steps marked done';$('progress').max=result.actions.length||1;$('progress').value=count;}
function invalidate(){revision++;controller?.abort();result=null;active=false;completed={};$('result').hidden=true;$('empty').hidden=false;$('error').hidden=true;if($('form-error'))$('form-error').hidden=true;$('status').textContent='';showStage('form');}
function reset(){invalidate();$('police-locality').value='';$('police-region').value='Central';$('police-resources').open=false;$('bank-resources').open=false;for(const q of questions)$('q-'+q.field).value=base[q.field];for(const id of ['amount','reference','notes'])$(id).value='';$('demo-label').hidden=true;updateUrgent();$('assess').textContent='Show my next steps →';$('status').textContent='Session cleared.';}
$('incident-form').addEventListener('submit',e=>{e.preventDefault();assess(true);});
$('load-demo').addEventListener('click',()=>{invalidate();const sample=examples[$('demo').value];for(const q of questions)$('q-'+q.field).value=sample.facts[q.field];$('amount').value=sample.amount;$('notes').value=sample.notes;$('reference').value='';$('demo-label').hidden=false;updateUrgent();$('assess').textContent='Show my next steps →';});
$('reset').addEventListener('click',reset);
$('edit-answers').addEventListener('click',()=>{showStage('form');$('assess').textContent='Update my next steps →';});
for(const id of ['amount','reference','notes'])$(id).addEventListener('change',()=>{if(active)assess();});
$('download').addEventListener('click',async()=>{
 if(!$('incident-form').reportValidity())return;
 const current=revision;$('download').disabled=true;$('error').hidden=true;
 try{const response=await fetch('/api/summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())});if(!response.ok){await jsonResponse(response);return;}const blob=await response.blob();if(current!==revision)return;const url=URL.createObjectURL(blob);const link=el('a');link.href=url;link.download='fraud-first-aid-summary.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='Summary downloaded. Review it before sharing.';}
 catch(e){if(current===revision)reportError(e.message);}finally{if(current===revision)$('download').disabled=!result;}
});
async function init(){showStage('form');try{
 const data=await jsonResponse(await fetch('/api/questions'));questions=data.questions;$('questions').replaceChildren();
 for(const q of questions){const group=el('div',undefined,'question');const label=el('label',q.prompt);label.htmlFor='q-'+q.field;const select=el('select');select.id=label.htmlFor;select.name=q.field;
 for(const option of q.options){const opt=el('option',labels[option]);opt.value=option;select.append(opt);}select.value=base[q.field];group.append(label,select);
 if(['bank_reported','official_reported'].includes(q.field))group.append(el('small','Answer for the point when you start this checklist. Later actions are recorded separately below.'));
 select.addEventListener('change',()=>{updateUrgent();if(active)assess();});$('questions').append(group);
 }
 $('assess').disabled=false;$('load-demo').disabled=false;
 }catch(e){$('questions').textContent='Questions could not load. Start the Python server and reload this page.';reportError(e.message);$('assess').disabled=true;$('load-demo').disabled=true;}}
$('maps-search').addEventListener('click',()=>{
 if($('q-country')?.value!=='IN')return;
 const region=$('police-region').value;
 const locality=$('police-locality').value.trim();
 const area=locality ? `${locality}, Bengaluru` : `${region} Bengaluru`;
 const query=`cybercrime police assistance near ${area}, Karnataka, India`;
 const url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
 window.open(url,'_blank','noopener,noreferrer');
});
init();
