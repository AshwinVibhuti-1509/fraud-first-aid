const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'static/guided.html'),'utf8');
const js=fs.readFileSync(path.join(root,'static/guided.js'),'utf8');
const styles=fs.readFileSync(path.join(root,'static/guided.css'),'utf8');
test('core workflow present and no broken option markup',()=>{
 for(const id of ['choose-image','choose-category','choose-description','triage-screen','proposals-screen','bank-panel','police-panel','workspace-screen','print-report','image-consent'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.doesNotMatch(html,/<\/option\s+value/i);
 assert.match(html,/<option value="payment">Suspicious UPI or other payment<\/option>/);
});
test('reporting is first-screen and official',()=>{
 assert.match(html,/href="tel:1930"/); assert.match(html,/href="https:\/\/cybercrime\.gov\.in\/"/);
});
test('no silent persistence or unsafe HTML injection in guided controller',()=>{
 for(const bad of ['localStorage','sessionStorage','indexedDB','innerHTML','document.write'])assert.equal(js.includes(bad),false,bad);
 assert.match(js,/redact|Redact|redaction/);
 assert.match(styles,/@media print/);
});
test('privacy gates before image analysis',()=>{
 assert.match(js,/image-consent/);
 assert.match(js,/sanitized_preview_confirmed/);
 assert.match(js,/canvas\.toDataURL\('image\/png'\)/);
});
