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


test('Maps encodes locality and never includes incident notes',async()=>{
 const f=await fixture(),opened=[];f.context.window={open:(...args)=>opened.push(args)};
 f.nodes.get('police-locality').value='Whitefield & Main / Road';f.nodes.get('police-region').value='East';
 f.nodes.get('notes').value='PRIVATE INCIDENT';f.nodes.get('maps-search').emit('click');
 const u=new URL(opened[0][0]);assert.equal(u.origin,'https://www.google.com');assert.equal(u.pathname,'/maps/search/');
 assert.equal(u.searchParams.get('api'),'1');assert.equal(u.searchParams.get('query'),'cybercrime police assistance near Whitefield & Main / Road, Bengaluru, Karnataka, India');
 assert.equal(opened[0][2],'noopener,noreferrer');assert.ok(!opened[0][0].includes('PRIVATE'));
 f.nodes.get('police-locality').value='';f.nodes.get('maps-search').emit('click');assert.ok(decodeURIComponent(opened[1][0]).includes('East Bengaluru'));
});
test('Another country hides India contacts and blocks Maps; reset restores and clears locality',async()=>{
 const f=await fixture(),opened=[];f.context.window={open:(...args)=>opened.push(args)};
 assert.ok(f.nodes.get('q-country').children.some(n=>n.value==='OTHER'));
 f.nodes.get('q-country').value='OTHER';f.nodes.get('q-country').emit('change');
 for(const id of ['urgent','header-1930','india-resources'])assert.equal(f.nodes.get(id).hidden,true);
 f.nodes.get('maps-search').emit('click');assert.equal(opened.length,0);
 f.nodes.get('police-locality').value='Jayanagar';f.nodes.get('police-resources').open=true;f.nodes.get('bank-resources').open=true;
 f.nodes.get('reset').emit('click');
 assert.equal(f.nodes.get('police-locality').value,'');assert.equal(f.nodes.get('police-region').value,'Central');
 for(const id of ['urgent','header-1930','india-resources'])assert.equal(f.nodes.get(id).hidden,false);
 for(const id of ['police-resources','bank-resources'])assert.equal(f.nodes.get(id).open,false);
});
