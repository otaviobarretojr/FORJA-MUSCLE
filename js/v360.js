// VITAFIT 3.6.0 — rework completo da área de treino, preservando shape12.*
(function(){
  const BUILD='3.6.0';
  const NS='shape12.v360.';
  const dayOrder=['seg','ter','qua','qui','sex'];
  const dayMeta={
    seg:{dow:1,label:'SEG',title:'Inferiores completo',subtitle:'Inferiores + cardio moderado',cardio:'Bike ou esteira • moderado',video:'191175'},
    ter:{dow:2,label:'TER',title:'Superiores completo',subtitle:'Superiores + cardio',cardio:'HIIT na esteira • 20 min',video:'191177'},
    qua:{dow:3,label:'QUA',title:'Inferiores completo',subtitle:'Prioridade em inferiores',cardio:'',video:'191179'},
    qui:{dow:4,label:'QUI',title:'Superiores completo',subtitle:'Superiores + cardio',cardio:'HIIT na esteira • 20 min',video:'191177'},
    sex:{dow:5,label:'SEX',title:'Inferiores completo',subtitle:'Inferiores completo',cardio:'',video:'191181'}
  };
  const plan={
    seg:[
      {k:'seg-sumo',n:'Agachamento sumô',note:'Pirâmide • progressão de carga',sets:5,reps:'20 / 15 / 12 / 10',rest:'90–120 s',start:0},
      {k:'seg-afundo',n:'Afundo no smith',note:'Cada lado',sets:4,reps:'10',rest:'90 s',start:2.2},
      {k:'seg-pelvica',n:'Elevação pélvica',note:'Progressão de carga',sets:3,reps:'10',rest:'90–120 s',start:4.4},
      {k:'seg-stiff',n:'Stiff',note:'Movimento controlado',sets:4,reps:'12',rest:'90 s',start:6.6},
      {k:'seg-coice',n:'Coice na polia',note:'Cada lado',sets:3,reps:'8',rest:'60–75 s',start:8.8}
    ],
    ter:[
      {k:'ter-remada',n:'Remada máquina',note:'Pico de contração',sets:4,reps:'12',rest:'75–90 s',start:0},
      {k:'ter-supino',n:'Supino máquina',note:'',sets:3,reps:'12',rest:'75–90 s',start:2.2},
      {k:'ter-desenvolvimento',n:'Desenvolvimento livre',note:'Movimento controlado',sets:4,reps:'10',rest:'75–90 s',start:4.4},
      {k:'ter-rosca',n:'Rosca direta na polia',note:'',sets:4,reps:'10',rest:'60–75 s',start:6.6},
      {k:'ter-triceps',n:'Tríceps corda',note:'',sets:3,reps:'20',rest:'60 s',start:8.8}
    ],
    qua:[
      {k:'qua-extensora',n:'Cadeira extensora',note:'Dropset',sets:3,reps:'20',rest:'60–75 s',start:0},
      {k:'qua-smith',n:'Agachamento smith',note:'Pirâmide 15 / 12 / 10',sets:4,reps:'15 / 12 / 10',rest:'90–120 s',start:2},
      {k:'qua-leguni',n:'Leg press unilateral',note:'Cada lado',sets:3,reps:'10',rest:'90 s',start:4},
      {k:'qua-flexora',n:'Cadeira flexora',note:'Pico de contração',sets:4,reps:'12',rest:'75 s',start:6},
      {k:'qua-stiff',n:'Stiff',note:'Movimento controlado',sets:3,reps:'12',rest:'90 s',start:8},
      {k:'qua-abdutora',n:'Cadeira abdutora',note:'Pico de contração',sets:3,reps:'15',rest:'60 s',start:10}
    ],
    qui:[
      {k:'qui-remada',n:'Remada máquina',note:'Pico de contração',sets:4,reps:'12',rest:'75–90 s',start:0},
      {k:'qui-supino',n:'Supino máquina',note:'',sets:3,reps:'12',rest:'75–90 s',start:2.2},
      {k:'qui-desenvolvimento',n:'Desenvolvimento livre',note:'Movimento controlado',sets:4,reps:'10',rest:'75–90 s',start:4.4},
      {k:'qui-rosca',n:'Rosca direta na polia',note:'',sets:4,reps:'10',rest:'60–75 s',start:6.6},
      {k:'qui-triceps',n:'Tríceps corda',note:'',sets:3,reps:'20',rest:'60 s',start:8.8}
    ],
    sex:[
      {k:'sex-afundo',n:'Afundo no smith',note:'Progressão de carga',sets:4,reps:'10',rest:'90 s',start:0},
      {k:'sex-bulgaro',n:'Agachamento búlgaro',note:'Movimento controlado',sets:3,reps:'12',rest:'90 s',start:2},
      {k:'sex-sumo',n:'Terra sumô',note:'Progressão de carga',sets:4,reps:'8',rest:'90–120 s',start:4},
      {k:'sex-coice-abd',n:'Coice na polia + abdução na polia',note:'3×12 em ambos',sets:3,reps:'12',rest:'60–75 s',start:6},
      {k:'sex-abdutora',n:'Cadeira abdutora',note:'Dropset',sets:3,reps:'20',rest:'60 s',start:8},
      {k:'sex-pelvica',n:'Elevação pélvica',note:'Progressão de carga',sets:4,reps:'10',rest:'90–120 s',start:10}
    ]
  };

  const json=(k,f)=>{try{const v=localStorage.getItem(NS+k);return v===null?f:JSON.parse(v)}catch(e){return f}};
  const put=(k,v)=>{try{localStorage.setItem(NS+k,JSON.stringify(v))}catch(e){}};
  const dateKey=()=>{try{return typeof isoDate==='function'&&window.selectedDate?isoDate(window.selectedDate):new Date().toISOString().slice(0,10)}catch(e){return new Date().toISOString().slice(0,10)}};
  const key=(ex,i,field)=>`day.${dateKey()}.${ex}.${i}.${field}`;
  const hkey=ex=>`history.${ex}`;
  let activeDay=null, modalUrl=null, modalEnd=0;

  function initialDay(){
    const dow=(window.selectedDate||new Date()).getDay();
    return dayOrder.find(d=>dayMeta[d].dow===dow)||json('ui.day','seg');
  }
  function setDay(day){if(!plan[day])return;activeDay=day;put('ui.day',day);render()}
  function setDone(ex,i,val){put(key(ex,i,'done'),val);saveHistory(ex);render()}
  function setVal(ex,i,field,val){put(key(ex,i,field),val);saveHistory(ex);updateProgressOnly()}
  function exerciseDone(ex){return Array.from({length:ex.sets},(_,j)=>json(key(ex,j+1,'done'),false)).every(Boolean)}
  function progress(){const all=plan[activeDay];let total=0,done=0;all.forEach(ex=>{total+=ex.sets;for(let i=1;i<=ex.sets;i++)if(json(key(ex.k,i,'done'),false))done++});return {total,done,pct:total?Math.round(done/total*100):0}}
  function previous(ex){const arr=json(hkey(ex.k),[]).filter(x=>x.date<dateKey()).sort((a,b)=>a.date.localeCompare(b.date));return arr[arr.length-1]||null}
  function saveHistory(exKey){
    const ex=Object.values(plan).flat().find(x=>x.k===exKey);if(!ex)return;
    const sets=[];for(let i=1;i<=ex.sets;i++)sets.push({load:json(key(ex.k,i,'load'),''),reps:json(key(ex.k,i,'reps'),''),done:json(key(ex.k,i,'done'),false)});
    if(!sets.some(s=>s.load||s.reps||s.done))return;
    let arr=json(hkey(ex.k),[]).filter(x=>x.date!==dateKey());arr.push({date:dateKey(),sets});arr.sort((a,b)=>a.date.localeCompare(b.date));put(hkey(ex.k),arr.slice(-24));
  }
  function targetPlaceholder(ex,i){
    if(!ex.reps.includes('/'))return ex.reps;
    const nums=(ex.reps.match(/\d+/g)||[]);return nums[Math.min(i-1,nums.length-1)]||ex.reps;
  }
  function exCard(ex,index){
    const prev=previous(ex),done=exerciseDone(ex);
    const rows=Array.from({length:ex.sets},(_,j)=>{const i=j+1,load=json(key(ex.k,i,'load'),''),reps=json(key(ex.k,i,'reps'),''),ok=json(key(ex.k,i,'done'),false),ps=prev?.sets?.[j];return `<div class="v360-set"><i>${i}</i><input class="v360-input" inputmode="decimal" value="${esc(load)}" placeholder="kg" data-ex="${ex.k}" data-set="${i}" data-field="load"><input class="v360-input" inputmode="numeric" value="${esc(reps)}" placeholder="${targetPlaceholder(ex,i)}" data-ex="${ex.k}" data-set="${i}" data-field="reps"><button class="v360-set-ok ${ok?'done':''}" data-done="${ex.k}" data-set="${i}">✓</button></div>`}).join('');
    const prevText=prev?`Último treino: ${prev.sets.map(s=>`${s.load||'—'}kg × ${s.reps||'—'}`).join(' • ')}`:'Primeiro registro deste exercício';
    return `<article class="v360-ex ${done?'done':''}" data-ex-card="${ex.k}"><div class="v360-ex-top"><div class="v360-num">${index+1}</div><div><h3>${ex.n}</h3>${ex.note?`<span class="v360-ex-note">${ex.note}</span>`:''}</div><div class="v360-presc"><b>${ex.sets}×${ex.reps}</b><span>${ex.rest}</span></div></div><button class="v360-video-btn" data-video-ex="${ex.k}"><span class="play">▶</span><span><b>Ver execução</b><small>Vídeo rápido • toque para abrir</small></span></button><div class="v360-sets"><div class="v360-set-head"><span>Série</span><span>Carga</span><span>Reps</span><span>OK</span></div>${rows}</div><div class="v360-history">${prevText}</div></article>`;
  }
  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function shell(){
    const training=document.getElementById('treino');if(!training)return null;
    if(!training.classList.contains('v360-ready')){
      const legacy=document.createElement('div');legacy.id='v360LegacyTraining';
      while(training.firstChild)legacy.appendChild(training.firstChild);
      training.appendChild(legacy);
      const app=document.createElement('div');app.id='v360TrainingApp';app.className='v360-shell';training.insertBefore(app,legacy);
      training.classList.add('v360-ready');
      const modal=document.createElement('div');modal.id='v360VideoModal';modal.className='v360-video-modal';modal.innerHTML='<div class="v360-video-box"><div class="v360-video-head"><b id="v360VideoTitle">Execução</b><button type="button" id="v360VideoClose">×</button></div><video id="v360Video" playsinline muted controls></video><div class="v360-video-help">Referência rápida do movimento. Use amplitude confortável e priorize controle.</div></div>';document.body.appendChild(modal);
      const toast=document.createElement('div');toast.id='v360Toast';toast.className='v360-toast';document.body.appendChild(toast);
      modal.addEventListener('click',e=>{if(e.target===modal)closeVideo()});modal.querySelector('#v360VideoClose').addEventListener('click',closeVideo);
      modal.querySelector('video').addEventListener('timeupdate',e=>{if(modalEnd&&e.target.currentTime>=modalEnd){e.target.currentTime=Math.max(0,modalEnd-2.2);e.target.play().catch(()=>{})}});
    }
    return document.getElementById('v360TrainingApp');
  }
  function render(){
    const app=shell();if(!app)return;const meta=dayMeta[activeDay],p=progress();
    app.innerHTML=`<section class="v360-hero"><span class="v360-kicker">NOVO TREINO • V${BUILD}</span><h1>Treino da semana</h1><p>Ficha refeita para uso na academia: séries, carga, repetições, histórico e demonstração em vídeo no mesmo lugar.</p></section><div class="v360-week">${dayOrder.map(d=>`<button class="v360-day ${d===activeDay?'active':''}" data-day="${d}"><b>${dayMeta[d].label}</b><span>${dayMeta[d].title.replace(' completo','')}</span></button>`).join('')}</div><section class="v360-overview"><div><span class="v360-kicker">${meta.label} • TREINO DO DIA</span><h2>${meta.title}</h2><p>${meta.subtitle}</p><div class="v360-badges"><span class="v360-badge">${plan[activeDay].length} exercícios</span><span class="v360-badge">${p.total} séries</span>${meta.cardio?`<span class="v360-badge">${meta.cardio}</span>`:''}</div></div><div class="v360-progress" style="--p:${p.pct}%"><b>${p.pct}%</b></div></section><div class="v360-list">${plan[activeDay].map(exCard).join('')}</div>${meta.cardio?`<div class="v360-cardio"><div><b>Cardio do dia</b><span>${meta.cardio}</span></div><button id="v360Cardio" class="${json(`day.${dateKey()}.${activeDay}.cardio`,false)?'done':''}">${json(`day.${dateKey()}.${activeDay}.cardio`,false)?'✓ Concluído':'Marcar concluído'}</button></div>`:''}`;
    bind();syncBuild();
  }
  function bind(){
    document.querySelectorAll('#v360TrainingApp [data-day]').forEach(b=>b.addEventListener('click',()=>setDay(b.dataset.day)));
    document.querySelectorAll('#v360TrainingApp .v360-input').forEach(inp=>inp.addEventListener('input',()=>setVal(inp.dataset.ex,Number(inp.dataset.set),inp.dataset.field,inp.value)));
    document.querySelectorAll('#v360TrainingApp [data-done]').forEach(b=>b.addEventListener('click',()=>{const ex=b.dataset.done,i=Number(b.dataset.set);setDone(ex,i,!json(key(ex,i,'done'),false));showToast(json(key(ex,i,'done'),false)?'Série concluída':'Série reaberta')}));
    document.querySelectorAll('#v360TrainingApp [data-video-ex]').forEach(b=>b.addEventListener('click',()=>openVideo(b.dataset.videoEx)));
    const cardio=document.getElementById('v360Cardio');if(cardio)cardio.addEventListener('click',()=>{const k=`day.${dateKey()}.${activeDay}.cardio`;put(k,!json(k,false));render()});
  }
  function updateProgressOnly(){const p=progress(),ring=document.querySelector('.v360-progress');if(ring){ring.style.setProperty('--p',p.pct+'%');const b=ring.querySelector('b');if(b)b.textContent=p.pct+'%'}}
  async function videoBlob(id){
    const paths=[`assets/videos/${id}.00.b64`,`assets/videos/${id}.01.b64`];
    const chunks=await Promise.all(paths.map(async p=>{const r=await fetch(p+'?v='+BUILD,{cache:'force-cache'});if(!r.ok)throw new Error('video');return (await r.text()).trim()}));
    const bin=atob(chunks.join('')),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new Blob([bytes],{type:'video/mp4'});
  }
  async function openVideo(exKey){
    const ex=plan[activeDay].find(x=>x.k===exKey);if(!ex)return;const modal=document.getElementById('v360VideoModal'),video=document.getElementById('v360Video');document.getElementById('v360VideoTitle').textContent=ex.n;modal.classList.add('open');document.body.style.overflow='hidden';video.poster='';
    try{video.pause();if(modalUrl)URL.revokeObjectURL(modalUrl);const blob=await videoBlob(dayMeta[activeDay].video);modalUrl=URL.createObjectURL(blob);video.src=modalUrl;video.load();const go=()=>{video.currentTime=Math.min(ex.start,Math.max(0,(video.duration||12)-1));modalEnd=Math.min(video.currentTime+2.2,video.duration||12);video.play().catch(()=>{})};if(video.readyState>=1)go();else video.addEventListener('loadedmetadata',go,{once:true})}catch(e){showToast('Não foi possível abrir o vídeo')}
  }
  function closeVideo(){const modal=document.getElementById('v360VideoModal'),video=document.getElementById('v360Video');if(video)video.pause();if(modal)modal.classList.remove('open');document.body.style.overflow='';modalEnd=0}
  function showToast(t){const el=document.getElementById('v360Toast');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1300)}
  function syncBuild(){window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD}

  // Mantém os resumos da Home coerentes com a nova rotina.
  window.currentWorkoutDetails=function(){const dow=(window.selectedDate||new Date()).getDay(),d=dayOrder.find(x=>dayMeta[x].dow===dow);return d?{id:'workout-'+d,name:dayMeta[d].title,tag:dayMeta[d].subtitle}:{id:null,name:'Descanso',tag:'Recuperação'}};
  const prevSetScreen=window.setAppScreen;if(typeof prevSetScreen==='function')window.setAppScreen=function(id,opts={}){prevSetScreen(id,opts);if(id==='treino'){activeDay=initialDay();requestAnimationFrame(render)};syncBuild()};
  const prevRenderAll=window.renderAll;if(typeof prevRenderAll==='function')window.renderAll=function(){prevRenderAll();if(document.getElementById('v360TrainingApp')){activeDay=initialDay();requestAnimationFrame(render)};syncBuild()};
  activeDay=initialDay();shell();render();syncBuild();
})();
