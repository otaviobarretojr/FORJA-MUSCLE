// VITAFIT / FORJA MUSCLE v3.5.4 — nova rotina semanal + demos em vídeo
(function(){
  const VIDEO_BY_DOW={1:'assets/workouts/segunda.b64',2:'assets/workouts/superiores.b64',3:'assets/workouts/quarta.b64',4:'assets/workouts/superiores.b64',5:'assets/workouts/sexta.b64'};
  const dayCode={1:'seg',2:'ter',3:'qua',4:'qui',5:'sex'};
  const plans={
    seg:[
      ['seg-sumo','Agachamento sumô','Pirâmide • 20/15/12/10','5×20/15/12/10','90–120s',0],
      ['seg-afundo','Afundo no smith','4×10 cada lado','4×10','90s',2],
      ['seg-pelvica','Elevação pélvica','Progressão de carga','3×10','90–120s',4],
      ['seg-stiff','Stiff','Movimento controlado','4×12','90s',6],
      ['seg-coice','Coice na polia','Cada lado','3×8','60–75s',8]
    ],
    ter:[
      ['ter-remada','Remada máquina','Pico de contração','4×12','75–90s',0],
      ['ter-supino','Supino máquina','','3×12','75–90s',2],
      ['ter-desenvolvimento','Desenvolvimento livre','Movimento controlado','4×10','75–90s',4],
      ['ter-rosca','Rosca direta na polia','','4×10','60–75s',6],
      ['ter-triceps','Tríceps corda','','3×20','60s',8]
    ],
    qua:[
      ['qua-extensora','Cadeira extensora','Dropset','3×20','60–75s',0],
      ['qua-smith','Agachamento smith','Pirâmide 15/12/10','4×15/12/10','90–120s',2],
      ['qua-leguni','Leg press unilateral','Cada lado','3×10','90s',4],
      ['qua-flexora','Cadeira flexora','Pico de contração','4×12','75s',6],
      ['qua-stiff','Stiff','Movimento controlado','3×12','90s',8],
      ['qua-abdutora','Cadeira abdutora','Pico de contração','3×15','60s',10]
    ],
    qui:[
      ['qui-remada','Remada máquina','Pico de contração','4×12','75–90s',0],
      ['qui-supino','Supino máquina','','3×12','75–90s',2],
      ['qui-desenvolvimento','Desenvolvimento livre','Movimento controlado','4×10','75–90s',4],
      ['qui-rosca','Rosca direta na polia','','4×10','60–75s',6],
      ['qui-triceps','Tríceps corda','','3×20','60s',8]
    ],
    sex:[
      ['sex-afundo','Afundo no smith','Progressão de carga','4×10','90s',0],
      ['sex-bulgaro','Agachamento búlgaro','Movimento controlado','3×12','90s',2],
      ['sex-sumo','Terra sumô','Progressão de carga','4×8','90–120s',4],
      ['sex-coice-abd','Coice na polia + abdução na polia','3×12 em ambos','3×12','60–75s',6],
      ['sex-abdutora','Cadeira abdutora','Dropset','3×20','60s',8],
      ['sex-pelvica','Elevação pélvica','Progressão de carga','4×10','90–120s',10]
    ]
  };
  const labels={
    1:{name:'Inferiores completo',tag:'Inferiores + cardio moderado',cardio:'Bike ou esteira • moderado'},
    2:{name:'Superiores completo',tag:'Superiores + cardio',cardio:'HIIT na esteira • 20 min'},
    3:{name:'Inferiores completo',tag:'Prioridade em inferiores',cardio:''},
    4:{name:'Superiores completo',tag:'Superiores + cardio',cardio:'HIIT na esteira • 20 min'},
    5:{name:'Inferiores completo',tag:'Inferiores completo',cardio:''}
  };

  Object.assign(dowPlans,{
    0:{type:'Recuperação',plan:'Descanso',detail:'Recuperação e rotina normal',water:3000},
    1:{type:'Musculação',plan:'Inferiores completo',detail:'Inferiores + cardio moderado',water:3000},
    2:{type:'Musculação',plan:'Superiores completo',detail:'Superiores + HIIT 20 min',water:3000},
    3:{type:'Musculação',plan:'Inferiores completo',detail:'Prioridade em inferiores',water:3000},
    4:{type:'Musculação',plan:'Superiores completo',detail:'Superiores + HIIT 20 min',water:3000},
    5:{type:'Musculação',plan:'Inferiores completo',detail:'Inferiores completo',water:3000},
    6:{type:'Recuperação',plan:'Descanso',detail:'Recuperação e mobilidade opcional',water:3000}
  });

  window.currentWorkoutDetails=function(){
    const dow=selectedDate.getDay(),l=labels[dow];
    return l?{id:'workout-'+dayCode[dow],name:l.name,tag:l.tag}:{id:null,name:'Descanso',tag:'Recuperação'};
  };
  window.cardioPlan=function(){return {mon:'moderado',tue:'20 min HIIT',wed:'',thu:'20 min HIIT',fri:''}};
  window.renderCardio=function(){
    const h=document.getElementById('cardioPhaseHead'),rows=document.getElementById('cardioRows'); if(!rows)return;
    if(h)h.textContent='Prescrição';
    rows.innerHTML='<tr><td><b>Segunda</b></td><td>Bike ou esteira</td><td>Moderado</td><td><span class="tag">pós-treino</span></td></tr><tr><td><b>Terça</b></td><td>Esteira</td><td>20 min</td><td><span class="tag">HIIT</span></td></tr><tr><td><b>Quinta</b></td><td>Esteira</td><td>20 min</td><td><span class="tag">HIIT</span></td></tr>';
  };
  window.renderTodayWorkoutCard=function(){
    const w=currentWorkoutDetails(),dow=selectedDate.getDay(),l=labels[dow];
    twTitle.textContent=w.name;twTag.textContent=w.tag;twSubtitle.textContent=l?(l.cardio?`Musculação • ${l.cardio}`:'Musculação'):'Dia de recuperação';
    startWorkoutBtn.style.display=w.id?'inline-block':'none';
    cardioDoneBtn.style.display=([1,2,4].includes(dow))?'inline-block':'none';
    cardioDoneBtn.classList.toggle('done',store.get(dk('cardioDone'),false));
    cardioDoneBtn.textContent=store.get(dk('cardioDone'),false)?'✓ Cardio concluído':'✓ Marcar cardio';
    restoreSessionUI();renderSessionKpis();
  };

  const oldParse=window.parsePrescription;
  window.parsePrescription=function(range){
    const s=String(range||'');
    if(s.includes('/')){
      const nums=(s.match(/\d+/g)||[]).map(Number),sets=nums.shift()||3;
      if(nums.length)return {sets,min:Math.min(...nums),max:Math.max(...nums)};
    }
    return oldParse(range);
  };

  function exerciseHTML(item,dow){
    const [key,name,note,range,rest,start]=item;
    return `<div class="exercise" data-ex="${key}" data-range="${range}" data-demo-src="${VIDEO_BY_DOW[dow]}" data-demo-start="${start}"><div class="name">${name}${note?`<small>${note}</small>`:''}</div><div class="data">${range}</div><div class="data rest">${rest}</div><input class="load-input" inputmode="decimal" placeholder="kg" data-load="${key}"><input class="reps-input" inputmode="numeric" placeholder="reps" data-reps="${key}"><button class="ex-check" data-key="${key}">✓</button><div class="exercise-sub"><span class="progress-hint" id="hint-${key}">Registre carga + repetições</span></div><div class="history-box" id="hist-${key}"></div></div>`;
  }

  function rebuildTraining(){
    const schedule=document.getElementById('schedule');
    if(schedule)schedule.innerHTML=`<div class="day training" data-dow="1"><b>SEG</b><strong>Inferiores</strong><small>Completo + cardio moderado</small></div><div class="day training" data-dow="2"><b>TER</b><strong>Superiores</strong><small>Completo + HIIT</small></div><div class="day training" data-dow="3"><b>QUA</b><strong>Inferiores</strong><small>Prioridade inferiores</small></div><div class="day training" data-dow="4"><b>QUI</b><strong>Superiores</strong><small>Completo + HIIT</small></div><div class="day training" data-dow="5"><b>SEX</b><strong>Inferiores</strong><small>Completo</small></div><div class="day" data-dow="6"><b>SÁB</b><strong>Descanso</strong><small>Recuperação</small></div><div class="day" data-dow="0"><b>DOM</b><strong>Descanso</strong><small>Recuperação</small></div>`;
    const first=document.querySelector('details[id^="workout-"]'); if(!first)return;
    const parent=first.parentNode,marker=document.createComment('v354-workouts');parent.insertBefore(marker,first);
    document.querySelectorAll('details[id^="workout-"]').forEach(x=>x.remove());
    const defs=[[1,'seg','SEGUNDA • Inferiores completo','Inferiores + cardio moderado'],[2,'ter','TERÇA • Superiores completo','Superiores + HIIT 20 min'],[3,'qua','QUARTA • Inferiores completo','Prioridade em inferiores'],[4,'qui','QUINTA • Superiores completo','Superiores + HIIT 20 min'],[5,'sex','SEXTA • Inferiores completo','Inferiores completo']];
    defs.forEach(([dow,code,title,sub])=>{
      const d=document.createElement('details');d.id='workout-'+code;d.dataset.dow=dow;d.innerHTML=`<summary><span>${title}</span><span class="sum-meta">${sub}</span></summary><div class="detail-body" id="body-${code}">${plans[code].map(i=>exerciseHTML(i,dow)).join('')}</div>`; parent.insertBefore(d,marker);
    });
    marker.remove();
    setupExercises();
  }

  function modal(){
    let m=document.getElementById('forjaVideoModal');if(m)return m;
    m=document.createElement('div');m.id='forjaVideoModal';m.className='forja-video-modal';m.innerHTML=`<div class="forja-video-card"><button class="forja-video-close" aria-label="Fechar">×</button><div class="forja-video-title" id="forjaVideoTitle">Demonstração</div><video id="forjaDemoVideo" playsinline controls preload="metadata"></video><p>Vídeo rápido de referência do exercício. Priorize execução confortável e controlada.</p></div>`;
    document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.forja-video-close'))closeDemo()});return m;
  }
  const demoUrlCache=new Map();
  async function resolveDemoUrl(src){
    if(demoUrlCache.has(src))return demoUrlCache.get(src);
    const b64=(await (await fetch(src+'?v='+(window.__FORJA_BUILD__||'3.5.4'))).text()).trim();
    const bin=atob(b64),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const url=URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));demoUrlCache.set(src,url);return url;
  }
  async function openDemo(row){
    const m=modal(),v=m.querySelector('video'),title=m.querySelector('#forjaVideoTitle'),src=row.dataset.demoSrc,start=Number(row.dataset.demoStart||0);
    title.textContent=(row._v13meta?.nameHTML||row.querySelector('.name')?.textContent||'Demonstração').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    m.classList.add('open');document.body.classList.add('video-modal-open');
    try{const url=await resolveDemoUrl(src);if(v.src!==url){v.src=url;v.load()}const seek=()=>{try{v.currentTime=start}catch(e){} v.play().catch(()=>{})};if(v.readyState>=1)seek();else v.addEventListener('loadedmetadata',seek,{once:true})}catch(e){toast('Não foi possível carregar o vídeo')}
  }
  function closeDemo(){const m=document.getElementById('forjaVideoModal');if(!m)return;const v=m.querySelector('video');v.pause();m.classList.remove('open');document.body.classList.remove('video-modal-open')}
  function injectDemo(row){
    if(!row?.dataset?.demoSrc)return;const shell=row.querySelector('.v13-shell');if(!shell||shell.querySelector('.exercise-demo-btn'))return;
    const b=document.createElement('button');b.type='button';b.className='exercise-demo-btn';b.innerHTML='<span>▶</span><b>Ver execução</b><small>vídeo rápido</small>';b.addEventListener('click',()=>openDemo(row));
    const head=shell.querySelector('.ex-card-head');head?.insertAdjacentElement('afterend',b);
  }
  const oldRenderExerciseSetCard=window.renderExerciseSetCard;
  window.renderExerciseSetCard=function(row){oldRenderExerciseSetCard(row);injectDemo(row)};

  rebuildTraining();document.querySelectorAll('.exercise[data-ex]').forEach(injectDemo);renderCardio();renderToday();renderTodayWorkoutCard();renderProgress();
})();
