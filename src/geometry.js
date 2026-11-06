import {STICKER_MOTIFS} from './sticker-motifs.js';
import opentype from 'opentype.js';
import ClipperLib from 'clipper-lib';
export const FONT_FILES={"bagelfatone": "assets/bagelfatone.ttf", "modak": "assets/modak.ttf", "bowlbyonesc": "assets/bowlbyonesc.ttf", "bricolagegrotesque": "assets/bricolagegrotesque.ttf"};
export const MATERIALS={white:{name:'Plexi blanc',fill:'#ffffff'},black:{name:'Plexi noir',fill:'#17191c'},wood:{name:'Bois clair',fill:'url(#material-wood)'}};
export const MOTIFS={none:{name:'Aucun',d:''},...STICKER_MOTIFS};
const S=1000;
const toInt=p=>({X:Math.round(p.x*S),Y:Math.round(p.y*S)});
function flatten(commands){let paths=[],p=[],cur={x:0,y:0},start;const add=q=>{p.push(toInt(q));cur=q;};for(const c of commands){if(c.type==='M'){if(p.length>2)paths.push(p);p=[];add({x:c.x,y:c.y});start=cur;}else if(c.type==='L')add({x:c.x,y:c.y});else if(c.type==='C'||c.type==='Q'){const from=cur;const len=Math.hypot(c.x-from.x,c.y-from.y)+Math.hypot(c.x1-from.x,c.y1-from.y)+(c.type==='C'?Math.hypot(c.x2-c.x,c.y2-c.y):0);const n=Math.max(6,Math.ceil(len/.16));for(let i=1;i<=n;i++){let t=i/n,u=1-t;add(c.type==='C'?{x:u*u*u*from.x+3*u*u*t*c.x1+3*u*t*t*c.x2+t*t*t*c.x,y:u*u*u*from.y+3*u*u*t*c.y1+3*u*t*t*c.y2+t*t*t*c.y}:{x:u*u*from.x+2*u*t*c.x1+t*t*c.x,y:u*u*from.y+2*u*t*c.y1+t*t*c.y});}}else if(c.type==='Z'){if(p.length>2)paths.push(p);p=[];cur=start;}}if(p.length>2)paths.push(p);return paths;}
function exteriors(paths){const c=new ClipperLib.Clipper();c.AddPaths(paths,ClipperLib.PolyType.ptSubject,true);let tree=new ClipperLib.PolyTree();c.Execute(ClipperLib.ClipType.ctUnion,tree,ClipperLib.PolyFillType.pftNonZero,ClipperLib.PolyFillType.pftNonZero);return tree.Childs().map(n=>n.Contour());}
function offset(paths,amount,open=false){let co=new ClipperLib.ClipperOffset(2,.03*S);co.AddPaths(paths,ClipperLib.JoinType.jtRound,open?ClipperLib.EndType.etOpenRound:ClipperLib.EndType.etClosedPolygon);let out=new ClipperLib.Paths();co.Execute(out,amount*S);return out;}
function circle(x,y,r){return Array.from({length:96},(_,i)=>toInt({x:x+r*Math.cos(i*2*Math.PI/96),y:y+r*Math.sin(i*2*Math.PI/96)}));}
function connect(parts,thickness){let merged=exteriors(parts),limit=0;while(merged.length>1&&limit++<40){let best={d:Infinity};const first=merged.reduce((a,b)=>Math.abs(ClipperLib.Clipper.Area(a))>Math.abs(ClipperLib.Clipper.Area(b))?a:b);for(const other of merged){if(other===first)continue;for(let i=0;i<first.length;i+=2)for(let j=0;j<other.length;j+=2){const a=first[i],b=other[j],d=(a.X-b.X)**2+(a.Y-b.Y)**2;if(d<best.d)best={a,b,d};}}const bridge=offset([[best.a,best.b]],thickness/2,true);merged=exteriors([...merged,...bridge]);}if(merged.length!==1)throw Error('Le contour ne peut pas être relié. Essaie un autre texte ou une bordure plus large.');return merged;}
function bounds(paths){const all=paths.flat();return {x1:Math.min(...all.map(p=>p.X))/S,y1:Math.min(...all.map(p=>p.Y))/S,x2:Math.max(...all.map(p=>p.X))/S,y2:Math.max(...all.map(p=>p.Y))/S};}
function svgToContours(d){/* Motif contours use M/L/C only; details may use arcs and stay separate. */const tokens=d.match(/[A-Za-z]|-?\d*\.?\d+/g);let cmds=[],i=0,kind;while(i<tokens.length){if(/[A-Za-z]/.test(tokens[i]))kind=tokens[i++];if(kind==='Z'){cmds.push({type:'Z'});kind=null;continue;}const count={M:2,L:2,C:6,Q:4,H:1,V:1}[kind];if(!count)throw Error('Motif non reconnu');const a=tokens.slice(i,i+count).map(Number);i+=count;const previous=cmds.at(-1);if(kind==='H')cmds.push({type:'L',x:a[0],y:previous.y});else if(kind==='V')cmds.push({type:'L',x:previous.x,y:a[0]});else cmds.push(kind==='C'?{type:kind,x1:a[0],y1:a[1],x2:a[2],y2:a[3],x:a[4],y:a[5]}:kind==='Q'?{type:kind,x1:a[0],y1:a[1],x:a[2],y:a[3]}:{type:kind,x:a[0],y:a[1]});}return flatten(cmds);}
export function parseFont(buffer){return opentype.parse(buffer);}
export function validate(config,font){if(config.lineGap!==undefined&&(!Number.isFinite(config.lineGap)||config.lineGap<0||config.lineGap>12))throw Error('Choisis un interligne entre 0 et 12 mm.');if(!config.text.trim())throw Error('Saisis un prénom ou un texte pour créer le porte-clés.');if([...config.text].length>18)throw Error('Le texte est limité à 18 caractères.');for(const char of config.text){if(![' ','\n','\r'].includes(char)&&font.charToGlyphIndex(char)===0)throw Error(config.font==='gemstone'?'Gemstone ne contient pas de lettres accentuées. Modifie le texte ou choisis une autre police.':`Le caractère « ${char} » n’est pas disponible dans cette police.`);}for(const item of config.decorations){if(item.gap!==undefined&&(!Number.isFinite(item.gap)||item.gap<0||item.gap>12))throw Error('Choisis un écart du motif entre 0 et 12 mm.');}if(config.width<40||config.width>140||!Number.isFinite(config.width))throw Error('Choisis une largeur entre 40 et 140 mm.');if(config.border<1.5||config.border>5||!Number.isFinite(config.border))throw Error('Choisis une bordure entre 1,5 et 5 mm.');if(config.hole<3||config.hole>6||!Number.isFinite(config.hole))throw Error('Choisis un trou entre 3 et 6 mm.');}
function linePath(text,font,size){const path=new opentype.Path();const chars=[...text];let advance=0;for(let i=0;i<chars.length;i++){const glyph=font.charToGlyph(chars[i]);path.extend(glyph.getPath(advance,0,size,{},font));advance+=(glyph.advanceWidth||0)/font.unitsPerEm*size;if(i+1<chars.length)advance+=font.getKerningValue(glyph,font.charToGlyph(chars[i+1]))/font.unitsPerEm*size;}return path;}
function generate(config,font,size){
const lines=config.text.trim().normalize('NFC').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
const rows=lines.map(line=>{const path=linePath(line,font,size);return {path,bb:bounds(flatten(path.commands))};});
const lineHeight=Math.min(...rows.map(row=>row.bb.y2-row.bb.y1));
let path=rows[0].path;
if(rows.length>1){
 path=new opentype.Path();
 const maxWidth=Math.max(...rows.map(row=>row.bb.x2-row.bb.x1));let top=0;
 for(const row of rows){
  const dx=(maxWidth-(row.bb.x2-row.bb.x1))/2-row.bb.x1,dy=top-row.bb.y1;
  path.extend(row.path.commands.map(command=>{const c={...command};for(const key of ['x','x1','x2'])if(key in c)c[key]+=dx;for(const key of ['y','y1','y2'])if(key in c)c[key]+=dy;return c;}));
  top+=row.bb.y2-row.bb.y1+(config.lineGap??size*.18);
 }
}
let glyphs=flatten(path.commands);let bb=bounds(glyphs);let tx=-bb.x1,ty=-bb.y1;glyphs=glyphs.map(p=>p.map(q=>({X:q.X+Math.round(tx*S),Y:q.Y+Math.round(ty*S)})));const textW=bb.x2-bb.x1,textH=bb.y2-bb.y1;let solid=offset(exteriors(glyphs),config.border),art=[`<path fill="${config.textColor}" d="${path.toPathData(4)}" transform="translate(${tx} ${ty})"/>`];let right=textW,left=0;
for(const item of config.decorations){
 if(item.shape==='none')continue;
 const motif=MOTIFS[item.shape],w=Math.max(7,textH*.92)*item.size/100,y=(textH-w)/2,gap=item.gap??config.border*.6;
 const position=item.position||'right';
 if(!['left','right','both'].includes(position))throw Error('Choisis la position du motif.');
 const placements=[];
 if(position==='left'||position==='both'){left-=gap+w;placements.push(left);}
 if(position==='right'||position==='both'){right+=gap;placements.push(right);right+=w;}
 for(const x of placements){
  const contours=svgToContours(motif.d).map(p=>p.map(q=>({X:Math.round((q.X/S*w/100+x)*S),Y:Math.round((q.Y/S*w/100+y)*S)})));
  solid.push(...offset(exteriors(contours),config.border));
  art.push(`<g data-motif="${item.shape}" transform="translate(${x} ${y}) scale(${w/100})"><path d="${motif.d} ${motif.cutouts||''}" fill="${item.color}" fill-rule="evenodd"/>${motif.detail?`<path d="${motif.detail}" fill="${config.textColor}"/>`:''}</g>`);
 }
}
const hole={x:left-config.border-config.hole/2,y:textH/2,r:config.hole/2};solid.push(circle(hole.x,hole.y,hole.r+config.border));const connected=connect(solid,Math.max(2,config.border*1.5));const b=bounds(connected);return {outer:connected[0],art:art.join(''),hole,bounds:b,width:b.x2-b.x1,height:b.y2-b.y1,fontHeight:lineHeight};}
export function buildGeometry(config,font){validate(config,font);let size=20,g;for(let i=0;i<8;i++){g=generate(config,font,size);if(Math.abs(g.width-config.width)<.003)break;size*=Math.max(.35,Math.min(2.5,(config.width-(config.hole+config.border*3))/(g.width-(config.hole+config.border*3))));}if(g.fontHeight<4)throw Error('Les lettres seraient trop petites. Augmente la largeur ou raccourcis le texte.');const shift={x:-g.bounds.x1,y:-g.bounds.y1};let d=g.outer.map((p,i)=>`${i?'L':'M'}${(p.X/S+shift.x).toFixed(3)} ${(p.Y/S+shift.y).toFixed(3)}`).join(' ')+' Z';return {...g,shift,d,material:config.material||'white',width:+g.width.toFixed(3),height:+g.height.toFixed(3)};}
function holePath(g){const x=g.hole.x+g.shift.x,y=g.hole.y+g.shift.y,r=g.hole.r;return `M ${x+r} ${y} A ${r} ${r} 0 1 0 ${x-r} ${y} A ${r} ${r} 0 1 0 ${x+r} ${y} Z`;}
function materialDefs(material){if(material!=='wood')return '';return `<defs><filter id="material-grain"><feTurbulence type="fractalNoise" baseFrequency="0.025 0.8" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><pattern id="material-wood" patternUnits="userSpaceOnUse" width="100" height="35"><rect width="100" height="35" fill="#dfbf91"/><rect width="100" height="35" filter="url(#material-grain)" opacity="0.12"/><g fill="none" stroke="#ac7c45" stroke-width="0.12" opacity="0.22"><path d="M0 3 Q22 1 48 3 T100 2 M0 8 Q30 5 52 8 T100 7 M0 14 Q18 12 44 14 T100 15 M0 20 Q33 18 70 21 T100 20 M0 27 Q22 24 59 27 T100 26 M0 32 Q40 30 65 33 T100 32"/></g></pattern></defs>`;}
export function svgDocument(g,mode='uv',preview=false){const base=`${g.d} ${holePath(g)}`;const art=`<g transform="translate(${g.shift.x} ${g.shift.y})">${g.art}</g>`;const laser=`<path d="${base}" fill="none" stroke="#000000" stroke-width="0.6"/>`;const material=MATERIALS[g.material]||MATERIALS.white;const content=mode==='laser'?laser:mode==='result'?`${materialDefs(g.material)}<path data-material="${g.material}" d="${base}" fill="${material.fill}" fill-rule="evenodd"/>${art}`:art;return `<svg xmlns="http://www.w3.org/2000/svg" width="${g.width}mm" height="${g.height}mm" viewBox="0 0 ${g.width} ${g.height}">${content}</svg>`;}
