import fs from 'node:fs';import assert from 'node:assert/strict';import {JSDOM} from 'jsdom';
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{runScripts:'outside-only',url:'https://example.com/'}),w=dom.window;
w.Blob=Blob;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.structuredClone=structuredClone;
w.HTMLCanvasElement.prototype.getContext=()=>({measureText:()=>({width:0})});
w.fetch=async p=>{const b=fs.readFileSync(p);return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}};
const blobs=new Map();let last;w.URL.createObjectURL=b=>{let id='blob:'+blobs.size;blobs.set(id,b);return id};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){last={name:this.download,blob:blobs.get(this.href)}};
w.eval(fs.readFileSync('app.js','utf8'));await new Promise(r=>setTimeout(r,900));const d=w.document,results=[];
for(const variant of ['left','right','both','multiline']){
 if(variant==='multiline'){d.getElementById('text').value='Digi\nFactory';d.getElementById('text').dispatchEvent(new w.Event('input'));}else{d.querySelector(`[data-position="${variant}"]`).click();}
 await new Promise(r=>setTimeout(r,200));const dims=d.querySelector('#stage svg').getAttribute('viewBox');
 for(const type of ['laser','uv']){last=null;d.getElementById('export-'+type).click();for(let i=0;i<100&&!last;i++)await new Promise(r=>setTimeout(r,50));assert(last,'PDF download missing: '+variant+' '+type);assert(last.name.endsWith('-'+type+'.pdf'));const bytes=Buffer.from(await last.blob.arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');const path='/tmp/'+variant+'-'+type+'.pdf';fs.writeFileSync(path,bytes);results.push({variant,type,path,dims});}
}
fs.writeFileSync('/tmp/pdf-checks.json',JSON.stringify(results));dom.window.close();console.log('Huit exports PDF vérifiés : motif avant, après, deux côtés et texte multiligne.');
