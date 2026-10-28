// Tests the two-stage visibility contract with a simulated DOM, not a real browser.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'static/index.html'),'utf8');
const questions=JSON.parse(fs.readFileSync(path.join(root,'data/questions.json'),'utf8'));
const flush=async()=>{await new Promise(setImmediate);await new Promise(setImmediate);};
let registry=null;
class Element{
 constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.hidden=false;this.disabled=false;this.value='';this.valid=true;this.classList={toggle(){}};}
 set id(v){this._id=v;if(registry)registry.set(v,this);} get id(){return this._id;}
 append(...c){this.children.push(...c);} replaceChildren(...c){this.children=c;}
 setAttribute(k,v){this[k]=v;} addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
 emit(k){for(const fn of this.listeners[k]??[])fn({preventDefault(){}});}
 querySelectorAll(tag){return this.children.flatMap(n=>[...(n.tag===tag?[n]:[]),...n.querySelectorAll(tag)]);}
 reportValidity(){return this.valid;} remove(){} click(){this.emit('click');}
}
function setup(){
 const nodes=new Map(); registry=nodes;
 for(const m of html.matchAll(/id="([^"]+)"/g))nodes.set(m[1],new Element());
 const doc={getElementById:id=>nodes.get(id),createElement:tag=>new Element(tag),body:new Element('body')};
 const fetch=async(url,options)=>({ok:true,json:async()=>url==='/api/questions'?{questions}:{facts:JSON.parse(options.body).facts,actions:[],completed:{},notices:[],unknown_questions:[]}});
 vm.runInNewContext(fs.readFileSync(path.join(root,'static/app.js'),'utf8'),{document:doc,fetch,AbortController,setTimeout:()=>{},URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},console,window:{open(){}}});
 return nodes;
}
test('initial screen shows only form, not the results panel; success reveals results',async()=>{
 assert.match(html,/id="results-panel"[^>]*hidden/);
 assert.match(html,/Show my next steps/);
 const nodes=setup(); await flush();
 assert.equal(nodes.get('form-panel').hidden,false);
 assert.equal(nodes.get('results-panel').hidden,true);
 nodes.get('incident-form').emit('submit'); await flush();
 assert.equal(nodes.get('form-panel').hidden,true);
 assert.equal(nodes.get('results-panel').hidden,false);
});
test('Edit answers and Clear session return the user to the form view',async()=>{
 const nodes=setup(); await flush();
 nodes.get('incident-form').emit('submit');await flush();
 nodes.get('edit-answers').emit('click');
 assert.equal(nodes.get('form-panel').hidden,false);
 assert.equal(nodes.get('results-panel').hidden,true);
 nodes.get('incident-form').emit('submit');await flush();
 nodes.get('reset').emit('click');
 assert.equal(nodes.get('form-panel').hidden,false);
 assert.equal(nodes.get('results-panel').hidden,true);
});
