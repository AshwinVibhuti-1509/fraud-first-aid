// Optional DOM acceptance with jsdom; no browser rendering claims.
// Run with jsdom installed in test tooling (not an application dependency).
const {test}=require('node:test');const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const flush=async()=>{await new Promise(setImmediate);await new Promise(setImmediate)};
const questions=JSON.parse(fs.readFileSync(path.join(root,'data/questions.json')));
async function fixture(){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'static/guided.html'),'utf8'),{url:'http://localhost/',runScripts:'outside-only'});
 const w=dom.window,requests=[],downloads=[];
 w.URL.createObjectURL=()=>{downloads.push('download');return 'blob:fixture'};w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){};
 w.fetch=(url,options)=>{
  if(url==='/api/questions')return Promise.resolve({ok:true,json:async()=>({questions})});
  return new Promise((resolve,reject)=>requests.push({url,body:JSON.parse(options.body),resolve,reject,options}));
 };
 w.eval(fs.readFileSync(path.join(root,'static/guided.js'),'utf8'));await flush();
 const $=id=>w.document.getElementById(id);const click=id=>$(id).click();
 const answer=v=>{$('answer').value=v;$('answer').dispatchEvent(new w.Event('change'));click('question-next')};
 const form=()=>{click('choose-category');click('category-next');for(const v of ['IN','yes','yes','upi','no','no','no','no'])answer(v);};
 const respond=(req,actions=[])=>req.resolve({ok:true,json:async()=>({facts:req.body.facts,details:req.body.details,completed:{},actions,notices:[],unknown_questions:[]})});
 return {dom,w,requests,downloads,$,click,answer,form,respond};
}

test('three entries exist; screenshot proposals are explicit and never sent automatically',async()=>{
 const f=await fixture();try{
 assert.equal(f.w.document.querySelectorAll('input[type=file]').length,0);
 f.click('choose-image');f.click('demo-proposals');assert.equal(f.requests.length,0);
 f.click('apply-demo');assert.equal(f.$('amount').value,'4500');assert.equal(f.$('share-notes').checked,false);
 for(const q of questions){assert.equal(f.$('question-title').textContent,q.prompt);assert.equal(f.$('answer').options.length,q.options.length);f.click('question-next');}
 f.click('build-plan');assert.equal(f.requests.length,1);assert.equal(f.requests[0].body.facts.suspected_fraud,'unknown');assert.deepEqual(f.requests[0].body.details,{});
 }finally{f.dom.window.close()}
});
test('description stays local until review and optional-detail opt-in',async()=>{
 const f=await fixture();try{f.click('choose-description');f.$('description').value='Fictional note';f.click('description-next');
 assert.equal(f.requests.length,0);for(let i=0;i<8;i++)f.click('question-next');
 f.click('build-plan');assert.deepEqual(f.requests[0].body.details,{});f.respond(f.requests[0]);await flush();
 f.click('edit-plan');f.$('share-notes').checked=true;f.click('build-plan');assert.equal(f.requests[1].body.details.notes,'Fictional note');
 }finally{f.dom.window.close()}
});
test('OTHER immediately hides India contacts and reset restores them',async()=>{
 const f=await fixture();try{f.click('choose-category');f.$('category').value='sim';f.click('category-next');
 f.answer('OTHER');assert.equal(f.$('urgent-links').hidden,true);assert.equal(f.$('urgent').hidden,true);
 assert.equal(f.$('answer').value,'unknown');f.click('clear-session');assert.equal(f.$('urgent-links').hidden,false);assert.equal(f.$('home').hidden,false);
 }finally{f.dom.window.close()}
});
test('reset invalidates stale plan and export responses and clears sensitive fields',async()=>{
 const f=await fixture();try{f.form();f.$('notes').value='Fictional confidential note';f.click('build-plan');f.click('clear-session');f.respond(f.requests[0]);await flush();
 assert.equal(f.$('home').hidden,false);assert.equal(f.$('notes').value,'');assert.equal(f.$('actions-screen').hidden,true);
 f.form();f.click('build-plan');f.respond(f.requests[1]);await flush();f.click('download-plan');f.click('clear-session');
 f.requests[2].resolve({ok:true,blob:async()=>new f.w.Blob(['fixture'])});await flush();assert.equal(f.downloads.length,0);
 }finally{f.dom.window.close()}
});
test('network errors preserve answers and permit retry; text cannot inject HTML',async()=>{
 const f=await fixture();try{f.form();f.click('build-plan');f.requests[0].reject(new Error('Network unavailable'));await flush();
 assert.equal(f.$('error').hidden,false);assert.equal(f.$('build-plan').disabled,false);f.click('build-plan');
 f.respond(f.requests[1],[{action_id:'A06',title:'<img src=x onerror=alert(1)>',reason:'why',action_text:'<script>bad</script>',completion_token:'a'.repeat(64),source:null}]);await flush();
 assert.equal(f.$('action-list').querySelectorAll('img,script').length,0);assert.match(f.$('action-list').textContent,/<img/);
 }finally{f.dom.window.close()}
});
test('completion tokens are forwarded unchanged when editing and reassessing',async()=>{
 const f=await fixture();try{f.form();f.click('build-plan');f.respond(f.requests[0],[{action_id:'A06',title:'Organise facts',reason:'why',action_text:'how',completion_token:'b'.repeat(64),source:null}]);await flush();
 const check=f.$('action-list').querySelector('input');check.click();f.click('edit-plan');f.click('review-edit');for(const v of ['IN','yes','yes','upi','no','yes','no','no'])f.answer(v);f.click('build-plan');
 assert.equal(f.requests[1].body.completed.A06,'b'.repeat(64));assert.equal(f.requests[1].body.facts.remote_access,'yes');
 }finally{f.dom.window.close()}
});
