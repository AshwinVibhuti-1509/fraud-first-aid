// Executes the shipped controller with a minimal DOM/fetch fixture.
// These are controller unit tests, NOT browser rendering or end-to-end tests.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const questions=JSON.parse(fs.readFileSync(path.join(root,'data/questions.json')));
const flush=async()=>{await new Promise(setImmediate);await new Promise(setImmediate);};

test('an export failure arriving after reset cannot resurrect an error',async()=>{
 const f=await fixture();f.nodes.get('incident-form').emit('submit');
 f.pending[0].resolve(f.result(f.pending[0]));await flush();
 f.nodes.get('download').emit('click');f.nodes.get('reset').emit('click');
 f.pending[1].reject(new Error('Old export failed'));await flush();
 assert.equal(f.nodes.get('error').hidden,true);
 assert.equal(f.nodes.get('status').textContent,'Session cleared.');
});

test('invalid assessment clears a previous network error',async()=>{
 const f=await fixture();f.nodes.get('incident-form').emit('submit');
 f.pending[0].reject(new Error('Previous network failure'));await flush();
 assert.equal(f.nodes.get('error').hidden,false);
 f.nodes.get('incident-form').valid=false;f.nodes.get('incident-form').emit('submit');
 assert.equal(f.nodes.get('error').hidden,true);
 assert.equal(f.pending.length,1);
});

async function fixture(){
 const nodes=new Map(), pending=[], downloads=[];
 class Element{
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.hidden=false;this.disabled=false;this.value='';this.valid=true;this.classList={toggle(){}};}
  set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
  append(...values){this.children.push(...values);}
  replaceChildren(...values){this.children=[...values];}
  setAttribute(key,value){this[key]=value;}
  addEventListener(name,callback){(this.listeners[name]??=[]).push(callback);}
  emit(name){for(const fn of this.listeners[name]??[])fn({preventDefault(){}});}
  querySelectorAll(tag){return this.children.flatMap(n=>[...(n.tag===tag?[n]:[]),...n.querySelectorAll(tag)]);}
  reportValidity(){return this.valid;}
  click(){if(this.tag==='a')downloads.push(this.download);this.emit('click');}
  remove(){}
 }
 const html=fs.readFileSync(path.join(root,'static/index.html'),'utf8');
 for(const match of html.matchAll(/id="([^"]+)"/g)){const n=new Element();n.id=match[1];}
 nodes.get('demo').value='payment';
 const document={getElementById:id=>nodes.get(id),createElement:tag=>new Element(tag),body:new Element('body')};
 const respond=data=>({ok:true,json:async()=>data,blob:async()=>({})});
 const fetch=(url,options)=>{
  if(url==='/api/questions')return Promise.resolve(respond({questions}));
  return new Promise((resolve,reject)=>pending.push({url,body:JSON.parse(options.body),signal:options.signal,resolve:data=>resolve(respond(data)),reject}));
 };
 const context=vm.createContext({document,fetch,AbortController,setTimeout:fn=>fn(),URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},console});
 vm.runInContext(fs.readFileSync(path.join(root,'static/app.js'),'utf8'),context);
 await flush();
 const result=(request,actions=[])=>({facts:request.body.facts,actions,completed:{},notices:[],unknown_questions:[]});
 return {nodes,pending,downloads,result,context};
}

test('answer change during first request starts a newer assessment',async()=>{
 const f=await fixture();f.nodes.get('incident-form').emit('submit');
 assert.equal(f.pending.length,1);
 f.nodes.get('q-remote_access').value='yes';f.nodes.get('q-remote_access').emit('change');
 assert.equal(f.pending.length,2);
 assert.equal(f.pending[1].body.facts.remote_access,'yes');
 assert.equal(f.pending[0].signal.aborted,true);
});

test('late older response cannot replace the latest assessment',async()=>{
 const f=await fixture();f.nodes.get('incident-form').emit('submit');
 f.nodes.get('q-country').value='OTHER';f.nodes.get('incident-form').emit('submit');
 f.pending[1].resolve(f.result(f.pending[1]));await flush();
 f.pending[0].resolve({...f.result(f.pending[0]),notices:['OUTDATED RESULT']});await flush();
 assert.equal(f.nodes.get('notices').children.length,0);
 assert.equal(f.nodes.get('result').hidden,false);
});

test('reset during a request prevents old results returning',async()=>{
 const f=await fixture();f.nodes.get('incident-form').emit('submit');f.nodes.get('reset').emit('click');
 f.pending[0].resolve(f.result(f.pending[0]));await flush();
 assert.equal(f.nodes.get('result').hidden,true);
 assert.equal(f.nodes.get('status').textContent,'Session cleared.');
});

test('network failure retains answers and hides obsolete results',async()=>{
 const f=await fixture();f.nodes.get('q-payment_channel').value='card';f.nodes.get('incident-form').emit('submit');
 f.pending[0].reject(new Error('Network unavailable'));await flush();
 assert.equal(f.nodes.get('q-payment_channel').value,'card');
 assert.equal(f.nodes.get('result').hidden,true);
 assert.equal(f.nodes.get('error').hidden,false);
 assert.equal(f.nodes.get('download').disabled,true);
});

test('invalid form blocks requests and disables summary export',async()=>{
 const f=await fixture();f.nodes.get('incident-form').valid=false;f.nodes.get('incident-form').emit('submit');
 assert.equal(f.pending.length,0);
 assert.equal(f.nodes.get('download').disabled,true);
});

test('country selection immediately hides India urgent reporting strip',async()=>{
 const f=await fixture();f.nodes.get('q-country').value='OTHER';f.nodes.get('q-country').emit('change');
 assert.equal(f.nodes.get('urgent').hidden,true);
 f.nodes.get('q-country').value='IN';f.nodes.get('q-country').emit('change');
 assert.equal(f.nodes.get('urgent').hidden,false);
});

test('completion is sent to export and a download is requested',async()=>{
 const f=await fixture();f.nodes.get('incident-form').emit('submit');
 const action={action_id:'A06',title:'Organise incident facts',action_text:'Keep facts.',origin:'project_workflow_design',source:null,reason:'Organise.',completion_token:'x'.repeat(64),completed:false};
 f.pending[0].resolve(f.result(f.pending[0],[action]));await flush();
 const check=f.nodes.get('action-A06');check.checked=true;check.emit('change');
 f.nodes.get('download').emit('click');
 assert.equal(f.pending[1].url,'/api/summary');
 assert.equal(f.pending[1].body.completed.A06,'x'.repeat(64));
 f.pending[1].resolve({});await flush();
 assert.deepEqual(f.downloads,['fraud-first-aid-summary.txt']);
});
