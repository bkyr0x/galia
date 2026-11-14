// ---------------- state ----------------
const S={route:'landing',mode:'demo',after:false,filter:'all',cat:'all',q:'',drawer:null,
 uploads:[],plan:null,planStatus:'draft',todo:{},wear:{apple:true,oura:false,whoop:false,garmin:false},
 chat:[],busy:false,up:{state:'idle'},explain:{},toast:null};
const SAVE_KEYS=['uploads','plan','planStatus','todo','wear','mode'];
try{const s=JSON.parse(localStorage.getItem('galia_web_v1')||'null');if(s){SAVE_KEYS.forEach(k=>{if(s[k]!==undefined)S[k]=s[k]});if(s.lang)L=s.lang;}}catch(e){}
function save(){try{const o={lang:L};SAVE_KEYS.forEach(k=>o[k]=S[k]);localStorage.setItem('galia_web_v1',JSON.stringify(o));}catch(e){}}
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>{if(v==null||v==='')return'–';const n=+v;if(isNaN(n))return esc(v);const s=Math.abs(n)>=100?String(Math.round(n*10)/10):String(Math.round(n*100)/100);return L==='lt'?s.replace('.',','):s;};
const nm=m=>m.name||(L==='lt'?m.lt:m.en);
const statusOf=(v,m)=>{if(m.rl==null||m.rh==null)return'o';if(v<m.rl||v>m.rh)return'x';if(m.ol!=null&&(v<m.ol||v>m.oh))return'n';return'o';};
const stLabel=m=>m.st==='x'?(m.v>m.rh?t('st_hi'):t('st_lo')):m.st==='n'?t('st_n'):t('st_o');
// Demo mode: AI API key not connected → standard prepared answers. Set AI_LIVE=true to use live AI.
const AI_LIVE=false;
let _sp=null;function getSample(){if(!AI_LIVE)return Promise.resolve(null);if(!_sp&&window.claude&&window.claude.use)_sp=window.claude.use('sample').catch(()=>null);return _sp||Promise.resolve(null);}if(AI_LIVE)getSample();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const apiBadge=()=>AI_LIVE?'':`<span class='pill n' style='font-size:12px' title='${t('ai_off')}'>${t('api_badge')}</span>`;

// ---------------- markers ----------------
function markers(){
  const ups=[...S.uploads].sort((a,b)=>a.date.localeCompare(b.date));
  if(S.mode==='demo'){
    return MARKERS.map(b=>{
      const v=(S.after&&b.after!=null)?b.after:b.v;
      const hist=[];
      if(b.prev!=null)hist.push({d:'2025-11',v:b.prev});
      ups.forEach(u=>u.rows.forEach(r=>{if(r.key===b.id&&r.vc!=null)hist.push({d:u.date.slice(0,7),v:r.vc,up:1})}));
      hist.push({d:'2026-11',v:b.v});
      if(S.after&&b.after!=null)hist.push({d:'2027-05',v:b.after});
      const seen={};const h=hist.filter(x=>{const k=x.d+'|'+x.v;if(seen[k])return false;seen[k]=1;return true;}).sort((a,c)=>a.d.localeCompare(c.d));
      return {...b,v,st:statusOf(v,b),hist:h};
    });
  }
  // my data: only uploaded values
  const out=[];
  MARKERS.forEach(b=>{
    const h=[];ups.forEach(u=>u.rows.forEach(r=>{if(r.key===b.id&&r.vc!=null)h.push({d:u.date.slice(0,7),v:r.vc})}));
    if(h.length){const v=h[h.length-1].v;out.push({...b,v,st:statusOf(v,b),hist:h});}
  });
  ups.forEach((u,ui)=>u.rows.forEach((r,ri)=>{if(!r.key&&r.v!=null&&!isNaN(+r.v)){const m={id:`x${ui}_${ri}`,name:r.name,cat:'other',v:+r.v,u:r.unit||'',rl:r.rl??null,rh:r.rh??null,ol:r.rl??null,oh:r.rh??null};m.st=statusOf(m.v,m);m.hist=[{d:u.date.slice(0,7),v:m.v}];out.push(m);}}));
  return out;
}
const counts=ms=>{const c={o:0,n:0,x:0};ms.forEach(m=>c[m.st]++);return c;};
function scoreOf(ms){if(S.mode==='demo')return S.after?91:87;if(!ms.length)return null;const c=counts(ms);return Math.max(40,Math.round(100-(c.x*9+c.n*3)*(30/Math.max(ms.length,30))));}
function bioOf(){return S.mode==='demo'?(S.after?38:44):null;}

// ---------------- plan ----------------
function autoPlan(ms){
  const by={};ms.filter(m=>m.st!=='o').forEach(m=>{(by[m.cat]=by[m.cat]||[]).push(m)});
  const order=Object.keys(by).sort((a,b)=>{const s=k=>by[k].reduce((x,m)=>x+(m.st==='x'?2:1),0);return s(b)-s(a)});
  return order.slice(0,3).map(k=>{const T=TEMPL[k]||TEMPL.other,tx=T[L];return {title:tx[0],why:tx[1],actions:tx[2],markers:by[k].map(m=>m.id),c:T.c,bg:T.bg,cat:k};});
}
function currentPlan(ms){
  if(S.plan&&S.plan.lang===L&&S.plan.mode===S.mode)return S.plan.items;
  return autoPlan(ms);
}

