(()=>{
'use strict';
const D=window.TOUR_DATA,$=id=>document.getElementById(id),V=$('viewport'),frame=$('imageFrame'),image=$('sceneImage');
let current=null,pending=null,token=0,scale=1,panX=0,panY=0,fit=false,nw=1600,nh=960,pointers=new Map(),gesture=null;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function render(){
 const w=V.clientWidth,h=V.clientHeight,base=fit?Math.min(w/nw,Math.max(180,h-300)/nh):Math.max(w/nw,h/nh),iw=nw*base*scale,ih=nh*base*scale;
 panX=clamp(panX,-Math.max(0,(iw-w)/2),Math.max(0,(iw-w)/2));panY=clamp(panY,-Math.max(0,(ih-h)/2),Math.max(0,(ih-h)/2));
 frame.style.width=iw+'px';frame.style.height=ih+'px';frame.style.transform=`translate(calc(-50% + ${panX}px),calc(-50% + ${panY+(fit?-25:0)}px))`;
 $('zoomValue').textContent=scale.toFixed(1)+'×';$('fitButton').setAttribute('aria-pressed',String(fit));$('tour').classList.toggle('fit',fit);
 window.__TOUR_STATE={scene:current?.id??null,loading:!!pending,scale,panX,panY,fit,renderedWidth:iw,renderedHeight:ih};
}
function reset(){scale=1;panX=panY=0;fit=false;render()}
function zoom(amount){scale=clamp(scale*amount,1,2.5);render()}
function loadScene(id,fromHistory=false){
 const node=D.scenes.find(n=>n.id===id)||D.scenes[0],request=++token;pending=node; $('error').hidden=true;$('loading').hidden=false;render();
 const incoming=new Image();incoming.decoding='async';
 incoming.onload=()=>{if(request!==token)return;nw=incoming.naturalWidth;nh=incoming.naturalHeight;image.src=incoming.src;image.alt=node.alt||node.title;current=node;pending=null;$('loading').hidden=true;reset();
  $('sceneTitle').textContent=node.title;$('sceneDescription').textContent=node.description;$('number').textContent=String(D.scenes.indexOf(node)+1).padStart(2,'0');$('sceneCount').textContent=String(D.scenes.length).padStart(2,'0');
  $('nextScenes').replaceChildren(...node.next.map(id=>{const target=D.scenes.find(n=>n.id===id);const b=document.createElement('button');b.textContent=node.via?.[id]||target.short;b.addEventListener('click',()=>loadScene(id));return b}));
  if(!fromHistory&&location.hash!=='#'+node.id)history.pushState({scene:node.id},'', '#'+node.id);
  document.title=`${node.title} · 長 chang 空间浏览`;updateCurrent();$('announcement').textContent='已进入'+node.title;window.dispatchEvent(new Event('scenechange'));
 };
 incoming.onerror=()=>{if(request!==token)return;$('loading').hidden=true;$('error').hidden=false;$('stay').hidden=!current;render()};
 incoming.src=node.image+(node.retry?'?retry='+Date.now():'');
}
function updateCurrent(){document.querySelectorAll('[data-scene]').forEach(el=>{const same=el.dataset.scene===current.id;el.classList.toggle('current',same);el.setAttribute('aria-current',same?'location':'false')})}
const svgNS='http://www.w3.org/2000/svg';
function S(tag,attrs={},text){const e=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!=null)e.textContent=text;return e}
function buildMap(){
 const svg=S('svg',{viewBox:'-1 -1 26 21.3',role:'img','aria-label':'R18平面定位，编号为可浏览视点'}),g=S('g',{transform:'translate(0 18.5) scale(1 -1)'});svg.append(g);
 const pts=p=>p.map(a=>a.join(',')).join(' ');
 g.append(S('polygon',{points:pts(D.map.site),fill:'#ddd7c9',stroke:'#555e50','stroke-width':.09}));
 D.map.zones.forEach((z,i)=>g.append(S('polygon',{points:pts(z.points),fill:['#d6b985','#e9dfc9','#e0c69b','#b6c7be','#b9cbbd','#ebc891','#e0e4d4','#d4dacb','#b6c7be'][i]||'#ddd',stroke:'none'})));
 D.map.fixtures.forEach(r=>g.append(S('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:'#a2967c',stroke:'#685e49','stroke-width':.035,opacity:.6})));
 D.map.columns.forEach(r=>g.append(S('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:'#405046'})));
 D.map.walls.forEach(l=>g.append(S('polyline',{points:pts(l),fill:'none',stroke:'#495c50','stroke-width':.09})));
 D.map.glass.forEach(l=>g.append(S('polyline',{points:pts(l),fill:'none',stroke:'#3c8d94','stroke-width':.06})));
 Object.entries(D.map.doors).forEach(([id,d])=>{const a=d.a,b=d.b;g.append(S('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:id==='D08'?'#c77d2e':'#f8f4e9','stroke-width':.14}));if(id==='D08'){g.append(S('path',{d:'M15 5.8 L16.2 5.8 M15 7 A1.2 1.2 0 0 0 16.2 5.8',fill:'none',stroke:'#ad702b','stroke-width':.045}));}});
 const labels=[['员工修复',3.1,10.9],['咖啡 / 交流',7,2],['拼装',11.23,7.2],['珍藏 + 格纳库',20,4.6],['故事阅读 / 观展咖啡',19.6,15.6],['主吧',1.5,1.2],['特调',2.4,5.6]];
 labels.forEach(([t,x,y])=>svg.append(S('text',{x,y:18.5-y,'font-size':.42,'text-anchor':'middle',fill:'#405047','font-family':'Microsoft YaHei,sans-serif'},t)));
 svg.append(S('text',{x:15.65,y:18.5-6.4,'font-size':.36,fill:'#875414'},'D08'));
 D.scenes.forEach((n,i)=>{const node=S('g',{class:'node','data-scene':n.id,tabindex:0,role:'button','aria-label':n.title,transform:`translate(${n.position[0]} ${18.5-n.position[1]})`});node.append(S('circle',{r:.46}),S('text',{y:.02},String(i+1)));node.addEventListener('click',()=>{closeAll();loadScene(n.id)});node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();closeAll();loadScene(n.id)}});svg.append(node)});
 $('map').append(svg);
 D.scenes.forEach((n,i)=>{const b=document.createElement('button');b.dataset.scene=n.id;b.textContent=String(i+1).padStart(2,'0')+' '+n.short;b.onclick=()=>{closeAll();loadScene(n.id)};$('mapNodes').append(b);const c=document.createElement('button');c.className='scene-card';c.dataset.scene=n.id;const img=document.createElement('img');img.loading='lazy';img.src=n.image;img.alt=n.title;const txt=document.createElement('span');txt.textContent=String(i+1).padStart(2,'0')+' · '+n.title;c.append(img,txt);c.onclick=()=>{closeAll();loadScene(n.id)};$('sceneGrid').append(c)});
}
function closeAll(){document.querySelectorAll('dialog[open]').forEach(d=>d.close())}
[['mapButton','mapDialog'],['infoButton','infoDialog'],['scenesButton','scenesDialog']].forEach(([b,d])=>{$(b).onclick=()=>$(d).showModal()});
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
$('retry').onclick=()=>{if(pending){pending.retry=true;loadScene(pending.id)}};$('stay').onclick=()=>{token++;pending=null;$('error').hidden=true;render()};
$('zoomIn').onclick=()=>zoom(1.2);$('zoomOut').onclick=()=>zoom(1/1.2);$('resetButton').onclick=reset;$('fitButton').onclick=()=>{fit=!fit;scale=1;panX=panY=0;render()};
$('fullButton').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('tour').requestFullscreen)await $('tour').requestFullscreen();else{fit=true;scale=1;render();$('announcement').textContent='此浏览器不支持全屏，已切换为完整构图。'}}catch{fit=true;scale=1;render()}};
function getGesture(){const arr=[...pointers.values()];return arr.length>1?{x:(arr[0].x+arr[1].x)/2,y:(arr[0].y+arr[1].y)/2,dist:Math.hypot(arr[0].x-arr[1].x,arr[0].y-arr[1].y)}:{x:arr[0]?.x||0,y:arr[0]?.y||0,dist:0}}
V.addEventListener('pointerdown',e=>{V.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});gesture=getGesture();$('gestureHint').textContent='点击“移步至”换个位置'});
V.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=getGesture();if(gesture){panX+=next.x-gesture.x;panY+=next.y-gesture.y;if(gesture.dist&&next.dist)scale=clamp(scale*(next.dist/gesture.dist),1,2.5);render()}gesture=next});
['pointerup','pointercancel','lostpointercapture'].forEach(type=>V.addEventListener(type,e=>{pointers.delete(e.pointerId);gesture=pointers.size?getGesture():null}));
V.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.08:1/1.08)},{passive:false});V.addEventListener('keydown',e=>{const moves={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]};if(moves[e.key]){e.preventDefault();panX+=moves[e.key][0];panY+=moves[e.key][1];render()}else if(e.key==='+'||e.key==='=')zoom(1.2);else if(e.key==='-')zoom(1/1.2);else if(e.key==='Home')reset()});
window.addEventListener('resize',render);window.addEventListener('hashchange',()=>loadScene(location.hash.slice(1),true));window.addEventListener('online',()=>{if(pending)loadScene(pending.id)});
buildMap();loadScene(location.hash.slice(1),true);
})();
