/* Fraud First Aid 2.2 — local-only evidence and follow-up workspace.
   No fetch(), server upload, persistent storage, or third-party request is used here. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const make = (tag, text, cls) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  };
  const MAX_FILES = 12, MAX_FILE = 2 * 1024 * 1024, MAX_TOTAL = 12 * 1024 * 1024;
  const ALLOWED_ACTION = /^[A-Z][A-Z0-9]{1,9}$/;
  const EVIDENCE_TYPES = ['receipt','status','transaction','chat','other'];
  const STAGES = ['not_checked','helpline','attempted','acknowledged','status_viewed','response','closed_reported'];
  const ISSUES = ['none','site','captcha','not_found','no_ack','delay','other'];
  const FIELDS = ['w-date','w-time','w-tx-date','w-tx-amount','w-bank','w-utr','w-app','w-ack-bank','w-ack-police','w-portal-draft','w-followup','w-reminder'];
  const STATUSES = ['cw-portal-stage','cw-status-text','cw-checked-at','cw-portal-issue'];
  let proofs = [], updates = [], actionNotes = [], activeAction = 'general';
  const notice = msg => { $('cw-proof-message').textContent = msg; };
  const saveNotice = msg => { $('cw-save-status').textContent = msg; };
  const safeText = (v, limit) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').slice(0,limit);
  const actionValue = a => a === 'general' || ['portal','bank','transaction'].includes(a) || ALLOWED_ACTION.test(a);
  const displayStamp = v => v ? v.replace('T',' ') : 'Date and time not recorded';
  const snap = () => Object.fromEntries(FIELDS.concat(STATUSES).map(id => [id, $(id).value]));

  function refreshActions() {
    const select = $('cw-action'), old = activeAction;
    const existing = new Set(Array.from(select.options).map(o => o.value));
    for (const card of document.querySelectorAll('.action[data-action-id]')) {
      const id = card.dataset.actionId;
      if (!ALLOWED_ACTION.test(id) || existing.has(id)) continue;
      const title = card.querySelector('h3')?.textContent || id;
      const option = make('option',`${id} — ${title.slice(0,85)}`);
      option.value = id; select.append(option); existing.add(id);
    }
    select.value = existing.has(old) ? old : 'general';
  }
  function selectAction(id) {
    if (actionValue(id)) activeAction = id;
    refreshActions();
    $('cw-action').value = Array.from($('cw-action').options).some(o=>o.value===activeAction) ? activeAction : 'general';
    const name = $('cw-action').selectedOptions[0]?.textContent || 'the selected step';
    notice(`Ready to attach a screenshot or note for: ${name}. Attachments are stored only in this tab.`);
  }
  function renderNotes(){
    const list=$('cw-step-notes');list.replaceChildren();
    if(!actionNotes.length)list.append(make('li','No personal step notes in this session.','microcopy'));
    for(const [i,n] of actionNotes.entries()){
      const li=make('li',undefined,'cw-update');li.append(make('strong',n.action+' · '+n.when),make('p',n.text));
      const remove=make('button','Remove','secondary small-btn');remove.type='button';remove.addEventListener('click',()=>{actionNotes.splice(i,1);renderNotes();});li.append(remove);list.append(li);
    }
  }
  $('cw-save-step-note').addEventListener('click',()=>{
    const text=$('cw-step-note').value.trim();
    if(!text)return notice('Write a brief note about the step first.');
    if(actionNotes.length>=40)return notice('Maximum 40 step notes; export your record and remove older notes.');
    actionNotes.push({action:$('cw-action').value,when:new Date().toLocaleString('en-IN'),text:safeText(text,500)});
    $('cw-step-note').value='';renderNotes();notice('Step note recorded locally. No official action was verified.');
  });
  $('cw-action').addEventListener('change' , () => { activeAction = $('cw-action').value; });
  function deriveStatus() {
    const stage = $('cw-portal-stage').value, status = safeText($('cw-status-text').value.trim(),600);
    const issue = $('cw-portal-issue').value;
    const map = {
      not_checked:'No official status has been checked here.',
      helpline:'You reported calling 1930; filing on the portal is not confirmed.',
      attempted:'You reported an attempt without acknowledgement. No successful submission is established.',
      acknowledged:'You entered that an acknowledgement was received. The reference is not independently checked.',
      status_viewed:'You report viewing the official portal. This app does not validate the displayed status.',
      response:'You report receiving a response. Its contents have not been authenticated.',
      closed_reported:'You report that an official site displayed closed/resolved. This app cannot verify closure.'
    };
    let text = map[stage] || map.not_checked;
    if (issue !== 'none') text += ' You also reported a portal access or response issue.';
    if (status) text += ' Your copied message is user-supplied.';
    $('cw-trust-label').textContent = text;
  }
  for (const id of STATUSES) $(id).addEventListener('change',deriveStatus);
  function renderUpdates() {
    const list = $('cw-updates'); list.replaceChildren();
    for (const [i, u] of updates.entries()) {
      const li=make('li',undefined,'cw-update');
      li.append(make('strong',displayStamp(u.when)), make('p',u.stageLabel));
      if(u.message) li.append(make('p','Recorded message: '+u.message));
      if(u.issue && u.issue!=='none')li.append(make('p','Problem: '+u.issue));
      const del=make('button','Remove','secondary small-btn');del.type='button';
      del.addEventListener('click',()=>{updates.splice(i,1);renderUpdates();});li.append(del);list.append(li);
    }
  }
  $('cw-add-update').addEventListener('click',()=>{
    if(updates.length>=40){saveNotice('Maximum 40 updates per case. Export your record before removing old entries.');return;}
    const stage=$('cw-portal-stage');
    updates.push({
      when:$('cw-checked-at').value,
      stage:stage.value,stageLabel:stage.selectedOptions[0]?.textContent||'Unknown',
      message:safeText($('cw-status-text').value.trim(),600),issue:$('cw-portal-issue').value
    });
    renderUpdates();deriveStatus();saveNotice('Status observation recorded locally. It is not independently verified.');
  });
  function updateCount() {
    const n=$('w-portal-draft').value.trim().length;
    $('portal-word-count').textContent = `${n} characters · Official checklist currently asks for at least 200 characters of incident details. Check the live portal for current requirements.`;
  }
  $('w-portal-draft').addEventListener('input',updateCount);
  function readiness() {
    const details=$('w-portal-draft').value.trim();
    const amount=$('w-tx-amount').value || $('amount').value;
    const checks = [
      ['Incident date and time',!!$('w-date').value && !!$('w-time').value],
      ['Incident narrative (portal currently requests 200+ characters)',details.length>=200],
      ['Identity document prepared privately for the official portal', $('cw-id-ready').checked],
      ['Name of bank, wallet or merchant',!!$('w-bank').value.trim()],
      ['Transaction reference / UTR (verify format on portal)',!!$('w-utr').value.trim()],
      ['Transaction date',!!($('w-tx-date').value||$('w-date').value)],
      ['Financial amount (if applicable)',amount!=='' && Number.isFinite(Number(amount)) && Number(amount)>=0],
      ['Relevant screenshots or evidence available',proofs.length>0],
    ];
    const el=$('cw-readiness');el.replaceChildren();
    for (const [label,ok] of checks) {
      const li=make('li',`${ok?'✓':'○'} ${label}`,`cw-ready ${ok?'has':'missing'}`);el.append(li);
    }
  }
  $('cw-refresh-ready').addEventListener('click',readiness);
  $('cw-id-ready').addEventListener('change',readiness);
  for(const id of FIELDS)$(id).addEventListener('input',readiness);

  function isPng(a){return a.length>=8&&a[0]===137&&a[1]===80&&a[2]===78&&a[3]===71&&a[4]===13&&a[5]===10&&a[6]===26&&a[7]===10;}
  function isJpeg(a){return a.length>=4&&a[0]===255&&a[1]===216&&a[2]===255;}
  function mimeOf(a){return isPng(a)?'image/png':isJpeg(a)?'image/jpeg':null;}
  function totalBytes(){return proofs.reduce((sum,p)=>sum+p.bytes,0);}
  function renderProofs() {
    const list=$('cw-proof-list');list.replaceChildren();
    if(!proofs.length)list.append(make('p','No screenshots attached in this tab. You can still record actions and use official reporting.','microcopy'));
    for(const [i,p] of proofs.entries()){
      const item=make('article',undefined,'cw-proof');
      const image=make('img');image.src=p.data;image.alt='User-provided screenshot, not independently verified';image.loading='lazy';
      const meta=make('div',undefined,'cw-proof-meta');meta.append(make('strong',p.name));
      meta.append(make('p',`Linked to: ${p.action} · ${p.type} · ${Math.round(p.bytes/1024)} KiB`));
      if(p.note)meta.append(make('p',p.note));
      meta.append(make('p','Local screenshot · not an official verification','microcopy'));
      const remove=make('button','Remove','secondary small-btn');remove.type='button';remove.addEventListener('click',()=>{proofs.splice(i,1);renderProofs();readiness();notice('Screenshot removed from browser memory.');});
      meta.append(remove);item.append(image,meta);list.append(item);
    }
    readiness();
  }
  $('cw-proof-file').addEventListener('change',()=>{const files=$('cw-proof-file').files;const count=files?.length||0;$('cw-file-count').textContent=count?`${count} screenshot${count===1?'':'s'} selected · will share the selected action and evidence type.`:'Select several files at once. Every image is linked to the same step and evidence type.';});
  $('cw-add-proof').addEventListener('click',async()=>{
    const files=Array.from($('cw-proof-file').files||[]);
    if(!files.length)return notice('Choose one or more screenshots first.');
    if(proofs.length+files.length>MAX_FILES)return notice(`You can keep at most ${MAX_FILES} screenshots; ${proofs.length} already attached. Remove some or select fewer.`);
    if(files.some(f=>f.size<=0||f.size>MAX_FILE))return notice('Each screenshot must be larger than 0 and at most 2 MB. Nothing was attached.');
    if(totalBytes()+files.reduce((sum,f)=>sum+f.size,0)>MAX_TOTAL)return notice('Selected screenshots exceed the 12 MB combined limit. Nothing was attached.');
    if(files.some(f=>!['image/png','image/jpeg'].includes(f.type)))return notice('Only PNG/JPEG screenshots are supported. Nothing was attached.');
    const incoming=[];
    try{
      for(const f of files){
        const header=new Uint8Array(await f.slice(0,16).arrayBuffer());
        const actual=mimeOf(header);
        if(!actual||actual!==f.type)throw Error(`${f.name}: actual image signature does not match its declared type.`);
        const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f);});
        if(typeof data!=='string'||!data.startsWith(`data:${actual};base64,`))throw Error(`${f.name}: image could not be decoded.`);
        await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>im.naturalWidth>=16&&im.naturalHeight>=16&&im.naturalWidth*im.naturalHeight<=6000000?resolve():reject(new Error('Image dimensions invalid'));im.onerror=()=>reject(new Error('Corrupt or unsupported image'));im.src=data;});
        incoming.push({name:safeText(f.name,100),bytes:f.size,data,type:$('cw-evidence-type').value,action:$('cw-action').value,note:safeText($('cw-proof-note').value.trim(),250)});
      }
      // Atomic batch: do not commit any entries until every selected file passed checks.
      proofs.push(...incoming);
      $('cw-proof-file').value='';$('cw-proof-note').value='';$('cw-file-count').textContent='Select more files, or remove a screenshot individually below.';
      renderProofs();notice(`${incoming.length} screenshot${incoming.length===1?'':'s'} added locally. Total: ${proofs.length}/${MAX_FILES}. Nothing was uploaded to a server.`);
    }catch(e){notice('Nothing was attached. '+safeText(e.message,170));}
  });
  $('cw-clear-proofs').addEventListener('click',()=>{if(!proofs.length)return;proofs=[];renderProofs();notice('Screenshots cleared from browser memory.');});
  function reportAppend() {
    const lines=['','USER-RECORDED PORTAL CHECK AND EVIDENCE','This is NOT independent confirmation of filing, acceptance, investigation, or resolution.'];
    lines.push('User-observed stage: '+$('cw-portal-stage').selectedOptions[0]?.textContent);
    lines.push('Portal status message (user supplied): '+safeText($('cw-status-text').value,600));
    lines.push('Checked date/time (user supplied): '+$('cw-checked-at').value);
    lines.push('Problem checking: '+$('cw-portal-issue').selectedOptions[0]?.textContent);
    lines.push('Status check history:');
    for(const u of updates)lines.push(' - '+displayStamp(u.when)+' · '+u.stageLabel+(u.message?' · '+u.message:''));
    lines.push('Personal action notes (not independently verified):');
    for(const n of actionNotes)lines.push(' - '+n.action+' · '+n.when+' · '+n.text);
    lines.push('Local evidence attachments (user supplied, NOT authenticated):');
    for(const p of proofs)lines.push(' - '+p.name+' ['+p.action+' / '+p.type+'] '+p.note);
    lines.push('Proof image contents are NOT included in this text report. They appear only in an explicitly exported case JSON file.');
    lines.push('Official status check: https://cybercrime.gov.in/webform/chkackstatus.aspx');
    lines.push('Official suspect search: https://cybercrime.gov.in/webform/suspect_search_repository.aspx');
    lines.push('Official grievance officer list: https://cybercrime.gov.in/webform/Crime_NodalGrivanceList.aspx');
    return lines.join('\n')+'\n';
  }
  function downloadFile(name, content, type){const url=URL.createObjectURL(new Blob([content],{type}));const a=make('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
  $('cw-export').addEventListener('click',()=>{
    try {
      const data={schema:'fraud-first-aid-local-case-1',exportedAt:new Date().toISOString(),workspace:snap(),idReady:$('cw-id-ready').checked,
        bankCalled:$('w-called-bank').checked,reportFiled:$('w-filed').checked,
        timeline:window.FFA_WORKSPACE?.getTimeline()||[],actionProgress:window.FFA_WORKSPACE?.getActionSnapshot()||[],updates:updates.map(x=>({...x})),actionNotes:actionNotes.map(x=>({...x})),proofs:proofs.map(x=>({...x}))};
      downloadFile('fraud-first-aid-personal-case.json',JSON.stringify(data,null,2),'application/json;charset=utf-8');
      saveNotice('Local unencrypted JSON downloaded. Keep it private; screenshot data is included. No file was sent to a server.');
    }catch(e){saveNotice('Could not export the file: '+safeText(e.message,130));}
  });
  $('cw-import').addEventListener('change',async()=>{
    const f=$('cw-import').files?.[0];if(!f)return;
    $('cw-import').value='';
    if(f.size>20*1024*1024||f.size<20)return saveNotice('Invalid case file size.');
    try {
      const d=JSON.parse(await f.text());
      if(!d||d.schema!=='fraud-first-aid-local-case-1'||typeof d.workspace!=='object'||!Array.isArray(d.updates)||!Array.isArray(d.proofs)||!Array.isArray(d.timeline)||!(d.actionNotes===undefined||Array.isArray(d.actionNotes)))throw Error('Incorrect file format.');
      if(d.proofs.length>MAX_FILES||d.updates.length>40||d.timeline.length>20||(d.actionNotes||[]).length>40||!(d.actionProgress===undefined||Array.isArray(d.actionProgress))||(d.actionProgress||[]).length>40)throw Error('Too many saved records.');
      const cleanProofs=[];let total=0;
      for(const p of d.proofs){
        if(!p||!['image/png','image/jpeg'].some(t=>typeof p.data==='string'&&p.data.startsWith('data:'+t+';base64,'))||typeof p.bytes!=='number'||!Number.isInteger(p.bytes)||p.bytes<1||p.bytes>MAX_FILE||p.data.length>MAX_FILE*1.4+100||!EVIDENCE_TYPES.includes(p.type)||typeof p.name!=='string'||p.name.length>100||typeof p.note!=='string'||p.note.length>250||typeof p.action!=='string'||!actionValue(p.action))throw Error('Invalid evidence attachment.');
        const b64=p.data.split(',')[1];if(!/^[A-Za-z0-9+/]+={0,2}$/.test(b64))throw Error('Invalid attachment encoding.');
        const binary=atob(b64),first=Uint8Array.from(binary.slice(0,16),c=>c.charCodeAt(0));
        if(binary.length!==p.bytes||!p.data.startsWith('data:'+mimeOf(first)+';'))throw Error('Attachment content does not match its type or size.');
        total+=p.bytes;cleanProofs.push({...p});
      }
      if(total>MAX_TOTAL)throw Error('Combined attachments exceed the limit.');
      const cleanUpdates=d.updates.map(u=>{
        if(!u||!STAGES.includes(u.stage)||!ISSUES.includes(u.issue)||typeof u.when!=='string'||u.when.length>22||typeof u.message!=='string'||u.message.length>600)return null;
        return {when:u.when,stage:u.stage,stageLabel:STAGES.includes(u.stage)?({'not_checked':'Not checked','helpline':'Called 1930','attempted':'Attempted submission','acknowledged':'Received acknowledgment','status_viewed':'Viewed portal status','response':'Received a response','closed_reported':'Displayed closed status'})[u.stage]:'Unknown',message:u.message,issue:u.issue};
      });
      if(cleanUpdates.some(u=>u===null))throw Error('Invalid follow-up history.');
      const importedProgress=(d.actionProgress||[]).map(p=>{
        if(!p||typeof p.action_id!=='string'||!ALLOWED_ACTION.test(p.action_id)||typeof p.title!=='string'||p.title.length>150||typeof p.done!=='boolean')return null;
        return {action_id:p.action_id,title:p.title,done:p.done};
      });
      if(importedProgress.some(p=>p===null))throw Error('Invalid stored action progress.');
      const cleanNotes=(d.actionNotes||[]).map(n=>{
        if(!n||typeof n.action!=='string'||!actionValue(n.action)||typeof n.when!=='string'||n.when.length>90||typeof n.text!=='string'||n.text.length>500)return null;
        return {action:n.action,when:n.when,text:n.text};
      });
      if(cleanNotes.some(n=>n===null))throw Error('Invalid action notes.');
      const cleanTimeline=d.timeline.map(e=>{
        if(!e||typeof e.date!=='string'||typeof e.time!=='string'||typeof e.text!=='string'||e.date.length>10||e.time.length>5||e.text.length>400)return null;
        return {date:e.date,time:e.time,text:e.text};
      });
      if(cleanTimeline.some(e=>e===null))throw Error('Invalid incident timeline.');
      const state={};
      for(const id of FIELDS.concat(STATUSES)){
        const v=d.workspace[id];if(typeof v!=='string'||v.length>5500)throw Error('Invalid field '+id);
        if(id==='cw-portal-stage'&&!STAGES.includes(v))throw Error('Invalid stage');
        if(id==='cw-portal-issue'&&!ISSUES.includes(v))throw Error('Invalid portal issue');
        state[id]=v;
      }
      // Apply atomically after all data has passed validation.
      for(const [id,value]of Object.entries(state))$(id).value=value;
      $('cw-id-ready').checked=d.idReady===true;$('w-called-bank').checked=d.bankCalled===true;$('w-filed').checked=d.reportFiled===true;
      proofs=cleanProofs;updates=cleanUpdates;actionNotes=cleanNotes;
      window.FFA_WORKSPACE?.setTimeline(cleanTimeline);
      renderProofs();renderUpdates();renderNotes();deriveStatus();updateCount();readiness();
      $('cw-import-progress').hidden=importedProgress.length===0;
      $('cw-import-progress').textContent=importedProgress.length?`Imported snapshot: ${importedProgress.filter(x=>x.done).length} of ${importedProgress.length} previously marked done (self-reported). For safety, the current checklist is not silently marked complete; rebuild and review your plan.`:'';
      saveNotice('Local case workspace restored. Official status and files are user-supplied and unverified. Rebuild your action plan separately if needed.');
    }catch(e){saveNotice('Import rejected; existing records were not changed. '+safeText(e.message,130));}
  });
  function reset(){proofs=[];updates=[];actionNotes=[];activeAction='general';
    for(const id of FIELDS.concat(STATUSES)) {if(id.startsWith('cw-'))$(id).value=id==='cw-portal-stage'?'not_checked':id==='cw-portal-issue'?'none':'';}
    $('cw-import-progress').hidden=true;$('cw-import-progress').textContent='';$('cw-id-ready').checked=false;$('cw-proof-file').value='';$('cw-file-count').textContent='Select several files at once. Every image is linked to the same step and evidence type.';$('cw-proof-note').value='';$('cw-action').value='general';$('cw-evidence-type').value='receipt';
    $('cw-updates').replaceChildren();$('cw-step-note').value='';renderNotes();$('cw-trust-label').textContent='Not checked. No official status was independently verified.';
    $('cw-save-status').textContent='';$('cw-proof-message').textContent='';renderProofs();deriveStatus();updateCount();readiness();
  }
  window.FFA_CASE_HUB={selectAction,refreshActions,reset,reportAppend,readiness};
  renderProofs();renderNotes();deriveStatus();updateCount();readiness();
})();