// ---------------- render helpers ----------------
function seg(c,total){const w=k=>Math.max(1.5,(c[k]/Math.max(total,1))*100);return `<div class='seg'><span style='flex:${w('o')};background:var(--good)'></span><span style='flex:${w('n')};background:var(--warn)'></span><span style='flex:${w('x')};background:var(--bad)'></span></div>`;}
function spark(m,w=120,h=34){
  if(!m.hist||m.hist.length<2)return `<span class='tiny mute'>—</span>`;
  const vs=m.hist.map(x=>x.v),mn=Math.min(...vs),mx=Math.max(...vs),r=mx-mn||1;
  const pts=m.hist.map((x,i)=>`${4+i*((w-8)/(m.hist.length-1))},${h-4-((x.v-mn)/r)*(h-8)}`).join(' ');
  const last=pts.split(' ').pop().split(',');
  return `<svg width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' aria-hidden='true'><polyline points='${pts}' fill='none' stroke='var(--ink2)' stroke-width='2'/><circle cx='${last[0]}' cy='${last[1]}' r='4' fill='var(--${m.st==='o'?'good':m.st==='n'?'warn':'bad'})'/></svg>`;
}
function rangeBar(m){
  if(m.rl==null||m.rh==null)return `<div class='small mute'>${L==='lt'?'Blanke norma nenurodyta.':'No reference range on the report.'}</div>`;
  const lo=Math.min(m.rl,m.v)-(m.rh-m.rl)*0.15,hi=Math.max(m.rh,m.v)+(m.rh-m.rl)*0.15;const p=x=>((x-lo)/(hi-lo))*100;
  return `<div style='position:relative;height:58px;margin-top:10px'>
  <div style='position:absolute;top:22px;left:0;right:0;height:12px;border-radius:9px;background:var(--bad-bg)'></div>
  <div style='position:absolute;top:22px;left:${p(m.rl)}%;width:${p(m.rh)-p(m.rl)}%;height:12px;border-radius:9px;background:var(--warn-bg)'></div>
  ${m.ol!=null?`<div style='position:absolute;top:22px;left:${p(m.ol)}%;width:${p(m.oh)-p(m.ol)}%;height:12px;border-radius:9px;background:#BFE6CE'></div>`:''}
  <div style='position:absolute;top:14px;left:calc(${p(m.v)}% - 14px);width:28px;height:28px;border-radius:99px;background:#fff;border:6px solid var(--${m.st==='o'?'good':m.st==='n'?'warn':'bad'});box-shadow:0 3px 8px rgba(0,0,0,.15)'></div>
  <div class='tiny mute' style='position:absolute;top:40px;left:${p(m.rl)}%;translate:-50% 0'>${fmt(m.rl)}</div><div class='tiny mute' style='position:absolute;top:40px;left:${p(m.rh)}%;translate:-50% 0'>${fmt(m.rh)}</div></div>`;
}
function histChart(m){
  if(!m.hist||m.hist.length<2)return `<div class='small mute'>${L==='lt'?'Kol kas vienas matavimas. Įkelk senus tyrimus – atsiras istorija.':'Only one measurement so far. Upload past tests to build a history.'}</div>`;
  const W=440,H=150,vs=m.hist.map(x=>x.v),mn=Math.min(...vs,m.ol??m.rl??Infinity)*0.92,mx=Math.max(...vs,m.oh??m.rh??-Infinity)*1.06;
  const x=i=>30+i*((W-60)/(m.hist.length-1)),y=v=>H-24-((v-mn)/(mx-mn||1))*(H-50);
  const col=v=>`var(--${statusOf(v,m)==='o'?'good':statusOf(v,m)==='n'?'warn':'bad'})`;
  const pts=m.hist.map((h,i)=>`${x(i)},${y(h.v)}`).join(' ');
  const band=m.ol!=null?`<rect x='0' y='${y(Math.min(m.oh,mx))}' width='${W}' height='${Math.max(0,y(Math.max(m.ol,mn))-y(Math.min(m.oh,mx)))}' fill='#E4F4EA'/>`:'';
  return `<svg width='100%' viewBox='0 0 ${W} ${H}' role='img' aria-label='${esc(nm(m))}'>${band}
  <polygon points='${x(0)},${H-24} ${pts} ${x(m.hist.length-1)},${H-24}' fill='rgba(255,74,47,.06)'/><polyline points='${pts}' fill='none' stroke='var(--ink)' stroke-width='2.5'/>
  ${m.hist.map((h,i)=>`<circle cx='${x(i)}' cy='${y(h.v)}' r='${i===m.hist.length-1?7:5}' fill='${col(h.v)}' stroke='#fff' stroke-width='2'/><text x='${x(i)}' y='${y(h.v)-12}' font-size='13' font-weight='700' text-anchor='middle' fill='var(--ink)' font-family='Manrope'>${fmt(h.v)}</text><text x='${x(i)}' y='${H-5}' font-size='11.5' text-anchor='middle' fill='var(--mute)' font-family='Manrope'>${h.d}${h.up?' ↑':''}</text>`).join('')}</svg>`;
}

// ---------------- landing ----------------
function vLanding(){
  const ms=markers();
  return `<header class='topnav'><div class='in'><div class='brand'>${LOGO(34,'n')}GALIA</div>
  <div class='row'>${langSwitch()}<button class='btn sm' data-go='dashboard' data-mode='demo'>${t('open_demo')}</button></div></div></header>
  <main class='wrap'>
   <section class='hero'>
    <div><span class='eyebrow'>${t('hero_eyebrow')}</span><h1>${t('hero_h')}</h1><p>${t('hero_p')}</p>
     <div class='row' style='flex-wrap:wrap'><button class='btn grad' data-go='dashboard' data-mode='demo'>${t('open_demo')} →</button><button class='btn ghost' data-go='upload' data-mode='mine'>${t('upload_own')}</button></div></div>
    <div class='mock' aria-hidden='true'>${miniDash()}</div>
   </section>
   <section class='section' style='padding-top:10px'><div class='cols4'>
    ${[['52 %','st1'],['222','st2'],['54 %','st3'],['3 000 €','st4']].map(([b,k])=>`<div class='card stat'><b>${L==='en'&&b==='3 000 €'?'€3,000':b}</b><span class='mute'>${t(k)}</span></div>`).join('')}
   </div><div class='tiny mute' style='margin-top:10px'>${t('source')}</div></section>
   <section class='section'><h2>${t('mid_h')}</h2><p class='lead'>${t('mid_p')}</p>
    <div class='card' style='margin-top:24px;padding:30px'><div style='position:relative;height:120px'>
     <div style='position:absolute;top:58px;left:4%;right:4%;height:6px;background:var(--line);border-radius:9px'></div>
     ${[['4%',t('diy'),L==='lt'?'50–400 €':'€50–400','#9AA0AA'],['50%','GALIA',L==='lt'?'149 €':'€149','var(--accent)'],['96%',t('longev'),L==='lt'?'~3 000 €':'~€3,000','#C9A45C']].map(([x,a,b,c],i)=>`<div style='position:absolute;left:${x};top:${i===1?6:16}px;translate:${i===0?'0':i===2?'-100%':'-50%'} 0;text-align:${i===0?'left':i===2?'right':'center'}'>${i===1?`<div style='display:inline-flex;margin-bottom:6px'>${LOGO(40,'ax')}</div>`:''}<div style='font-weight:800;font-size:${i===1?22:16}px'>${a}</div></div>
      <div style='position:absolute;left:${x};top:50px;width:22px;height:22px;border-radius:99px;background:${c};translate:-50% 0;box-shadow:0 0 0 6px #fff'></div>
      <div style='position:absolute;left:${x};top:84px;translate:${i===0?'0':i===2?'-100%':'-50%'} 0;font-weight:800;font-size:${i===1?24:18}px;color:${i===1?'var(--accent)':'var(--ink2)'}'>${b}</div>`).join('')}
    </div></div></section>
   <section class='section'><h2>${t('how_h')}</h2><div class='cols4'>${[1,2,3,4].map(i=>`<div class='card step'><b>${i}</b><h3 style='font-size:18px'>${t('how'+i)}</h3><p class='mute' style='margin-top:6px'>${t('how'+i+'p')}</p></div>`).join('')}</div></section>
   <section class='section'><h2>${t('feat_h')}</h2><div class='cols3'>${[1,2,3,4,5,6].map(i=>`<div class='card'><h3 style='font-size:18px'>${t('f'+i)}</h3><p class='mute' style='margin-top:6px'>${t('f'+i+'p')}</p></div>`).join('')}</div>
    <div class='row' style='margin-top:24px;flex-wrap:wrap'><button class='btn' data-go='upload' data-mode='mine'>${t('upload_own')}</button><button class='btn ghost' data-go='dashboard' data-mode='demo'>${t('open_demo')}</button></div></section>
   <section class='section'><h2>${t('price_h')}</h2><div class='cols3' style='grid-template-columns:repeat(2,minmax(0,380px))'>
    <div class='card price'><div class='mute' style='font-weight:700'>${t('plan_basic')}</div><b>${L==='lt'?'149 €':'€149'}</b> <span class='mute'>${t('per_year')}</span><div class='stack' style='margin-top:16px'>${['pb1','pb2','pb3','pb4'].map(k=>`<div class='row'><span class='check on'></span>${t(k)}</div>`).join('')}</div></div>
    <div class='card price' style='border:2px solid var(--ink)'><div class='between'><span class='mute' style='font-weight:700'>${t('plan_gen')}</span><span class='pill x' style='background:#FFE9E3;color:var(--accent)'>${t('founding')}</span></div><b>${L==='lt'?'249 €':'€249'}</b> <span class='mute'>${t('per_year')}</span> <s class='mute'>${L==='lt'?'398 €':'€398'}</s><div class='stack' style='margin-top:16px'>${['pg1','pg2','pg3'].map(k=>`<div class='row'><span class='check on'></span>${t(k)}</div>`).join('')}</div></div>
   </div></section>
   <footer><div class='between' style='flex-wrap:wrap'><div class='brand' style='font-size:16px'>${LOGO(26,'f')}GALIA</div><div class='small mute'>${t('foot')}</div></div></footer>
  </main>`;
}
function miniDash(){
  const ms=MARKERS.map(b=>({...b,st:statusOf(b.v,b)})),c=counts(ms);
  return `<div class='between'><div><div class='small mute'>${t('latest')} · 2026-11</div><div style='font-weight:800;font-size:20px'>${t('hello')}</div></div>${LOGO(38,'m')}</div>
  <div class='grid' style='grid-template-columns:1fr 1fr;margin-top:16px'><div class='card' style='padding:16px'><div class='small mute'>${t('score')}</div><div style='font-size:38px;font-weight:700'>87<span class='small mute'> /100</span></div></div><div class='card' style='padding:16px'><div class='small mute'>${t('bioage')}</div><div style='font-size:38px;font-weight:700'>44<span class='small mute'> /41</span></div></div></div>
  <div class='card' style='padding:16px;margin-top:12px'><div class='row' style='gap:20px;margin-bottom:10px'>${[[84,'total',''],[c.o,'optimal','o'],[c.n,'normal','n'],[c.x,'out','x']].map(([v,k,cl])=>`<div><div style='font-size:24px;font-weight:700' class='${cl}'>${v}</div><div class='tiny mute'>${t(k)}</div></div>`).join('')}</div>${seg(c,84)}</div>
  ${['m0','m1','m55'].map(id=>{const m=ms.find(x=>x.id===id);return `<div class='between' style='padding:12px 4px;border-bottom:1px solid var(--line)'><b>${nm(m)}</b><span class='row'><span class='pill ${m.st}'>${stLabel(m)}</span><span class='num' style='font-weight:700'>${fmt(m.v)} <span class='tiny mute'>${m.u}</span></span></span></div>`}).join('')}`;
}
function langSwitch(){return `<div class='lang' role='group' aria-label='Language'><button class='${L==='lt'?'on':''}' data-lang='lt'>LT</button><button class='${L==='en'?'on':''}' data-lang='en'>EN</button></div>`;}

