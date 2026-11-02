const NS='http://www.w3.org/2000/svg';
export async function createScoreboard(host){
 const template=await fetch('/assets/template.svg').then(r=>r.text());const doc=new DOMParser().parseFromString(template,'image/svg+xml');const svg=document.importNode(doc.documentElement,true);host.replaceChildren(svg);svg.setAttribute('aria-label','比赛计分条');
 // Preserve the approved paths; replace the fixed strings with safe text nodes.
 const left=svg.querySelector('#left-player'),right=svg.querySelector('#right-player');
 const round=svg.querySelector('#round-label');
 const texts=[left.querySelectorAll('text'),right.querySelectorAll('text')];
 for(const [i,g]of [left,right].entries()){
  const im=document.createElementNS(NS,'image');im.setAttribute('x',i?'1678':'194');im.setAttribute('y','12');im.setAttribute('width','48');im.setAttribute('height','48');im.setAttribute('preserveAspectRatio','xMidYMid meet');im.dataset.logo='true';g.append(im);
 }
 const allGradientStops=[...svg.querySelectorAll('#rim stop,#score stop')];
 const fit=(el,value,max)=>{el.textContent=value;el.removeAttribute('textLength');el.removeAttribute('lengthAdjust');if(value&&el.getComputedTextLength()>max){el.setAttribute('textLength',max);el.setAttribute('lengthAdjust','spacingAndGlyphs');}};
 function draw(state){
  svg.style.visibility=state.visible?'visible':'hidden';svg.style.opacity=state.style.opacity;
  svg.querySelectorAll('#face stop').forEach((s,i)=>s.setAttribute('stop-color',shade(state.style.background,[.08,0,.04][i])));
  allGradientStops.forEach((s,i)=>s.setAttribute('stop-color',shade(state.style.accent,[.04,-.14,0,-.09,.04,-.1][i])));
  for(const [i,g] of [left,right].entries()){
   const player=i?state.right:state.left;const t=texts[i];const logo=g.querySelector('image');logo.setAttribute('href',player.icon||'');logo.style.display=player.icon?'':'none';t[0].style.display=player.icon?'none':'';t[0].textContent=player.id.slice(0,1).toUpperCase()||'—';t[0].setAttribute('fill',state.style.text);
   t[1].setAttribute('fill',state.style.identity);t[2].setAttribute('fill',state.style.text);
   // Reserve a stable identity region and name region; long labels never reach the lamps.
   if(i){t[1].setAttribute('x','1302');t[1].setAttribute('font-size','13');t[2].setAttribute('x','1610');}else{t[1].setAttribute('x','323');t[2].setAttribute('x','454');}
   fit(t[1],player.identity,i?139:120);fit(t[2],player.id,i?160:174);fit(t[3],String(player.score),46);
  }
  round.style.display=state.round?'':'none';fit(round.querySelector('text'),state.round,248);
 }
 return {svg,draw};
}
function shade(hex,amount){return '#'+[1,3,5].map(i=>Math.max(0,Math.min(255,parseInt(hex.slice(i,i+2),16)+Math.round(amount*255))).toString(16).padStart(2,'0')).join('');}
