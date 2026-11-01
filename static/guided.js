'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const screens=['home','description-screen','category-screen','image-screen','proposals-screen','triage-screen','question-screen','review-screen','actions-screen','workspace-screen'];
 const labels={IN:'India',OTHER:'Another country',yes:'Yes',no:'No',unknown:'Not sure',bank_transfer:'Bank transfer',upi:'UPI',card:'Debit / credit card',wallet:'Payment wallet',crypto:'Cryptocurrency',gift_card:'Gift card',cash:'Cash'};
 const BANKS={
  sbi:{name:'State Bank of India',phone:'1800111109',display:'1800 1111 09',purpose:'Dedicated unauthorised-transaction reporting line.',url:'https://sbi.co.in/web/customer-care/contact-centre'},
  hdfc:{name:'HDFC Bank',phone:'18001600',display:'1800 1600',purpose:'General customer care; request fraud reporting guidance.',url:'https://www.hdfc.bank.in/contact-us'},
  icici:{name:'ICICI Bank',phone:'18002662',display:'1800 2662',purpose:'Customer care; confirm appropriate fraudulent-transaction reporting route.',url:'https://www.icici.bank.in/customer-care'},
  axis:{name:'Axis Bank',phone:'18004030',display:'1800 4030',purpose:'General phone banking; ask for the fraud-reporting channel.',url:'https://www.axisbank.com/contact-us'}
 };
 const N=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const A=(label,href,cls)=>{const a=N('a',label,cls);a.href=href;if(/^https?:/.test(href)){a.target='_blank';a.rel='noopener noreferrer';}return a;};
 const safestr=v=>String(v==null?'':v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
 let questions=[],facts={},completed={},result=null,confirmed=null,step=0,rev=0,pending=null;
 let draftContext={incident_type:'unknown',active_pressure:'unknown',transaction_kind:'unknown'},suggestions=null,startedFrom='home',imageMode={},imageLoaded=null,canvasData=null;
 let timeline=[];
 const defaults=()=>Object.fromEntries(questions.map(q=>[q.field,q.field==='country'?$('guidance-country').value:'unknown']));
 const assessmentQuestions=()=>questions.filter(q=>q.field!=='country');
 function announce(msg){$('status').textContent=msg;}
 function fail(msg){$('error').textContent=msg;$('error').hidden=false;announce(msg);}
 function cancel(){rev++;pending?.abort();pending=null;$('build-plan').disabled=false;$('description-next').disabled=false;$('image-analyze').disabled=false;}
 function show(name){for(const s of screens)$(s).hidden=s!==name;$('error').hidden=true;const h=$(name).querySelector('h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}window.scrollTo({top:0,behavior:'instant'});}
 function jurisdiction(){const indian=facts.country==='IN';$('guidance-country').value=indian?'IN':'OTHER';$('urgent').hidden=!indian;$('india-resources').hidden=!indian;$('india-actions').hidden=!indian;$('country-hint').hidden=indian;document.querySelector('.top-actions').hidden=!indian;}
 $('guidance-country').addEventListener('change',()=>{const next=$('guidance-country').value;if(facts.country===next)return;cancel();facts.country=next;completed={};result=null;confirmed=null;jurisdiction();show('home');announce(next==='IN'?'India guidance selected. Rebuild your plan to apply the changed jurisdiction.':'Outside India selected. This prototype does not provide country-specific official reporting steps outside India. Rebuild the plan if needed.');});
 async function data(response){let body;try{body=await response.json();}catch{throw new Error('The server response could not be read.');}if(!response.ok)throw new Error(body.error||'Request failed.');return body;}
 async function post(path,body,signal){return data(await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal}));}
 function openBank(){if(facts.country==='OTHER'){fail('The current bank directory covers India only.');return;}$('bank-panel').open=true;$('india-resources').scrollIntoView({behavior:'smooth',block:'start'});}
 $('urgent-bank').addEventListener('click',openBank);$('result-bank').addEventListener('click',openBank);
 $('bank-filter').addEventListener('change',()=>{const bank=BANKS[$('bank-filter').value];$('bank-selected').replaceChildren();if(!bank)return;const card=N('div',undefined,'bank-entry');card.append(N('h3',bank.name),N('p',bank.purpose),A('☎ '+bank.display,'tel:'+bank.phone,'button-link'),A('Verify on official bank website ↗',bank.url,'source-link'));$('bank-selected').append(card);});
 $('maps-search').addEventListener('click',()=>{if(facts.country==='OTHER')return;const locality=$('police-locality').value.trim();const area=locality?locality+', Bengaluru':$('police-region').value+' Bengaluru';const query='cybercrime police assistance near '+area+', Karnataka, India';window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query),'_blank','noopener,noreferrer');});
 function reset(){window.FFA_CASE_HUB?.reset();cancel();facts=defaults();completed={};confirmed=null;result=null;step=0;draftContext={incident_type:'unknown',active_pressure:'unknown',transaction_kind:'unknown'};suggestions=null;startedFrom='home';timeline=[];canvasData=null;imageLoaded=null;imageQueue=[];imageIndex=0;imageLoadSeq++;
  for(const id of ['description','notes','reference','amount','image-input','w-date','w-time','w-tx-date','w-tx-amount','w-portal-draft','w-bank','w-utr','w-app','w-ack-bank','w-ack-police','w-followup','w-reminder','event-date','event-time','event-text','police-locality'])$(id).value='';
  for(const id of ['image-consent','share-notes','w-called-bank','w-filed'])$(id).checked=false;
  $('category').value='unknown';$('pressure').value='unknown';$('triage-money').value='unknown';$('triage-exposure').value='unknown';$('transaction-kind').value='unknown';$('canvas-wrap').hidden=true;queueStatus();
  $('timeline').replaceChildren();$('action-list').replaceChildren();$('proposed-fields').replaceChildren();$('export-status').textContent='';
  $('bank-panel').open=false;$('police-panel').open=false;$('bank-filter').value='';$('bank-selected').replaceChildren();
  $('triage-alert').hidden=true;$('triage-alert').textContent='';$('print-sheet').hidden=true;$('print-content').textContent='';
  jurisdiction();show('home');announce('Session information cleared from this page. Previously downloaded files remain on your device.');}
 $('clear-session').addEventListener('click',reset);
 $('home-button').addEventListener('click',()=>{cancel();show('home');});
 $('open-followup-home').addEventListener('click',()=>{show('workspace-screen');window.FFA_CASE_HUB?.readiness();});
 $('choose-description').onclick=()=>{startedFrom='description-screen';show('description-screen');};
 $('choose-category').onclick=()=>{startedFrom='category-screen';show('category-screen');};
 $('choose-image').onclick=()=>{startedFrom='image-screen';show('image-screen');};
 $('description-back').onclick=()=>show('home');$('category-back').onclick=()=>show('home');$('image-back').onclick=()=>show('home');
 $('description-next').onclick=async()=>{
  const description=$('description').value.trim();$('notes').value=description;
  if(!description){draftContext.incident_type='unknown';return show('triage-screen');}
  cancel();const thisRev=rev;const c=new AbortController();pending=c;$('description-next').disabled=true;announce('Looking for possible facts. You will confirm them.');
  try{const suggested=await post('/api/intake/interpret',{description,category:'unknown'},c.signal);if(thisRev!==rev)return;propose(suggested);show('proposals-screen');}
  catch(e){if(e.name!=='AbortError')fail(e.message+' You can continue by choosing an incident type instead.');}
  finally{if(thisRev===rev)$('description-next').disabled=false;}
 };
 $('category-next').onclick=async()=>{draftContext.incident_type=$('category').value;const category=draftContext.incident_type;
   // Category is a user-selected context but possible payment facts still require opt-in.
   try{const proposal=await post('/api/intake/interpret',{description:'',category});propose(proposal);show('proposals-screen');}
   catch(e){fail(e.message);}
 };
 function propose(obj){suggestions=obj;$('proposed-observations').replaceChildren();$('proposed-fields').replaceChildren();
  const factsObj=obj.proposed_facts||{};
  for(const obs of (obj.observations||[]).slice(0,5))$('proposed-observations').append(N('p',obs,'callout small'));
  if(obj.proposed_amount_inr!=null){const l=N('label',undefined,'check');const cb=N('input');cb.type='checkbox';cb.dataset.amount=obj.proposed_amount_inr;cb.checked=false;l.append(cb,N('span','Potential amount: ₹'+obj.proposed_amount_inr+' · apply only if correct'));$('proposed-fields').append(l);}
  for(const [key,val] of Object.entries(factsObj)){
   if(!questions.some(q=>q.field===key)||!questions.find(q=>q.field===key).options.includes(val)||val==='unknown')continue;
   const l=N('label',undefined,'check');const cb=N('input');cb.type='checkbox';cb.dataset.field=key;cb.dataset.value=val;cb.checked=false;
   const q=questions.find(q=>q.field===key);l.append(cb,N('span',q.prompt+' → '+(labels[val]||val)));$('proposed-fields').append(l);
  }
  $('proposed-empty').hidden=$('proposed-fields').children.length>0||$('proposed-observations').children.length>0;
 }
 $('proposals-back').onclick=()=>show(startedFrom);
 $('proposals-next').onclick=()=>{cancel();completed={};for(const cb of $('proposed-fields').querySelectorAll('input:checked')){if(cb.dataset.field)facts[cb.dataset.field]=cb.dataset.value;else if(cb.dataset.amount)$('amount').value=cb.dataset.amount;}
   $('triage-money').value=facts.money_moved;$('pressure').value=draftContext.active_pressure;show('triage-screen');};
 $('triage-back').onclick=()=>show(startedFrom);
 function updateTriage(){const pressure=$('pressure').value;const money=$('triage-money').value;
  const t=$('triage-alert');t.hidden=pressure!=='yes'&&money!=='yes';if(pressure==='yes')t.textContent='If someone is threatening or pressuring you, do not make further payments. Contact genuine authorities. If you face immediate physical danger, seek emergency assistance.';
  else if(money==='yes')t.textContent='If you suspect a fraudulent debit, contact your bank and 1930 promptly. Do not wait for this assessment.';}
 for(const id of ['pressure','triage-money','triage-exposure'])$(id).addEventListener('change',updateTriage);
 $('triage-next').onclick=()=>{draftContext.active_pressure=$('pressure').value;facts.money_moved=$('triage-money').value;
  // The combined exposure question does not infer which type was exposed.
  if($('triage-exposure').value==='yes')announce('Please clarify whether credentials or device access were exposed.');
  step=0;renderQuestion();};
 function renderQuestion(){const flow=assessmentQuestions();if(!flow.length)return fail('Questions unavailable. Use the official reporting options.');const q=flow[step];$('step-label').textContent=`CONFIRM THE FACTS · ${step+1} / ${flow.length}`;$('question-progress').max=flow.length;$('question-progress').value=step+1;
   $('question-title').textContent=q.prompt;$('question-hint').textContent=['bank_reported','official_reported'].includes(q.field)?'Only select Yes if you actually completed the reporting step.':'Choose the answer that is true for you. Not sure is a valid response.';
   $('answer').replaceChildren();for(const v of q.options){const o=N('option',labels[v]||v);o.value=v;$('answer').append(o);}$('answer').value=facts[q.field];$('question-next').textContent=step===flow.length-1?'Review answers →':'Continue →';show('question-screen');}
 $('answer').onchange=()=>{facts[assessmentQuestions()[step].field]=$('answer').value;};
 $('question-next').onclick=()=>{facts[assessmentQuestions()[step].field]=$('answer').value;if(step+1<assessmentQuestions().length){step++;renderQuestion();}else review();};
 $('question-back').onclick=()=>{facts[assessmentQuestions()[step].field]=$('answer').value;if(step>0){step--;renderQuestion();}else show('triage-screen');};
 function review(){cancel();$('review-facts').replaceChildren();for(const q of questions){const label=q.field==='country'?'Guidance country (change in the header)':q.prompt;$('review-facts').append(N('dt',label),N('dd',labels[facts[q.field]]||facts[q.field]));}$('transaction-kind').value=draftContext.transaction_kind;show('review-screen');}
 $('review-edit').onclick=()=>{step=0;renderQuestion();};
 $('edit-plan').onclick=review;
 const requestDetails=()=> $('share-notes').checked?{amount_inr:$('amount').value||null,reference:$('reference').value,notes:$('notes').value}:{};
 const requestBody=()=>({facts:{...facts},context:{...draftContext},details:requestDetails(),completed:{...completed}});
 $('build-plan').onclick=async()=>{
  draftContext.transaction_kind=$('transaction-kind').value;
  for(const id of ['amount','reference','notes'])if($('share-notes').checked&&!$(id).checkValidity()){$(id).reportValidity();return;}
  cancel();const thisRev=rev;pending=new AbortController();$('build-plan').disabled=true;announce('Building your source-linked response plan…');
  try{const plan=await post('/api/assess',requestBody(),pending.signal);if(thisRev!==rev)return;result=plan;completed={...plan.completed};confirmed={facts:{...plan.facts},context:{...plan.context},details:{...plan.details}};renderActions();show('actions-screen');announce('Action plan ready. Reporting is not automatic.');}
  catch(e){if(thisRev===rev&&e.name!=='AbortError')fail(e.message);}
  finally{if(thisRev===rev)$('build-plan').disabled=false;}
 };
 function updateProgress(){const total=result.actions.length;const count=result.actions.filter(a=>completed[a.action_id]===a.completion_token).length;$('completion-status').textContent=count+' of '+total+' actions completed · self-reported';$('actions-progress').max=Math.max(total,1);$('actions-progress').value=count;}
 function renderActions(){const list=$('action-list');list.replaceChildren();$('notices').replaceChildren(...result.notices.map(t=>N('p',t,'callout')));$('unknowns').textContent=result.unknown_questions.length?'Still uncertain: '+result.unknown_questions.join(' · '):'No answers marked Not sure. This is not a fraud verdict.';
  const groupNames={urgent:'Immediate attention',secure:'Secure accounts and devices',report:'Report and organise',followup:'Follow up'};
  const groups={urgent:[],secure:[],report:[],followup:[]};
  for(const a of result.actions){let group=a.group;
    if(!group)group=a.priority<=10?'urgent':a.priority<=20?'secure':a.priority<=35?'report':'followup';
    (groups[group]||groups.report).push(a);
  }
  for(const [key,arr] of Object.entries(groups)){
   if(!arr.length)continue;const section=N('section',undefined,'action-group');section.append(N('h2',groupNames[key]));
   for(const a of arr){const card=N('article',undefined,'action');card.dataset.actionId=a.action_id;card.append(N('h3',a.title));const reason=N('p','Why: '+a.reason,'action-why');card.append(reason,N('p',a.action_text));
    const more=N('details');more.append(N('summary','What should I prepare?'));more.append(N('p',a.action_id==='A06'||a.action_id==='A16'?'Keep the dates, transaction reference and relevant messages available. Do not enter passwords or OTPs.':'Keep any relevant user-confirmed facts and official acknowledgement references available. Never enter credentials.'));card.append(more);
    const source=N('p',undefined,'action-source');if(a.source)source.append(A(a.source.publisher+' · Source ↗',a.source.url));else source.textContent='Team-designed organisational suggestion (not an official instruction).';card.append(source);
    if(a.action_id==='A01'||a.action_id==='A08'){const btn=N('button','Find my bank →','secondary compact');btn.type='button';btn.onclick=openBank;card.append(btn);}
    if(a.action_id==='A02')card.append(A('Open official reporting ↗','https://cybercrime.gov.in/','button-link compact'));
    const label=N('label',undefined,'check done-label'),check=N('input');check.type='checkbox';check.checked=completed[a.action_id]===a.completion_token;label.append(check,N('span','I completed this action (self-reported)'));card.classList.toggle('done',check.checked);
    check.onchange=()=>{if(check.checked)completed[a.action_id]=a.completion_token;else delete completed[a.action_id];card.classList.toggle('done',check.checked);updateProgress();};card.append(label);
    const record=N('button','Record note / proof for this step →','secondary compact');record.type='button';
    record.addEventListener('click',()=>{window.FFA_CASE_HUB?.selectAction(a.action_id);show('workspace-screen');$('cw-action').scrollIntoView({behavior:'smooth',block:'center'});$('cw-step-note').focus({preventScroll:true});});
    card.append(record);section.append(card);
   }list.append(section);
  }updateProgress();window.FFA_CASE_HUB?.refreshActions();}
 $('open-workspace').onclick=()=>{show('workspace-screen');window.FFA_CASE_HUB?.readiness();};
 $('workspace-back').onclick=()=>show(result?'actions-screen':'home');
 function timelineView(){const list=$('timeline');list.replaceChildren();for(const [index,e] of timeline.entries()){
  const li=N('li');const date=(e.date||'Date unknown')+' '+(e.time||'');li.append(N('strong',date),N('p',e.text));const rm=N('button','Remove','secondary small-btn');rm.onclick=()=>{timeline.splice(index,1);timelineView();};li.append(rm);list.append(li);
 }}
 $('add-event').onclick=()=>{const text=$('event-text').value.trim();if(!text)return fail('Describe the timeline event before adding it.');if(timeline.length>=20)return fail('The timeline supports a maximum of 20 events.');timeline.push({date:$('event-date').value,time:$('event-time').value,text});$('event-text').value='';timelineView();announce('Timeline event added.');};
 window.FFA_WORKSPACE={getTimeline:()=>timeline.map(x=>({...x})),setTimeline:items=>{timeline=items.map(x=>({...x}));timelineView();},getActionSnapshot:()=>result?result.actions.map(a=>({action_id:a.action_id,title:a.title,done:completed[a.action_id]===a.completion_token})):[]};
 const wrap=v=>JSON.stringify(safestr(v));
 function extraReport(){const out=['','USER-PREPARED INCIDENT WORKSPACE','No report has been filed by this application. All details are user-provided, not verified.'];
  for(const [name,id] of [['Incident date','w-date'],['Incident time','w-time'],['Transaction date','w-tx-date'],['Transaction amount INR','w-tx-amount'],['Incident narrative','w-portal-draft'],['Financial institution','w-bank'],['UTR or transaction reference','w-utr'],['Website / app','w-app'],['Bank acknowledgement','w-ack-bank'],['Official complaint acknowledgement','w-ack-police'],['User-chosen reminder','w-reminder'],['Follow-up note','w-followup']])out.push(name+': '+wrap($(id).value||'Not provided'));
  out.push('Bank contacted (self-reported): '+($('w-called-bank').checked?'Yes':'Not marked'), 'Official report submitted (self-reported): '+($('w-filed').checked?'Yes':'Not marked'));
  out.push('TIMELINE (USER-CONFIRMED)');for(const e of timeline)out.push((e.date||'Date unknown')+' '+(e.time||'Time unknown')+' · '+wrap(e.text));
  out.push('OFFICIAL PORTAL: https://cybercrime.gov.in/','INDIA REPORTING HELPLINE: 1930','Use official channels; this is not a police or bank complaint.');return out.join('\n')+'\n';
 }
 async function fullReport(){let plan='FRAUD FIRST AID — PERSONAL CASE RECORD\nNo assessment built; the following workspace fields are user-provided and unverified.\n';if(result&&confirmed){const response=await fetch('/api/summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...confirmed,completed:{...completed}})});if(!response.ok){await data(response);throw new Error('Summary unavailable.');}plan=await response.text();}return plan+'\n'+extraReport()+'\n'+(window.FFA_CASE_HUB?.reportAppend()||'');}
 function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob),link=A('',url);link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
 $('download-plan').onclick=async()=>{try{const report=await fullReport();download('fraud-first-aid-report.txt',report,'text/plain;charset=utf-8');$('export-status').textContent='UTF-8 report downloaded. Review before sharing.';}catch(e){fail(e.message);}};
 $('print-report').onclick=async()=>{try{$('print-content').textContent=await fullReport();$('print-sheet').hidden=false;window.print();}catch(e){fail(e.message);}};
 $('download-ics').onclick=()=>{const date=$('w-reminder').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return fail('Choose your own reminder date first.');const d=date.replaceAll('-','');const now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const msg=($('w-followup').value.trim()||'Check official complaint progress using genuine channels').replace(/[\\;,\n\r]/g,' ');
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Fraud First Aid//Personal Reminder//EN','BEGIN:VEVENT','UID:ffa-'+Date.now()+'@local.invalid','DTSTAMP:'+now,'DTSTART;VALUE=DATE:'+d,'SUMMARY:Personal fraud-reporting follow-up','DESCRIPTION:'+msg.slice(0,300)+' (user reminder, not a legal deadline)','END:VEVENT','END:VCALENDAR'].join('\r\n');download('my-follow-up-reminder.ics',ics,'text/calendar;charset=utf-8');announce('Your personal reminder file was downloaded.');};
 // Multi-image intake. Every image is reviewed/redacted separately, then sent individually only after opt-in.
 // No original File is transmitted: each request contains a flattened PNG from the displayed canvas.
 const canvas=$('evidence-canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
 const MAX_INTAKE_IMAGES=4,MAX_INTAKE_BYTES=6*1024*1024,MAX_INTAKE_FILE=2*1024*1024;
 let drag=null,imageQueue=[],imageIndex=0,imageDrawing=false,imageLoadSeq=0;
 function imageChanged(){canvasData=null;$('image-consent').checked=false;}
 function saveImagePreview(){const item=imageQueue[imageIndex];if(item&&imageLoaded)item.preview=canvas.toDataURL('image/png');}
 function queueStatus(){
   const n=imageQueue.length,reviewed=imageQueue.filter(x=>x.reviewed).length;
   $('image-count').textContent=n?`${n} screenshot${n===1?'':'s'} selected · ${reviewed} reviewed. All must be reviewed before analysis. (Max 4, 2 MB each, 6 MB total)`:'Select up to 4 screenshots at once (2 MB each, 6 MB combined). Each must be reviewed and redacted separately before processing.';
   $('image-position').textContent=n?`Screenshot ${imageIndex+1} of ${n} · ${imageQueue[imageIndex].name}`:'';
   $('image-previous').disabled=imageDrawing||imageIndex===0;
   $('image-next').disabled=imageDrawing||imageIndex>=n-1;
   $('image-review-status').textContent=n?`${imageQueue[imageIndex].reviewed?'✓ Preview reviewed':'Preview not yet reviewed'} · ${reviewed}/${n} reviewed. Mark each screenshot after checking for secrets.`:'';
   $('canvas-wrap').hidden=!n;
 }
 async function decodeImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Image could not be decoded.'));im.src=src;});}
 async function makeImageItem(file){
   if(!['image/png','image/jpeg'].includes(file.type)||file.size<=0||file.size>MAX_INTAKE_FILE)throw Error(`${file.name}: only PNG/JPEG files up to 2 MB are supported.`);
   const signature=new Uint8Array(await file.slice(0,16).arrayBuffer());
   const isPng=signature.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>signature[i]===n);
   const isJpg=signature.length>=3&&signature[0]===255&&signature[1]===216&&signature[2]===255;
   if((file.type==='image/png'&&!isPng)||(file.type==='image/jpeg'&&!isJpg))throw Error(`${file.name}: image contents do not match the file type.`);
   const url=URL.createObjectURL(file);
   let im;try{im=await decodeImage(url);}finally{URL.revokeObjectURL(url);}
   if(im.naturalWidth<16||im.naturalHeight<16||im.naturalWidth*im.naturalHeight>6000000)throw Error(`${file.name}: invalid dimensions (max 6 million pixels).`);
   const scale=Math.min(1,1000/im.naturalWidth,900/im.naturalHeight);
   const w=Math.max(16,Math.round(im.naturalWidth*scale)),h=Math.max(16,Math.round(im.naturalHeight*scale));
   const off=document.createElement('canvas');off.width=w;off.height=h;
   const context=off.getContext('2d',{willReadFrequently:true});context.fillStyle='#fff';context.fillRect(0,0,w,h);context.drawImage(im,0,0,w,h);
   return {name:file.name.slice(0,90),preview:off.toDataURL('image/png'),original:context.getImageData(0,0,w,h),reviewed:false};
 }
 async function displayImage(){
   const item=imageQueue[imageIndex],load=++imageLoadSeq;
   if(!item){imageLoaded=null;ctx.clearRect(0,0,canvas.width,canvas.height);queueStatus();return;}
   imageDrawing=true;queueStatus();
   try{
     const im=await decodeImage(item.preview);if(load!==imageLoadSeq)return;
     canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;ctx.drawImage(im,0,0);
     imageLoaded=item.original;queueStatus();
   }catch(e){if(load===imageLoadSeq)fail('Could not display selected screenshot: '+e.message);}
   finally{if(load===imageLoadSeq){imageDrawing=false;queueStatus();}}
 }
 $('image-input').addEventListener('change',async()=>{
   const files=Array.from($('image-input').files||[]);
   if(!files.length)return;
   if(files.length>MAX_INTAKE_IMAGES||files.reduce((sum,x)=>sum+x.size,0)>MAX_INTAKE_BYTES){$('image-input').value='';fail('Select at most 4 screenshots, up to 2 MB each and 6 MB combined. Your previous previews were preserved.');return;}
   cancel();imageChanged();$('image-input').disabled=true;
   try{
     const newQueue=[];
     for(const file of files)newQueue.push(await makeImageItem(file));
     imageLoadSeq++;imageQueue=newQueue;imageIndex=0;imageLoaded=null;
     await displayImage();announce(`${files.length} screenshots ready. Review and redact every preview individually. No image was sent to a server.`);
   }catch(e){fail(e.message+' Your previous previews were preserved.');}
   finally{$('image-input').disabled=false;$('image-input').value='';queueStatus();}
 });
 async function moveImage(dir){if(imageDrawing||!imageQueue.length)return;saveImagePreview();imageIndex=Math.max(0,Math.min(imageQueue.length-1,imageIndex+dir));imageChanged();await displayImage();}
 $('image-previous').onclick=()=>moveImage(-1);
 $('image-next').onclick=()=>moveImage(1);
 $('image-review').onclick=()=>{const item=imageQueue[imageIndex];if(!item||imageDrawing)return fail('Choose a screenshot first.');saveImagePreview();item.reviewed=true;imageChanged();queueStatus();announce(`${imageQueue.filter(x=>x.reviewed).length} of ${imageQueue.length} previews reviewed. Consent remains unchecked until you approve all images.`);};
 function pos(event){const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(canvas.width,(event.clientX-r.left)*canvas.width/r.width)),y:Math.max(0,Math.min(canvas.height,(event.clientY-r.top)*canvas.height/r.height))};}
 canvas.addEventListener('pointerdown',e=>{if(!imageLoaded||imageDrawing)return;const p=pos(e);drag={start:p,snapshot:ctx.getImageData(0,0,canvas.width,canvas.height)};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const p=pos(e);ctx.putImageData(drag.snapshot,0,0);ctx.fillStyle='#101a18';ctx.fillRect(Math.min(drag.start.x,p.x),Math.min(drag.start.y,p.y),Math.abs(p.x-drag.start.x),Math.abs(p.y-drag.start.y));});
 function release(){if(!drag)return;drag=null;const item=imageQueue[imageIndex];if(item){item.reviewed=false;saveImagePreview();}imageChanged();queueStatus();}
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 $('image-clear').onclick=()=>{if(!imageQueue.length)return;cancel();imageQueue.splice(imageIndex,1);imageIndex=Math.min(imageIndex,Math.max(0,imageQueue.length-1));imageLoaded=null;imageChanged();displayImage();announce('Selected screenshot removed. Remaining images were not sent anywhere.');};
 $('image-reset-redactions').onclick=()=>{const item=imageQueue[imageIndex];if(item&&imageLoaded){ctx.putImageData(item.original,0,0);item.preview=canvas.toDataURL('image/png');item.reviewed=false;imageChanged();queueStatus();}};
 $('image-mode').onchange=imageChanged;
 $('image-manual').onclick=()=>{draftContext.incident_type='unknown';show('triage-screen');};
 $('image-analyze').onclick=async()=>{
   if(!imageQueue.length||imageDrawing)return fail('Choose one or more screenshots first.');
   saveImagePreview();
   if(imageQueue.some(x=>!x.reviewed))return fail('Review and mark each screenshot before consenting to processing.');
   if(!$('image-consent').checked)return fail('Consent is required after reviewing all flattened previews.');
   const mode=$('image-mode').value;
   if(!imageMode[mode])return fail('This image-analysis method is not configured. Use manual intake instead.');
   cancel();const thisRev=rev;pending=new AbortController();$('image-analyze').disabled=true;
   $('image-previous').disabled=true;$('image-next').disabled=true;
   announce(`Analyzing ${imageQueue.length} individually reviewed and sanitized screenshot(s)…`);
   try{
     const aggregate={observations:[],proposed_facts:{},proposed_amount_inr:null};
     const amounts=new Set(),values=new Map();
     for(let i=0;i<imageQueue.length;i++){
       const item=imageQueue[i];
       const suggestion=await post('/api/evidence/analyze',{image:item.preview,mode,consent:true,sanitized_preview_confirmed:true},pending.signal);
       if(thisRev!==rev)return;
       for(const obs of (suggestion.observations||[]).slice(0,3))aggregate.observations.push(`Screenshot ${i+1}: ${String(obs).slice(0,240)}`);
       if(suggestion.proposed_amount_inr!=null)amounts.add(String(suggestion.proposed_amount_inr));
       for(const [key,value] of Object.entries(suggestion.proposed_facts||{})){
         if(!questions.some(q=>q.field===key&&q.options.includes(value))||value==='unknown')continue;
         if(!values.has(key))values.set(key,new Set());values.get(key).add(value);
       }
     }
     for(const [key,val] of values)if(val.size===1)aggregate.proposed_facts[key]=Array.from(val)[0];
     if(amounts.size===1)aggregate.proposed_amount_inr=Array.from(amounts)[0];
     if(amounts.size>1||Array.from(values.values()).some(v=>v.size>1))aggregate.observations.push('Some screenshots disagree. Conflicting details were not applied; confirm them manually.');
     if(thisRev!==rev)return;propose(aggregate);show('proposals-screen');
   }catch(e){if(e.name!=='AbortError')fail('Screenshot analysis did not complete: '+e.message+'. No proposed facts were applied. Manual intake remains available.');}
   finally{if(thisRev===rev){$('image-analyze').disabled=false;queueStatus();}}
 };
 async function init(){try{const r=await data(await fetch('/api/questions'));questions=r.questions;facts=defaults();jurisdiction();}catch(e){fail('Questions could not be loaded. Reload or use the official reporting links.');}
  try{const r=await data(await fetch('/api/intake/options'));imageMode=r.image||{};const methods=[];if(imageMode.local_ocr)methods.push('Local OCR available (server-side, not AI).');if(imageMode.ai_vision)methods.push('OpenAI vision available with explicit consent.');$('image-availability').textContent=methods.join(' ')||'No image analysis provider is configured. You can still use manual description and category intake.';
   for(const o of $('image-mode').options){if(!imageMode[o.value])o.disabled=true;}const usable=Array.from($('image-mode').options).find(o=>!o.disabled);if(usable)$('image-mode').value=usable.value;else $('image-analyze').disabled=true;
  }catch{$('image-availability').textContent='Image analysis status is unavailable. Use manual intake.';$('image-analyze').disabled=true;}
 }
 init();
})();