// ---------------- app shell ----------------
const NAV=[['dashboard','nav_dash','dash'],['biomarkers','nav_markers','markers'],['upload','nav_upload','upload'],['plan','nav_plan','plan'],['assistant','nav_ai','ai'],['employers','nav_emp','emp'],['settings','nav_set','set']];
function shell(content){
  const ms=markers(),c=counts(ms);
  const navs=NAV.map(([r,k,i])=>`<button class='nav ${S.route===r?'on':''}' data-go='${r}'>${ICONS[i]}<span>${t(k)}</span>${r==='biomarkers'&&c.x?`<span class='badge'>${c.x}</span>`:''}</button>`).join('');
  return `<div class='app'><aside class='side'><button class='brand' data-go='landing'>${LOGO(34,'s')}GALIA</button>${navs}
   <div class='foot'>
    <div class='lang' role='group' aria-label='Profile' style='width:100%'><button style='flex:1' class='${S.mode==='demo'?'on':''}' data-mode-set='demo'>${t('demo_tomas')}</button><button style='flex:1' class='${S.mode==='mine'?'on':''}' data-mode-set='mine'>${t('my_data')}</button></div>
    ${S.mode==='demo'?`<div class='between'><span class='small' style='font-weight:700'>${t('after6')}</span><button class='toggle ${S.after?'on':''}' data-act='after' aria-label='${t('after6')}'></button></div>`:''}
    ${langSwitch()}
    ${AI_LIVE?'':`<div class='tiny mute' style='text-align:center'>${t('api_badge')}</div>`}
   </div></aside>
  <div><nav class='mobilebar'>${`<button class='nav' data-go='landing'>${ICONS.home}</button>`+navs}</nav><main class='main fade'>${content}</main></div></div>
  ${S.drawer?drawer():''}${S.toast?`<div class='toast' role='status'>${esc(S.toast)}</div>`:''}`;
}
function emptyMine(){
  return `<div class='card' style='text-align:center;padding:50px'><div style='display:inline-flex'>${LOGO(56,'e')}</div><h2 style='margin-top:14px'>${t('mine_empty_h')}</h2><p class='mute' style='margin:8px auto 18px;max-width:30em'>${t('mine_empty_p')}</p><button class='btn grad' data-go='upload'>${t('nav_upload')}</button></div>`;
}

// ---------------- dashboard ----------------
function vDashboard(){
  const ms=markers();if(!ms.length)return shell(`<div class='pagehead'><h1>${t('hello_me')}</h1></div>${emptyMine()}`);
  const c=counts(ms),sc=scoreOf(ms),ba=bioOf(),plan=currentPlan(ms);
  const flagged=ms.filter(m=>m.st!=='o').sort((a,b)=>(a.st==='x'?0:1)-(b.st==='x'?0:1));
  const cats=Object.keys(CATS).filter(k=>ms.some(m=>m.cat===k));
  const today=plan.flatMap((p,i)=>p.actions.slice(0,1).map(a=>({id:'p'+i,a})));
  const lastDate=S.mode==='demo'?(S.after?'2027-05-20':'2026-11-06'):[...S.uploads].sort((a,b)=>b.date.localeCompare(a.date))[0]?.date;
  return shell(`<div class='pagehead'><div><div class='small mute'>${t('latest')} · ${lastDate||'–'}</div><h1>${S.mode==='demo'?t('hello'):t('hello_me')}</h1></div><button class='btn sm ghost' data-go='upload'>${ICONS.upload.replace('<svg',"<svg width='16' height='16'")} ${t('nav_upload')}</button></div>
  <div class='kpis'>
   <div class='card kpi'><div class='small mute' style='font-weight:700'>${t('score')}</div><div class='big num'>${sc??'–'}<span class='small mute'> /100</span></div>${S.mode==='demo'?`<div class='small ${S.after?'o':'mute'}'>${S.after?'↗ +4':''}</div>`:''}</div>
   <div class='card kpi'><div class='small mute' style='font-weight:700'>${t('bioage')}</div><div class='big num ${ba&&ba<41?'o':''}'>${ba??'–'}${ba?`<span class='small mute'> /41</span>`:''}</div>${ba?`<div class='small ${ba<41?'o':'x'}'>${Math.abs(ba-41)} ${ba<41?t('younger'):t('older')}</div>`:`<div class='small mute'>${L==='lt'?'reikia pilno tyrimo':'needs a full panel'}</div>`}</div>
   <div class='card kpi' style='grid-column:span 2'><div class='row' style='gap:28px;margin-bottom:12px'>${[[ms.length,'total',''],[c.o,'optimal','o'],[c.n,'normal','n'],[c.x,'out','x']].map(([v,k,cl])=>`<div><div class='big num ${cl}' style='font-size:32px'>${v}</div><div class='small mute'>${t(k)}</div></div>`).join('')}</div>${seg(c,ms.length)}</div>
  </div>
  <div class='two' style='margin-top:16px'>
   <div class='card'><div class='between'><h2 style='font-size:19px'>${t('needs')}</h2><button class='small' style='font-weight:700' data-go='biomarkers' data-filter='flag'>${t('view_all')}</button></div>
    <div class='tablewrap'><table class='table' style='margin-top:6px'><tbody>${flagged.slice(0,8).map(m=>`<tr class='click' data-mk='${m.id}'><td><b>${esc(nm(m))}</b><div class='tiny mute'>${catName(m.cat)}</div></td><td><span class='pill ${m.st}'>${stLabel(m)}</span></td><td class='num' style='font-weight:700;white-space:nowrap'>${fmt(m.v)} <span class='tiny mute'>${esc(m.u)}</span></td><td>${spark(m)}</td></tr>`).join('')||`<tr><td class='mute'>${t('plan_empty')}</td></tr>`}</tbody></table></div></div>
   <div class='stack'>
    <div class='card'><div class='between'><h2 style='font-size:19px'>${t('today')}</h2><button class='small' style='font-weight:700' data-go='plan'>${t('open_plan')}</button></div>
     <div class='stack' style='margin-top:10px'>${today.map(x=>`<button class='row' data-todo='${esc(x.a)}' style='text-align:left'><span class='check ${S.todo[x.a]?'on':''}'></span><span style='${S.todo[x.a]?'color:var(--mute);text-decoration:line-through':''}'>${esc(x.a)}</span></button>`).join('')||`<span class='mute'>${t('plan_empty')}</span>`}</div></div>
    <div class='card'><h2 style='font-size:19px;margin-bottom:8px'>${t('systems')}</h2>${cats.map(k=>{const g=ms.filter(m=>m.cat===k),gc=counts(g),gr=gc.x?['C','x']:gc.n?['B','n']:['A','o'];return `<button class='between' data-go='biomarkers' data-cat='${k}' style='width:100%;padding:8px 0;border-bottom:1px solid var(--line)'><span class='row'><span class='pill ${gr[1]}' style='padding:2px 9px'>${gr[0]}</span>${catName(k)}</span><span class='small mute'>${g.length}</span></button>`}).join('')}</div>
   </div>
  </div>`);
}

