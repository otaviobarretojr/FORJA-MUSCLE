(()=>{
'use strict';
const BUILD='4.0.0';
const NS='shape12.v360.';
const CARDIO_NS='shape12.v369.';
const DB_NAME='vitafit-local-media',STORE='workout-videos';
const DAYS={
  0:{label:'DOM',type:'strength',day:'dom',title:'Superiores completo',short:'Superiores'},
  1:{label:'SEG',type:'strength',day:'seg',title:'Inferiores completo',short:'Inferiores'},
  2:{label:'TER',type:'cardio',minutes:20,title:'Cardio',short:'20 min'},
  3:{label:'QUA',type:'strength',day:'qua',title:'Superiores completo',short:'Superiores'},
  4:{label:'QUI',type:'cardio',minutes:40,title:'Cardio',short:'40 min'},
  5:{label:'SEX',type:'strength',day:'sex',title:'Inferiores completo',short:'Inferiores'},
  6:{label:'SÁB',type:'cardio',minutes:20,title:'Cardio',short:'20 min'}
};
const ORDER=[1,2,3,4,5,6,0];
const DAYNAME=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const PLAN={
 seg:[
  {k:'seg-sumo',n:'Agachamento sumô',note:'Pirâmide • progressão de carga',sets:5,reps:'20 / 15 / 12 / 10',rest:'90–120 s'},
  {k:'seg-afundo',n:'Afundo no smith',note:'Cada lado',sets:4,reps:'10',rest:'90 s'},
  {k:'seg-pelvica',n:'Elevação pélvica',note:'Progressão de carga',sets:3,reps:'10',rest:'90–120 s'},
  {k:'seg-stiff',n:'Stiff',note:'Movimento controlado',sets:4,reps:'12',rest:'90 s'},
  {k:'seg-coice',n:'Coice na polia',note:'Cada lado',sets:3,reps:'8',rest:'60–75 s'}
 ],
 qua:[
  {k:'ter-remada',n:'Remada máquina',note:'Pico de contração',sets:4,reps:'12',rest:'75–90 s'},
  {k:'ter-supino',n:'Supino máquina',note:'',sets:3,reps:'12',rest:'75–90 s'},
  {k:'ter-desenvolvimento',n:'Desenvolvimento livre',note:'Movimento controlado',sets:4,reps:'10',rest:'75–90 s'},
  {k:'ter-rosca',n:'Rosca direta na polia',note:'',sets:4,reps:'10',rest:'60–75 s'},
  {k:'ter-triceps',n:'Tríceps corda',note:'',sets:3,reps:'20',rest:'60 s'}
 ],
 sex:[
  {k:'qua-extensora',n:'Cadeira extensora',note:'Dropset',sets:3,reps:'20',rest:'60–75 s'},
  {k:'qua-smith',n:'Agachamento smith',note:'Pirâmide 15 / 12 / 10',sets:4,reps:'15 / 12 / 10',rest:'90–120 s'},
  {k:'qua-leguni',n:'Leg press unilateral',note:'Cada lado',sets:3,reps:'10',rest:'90 s'},
  {k:'qua-flexora',n:'Cadeira flexora',note:'Pico de contração',sets:4,reps:'12',rest:'75 s'},
  {k:'qua-stiff',n:'Stiff',note:'Movimento controlado',sets:3,reps:'12',rest:'90 s'},
  {k:'qua-abdutora',n:'Cadeira abdutora',note:'Pico de contração',sets:3,reps:'15',rest:'60 s'}
 ],
 dom:[
  {k:'qui-remada',n:'Remada máquina',note:'Pico de contração',sets:4,reps:'12',rest:'75–90 s'},
  {k:'qui-supino',n:'Supino máquina',note:'',sets:3,reps:'12',rest:'75–90 s'},
  {k:'qui-desenvolvimento',n:'Desenvolvimento livre',note:'Movimento controlado',sets:4,reps:'10',rest:'75–90 s'},
  {k:'qui-rosca',n:'Rosca direta na polia',note:'',sets:4,reps:'10',rest:'60–75 s'},
  {k:'qui-triceps',n:'Tríceps corda',note:'',sets:3,reps:'20',rest:'60 s'}
 ]
};
const ICON={
 brand:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 11l14 27L38 11" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 14c3-5 7-7 12-6-1 5-4 8-10 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
 home:'<svg viewBox="0 0 24 24"><path d="M3.5 10.5L12 3l8.5 7.5V21h-6v-6h-5v6h-6z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
 train:'<svg viewBox="0 0 24 24"><path d="M3 9v6m3-8v10m12-10v10m3-8v6M6 12h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 more:'<svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 cardio:'<svg viewBox="0 0 48 48"><path d="M7 26h8l4-9 6 18 5-11h11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 41C12 34 7 28 7 19a8 8 0 0115-4 8 8 0 0115 4c0 9-5 15-13 22z" fill="none" stroke="currentColor" stroke-width="2.3" opacity=".55"/></svg>',
 workout:'<svg viewBox="0 0 48 48"><path d="M8 20v8m6-13v18m20-18v18m6-13v8M14 24h20" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M18 20v8m12-8v8" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>'
};
let selectedDate=noon(new Date()),trainingDow=selectedDate.getDay(),currentScreen='hoje',dbPromise=null,objectUrl=null,toastTimer=null;
function noon(d){const x=new Date(d);x.setHours(12,0,0,0);return x}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function read(prefix,k,f){try{const v=localStorage.getItem(prefix+k);return v===null?f:JSON.parse(v)}catch{return f}}
function write(prefix,k,v){try{localStorage.setItem(prefix+k,JSON.stringify(v))}catch{}}
function targetDateForDow(dow){const base=noon(selectedDate),pos=x=>x===0?6:x-1;base.setDate(base.getDate()+pos(dow)-pos(base.getDay()));return base}
function targetDate(){return targetDateForDow(trainingDow)}
function key(ex,set,field){return `day.${iso(targetDate())}.${ex}.${set}.${field}`}
function hkey(ex){return `history.${ex}`}
function cardioKey(dow){return `cardio.${iso(targetDateForDow(dow))}`}
function dayInfo(dow=selectedDate.getDay()){return DAYS[dow]}
function db(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>{dbPromise=null;reject(r.error)}});return dbPromise}
async function videoGet(day){const d=await db();return new Promise((res,rej)=>{const r=d.transaction(STORE,'readonly').objectStore(STORE).get(day);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}
async function videoPut(day,file){const d=await db();return new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put({blob:file,name:file.name,type:file.type,size:file.size,updatedAt:Date.now()},day);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
async function videoDel(day){const d=await db();return new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(day);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
function mount(){
 document.body.innerHTML=`<main class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">${ICON.brand}</span><div class="brand-copy"><strong>VITAFIT</strong><small>FORÇA • SAÚDE • EVOLUÇÃO</small></div></div><span class="version">v${BUILD}</span></header><section id="screen-hoje" class="screen active"></section><section id="treino" class="screen"></section><section id="mais" class="screen"></section></main><nav class="bottom-nav" id="appBottomNav" aria-label="Navegação principal"><button class="nav-btn active" data-screen="hoje" aria-current="page">${ICON.home}<span>Hoje</span></button><button class="nav-btn" data-screen="treino">${ICON.train}<span>Treino</span></button><button class="nav-btn" data-screen="mais">${ICON.more}<span>Mais</span></button></nav><div class="toast" id="toast" role="status" aria-live="polite"></div><div class="modal" id="videoModal" aria-hidden="true"><div class="video-stage"><header><div><small>VÍDEO DO TREINO</small><b id="videoTitle">Treino</b></div><button id="videoClose" aria-label="Fechar vídeo">×</button></header><div class="video-player"><video id="videoPlayer" playsinline controls preload="metadata"></video></div><footer>Vídeo salvo localmente neste aparelho.</footer></div></div><input id="videoInput" type="file" accept="video/*" hidden><input id="backupInput" type="file" accept=".json,application/json" hidden>`;
 bindGlobal();renderHome();syncBuild();document.documentElement.dataset.vitafitReady='true';
}
function bindGlobal(){
 const nav=document.getElementById('appBottomNav');
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-screen]');if(b)setScreen(b.dataset.screen)});
 nav.addEventListener('pointerdown',e=>e.target.closest('.nav-btn')?.classList.add('pressed'),{passive:true});
 const clear=()=>nav.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));
 ['pointerup','pointercancel','pointerleave'].forEach(t=>nav.addEventListener(t,clear,{passive:true}));
 document.getElementById('videoClose').addEventListener('click',closeVideo);
 document.getElementById('videoModal').addEventListener('click',e=>{if(e.target.id==='videoModal')closeVideo()});
 document.getElementById('videoInput').addEventListener('change',handleVideoInput);
 document.getElementById('backupInput').addEventListener('change',e=>importBackup(e.target.files?.[0]));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeVideo()});
}
function setScreen(id){if(!['hoje','treino','mais'].includes(id))id='hoje';if(id===currentScreen&&document.getElementById(id==='hoje'?'screen-hoje':id).classList.contains('active'))return;currentScreen=id;document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===(id==='hoje'?'screen-hoje':id)));document.querySelectorAll('.nav-btn').forEach(b=>{const active=b.dataset.screen===id;b.classList.toggle('active',active);active?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'auto'});if(id==='treino'){trainingDow=selectedDate.getDay();renderTraining()}else if(id==='hoje')renderHome();else renderMore();try{localStorage.setItem('shape12.ui.screen',JSON.stringify(id))}catch{}}
function syncBuild(){window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD}
function greeting(){const h=new Date().getHours();return h<12?'Bom dia, atleta.':h<18?'Boa tarde, atleta.':'Boa noite, atleta.'}
function fmtDate(d){return new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'short'}).format(d).replace('.','')}
function strengthProgressForDate(d){const info=DAYS[d.getDay()];if(!info||info.type!=='strength')return {total:0,done:0,pct:0};let total=0,done=0;(PLAN[info.day]||[]).forEach(ex=>{total+=ex.sets;for(let i=1;i<=ex.sets;i++)if(read(NS,`day.${iso(d)}.${ex.k}.${i}.done`,false))done++});return {total,done,pct:total?Math.round(done/total*100):0}}
function renderHome(){
 const root=document.getElementById('screen-hoje'),info=dayInfo(),strength=info.type==='strength',p=strength?strengthProgressForDate(selectedDate):{pct:read(CARDIO_NS,`cardio.${iso(selectedDate)}`,false)?100:0};
 const a=strength?(PLAN[info.day]||[]).length:info.minutes,b=strength?(PLAN[info.day]||[]).reduce((n,x)=>n+x.sets,0):p.pct,c=strength?'Treino':'Cardio';
 root.innerHTML=`<div class="screen-head"><span class="eyebrow">VITAFIT</span><h1>${greeting()}</h1><p>O essencial para executar o dia.</p></div><div class="date-row"><span class="date-label">${fmtDate(selectedDate)}</span><div class="date-nav"><button class="icon-btn" data-date-move="-1" aria-label="Dia anterior">‹</button><button class="soft-btn" data-today>Hoje</button><button class="icon-btn" data-date-move="1" aria-label="Próximo dia">›</button></div></div><section class="card today-card"><div class="today-ribbon"><span>HOJE NA VITAFIT</span></div><div class="today-main"><div><h2>${strength?info.title:'Cardio'}</h2><p>${DAYNAME[selectedDate.getDay()]} • ${strength?'musculação':info.minutes+' min programados'}</p></div><span class="today-icon">${strength?ICON.workout:ICON.cardio}</span></div><div class="stats"><div class="stat"><b>${a}</b><span>${strength?'EXERCÍCIOS':'MINUTOS'}</span></div><div class="stat"><b>${b}${strength?'':'%'}</b><span>${strength?'SÉRIES':'CONCLUÍDO'}</span></div><div class="stat"><b>${c}</b><span>ATIVIDADE</span></div></div><div class="progress-copy"><b>${p.pct}%</b><span>${strength?`${p.done}/${p.total} séries`:p.pct===100?'Cardio concluído':`${info.minutes} min pendentes`}</span></div><div class="progress-track"><div style="width:${p.pct}%"></div></div><div class="guidance"><b>✦</b><span>${strength?'Priorize execução, amplitude e progressão consistente.':'Mantenha um ritmo confortável e sustentável.'}</span></div><button class="primary-btn" data-open-today>${strength?'▶ INICIAR TREINO':p.pct===100?'✓ CARDIO CONCLUÍDO':'▶ ABRIR CARDIO'}</button></section><div class="support-grid"><div class="card support"><small>HOJE</small><b>${strength?'Treino':'Cardio'}</b><span>${strength?info.short:info.minutes+' min'}</span></div><div class="card support"><small>PRÓXIMO PASSO</small><b>${strength?'Registrar séries':'Concluir cardio'}</b><span>${strength?'Carga + reps + ✓':'Um toque ao finalizar'}</span></div></div>`;
 root.querySelectorAll('[data-date-move]').forEach(b=>b.addEventListener('click',()=>{selectedDate.setDate(selectedDate.getDate()+Number(b.dataset.dateMove));renderHome()}));
 root.querySelector('[data-today]').addEventListener('click',()=>{selectedDate=noon(new Date());renderHome()});
 root.querySelector('[data-open-today]').addEventListener('click',()=>{trainingDow=selectedDate.getDay();setScreen('treino')});
}
function renderWeek(){return `<div class="week">${ORDER.map(d=>{const x=DAYS[d],sel=d===trainingDow,today=iso(targetDateForDow(d))===iso(noon(new Date()));return `<button class="week-day ${x.type==='strength'?'strength':'cardio'} ${sel?'selected':''} ${today?'today':''}" data-dow="${d}" aria-pressed="${sel}"><b>${x.label}</b><span>${x.type==='strength'?'Treino':'Cardio'}</span><small>${x.type==='strength'?x.short:x.minutes+' min'}</small></button>`}).join('')}</div>`}
function renderTraining(){
 const root=document.getElementById('treino'),info=DAYS[trainingDow];root.innerHTML=`<div class="screen-head"><span class="eyebrow">ROTINA SEMANAL</span><h2>Treino da semana</h2><p>Treino e cardio organizados em uma única visão.</p></div>${renderWeek()}<div id="trainingBody"></div>`;
 root.querySelector('.week').addEventListener('click',e=>{const b=e.target.closest('[data-dow]');if(!b)return;trainingDow=Number(b.dataset.dow);renderTraining()});
 if(info.type==='cardio')renderCardioBody();else renderStrengthBody();
}
async function renderStrengthBody(){
 const info=DAYS[trainingDow],body=document.getElementById('trainingBody'),date=targetDate(),exs=PLAN[info.day],p=strengthProgressForDate(date);
 body.innerHTML=`<section class="card overview"><div><span class="eyebrow">${info.label} • TREINO DO DIA</span><h2>${info.title}</h2><p>${info.short} • musculação</p><div class="badges"><span class="badge">${exs.length} exercícios</span><span class="badge">${p.total} séries</span><span class="badge">${fmtDate(date)}</span></div><div id="videoBox" class="video-box"></div></div><div class="ring" style="--p:${p.pct}%"><b>${p.pct}%</b></div></section><div id="exerciseList">${exs.map((ex,i)=>exerciseCard(ex,i,date)).join('')}</div>`;
 bindStrength();await renderVideoBox(info.day);
}
function exerciseCard(ex,index,date){
 const rows=[];let all=true;for(let i=1;i<=ex.sets;i++){const load=read(NS,`day.${iso(date)}.${ex.k}.${i}.load`,''),reps=read(NS,`day.${iso(date)}.${ex.k}.${i}.reps`,''),done=read(NS,`day.${iso(date)}.${ex.k}.${i}.done`,false);if(!done)all=false;rows.push(`<div class="set-row"><i>${i}</i><input class="set-input" inputmode="decimal" value="${esc(load)}" placeholder="kg" data-ex="${ex.k}" data-set="${i}" data-field="load" aria-label="Carga série ${i}"><input class="set-input" inputmode="numeric" value="${esc(reps)}" placeholder="${repPlaceholder(ex,i)}" data-ex="${ex.k}" data-set="${i}" data-field="reps" aria-label="Repetições série ${i}"><button class="set-ok ${done?'done':''}" data-done="${ex.k}" data-set="${i}" aria-label="Concluir série ${i}">✓</button></div>`)}
 const prev=previous(ex,date),prevText=prev?`Último treino: ${prev.sets.map(s=>`${s.load||'—'}kg × ${s.reps||'—'}`).join(' • ')}`:'Primeiro registro deste exercício';
 return `<article class="card exercise ${all?'done':''}" data-card="${ex.k}"><div class="exercise-top"><div class="ex-num">${index+1}</div><div><h3>${ex.n}</h3>${ex.note?`<span class="ex-note">${ex.note}</span>`:''}</div><div class="prescription"><b>${ex.sets}×${ex.reps}</b><span>${ex.rest}</span></div></div><div class="sets"><div class="set-head"><span>SÉRIE</span><span>CARGA</span><span>REPS</span><span>OK</span></div>${rows.join('')}</div><div class="history">${prevText}</div></article>`
}
function repPlaceholder(ex,i){if(!ex.reps.includes('/'))return ex.reps;const nums=ex.reps.match(/\d+/g)||[];return nums[Math.min(i-1,nums.length-1)]||ex.reps}
function previous(ex,date){const arr=read(NS,hkey(ex.k),[]).filter(x=>x.date<iso(date)).sort((a,b)=>a.date.localeCompare(b.date));return arr[arr.length-1]||null}
function saveHistory(exKey){const info=DAYS[trainingDow],ex=(PLAN[info.day]||[]).find(x=>x.k===exKey);if(!ex)return;const date=targetDate(),sets=[];for(let i=1;i<=ex.sets;i++)sets.push({load:read(NS,`day.${iso(date)}.${ex.k}.${i}.load`,''),reps:read(NS,`day.${iso(date)}.${ex.k}.${i}.reps`,''),done:read(NS,`day.${iso(date)}.${ex.k}.${i}.done`,false)});if(!sets.some(s=>s.load||s.reps||s.done))return;let arr=read(NS,hkey(ex.k),[]).filter(x=>x.date!==iso(date));arr.push({date:iso(date),sets});arr.sort((a,b)=>a.date.localeCompare(b.date));write(NS,hkey(ex.k),arr.slice(-24))}
function bindStrength(){const root=document.getElementById('trainingBody');root.addEventListener('input',e=>{const inp=e.target.closest('.set-input');if(!inp)return;write(NS,key(inp.dataset.ex,Number(inp.dataset.set),inp.dataset.field),inp.value);saveHistory(inp.dataset.ex)});root.addEventListener('click',e=>{const b=e.target.closest('[data-done]');if(!b)return;const k=key(b.dataset.done,Number(b.dataset.set),'done'),val=!read(NS,k,false);write(NS,k,val);saveHistory(b.dataset.done);b.classList.toggle('done',val);const ex=(PLAN[DAYS[trainingDow].day]||[]).find(x=>x.k===b.dataset.done),card=b.closest('.exercise');if(ex&&card){let all=true;for(let i=1;i<=ex.sets;i++)if(!read(NS,key(ex.k,i,'done'),false))all=false;card.classList.toggle('done',all)}updateStrengthRing();toast(val?'Série concluída':'Série reaberta')})}
function updateStrengthRing(){const p=strengthProgressForDate(targetDate()),ring=document.querySelector('#trainingBody .ring');if(ring){ring.style.setProperty('--p',p.pct+'%');ring.querySelector('b').textContent=p.pct+'%'}if(iso(targetDate())===iso(selectedDate)&&document.getElementById('screen-hoje').innerHTML)renderHome()}
function renderCardioBody(){const info=DAYS[trainingDow],done=read(CARDIO_NS,cardioKey(trainingDow),false),body=document.getElementById('trainingBody'),date=targetDate();body.innerHTML=`<section class="card cardio-card"><span class="eyebrow">${info.label} • CARDIO</span><h2>${info.minutes} min de cardio</h2><p>Ritmo confortável e sustentável.</p><div class="badges"><span class="badge">${fmtDate(date)}</span></div><div class="cardio-meta"><div><b>${info.minutes}</b><span>MINUTOS</span></div><div><b>${done?'100%':'0%'}</b><span>CONCLUÍDO</span></div></div><button class="primary-btn" data-cardio-done>${done?'✓ Cardio concluído':'Marcar cardio concluído'}</button></section>`;body.querySelector('[data-cardio-done]').addEventListener('click',()=>{const v=!read(CARDIO_NS,cardioKey(trainingDow),false);write(CARDIO_NS,cardioKey(trainingDow),v);renderCardioBody();if(iso(targetDate())===iso(selectedDate)&&document.getElementById('screen-hoje').innerHTML)renderHome();toast(v?'Cardio concluído':'Cardio reaberto')})}
async function renderVideoBox(day){const box=document.getElementById('videoBox');if(!box)return;let saved=null;try{saved=await videoGet(day)}catch{}if(!box.isConnected)return;if(saved){box.innerHTML=`<button class="video-main" data-video-open><span class="play">▶</span><span><b>Ver execução do treino</b><small>Vídeo salvo neste aparelho</small></span><span>›</span></button><div class="video-actions"><button data-video-replace>Substituir vídeo</button><button class="danger" data-video-remove>Remover vídeo</button></div>`;box.querySelector('[data-video-open]').onclick=()=>openVideo(day);box.querySelector('[data-video-replace]').onclick=()=>chooseVideo(day);box.querySelector('[data-video-remove]').onclick=async()=>{if(!confirm('Remover o vídeo salvo deste treino neste aparelho?'))return;await videoDel(day);toast('Vídeo removido');renderVideoBox(day)}}else{box.innerHTML=`<button class="video-main" data-video-import><span class="play">＋</span><span><b>Importar vídeo da galeria</b><small>Salvo localmente na qualidade original</small></span><span>›</span></button>`;box.querySelector('[data-video-import]').onclick=()=>chooseVideo(day)}}
function chooseVideo(day){const input=document.getElementById('videoInput');input.dataset.day=day;input.value='';input.click()}
async function handleVideoInput(){const input=document.getElementById('videoInput'),file=input.files?.[0],day=input.dataset.day;if(!file||!day)return;try{await videoPut(day,file);toast('Vídeo salvo neste aparelho');if(DAYS[trainingDow]?.day===day)await renderVideoBox(day)}catch{toast('Não foi possível salvar o vídeo')}}
async function openVideo(day){let saved;try{saved=await videoGet(day)}catch{}if(!saved){chooseVideo(day);return}closeObjectUrl();objectUrl=URL.createObjectURL(saved.blob);const modal=document.getElementById('videoModal'),v=document.getElementById('videoPlayer');document.getElementById('videoTitle').textContent=DAYS[ORDER.find(d=>DAYS[d].day===day)]?.title||'Treino';v.src=objectUrl;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';v.play().catch(()=>{})}
function closeObjectUrl(){if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}}
function closeVideo(){const modal=document.getElementById('videoModal'),v=document.getElementById('videoPlayer');if(!modal?.classList.contains('open'))return;v.pause();v.removeAttribute('src');v.load();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';closeObjectUrl()}
function renderMore(){const root=document.getElementById('mais');root.innerHTML=`<div class="screen-head"><span class="eyebrow">VITAFIT</span><h2>Mais</h2><p>Somente o essencial para rotina e dados.</p></div><section class="card"><span class="eyebrow">ROTINA SEMANAL</span><h3>Semana padrão</h3><div class="schedule">${ORDER.map(d=>{const x=DAYS[d];return `<div class="${x.type==='strength'?'strength':'cardio'}"><b>${x.label}</b><span>${x.type==='strength'?'Treino':'Cardio'}</span><small>${x.type==='strength'?x.short:x.minutes+' min'}</small></div>`}).join('')}</div></section><section class="card"><span class="eyebrow">DADOS</span><h3>Backup</h3><p style="font-size:11px;color:var(--muted)">Salve ou restaure os registros do aplicativo.</p><div class="more-actions"><button class="primary-btn" data-export>Exportar backup</button><button class="soft-btn" data-import>Importar backup</button></div></section><section class="card about"><strong>VITAFIT</strong><p>Treino, consistência e evolução.</p><small>versão ${BUILD}</small></section>`;root.querySelector('[data-export]').onclick=exportBackup;root.querySelector('[data-import]').onclick=()=>document.getElementById('backupInput').click()}
function exportBackup(){const storage={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('shape12.'))storage[k]=localStorage.getItem(k)}const blob=new Blob([JSON.stringify({version:BUILD,exportedAt:new Date().toISOString(),storage},null,2)],{type:'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=`vitafit-backup-${iso(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exportado')}
function importBackup(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);Object.entries(data.storage||{}).forEach(([k,v])=>{if(k.startsWith('shape12.'))localStorage.setItem(k,v)});toast('Backup importado');setTimeout(()=>location.reload(),500)}catch{toast('Backup inválido')}};r.readAsText(file)}
function toast(msg){const e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),1100)}
window.setAppScreen=setScreen;window.setAppScreen.__vitafitFast=true;window.currentWorkoutDetails=()=>{const x=dayInfo();return x.type==='strength'?{id:'workout-'+x.day,name:x.title,tag:x.short}:{id:null,name:'Cardio',tag:x.minutes+' min'}};
window.addEventListener('beforeunload',closeObjectUrl);
mount();
if('serviceWorker'in navigator){navigator.serviceWorker.register('service-worker.js?v='+BUILD,{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{})}
})();