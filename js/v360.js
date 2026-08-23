// VITAFIT 3.6.6 — núcleo enxuto do treino, sem motor legado de vídeos
(function(){
  const BUILD='3.6.6';
  const NS='shape12.v360.';
  const dayOrder=['seg','ter','qua','qui','sex'];
  const dayMeta={
    seg:{dow:1,label:'SEG',title:'Inferiores completo',subtitle:'Inferiores + cardio moderado',cardio:'Bike ou esteira • moderado'},
    ter:{dow:2,label:'TER',title:'Superiores completo',subtitle:'Superiores + cardio',cardio:'HIIT na esteira • 20 min'},
    qua:{dow:3,label:'QUA',title:'Inferiores completo',subtitle:'Prioridade em inferiores',cardio:''},
    qui:{dow:4,label:'QUI',title:'Superiores completo',subtitle:'Superiores + cardio',cardio:'HIIT na esteira • 20 min'},
    sex:{dow:5,label:'SEX',title:'Inferiores completo',subtitle:'Inferiores completo',cardio:''}
  };
  const plan={
    seg:[
      {k:'seg-sumo',n:'Agachamento sumô',note:'Pirâmide • progressão de carga',sets:5,reps:'20 / 15 / 12 / 10',rest:'90–120 s'},
      {k:'seg-afundo',n:'Afundo no smith',note:'Cada lado',sets:4,reps:'10',rest:'90 s'},
      {k:'seg-pelvica',n:'Elevação pélvica',note:'Progressão de carga',sets:3,reps:'10',rest:'90–120 s'},
      {k:'seg-stiff',n:'Stiff',note:'Movimento controlado',sets:4,reps:'12',rest:'90 s'},
      {k:'seg-coice',n:'Coice na polia',note:'Cada lado',sets:3,reps:'8',rest:'60–75 s'}
    ],
    ter:[
      {k:'ter-remada',n:'Remada máquina',note:'Pico de contração',sets:4,reps:'12',rest:'75–90 s'},
      {k:'ter-supino',n:'Supino máquina',note:'',sets:3,reps:'12',rest:'75–90 s'},
      {k:'ter-desenvolvimento',n:'Desenvolvimento livre',note:'Movimento controlado',sets:4,reps:'10',rest:'75–90 s'},
      {k:'ter-rosca',n:'Rosca direta na polia',note:'',sets:4,reps:'10',rest:'60–75 s'},
      {k:'ter-triceps',n:'Tríceps corda',note:'',sets:3,reps:'20',rest:'60 s'}
    ],
    qua:[
      {k:'qua-extensora',n:'Cadeira extensora',note:'Dropset',sets:3,reps:'20',rest:'60–75 s'},
      {k:'qua-smith',n:'Agachamento smith',note:'Pirâmide 15 / 12 / 10',sets:4,reps:'15 / 12 / 10',rest:'90–120 s'},
      {k:'qua-leguni',n:'Leg press unilateral',note:'Cada lado',sets:3,reps:'10',rest:'90 s'},
      {k:'qua-flexora',n:'Cadeira flexora',note:'Pico de contração',sets:4,reps:'12',rest:'75 s'},
      {k:'qua-stiff',n:'Stiff',note:'Movimento controlado',sets:3,reps:'12',rest:'90 s'},
      {k:'qua-abdutora',n:'Cadeira abdutora',note:'Pico de contração',sets:3,reps:'15',rest:'60 s'}
    ],
    qui:[
      {k:'qui-remada',n:'Remada máquina',note:'Pico de contração',sets:4,reps:'12',rest:'75–90 s'},
      {k:'qui-supino',n:'Supino máquina',note:'',sets:3,reps:'12',rest:'75–90 s'},
      {k:'qui-desenvolvimento',n:'Desenvolvimento livre',note:'Movimento controlado',sets:4,reps:'10',rest:'75–90 s'},
      {k:'qui-rosca',n:'Rosca direta na polia',note:'',sets:4,reps:'10',rest:'60–75 s'},
      {k:'qui-triceps',n:'Tríceps corda',note:'',sets:3,reps:'20',rest:'60 s'}
    ],
    sex:[
      {k:'sex-afundo',n:'Afundo no smith',note:'Progressão de carga',sets:4,reps:'10',rest:'90 s'},
      {k:'sex-bulgaro',n:'Agachamento búlgaro',note:'Movimento controlado',sets:3,reps:'12',rest:'90 s'},
      {k:'sex-sumo',n:'Terra sumô',note:'Progressão de carga',sets:4,reps:'8',rest:'90–120 s'},
      {k:'sex-coice-abd',n:'Coice na polia + abdução na polia',note:'3×12 em ambos',sets:3,reps:'12',rest:'60–75 s'},
      {k:'sex-abdutora',n:'Cadeira abdutora',note:'Dropset',sets:3,reps:'20',rest:'60 s'},
      {k:'sex-pelvica',n:'Elevação pélvica',note:'Progressão de carga',sets:4,reps:'10',rest:'90–120 s'}
    ]
  };

  const json=(k,f)=>{try{const v=localStorage.getItem(NS+k);return v===null?f:JSON.parse(v)}catch(e){return f}};
  const put=(k,v)=>{try{localStorage.setItem(NS+k,JSON.stringify(v))}catch(e){}};
  const dateKey=()=>{try{return typeof isoDate==='function'&&window.selectedDate?isoDate(window.selectedDate):new Date().toISOString().slice(0,10)}catch(e){return new Date().toISOString().slice(0,10)}};
  const key=(ex,i,field)=>`day.${dateKey()}.${ex}.${i}.${field}`;
  const hkey=ex=>`history.${ex}`;
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let activeDay=null;

  function initialDay(){const dow=(window.selectedDate||new Date()).getDay();return dayOrder.find(d=>dayMeta[d].dow===dow)||json('ui.day','seg')}
  function findExercise(exKey){return Object.values(plan).flat().find(x=>x.k===exKey)||null}
  function exerciseDone(ex){return Array.from({length:ex.sets},(_,j)=>json(key(ex.k,j+1,'done'),false)).every(Boolean)}
  function progress(){let total=0,done=0;(plan[activeDay]||[]).forEach(ex=>{total+=ex.sets;for(let i=1;i<=ex.sets;i++)if(json(key(ex.k,i,'done'),false))done++});return {total,done,pct:total?Math.round(done/total*100):0}}
  function previous(ex){const arr=json(hkey(ex.k),[]).filter(x=>x.date<dateKey()).sort((a,b)=>a.date.localeCompare(b.date));return arr[arr.length-1]||null}
  function saveHistory(exKey){
    const ex=findExercise(exKey);if(!ex)return;
    const sets=[];for(let i=1;i<=ex.sets;i++)sets.push({load:json(key(ex.k,i,'load'),''),reps:json(key(ex.k,i,'reps'),''),done:json(key(ex.k,i,'done'),false)});
    if(!sets.some(s=>s.load||s.reps||s.done))return;
    let arr=json(hkey(ex.k),[]).filter(x=>x.date!==dateKey());arr.push({date:dateKey(),sets});arr.sort((a,b)=>a.date.localeCompare(b.date));put(hkey(ex.k),arr.slice(-24));
  }
  function targetPlaceholder(ex,i){if(!ex.reps.includes('/'))return ex.reps;const nums=ex.reps.match(/\d+/g)||[];return nums[Math.min(i-1,nums.length-1)]||ex.reps}

  function exCard(ex,index){
    const prev=previous(ex),done=exerciseDone(ex);
    const rows=Array.from({length:ex.sets},(_,j)=>{const i=j+1,load=json(key(ex.k,i,'load'),''),reps=json(key(ex.k,i,'reps'),''),ok=json(key(ex.k,i,'done'),false);return `<div class="v360-set"><i>${i}</i><input class="v360-input" inputmode="decimal" value="${esc(load)}" placeholder="kg" data-ex="${ex.k}" data-set="${i}" data-field="load"><input class="v360-input" inputmode="numeric" value="${esc(reps)}" placeholder="${targetPlaceholder(ex,i)}" data-ex="${ex.k}" data-set="${i}" data-field="reps"><button class="v360-set-ok ${ok?'done':''}" data-done="${ex.k}" data-set="${i}" aria-label="Concluir série ${i}">✓</button></div>`}).join('');
    const prevText=prev?`Último treino: ${prev.sets.map(s=>`${s.load||'—'}kg × ${s.reps||'—'}`).join(' • ')}`:'Primeiro registro deste exercício';
    return `<article class="v360-ex ${done?'done':''}" data-ex-card="${ex.k}"><div class="v360-ex-top"><div class="v360-num">${index+1}</div><div><h3>${ex.n}</h3>${ex.note?`<span class="v360-ex-note">${ex.note}</span>`:''}</div><div class="v360-presc"><b>${ex.sets}×${ex.reps}</b><span>${ex.rest}</span></div></div><div class="v360-sets"><div class="v360-set-head"><span>Série</span><span>Carga</span><span>Reps</span><span>OK</span></div>${rows}</div><div class="v360-history">${prevText}</div></article>`;
  }

  function shell(){
    const training=document.getElementById('treino');if(!training)return null;
    if(!training.classList.contains('v360-ready')){
      const legacy=document.createElement('div');legacy.id='v360LegacyTraining';legacy.hidden=true;legacy.setAttribute('aria-hidden','true');
      while(training.firstChild)legacy.appendChild(training.firstChild);
      training.appendChild(legacy);
      const app=document.createElement('div');app.id='v360TrainingApp';app.className='v360-shell';training.insertBefore(app,legacy);training.classList.add('v360-ready');
      const toast=document.createElement('div');toast.id='v360Toast';toast.className='v360-toast';document.body.appendChild(toast);
      bindApp(app);
    }
    return document.getElementById('v360TrainingApp');
  }

  function render(){
    const app=shell();if(!app)return;
    const meta=dayMeta[activeDay],p=progress();
    app.innerHTML=`<section class="v360-hero"><span class="v360-kicker">TREINO • V${BUILD}</span><h1>Treino da semana</h1><p>Séries, carga, repetições, histórico e vídeo da programação no topo da ficha.</p></section><div class="v360-week">${dayOrder.map(d=>`<button class="v360-day ${d===activeDay?'active':''}" data-day="${d}"><b>${dayMeta[d].label}</b><span>${dayMeta[d].title.replace(' completo','')}</span></button>`).join('')}</div><section class="v360-overview"><div><span class="v360-kicker">${meta.label} • TREINO DO DIA</span><h2>${meta.title}</h2><p>${meta.subtitle}</p><div class="v360-badges"><span class="v360-badge">${plan[activeDay].length} exercícios</span><span class="v360-badge">${p.total} séries</span>${meta.cardio?`<span class="v360-badge">${meta.cardio}</span>`:''}</div></div><div class="v360-progress" style="--p:${p.pct}%"><b>${p.pct}%</b></div></section><div class="v360-list">${plan[activeDay].map(exCard).join('')}</div>${meta.cardio?`<div class="v360-cardio"><div><b>Cardio do dia</b><span>${meta.cardio}</span></div><button id="v360Cardio" class="${json(`day.${dateKey()}.${activeDay}.cardio`,false)?'done':''}">${json(`day.${dateKey()}.${activeDay}.cardio`,false)?'✓ Concluído':'Marcar concluído'}</button></div>`:''}`;
    syncBuild();
  }

  function bindApp(app){
    if(app.dataset.bound==='1')return;app.dataset.bound='1';
    app.addEventListener('click',e=>{
      const day=e.target.closest('[data-day]');if(day){const d=day.dataset.day;if(plan[d]&&d!==activeDay){activeDay=d;put('ui.day',d);render()}return}
      const done=e.target.closest('[data-done]');if(done){toggleSet(done);return}
      const cardio=e.target.closest('#v360Cardio');if(cardio){const k=`day.${dateKey()}.${activeDay}.cardio`;const val=!json(k,false);put(k,val);cardio.classList.toggle('done',val);cardio.textContent=val?'✓ Concluído':'Marcar concluído'}
    });
    app.addEventListener('input',e=>{
      const inp=e.target.closest('.v360-input');if(!inp)return;
      put(key(inp.dataset.ex,Number(inp.dataset.set),inp.dataset.field),inp.value);saveHistory(inp.dataset.ex);updateProgressOnly();
    });
  }

  function toggleSet(btn){
    const exKey=btn.dataset.done,i=Number(btn.dataset.set),k=key(exKey,i,'done'),val=!json(k,false);put(k,val);saveHistory(exKey);
    btn.classList.toggle('done',val);
    const ex=findExercise(exKey),card=btn.closest('[data-ex-card]');if(ex&&card)card.classList.toggle('done',exerciseDone(ex));
    updateProgressOnly();showToast(val?'Série concluída':'Série reaberta');
  }
  function updateProgressOnly(){const p=progress(),ring=document.querySelector('#v360TrainingApp .v360-progress');if(ring){ring.style.setProperty('--p',p.pct+'%');const b=ring.querySelector('b');if(b)b.textContent=p.pct+'%'}}
  function showToast(t){const el=document.getElementById('v360Toast');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1100)}
  function syncBuild(){window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD}

  window.currentWorkoutDetails=function(){const dow=(window.selectedDate||new Date()).getDay(),d=dayOrder.find(x=>dayMeta[x].dow===dow);return d?{id:'workout-'+d,name:dayMeta[d].title,tag:dayMeta[d].subtitle}:{id:null,name:'Descanso',tag:'Recuperação'}};
  const prevSetScreen=window.setAppScreen;if(typeof prevSetScreen==='function')window.setAppScreen=function(id,opts={}){prevSetScreen(id,opts);if(id==='treino'){const next=initialDay();if(next!==activeDay){activeDay=next;requestAnimationFrame(render)}};syncBuild()};
  const prevRenderAll=window.renderAll;if(typeof prevRenderAll==='function')window.renderAll=function(){prevRenderAll();if(document.getElementById('v360TrainingApp')){const next=initialDay();if(next!==activeDay){activeDay=next;requestAnimationFrame(render)}};syncBuild()};

  activeDay=initialDay();shell();render();syncBuild();
})();