// ---------------- biomarkers ----------------
function vBiomarkers(){
  const ms=markers();if(!ms.length)return shell(`<div class='pagehead'><h1>${t('nav_markers')}</h1></div>${emptyMine()}`);
  const c=counts(ms),q=S.q.toLowerCase();
  const list=ms.filter(m=>(S.filter==='all'||(S.filter==='flag'?m.st!=='o':m.st===S.filter))&&(S.cat==='all'||m.cat===S.cat)&&(!q||nm(m).toLowerCase().includes(q)||(m.lt||'').toLowerCase().includes(q)||(m.en||'').toLowerCase().includes(q)));
  const cats=Object.keys(CATS).filter(k=>ms.some(m=>m.cat===k));
  return shell(`<div class='pagehead'><div><h1>${t('nav_markers')}</h1><div class='mute'>${ms.length} · ${c.o} ${t('optimal').toLowerCase()} · ${c.n} ${t('normal').toLowerCase()} · ${c.x} ${t('out').toLowerCase()}</div></div>
   <label for='q' class='tiny' style='position:absolute;left:-999px'>${t('search')}</label><input id='q' class='search' placeholder='${t('search')}' value='${esc(S.q)}' autocomplete='off'></div>
  <div class='row' style='flex-wrap:wrap;margin-bottom:10px'>${[['all',t('all')+` · ${ms.length}`],['x',t('out')+` · ${c.x}`],['n',t('normal')+` · ${c.n}`],['o',t('optimal')+` · ${c.o}`]].map(([k,l])=>`<button class='chip ${S.filter===k||(k==='all'&&S.filter==='flag'&&false)?'on':''}' data-filter='${k}'>${l}</button>`).join('')}</div>
  <div class='row' style='flex-wrap:wrap;margin-bottom:16px'><button class='chip ${S.cat==='all'?'on':''}' data-cat='all'>${t('all')}</button>${cats.map(k=>`<button class='chip ${S.cat===k?'on':''}' data-cat='${k}'>${catName(k)}</button>`).join('')}</div>
  <div class='card' style='padding:6px 8px'><div class='tablewrap'><table class='table'><thead><tr><th>${t('col_marker')}</th><th>${t('col_status')}</th><th>${t('col_value')}</th><th>${t('col_range')}</th><th>${t('col_trend')}</th></tr></thead><tbody>
   ${list.map(m=>`<tr class='click' data-mk='${m.id}'><td><b>${esc(nm(m))}</b><div class='tiny mute'>${catName(m.cat)}</div></td><td><span class='pill ${m.st}'>${stLabel(m)}</span></td><td class='num' style='font-weight:700;white-space:nowrap'>${fmt(m.v)} <span class='tiny mute'>${esc(m.u)}</span></td><td class='small mute num' style='white-space:nowrap'>${m.rl!=null?fmt(m.rl)+'–'+fmt(m.rh):'–'}</td><td>${spark(m)}</td></tr>`).join('')}
  </tbody></table></div></div>`);
}
function drawer(){
  const m=markers().find(x=>x.id===S.drawer);if(!m)return'';
  const ex=EXPLAIN[m.lt];const ai=S.explain[m.id+L];
  const plan=currentPlan(markers()).find(p=>p.markers.includes(m.id));
  return `<div class='drawer-bg' data-act='close'></div><aside class='drawer fade' role='dialog' aria-label='${esc(nm(m))}'>
   <div class='between'><span class='small mute' style='font-weight:700'>${catName(m.cat)}</span><button data-act='close' aria-label='Close' style='font-size:26px;line-height:1'>×</button></div>
   <h2 style='font-size:28px;margin:2px 0 12px'>${esc(nm(m))}</h2>
   <div class='card'><div class='between'><div style='font-size:40px;font-weight:700' class='num'>${fmt(m.v)} <span class='small mute'>${esc(m.u)}</span></div><span class='pill ${m.st}' style='font-size:14px'>${stLabel(m)}</span></div>${rangeBar(m)}
    <div class='row small mute' style='gap:16px;margin-top:6px;flex-wrap:wrap'>${m.ol!=null&&m.cat!=='other'?`<span><span class='o'>■</span> ${t('optzone')} ${fmt(m.ol)}–${fmt(m.oh)}</span>`:''}${m.rl!=null?`<span><span class='n'>■</span> ${t('refzone')} ${fmt(m.rl)}–${fmt(m.rh)}</span>`:''}</div></div>
   <h3 style='margin:20px 0 8px'>${t('history')}</h3><div class='card'>${histChart(m)}</div>
   <h3 style='margin:20px 0 8px'>${t('what')}</h3><div class='card'>${ex?ex[L==='lt'?0:1]:(L==='lt'?`${esc(nm(m))} – ${catName(m.cat).toLowerCase()} rodiklis. Tavo reikšmė ${m.st==='o'?'optimalioje zonoje.':m.st==='n'?'normos ribose, bet ne optimali.':'už normos ribų.'}`:`${esc(nm(m))} is a ${catName(m.cat).toLowerCase()} marker. Your value is ${m.st==='o'?'in the optimal zone.':m.st==='n'?'within range but not optimal.':'outside the reference range.'}`)}
    ${ai?`<div class='note' style='margin-top:12px'>${ai==='…'?`<span class='row'><span class='spin'></span>${t('thinking')}</span>`:esc(ai)}</div>`:''}
    <div style='margin-top:12px'><button class='btn sm grad' data-explain='${m.id}'>${t('explain_ai')}</button></div></div>
   <h3 style='margin:20px 0 8px'>${t('todo')}</h3><div class='card'>${plan?`<b>${esc(plan.title)}</b><div class='stack' style='margin-top:8px;gap:6px'>${plan.actions.map(a=>`<div>• ${esc(a)}</div>`).join('')}</div><button class='btn sm ghost' style='margin-top:12px' data-go='plan'>${t('open_plan')}</button>`:`<span class='mute'>${L==='lt'?'Rodiklis optimalus – nieko keisti nereikia.':'This marker is optimal – nothing to change.'}</span>`}</div>
   <div style='margin-top:18px'><button class='btn' data-ask='${esc((L==='lt'?'Ką reiškia mano ':'What does my ')+nm(m)+' '+fmt(m.v)+' '+m.u+(L==='lt'?' ir ką daryti?':' mean and what should I do?'))}'>${t('ask_ai')}</button></div>
  </aside>`;
}

