import fs from 'node:fs';
import assert from 'node:assert/strict';
import Clipper from 'clipper-lib';
import {FONT_FILES,parseFont,buildGeometry,svgDocument} from './geometry.js';
let count=0;
for(const [fontKey,file] of Object.entries(FONT_FILES)){
 const b=fs.readFileSync('./'+file),font=parseFont(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));
 const base={text:'DigiFactory',font:fontKey,material:'black',textColor:'#ffffff',width:80,border:2.5,hole:4,decorations:[{shape:'flame',color:'#ff3a30',size:90,gap:1.5}]};
 const single=buildGeometry(base,font);
 for(const [text,width,border,shape] of [['Digi\nFactory',80,2.5,'flame'],['A\nB\nC',40,1.5,'none'],['Jean\nLuc',140,5,'skull'],['Digi\n\nFactory\n',80,2.5,'flame']]){
  const g=buildGeometry({...base,text,width,border,decorations:[{...base.decorations[0],shape}]},font);
  assert(Math.abs(g.width-width)<.03,`${fontKey}: width ${g.width}`);
  assert(g.fontHeight>=4);
  assert.equal(Clipper.Clipper.PointInPolygon({X:g.hole.x*1000,Y:g.hole.y*1000},g.outer),1);
  if(text==='Digi\nFactory')assert(g.height>single.height);
  for(const mode of ['laser','uv','result']){const svg=svgDocument(g,mode);assert(!/NaN|Infinity|<text/.test(svg));assert(svg.includes(`viewBox="0 0 ${g.width} ${g.height}"`));}
  count++;
 }
}
console.log(`${count} compositions multilignes vérifiées sur les quatre polices, avec dimensions et exports concordants.`);
