const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'static/guided.html'),'utf8');
const guided=fs.readFileSync(path.join(root,'static/guided.js'),'utf8');
const casework=fs.readFileSync(path.join(root,'static/casework.js'),'utf8');
test('country selector is in persistent header; country question excluded from guided screens',()=>{
 assert.match(html,/<header[^>]*class="topbar"[\s\S]*id="guidance-country"/);
 assert.match(html,/<option value="OTHER">Outside India · limited<\/option>/);
 assert.match(guided,/questions\.filter\(q=>q\.field!=='country'\)/);
 assert.match(guided,/\$\('india-actions'\)\.hidden=!indian/);
 assert.match(html,/id="country-hint"/);
});
test('multi evidence locker has batch validation and atomic append, without server upload',()=>{
 assert.match(html,/<input id="cw-proof-file"[^>]*multiple/);
 assert.match(casework,/MAX_FILES = 12/);
 assert.match(casework,/MAX_TOTAL = 12 \* 1024 \* 1024/);
 assert.match(casework,/proofs\.push\(\.\.\.incoming\)/);
 assert.doesNotMatch(casework.replace(/\/\*[\s\S]*?\*\//g,''),/fetch\s*\(/);
});
test('screenshot intake requires per-image review and opt-in; server receives only flattened PNG',()=>{
 assert.match(html,/<input id="image-input"[^>]*multiple/);
 assert.match(html,/id="image-review"/);
 assert.match(guided,/imageQueue\.some\(x=>!x\.reviewed\)/);
 assert.match(guided,/item\.preview,mode,consent:true,sanitized_preview_confirmed:true/);
 assert.match(guided,/item\.preview=canvas\.toDataURL\('image\/png'\)/);
});