// ---------------- upload ----------------
function vUpload(){
  const u=S.up;let body='';
  if(u.state==='idle')body=`<label class='drop' id='drop' for='file'><div style='font-size:40px'>📄</div><b style='font-size:17px'>${t('up_drop')}</b><div class='small mute' style='margin-top:6px'>${t('up_types')}</div></label><input id='file' type='file' accept='image/*' multiple style='display:none'>
   <div class='row' style='margin-top:14px;flex-wrap:wrap'><button class='btn ghost' data-act='sample'>${t('up_sample')}</button></div>`;
  else if(u.state==='busy')body=`<div class='card' style='display:flex;gap:24px;align-items:center;flex-wrap:wrap'>${u.preview?`<img src='${u.preview}' alt='' style='width:220px;border-radius:10px;border:1px solid var(--line)'>`:''}<div class='row' style='font-weight:700'><span class='spin'></span>${t('up_busy')}</div></div>`;
  else if(u.state==='err')body=`<div class='note'>${esc(u.msg)}</div><div class='row' style='margin-top:12px'><button class='btn' data-act='reset'>${t('up_cancel')}</button><button class='btn ghost' data-act='sample'>${t('up_sample')}</button></div>`;
  else if(u.state==='review'){
    const matched=u.rows.filter(r=>r.key).length;
    body=`${u.note?`<div class='note' style='margin-bottom:12px'>${esc(u.note)}</div>`:''}<div class='two'><div class='card'><div class='between' style='flex-wrap:wrap'><h2 style='font-size:19px'>${t('up_review')}</h2><span class='small mute'>${t('up_found')}: ${u.rows.length} · ${matched} ${t('up_matched')}</span></div>
     <div class='tablewrap'><table class='table' style='margin-top:8px'><thead><tr><th>${t('up_report')}</th><th>GALIA</th><th>${t('up_conv')}</th></tr></thead><tbody>
     ${u.rows.map((r,i)=>{const b=MARKERS.find(x=>x.id===r.key);return `<tr><td><b>${esc(r.name)}</b><div class='tiny mute'>${esc(fmt(r.v))} ${esc(r.unit||'')}${r.ref?` · ${esc(r.ref)}`:''}</div></td>
      <td><label class='tiny' for='k${i}' style='position:absolute;left:-999px'>GALIA</label><select id='k${i}' data-rowkey='${i}' style='border:1.5px solid var(--line);border-radius:10px;padding:6px;max-width:200px;background:var(--card)'><option value=''>${t('up_other')}</option>${MARKERS.map(x=>`<option value='${x.id}' ${x.id===r.key?'selected':''}>${esc(L==='lt'?x.lt:x.en)}</option>`).join('')}</select></td>
      <td class='num' style='white-space:nowrap'>${b?`<label class='tiny' for='v${i}' style='position:absolute;left:-999px'>value</label><input id='v${i}' data-rowval='${i}' value='${r.vc??''}' style='width:80px;border:1.5px solid var(--line);border-radius:10px;padding:6px'> <span class='tiny mute'>${b.u}</span> ${r.vc!=null?`<span class='pill ${statusOf(+r.vc,b)}' style='margin-left:4px'>${stLabel({st:statusOf(+r.vc,b),v:+r.vc,rh:b.rh})}</span>`:''}`:`<span class='tiny mute'>${esc(fmt(r.v))} ${esc(r.unit||'')}</span>`}</td></tr>`;}).join('')}
     </tbody></table></div></div>
     <div class='stack'><div class='card'>${u.preview?`<img src='${u.preview}' alt='' style='width:100%;border-radius:10px;border:1px solid var(--line)'>`:''}
      <label for='udate' class='small' style='font-weight:700;display:block;margin-top:12px'>${t('up_date')}</label><input id='udate' type='date' value='${esc(u.date||new Date().toISOString().slice(0,10))}' style='border:1.5px solid var(--line);border-radius:10px;padding:8px;width:100%;margin-top:4px'>
      <div class='row' style='margin-top:14px;flex-wrap:wrap'><button class='btn grad' data-act='saveup'>${t('up_save')}</button><button class='btn ghost' data-act='reset'>${t('up_cancel')}</button></div></div></div></div>`;
  }
  const list=[...S.uploads].sort((a,b)=>b.date.localeCompare(a.date));
  return shell(`<div class='pagehead'><div><div class='row'><h1>${t('up_h')}</h1>${apiBadge()}</div><p class='mute' style='max-width:44em'>${t('up_p')}</p></div></div>${body}
   <h2 style='font-size:19px;margin:26px 0 10px'>${t('up_list')}</h2>
   <div class='card'>${list.length?list.map(x=>`<div class='between' style='padding:10px 0;border-bottom:1px solid var(--line)'><span><b>${esc(x.date)}</b> <span class='small mute'>· ${esc(x.label||'')}</span></span><span class='small mute'>${x.rows.filter(r=>r.key).length} / ${x.rows.length}</span></div>`).join(''):`<span class='mute'>${t('up_none')}</span>`}</div>`);
}
function sampleCanvas(){
  const c=document.createElement('canvas');c.width=900;c.height=1060;const g=c.getContext('2d');
  g.fillStyle='#fff';g.fillRect(0,0,900,1060);g.fillStyle='#222';g.font='bold 30px Arial';g.fillText('UAB „Pavyzdinė laboratorija“',50,70);
  g.font='22px Arial';g.fillStyle='#444';g.fillText(SAMPLE_REPORT.lab,50,108);g.fillText('Pacientas: '+SAMPLE_REPORT.patient,50,142);g.fillText('Mėginio data: '+SAMPLE_REPORT.date,50,176);
  g.strokeStyle='#999';g.beginPath();g.moveTo(50,200);g.lineTo(850,200);g.stroke();
  g.font='bold 20px Arial';g.fillStyle='#222';['Tyrimas','Rezultatas','Vnt.','Norma'].forEach((h,i)=>g.fillText(h,[50,450,600,720][i],235));
  g.font='21px Arial';SAMPLE_REPORT.rows.forEach((r,i)=>{const y=285+i*62;g.fillStyle=i%2?'#fff':'#F4F4F4';g.fillRect(40,y-36,820,56);g.fillStyle='#111';g.fillText(r[0],50,y);g.font='bold 21px Arial';g.fillText(r[1],450,y);g.font='21px Arial';g.fillText(r[2],600,y);g.fillText(r[3],720,y);});
  g.font='16px Arial';g.fillStyle='#777';g.fillText('Pavyzdinis blankas GALIA demonstracijai',50,1030);
  return c;
}
async function runExtract(blobs,preview){
  S.up={...S.up,state:'busy',preview};render();
  let rows=null,date=null,note=null;
  try{
    const sample=await getSample();if(!sample)throw new Error('na');
    const lim=sample.limits?await sample.limits():{images:true};if(!lim||!lim.images)throw new Error('na');
    const canon=MARKERS.map(m=>`${m.id}|${m.lt}|${m.en}|${m.u}`).join("\n");
    const prompt=`You read laboratory blood test reports (any language, often Lithuanian). Extract every test result from the image(s).
For each result return: 'name' exactly as printed, 'v' numeric value as printed (use dot decimals), 'unit' as printed, 'ref' the printed reference range text or null, 'rl'/'rh' numeric reference bounds in the printed unit or null.
Then map it to ONE canonical marker from this list (id|Lithuanian|English|canonical unit) when it is clearly the same test, else key=null. When mapped, give 'vc' = the value converted to the canonical unit (e.g. cholesterol/triglycerides/glucose mmol/L→mg/dL, vitamin D nmol/L→ng/mL ÷2.5, ApoB g/L→mg/dL ×100, hemoglobin g/L→g/dL ÷10, ferritin µg/L=ng/mL).
${canon}
Return only JSON: {'date':'YYYY-MM-DD or null','rows':[{'name':'','v':0,'unit':'','ref':null,'rl':null,'rh':null,'key':null,'vc':null}]}`;
    const out=await sample.json(prompt,{images:blobs,modelTier:'default'});
    rows=(out&&out.rows||[]).filter(r=>r&&r.name&&r.v!=null).slice(0,80).map(r=>({name:String(r.name),v:+r.v,unit:r.unit||'',ref:r.ref||null,rl:r.rl!=null?+r.rl:null,rh:r.rh!=null?+r.rh:null,key:MARKERS.some(m=>m.id===r.key)?r.key:null,vc:r.vc!=null&&!isNaN(+r.vc)?Math.round(+r.vc*100)/100:null}));
    date=out&&out.date||null;
    if(!rows.length){S.up={state:'err',msg:t('up_err')};render();return;}
  }catch(e){
    if(!preview||!preview.startsWith('data:image/png')||!S.up.isSample){S.up={state:'err',msg:(L==='lt'?'Demo režimas: DI API raktas neprijungtas, todėl savo nuotraukos atpažinti negalime. Išbandyk su pavyzdiniu blanku – jo atpažinimas paruoštas iš anksto.':"Demo mode: the AI API key isn't connected, so we can't read your own photo. Try the sample report – its extraction is prepared in advance.")};render();return;}
    rows=SAMPLE_REPORT.rows.map(r=>{const m=MARKERS.find(x=>x.lt===r[4]);return {name:r[0],v:+r[1].replace(',','.'),unit:r[2],ref:r[3],rl:null,rh:null,key:m?m.id:null,vc:r[5]};});
    date=SAMPLE_REPORT.date;note=t('up_offline');await wait(1500);
  }
  S.up={state:'review',rows,date,preview,note,isSample:S.up.isSample};render();
}
async function filesToRun(files){
  const imgs=[...files].filter(f=>f.type.startsWith('image/')).slice(0,3);
  if(!imgs.length){S.up={state:'err',msg:t('up_err')};render();return;}
  const preview=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=()=>r(null);fr.readAsDataURL(imgs[0]);});
  S.up={state:'busy',preview,isSample:false};runExtract(imgs,preview);
}
function runSample(){
  const c=sampleCanvas();const preview=c.toDataURL('image/png');S.up={state:'busy',preview,isSample:true};
  c.toBlob(b=>runExtract([b],preview),'image/png');
}

