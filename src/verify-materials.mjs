import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createCanvas,Image} from '@napi-rs/canvas';
import {JSDOM} from 'jsdom';
import {buildGeometry,parseFont,svgDocument,MATERIALS} from './geometry.js';
const b=fs.readFileSync('distassets/shorebreak.otf');
const font=parseFont(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));
const cfg={text:'Chris',font:'shorebreak',textColor:'#2589cf',width:80,border:2.5,hole:4,decorations:[{shape:'skull',color:'#ff784f',size:100}]};
let expectedLaser,expectedUV;
async function raster(svg,g){const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=Buffer.from(svg);});const ratio=20,c=createCanvas(Math.round(g.width*ratio),Math.round(g.height*ratio)),ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);const doc=new JSDOM(svg,{contentType:'image/svg+xml'}).window.document;const t=doc.querySelector('svg > g > g').getAttribute('transform').match(/translate\(([^ ]+) ([^)]+)\) scale\(([^)]+)\)/);const at=(x,y)=>[...ctx.getImageData(Math.round((g.shift.x+ +t[1]+x* +t[3])*ratio),Math.round((g.shift.y+ +t[2]+y* +t[3])*ratio),1,1).data];return {at,canvas:c};}
for(const key of Object.keys(MATERIALS)){
 const g=buildGeometry({...cfg,material:key},font),laser=svgDocument(g,'laser'),uv=svgDocument(g,'uv'),result=svgDocument(g,'result');
 if(expectedLaser){assert.equal(laser,expectedLaser);assert.equal(uv,expectedUV);}else{expectedLaser=laser;expectedUV=uv;}
 assert(!uv.includes('data-material'));assert(!uv.includes('<defs>'));assert.equal((laser.match(/M /g)||[]).length,1);assert(result.includes(`data-material="${key}"`));
 const ur=await raster(uv,g);for(const point of [[28,44],[72,44],[50,65]])assert.equal(ur.at(...point)[3],0,`${key} cutout opacity`);assert.deepEqual(ur.at(50,24),[255,120,79,255]);
 const pr=await raster(result,g);const eye=pr.at(28,44);assert.equal(eye[3],255);if(key==='black')assert.deepEqual(eye,[23,25,28,255]);if(key==='white')assert.deepEqual(eye,[255,255,255,255]);if(key==='wood')assert(eye[0]>eye[1]&&eye[1]>eye[2]);fs.writeFileSync(`/tmp/keychain-material-${key}.svg`,result);fs.writeFileSync(`/tmp/keychain-material-${key}.png`,await pr.canvas.encode('png'));
}
console.log('Trois supports vérifiés : yeux et nez transparents en UV, matériau visible dans l’aperçu, exports laser et UV indépendants du support.');