// ---------------- plan ----------------
function vPlan(){
  const ms=markers();if(!ms.length)return shell(`<div class='pagehead'><h1>${t('plan_h')}</h1></div>${emptyMine()}`);
  const plan=currentPlan(ms);const st=S.planStatus;
  return shell(`<div class='pagehead'><div><div class='row'><h1>${t('plan_h')}</h1>${apiBadge()}</div><div class='mute'>${S.plan&&S.plan.lang===L&&S.plan.mode===S.mode?'DI · '+t('plan_auto'):t('plan_auto')}</div></div>
   <div class='row' style='flex-wrap:wrap'><button class='btn sm grad' data-act='aiplan' ${S.busy?'disabled':''}>${S.busy==='plan'?`<span class='spin'></span>${t('genplan')}`:t('plan_ai')}</button>
   ${st==='draft'?`<button class='btn sm' data-act='senddoc'>${t('plan_send')}</button>`:st==='sent'?`<span class='row small' style='font-weight:700'><span class='spin'></span>${t('plan_sent')}</span>`:`<span class='pill o' style='font-size:13px'>✓ ${t('plan_ok')}</span>`}</div></div>
  ${st!=='draft'?`<div class='tiny mute' style='margin:-10px 0 14px'>${t('plan_demo')}</div>`:''}
  <div class='two'><div class='stack'>${plan.length?plan.map((p,i)=>`<div class='prio' style='background:${p.bg||'#F4F1EC'}'><div class='row' style='align-items:flex-start;gap:16px'><span class='n' style='color:${p.c||'var(--ink)'}'>${i+1}</span><div style='flex:1'><h3 style='font-size:19px'>${esc(p.title)}</h3><div class='small mute' style='margin-top:4px'><b>${t('why')}:</b> ${esc(p.why||'')}</div>
   <div style='margin-top:10px'><div class='small' style='font-weight:700'>${t('actions')}</div>${p.actions.map(a=>`<button class='row' data-todo='${esc(a)}' style='text-align:left;margin-top:8px'><span class='check ${S.todo[a]?'on':''}'></span><span>${esc(a)}</span></button>`).join('')}</div>
   ${p.markers&&p.markers.length?`<div class='small' style='font-weight:700;margin-top:12px'>${t('related')}</div><div class='row' style='flex-wrap:wrap;gap:6px;margin-top:6px'>${p.markers.map(id=>{const m=ms.find(x=>x.id===id);return m?`<button class='chip' data-mk='${m.id}'><span class='${m.st}'>●</span> ${esc(nm(m))}</button>`:''}).join('')}</div>`:''}</div></div></div>`).join(''):`<div class='card'>${t('plan_empty')}</div>`}</div>
   <div class='stack'><div class='card'><h3>${t('plan_retest')}</h3><p class='mute'>${t('plan_retest_p')}</p></div>
    <div class='card'><h3>${t('nav_ai')}</h3><p class='mute' style='margin:4px 0 12px'>${t('ai_sub')}</p><button class='btn sm' data-go='assistant'>${t('ask_ai')}</button></div></div></div>`);
}
async function aiPlan(){
  const ms=markers();S.busy='plan';render();
  try{
    const sample=await getSample();if(!sample)throw new Error('na');
    const flag=ms.filter(m=>m.st!=='o').map(m=>`${m.id}: ${nm(m)} ${m.v} ${m.u} (${stLabel(m)}; optimal ${m.ol}-${m.oh}, range ${m.rl}-${m.rh})`).join("\n");
    const out=await sample.json(`You are a preventive-health coach for GALIA (Lithuania). Write a personal plan in ${L==='lt'?'Lithuanian':'English'} for ${S.mode==='demo'?'Tomas, 41, male, runs regularly':'the user'} based on these non-optimal blood markers:\n${flag||'none'}\nRules: max 3 priorities ordered by importance; each with a short title, one-sentence 'why', 2–4 concrete daily/weekly lifestyle actions; no prescription drugs, no doses; supplements only as 'discuss with doctor'. 'markers' = ids from the list above. Return only JSON {'items':[{'title':'','why':'','actions':[''],'markers':['']}]}`,{modelTier:'default'});
    const items=(out&&out.items||[]).slice(0,3).map((p,i)=>{const cat=(ms.find(m=>(p.markers||[]).includes(m.id))||{}).cat||'other';const T=TEMPL[cat]||TEMPL.other;return {title:String(p.title||''),why:String(p.why||''),actions:(p.actions||[]).map(String).slice(0,4),markers:(p.markers||[]).filter(id=>ms.some(m=>m.id===id)),c:T.c,bg:T.bg};});
    if(!items.length)throw new Error('empty');
    S.plan={items,lang:L,mode:S.mode};S.planStatus='draft';save();
  }catch(e){await wait(1200);const items=S.mode==='demo'?PREP_PLAN[L].map((p,i)=>({...p,c:[TEMPL.sirdis.c,TEMPL.vitaminai.c,TEMPL.apykaita.c][i],bg:[TEMPL.sirdis.bg,TEMPL.vitaminai.bg,TEMPL.apykaita.bg][i]})):autoPlan(ms);S.plan={items,lang:L,mode:S.mode,demo:true};S.planStatus='draft';save();toast(t('ai_off'));}
  S.busy=false;render();
}

// ---------------- assistant ----------------
function vAssistant(){
  if(!S.chat.length)S.chat=[{r:'ai',t:t('ai_hi')}];
  const sug=L==='lt'?['Kodėl man padidėjęs ApoB?','Ar galiu bėgioti?','Kiek vitamino D vartoti žiemą?','Ką valgyti pusryčiams?','Kokių papildų man reikia?','Kada pasikartoti tyrimą?','Ką reiškia biologinis amžius?','Ar mano duomenys saugūs?']:['Why is my ApoB high?','Can I keep running?','How much vitamin D in winter?','What should I eat for breakfast?','Which supplements do I need?','When should I retest?','What is biological age?','Is my data safe?'];
  return shell(`<div class='pagehead'><div class='row'>${LOGO(44,'c')}<div><h1 style='font-size:24px'>${t('ai_h')}</h1><div class='small o' style='font-weight:700'>● ${t('ai_sub')}</div></div></div>${apiBadge()}</div>${AI_LIVE?'':`<div class='note' style='max-width:860px;margin-bottom:14px'>${t('ai_off')}</div>`}
  <div class='card' style='max-width:860px'><div class='chat' id='chat'>${S.chat.map(m=>`<div class='bubble ${m.r==='me'?'me':'ai'}'>${esc(m.t)}</div>`).join('')}${S.busy==='chat'?`<div class='bubble ai'><span class='row'><span class='spin'></span>${t('thinking')}</span></div>`:''}
   ${!S.busy?`<div class='row' style='flex-wrap:wrap;gap:8px'>${sug.map(s=>`<button class='chip' data-ask='${esc(s)}'>${esc(s)}</button>`).join('')}</div>`:''}</div>
   <form class='composer' id='cform'><label for='cin' style='position:absolute;left:-999px'>${t('ai_ph')}</label><input id='cin' placeholder='${t('ai_ph')}' autocomplete='off'><button class='btn'>${t('ai_send')}</button></form>
   <div class='tiny mute' style='margin-top:10px'>${t('ai_disc')}</div></div>`);
}
async function ask(q){
  if(S.busy)return;S.route='assistant';S.drawer=null;if(!S.chat.length)S.chat=[{r:'ai',t:t('ai_hi')}];S.chat.push({r:'me',t:q});S.busy='chat';render();
  let a=null;
  try{const sample=await getSample();if(sample){const ms=markers();const flag=ms.filter(m=>m.st!=='o').map(m=>`${nm(m)} ${m.v} ${m.u} (${stLabel(m)}; optimal ${m.ol}–${m.oh}, range ${m.rl}–${m.rh})`).join('; ');
   const plan=currentPlan(ms).map((p,i)=>`${i+1}) ${p.title}: ${p.actions.join(', ')}`).join(' ');
   const res=await sample(`You are GALIA's AI health assistant (preventive health app in Lithuania). Reply in the user's language (${L==='lt'?'default Lithuanian':'default English'}), 2–5 short sentences, warm, plain words, no markdown. Never diagnose or give prescription drugs/doses; suggest a GALIA doctor when needed.
User: ${S.mode==='demo'?'Tomas, 41, male, runs.':'GALIA member.'} ${ms.length} markers. Non-optimal: ${flag||'none'}. Others optimal. Plan: ${plan||'none'}.
Conversation:\n${S.chat.map(m=>(m.r==='me'?'User: ':'Assistant: ')+m.t).join("\n")}\nWrite only the assistant's next reply.`,{modelTier:'quick',cache:false});
   a=(res&&res.text||'').trim()||null;}}catch(e){a=null;}
  if(!a){await wait(700+Math.random()*500);a=cannedAnswer(q);}
  S.busy=false;S.chat.push({r:'ai',t:a});render();
}
async function explainAI(id){
  const m=markers().find(x=>x.id===id);if(!m)return;S.explain[id+L]='…';render();
  let a=null;try{const sample=await getSample();if(sample){const r=await sample(`Explain to a non-medical person in ${L==='lt'?'Lithuanian':'English'}, in 3–4 short sentences without markdown, what the blood marker '${nm(m)}' measures and what a value of ${m.v} ${m.u} means (reference ${m.rl}–${m.rh}, optimal ${m.ol}–${m.oh}, status: ${stLabel(m)}). Mention one practical next step. Do not diagnose.`,{modelTier:'quick'});a=(r&&r.text||'').trim()||null;}}catch(e){a=null;}
  if(!a){await wait(600);const base=(EXPLAIN[m.lt]||[])[L==='lt'?0:1]||'';const st=m.st==='o'?(L==='lt'?'Tavo reikšmė optimali – nieko keisti nereikia.':'Your value is optimal – nothing to change.'):(L==='lt'?`Tavo ${fmt(m.v)} ${m.u} ${m.st==='x'?'yra už normos ribų':'normos ribose, bet ne optimali'}. Ką daryti – rasi plane.`:`Your ${fmt(m.v)} ${m.u} is ${m.st==='x'?'outside the reference range':'within range but not optimal'}. See your plan for what to do.`);a=(base?base+' ':'')+st+'\n\n'+t('ai_off');}
  S.explain[id+L]=a;render();
}

// ---------------- employers & settings ----------------
function vEmployers(){
  const risks=[[L==='lt'?'Vitamino D trūkumas':'Vitamin D deficiency',54,'var(--blue)'],[L==='lt'?'Padidėję lipidai (ApoB/MTL)':'High lipids (ApoB/LDL)',31,'var(--accent)'],[L==='lt'?'Medžiagų apykaita':'Metabolic markers',18,'var(--accent2)'],[L==='lt'?'Skydliaukė':'Thyroid',7,'#8A5BD6']];
  return shell(`<div class='pagehead'><div><h1>${t('emp_h')}</h1><p class='mute' style='max-width:48em'>${t('emp_p')}</p></div><button class='btn grad' data-act='quote'>${t('emp_cta')}</button></div>
  <div class='kpis'>${[['68 %','emp_part'],['82','emp_tests'],['61 %','emp_flag'],['44 %','emp_improved']].map(([v,k])=>`<div class='card kpi'><div class='small mute' style='font-weight:700'>${t(k)}</div><div class='big num'>${v}</div></div>`).join('')}</div>
  <div class='two' style='margin-top:16px'><div class='card'><h2 style='font-size:19px;margin-bottom:14px'>${t('emp_risks')}</h2>${risks.map(([n,p,c])=>`<div style='margin-bottom:14px'><div class='between small'><b>${n}</b><span class='num'>${p} %</span></div><div style='height:12px;background:#EFEAE3;border-radius:9px;margin-top:6px'><div style='width:${p}%;height:100%;background:${c};border-radius:9px'></div></div></div>`).join('')}<div class='tiny mute'>n = 82 · ${L==='lt'?'anoniminiai duomenys':'anonymised data'}</div></div>
  <div class='card'><h3>${t('plan_basic')} · B2B</h3><div style='font-size:34px;font-weight:800;margin:6px 0'>${t('emp_price')}</div><div class='stack small' style='margin-top:10px'>${(L==='lt'?['Metinis tyrimas kiekvienam darbuotojui','Asmeninis planas ir DI asistentas','Anoniminė komandos suvestinė','Sveikatos dienos biure']:['Annual test for every employee','Personal plan and AI assistant','Anonymous team insights','On-site health days']).map(x=>`<div class='row'><span class='check on'></span>${x}</div>`).join('')}</div></div></div>`);
}
function vSettings(){
  const W=[['apple','Apple Health'],['oura','Oura'],['whoop','Whoop'],['garmin','Garmin']];
  return shell(`<div class='pagehead'><h1>${t('set_h')}</h1></div><div class='two'><div class='card'><h3 style='margin-bottom:8px'>${t('wear')}</h3>${W.map(([k,l])=>`<div class='between' style='padding:10px 0;border-bottom:1px solid var(--line)'><b>${l}</b><button class='toggle ${S.wear[k]?'on':''}' data-wear='${k}' aria-label='${l}'></button></div>`).join('')}${Object.values(S.wear).some(Boolean)?`<div class='note' style='margin-top:12px'>${t('wear_data')}</div>`:''}</div>
  <div class='card'><h3>${t('privacy')}</h3><p class='mute' style='margin:6px 0 14px'>${t('privacy_p')}</p><button class='btn ghost' data-act='wipe'>${t('wipe')}</button></div></div>`);
}

// ---------------- render & events ----------------
const VIEWS={landing:vLanding,dashboard:vDashboard,biomarkers:vBiomarkers,upload:vUpload,plan:vPlan,assistant:vAssistant,employers:vEmployers,settings:vSettings};
function render(){
  document.documentElement.lang=L;
  const y=window.scrollY;$('#root').innerHTML=(VIEWS[S.route]||vLanding)();
  if(S.keepScroll)window.scrollTo(0,y);S.keepScroll=false;
  const f=$('#file');if(f)f.onchange=e=>{if(e.target.files.length)filesToRun(e.target.files)};
  const d=$('#drop');if(d){d.ondragover=e=>{e.preventDefault();d.classList.add('over')};d.ondragleave=()=>d.classList.remove('over');d.ondrop=e=>{e.preventDefault();d.classList.remove('over');if(e.dataTransfer.files.length)filesToRun(e.dataTransfer.files)};}
  const q=$('#q');if(q){q.oninput=e=>{S.q=e.target.value;S.keepScroll=true;render();const n=$('#q');n.focus();n.setSelectionRange(S.q.length,S.q.length);};}
  const cf=$('#cform');if(cf)cf.onsubmit=e=>{e.preventDefault();const v=$('#cin').value.trim();if(v)ask(v);};
  const ch=$('#chat');if(ch)ch.scrollIntoView&&S.route==='assistant'&&S.chat.length>2&&ch.lastElementChild&&ch.lastElementChild.scrollIntoView({block:'nearest'});
  document.querySelectorAll('[data-rowkey]').forEach(s=>s.onchange=e=>{const i=+e.target.dataset.rowkey;const r=S.up.rows[i];r.key=e.target.value||null;if(r.key&&r.vc==null)r.vc=r.v;S.keepScroll=true;render();});
  document.querySelectorAll('[data-rowval]').forEach(s=>s.onchange=e=>{const i=+e.target.dataset.rowval;const v=parseFloat(String(e.target.value).replace(',','.'));S.up.rows[i].vc=isNaN(v)?null:v;S.keepScroll=true;render();});
}
let toastT;function toast(m){S.toast=m;S.keepScroll=true;render();clearTimeout(toastT);toastT=setTimeout(()=>{S.toast=null;S.keepScroll=true;render();},2800);}
function go(r){S.route=r;S.drawer=null;try{history.replaceState(null,'','#'+r)}catch(e){}render();window.scrollTo(0,0);}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-go],[data-act],[data-mk],[data-ask],[data-lang],[data-filter],[data-cat],[data-todo],[data-wear],[data-explain],[data-mode-set]');if(!el)return;
  const ds=el.dataset;
  if(ds.lang){L=ds.lang;save();S.keepScroll=true;return render();}
  if(ds.modeSet){S.mode=ds.modeSet;S.after=false;save();S.keepScroll=true;return render();}
  if(ds.go){if(ds.mode){S.mode=ds.mode;save();}if(ds.filter)S.filter=ds.filter;if(ds.cat){S.cat=ds.cat;S.filter='all';}if(ds.go==='biomarkers'&&!ds.filter&&!ds.cat){}return go(ds.go);}
  if(ds.mk){S.drawer=ds.mk;S.keepScroll=true;return render();}
  if(ds.ask)return ask(ds.ask);
  if(ds.filter){S.filter=ds.filter;S.keepScroll=true;return render();}
  if(ds.cat){S.cat=ds.cat;S.keepScroll=true;return render();}
  if(ds.todo){S.todo[ds.todo]=!S.todo[ds.todo];save();S.keepScroll=true;return render();}
  if(ds.wear){S.wear[ds.wear]=!S.wear[ds.wear];save();S.keepScroll=true;return render();}
  if(ds.explain)return explainAI(ds.explain);
  switch(ds.act){
    case 'close':S.drawer=null;S.keepScroll=true;render();break;
    case 'after':S.after=!S.after;S.keepScroll=true;render();break;
    case 'sample':runSample();break;
    case 'reset':S.up={state:'idle'};render();break;
    case 'saveup':{const d=($('#udate')||{}).value||new Date().toISOString().slice(0,10);S.uploads.push({date:d,label:S.up.isSample?(L==='lt'?'Pavyzdinis blankas':'Sample report'):(L==='lt'?'Įkeltas blankas':'Uploaded report'),rows:S.up.rows});S.up={state:'idle'};S.plan=null;save();toast(t('up_saved'));setTimeout(()=>go('dashboard'),900);break;}
    case 'aiplan':aiPlan();break;
    case 'senddoc':S.planStatus='sent';save();S.keepScroll=true;render();toast(t('doctor_toast'));setTimeout(()=>{S.planStatus='approved';save();S.keepScroll=true;render();},2600);break;
    case 'quote':toast(t('quote_toast'));break;
    case 'wipe':S.uploads=[];S.plan=null;S.planStatus='draft';save();toast(t('wiped'));break;
  }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.drawer){S.drawer=null;S.keepScroll=true;render();}});
(function init(){const h=location.hash.replace('#','');if(VIEWS[h])S.route=h;render();})();
