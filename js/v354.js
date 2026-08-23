// VITAFIT v3.5.4 — ponte da rotina semanal, sem sistema legado de vídeos
(function(){
  const dayCode={1:'seg',2:'ter',3:'qua',4:'qui',5:'sex'};
  const plans={
    seg:[
      ['seg-sumo','Agachamento sumô','Pirâmide • 20/15/12/10','5×20/15/12/10','90–120s'],
      ['seg-afundo','Afundo no smith','4×10 cada lado','4×10','90s'],
      ['seg-pelvica','Elevação pélvica','Progressão de carga','3×10','90–120s'],
      ['seg-stiff','Stiff','Movimento controlado','4×12','90s'],
      ['seg-coice','Coice na polia','Cada lado','3×8','60–75s']
    ],
    ter:[
      ['ter-remada','Remada máquina','Pico de contração','4×12','75–90s'],
      ['ter-supino','Supino máquina','','3×12','75–90s'],
      ['ter-desenvolvimento','Desenvolvimento livre','Movimento controlado','4×10','75–90s'],
      ['ter-rosca','Rosca direta na polia','','4×10','60–75s'],
      ['ter-triceps','Tríceps corda','','3×20','60s']
    ],
    qua:[
      ['qua-extensora','Cadeira extensora','Dropset','3×20','60–75s'],
      ['qua-smith','Agachamento smith','Pirâmide 15/12/10','4×15/12/10','90–120s'],
      ['qua-leguni','Leg press unilateral','Cada lado','3×10','90s'],
      ['qua-flexora','Cadeira flexora','Pico de contração','4×12','75s'],
      ['qua-stiff','Stiff','Movimento controlado','3×12','90s'],
      ['qua-abdutora','Cadeira abdutora','Pico de contração','3×15','60s']
    ],
    qui:[
      ['qui-remada','Remada máquina','Pico de contração','4×12','75–90s'],
      ['qui-supino','Supino máquina','','3×12','75–90s'],
      ['qui-desenvolvimento','Desenvolvimento livre','Movimento controlado','4×10','75–90s'],
      ['qui-rosca','Rosca direta na polia','','4×10','60–75s'],
      ['qui-triceps','Tríceps corda','','3×20','60s']
    ],
    sex:[
      ['sex-afundo','Afundo no smith','Progressão de carga','4×10','90s'],
      ['sex-bulgaro','Agachamento búlgaro','Movimento controlado','3×12','90s'],
      ['sex-sumo','Terra sumô','Progressão de carga','4×8','90–120s'],
      ['sex-coice-abd','Coice na polia + abdução na polia','3×12 em ambos','3×12','60–75s'],
      ['sex-abdutora','Cadeira abdutora','Dropset','3×20','60s'],
      ['sex-pelvica','Elevação pélvica','Progressão de carga','4×10','90–120s']
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
    const h=document.getElementById('cardioPhaseHead'),rows=document.getElementById('cardioRows');if(!rows)return;
    if(h)h.textContent='Prescrição';
    rows.innerHTML='<tr><td><b>Segunda</b></td><td>Bike ou esteira</td><td>Moderado</td><td><span class="tag">pós-treino</span></td></tr><tr><td><b>Terça</b></td><td>Esteira</td><td>20 min</td><td><span class="tag">HIIT</span></td></tr><tr><td><b>Quinta</b></td><td>Esteira</td><td>20 min</td><td><span class="tag">HIIT</span></td></tr>';
  };
  window.renderTodayWorkoutCard=function(){
    const w=currentWorkoutDetails(),dow=selectedDate.getDay(),l=labels[dow];
    const title=document.getElementById('twTitle'),tag=document.getElementById('twTag'),sub=document.getElementById('twSubtitle'),start=document.getElementById('startWorkoutBtn'),cardio=document.getElementById('cardioDoneBtn');
    if(title)title.textContent=w.name;if(tag)tag.textContent=w.tag;if(sub)sub.textContent=l?(l.cardio?`Musculação • ${l.cardio}`:'Musculação'):'Dia de recuperação';
    if(start)start.style.display=w.id?'inline-block':'none';
    if(cardio){cardio.style.display=([1,2,4].includes(dow))?'inline-block':'none';cardio.classList.toggle('done',store.get(dk('cardioDone'),false));cardio.textContent=store.get(dk('cardioDone'),false)?'✓ Cardio concluído':'✓ Marcar cardio'}
    if(typeof restoreSessionUI==='function')restoreSessionUI();if(typeof renderSessionKpis==='function')renderSessionKpis();
  };

  const oldParse=window.parsePrescription;
  window.parsePrescription=function(range){
    const s=String(range||'');
    if(s.includes('/')){const nums=(s.match(/\d+/g)||[]).map(Number),sets=nums.shift()||3;if(nums.length)return {sets,min:Math.min(...nums),max:Math.max(...nums)}}
    return typeof oldParse==='function'?oldParse(range):{sets:Number((s.match(/\d+/)||['0'])[0])||0,min:0,max:0};
  };

  function exerciseHTML(item){
    const [key,name,note,range,rest]=item;
    return `<div class="exercise" data-ex="${key}" data-range="${range}"><div class="name">${name}${note?`<small>${note}</small>`:''}</div><div class="data">${range}</div><div class="data rest">${rest}</div><input class="load-input" inputmode="decimal" placeholder="kg" data-load="${key}"><input class="reps-input" inputmode="numeric" placeholder="reps" data-reps="${key}"><button class="ex-check" data-key="${key}">✓</button><div class="exercise-sub"><span class="progress-hint" id="hint-${key}">Registre carga + repetições</span></div><div class="history-box" id="hist-${key}"></div></div>`;
  }

  function rebuildTraining(){
    const schedule=document.getElementById('schedule');
    if(schedule)schedule.innerHTML='<div class="day training" data-dow="1"><b>SEG</b><strong>Inferiores</strong><small>Completo + cardio moderado</small></div><div class="day training" data-dow="2"><b>TER</b><strong>Superiores</strong><small>Completo + HIIT</small></div><div class="day training" data-dow="3"><b>QUA</b><strong>Inferiores</strong><small>Prioridade inferiores</small></div><div class="day training" data-dow="4"><b>QUI</b><strong>Superiores</strong><small>Completo + HIIT</small></div><div class="day training" data-dow="5"><b>SEX</b><strong>Inferiores</strong><small>Completo</small></div><div class="day" data-dow="6"><b>SÁB</b><strong>Descanso</strong><small>Recuperação</small></div><div class="day" data-dow="0"><b>DOM</b><strong>Descanso</strong><small>Recuperação</small></div>';
    const first=document.querySelector('details[id^="workout-"]');if(!first)return;
    const parent=first.parentNode,marker=document.createComment('v354-workouts');parent.insertBefore(marker,first);
    document.querySelectorAll('details[id^="workout-"]').forEach(x=>x.remove());
    const defs=[[1,'seg','SEGUNDA • Inferiores completo','Inferiores + cardio moderado'],[2,'ter','TERÇA • Superiores completo','Superiores + HIIT 20 min'],[3,'qua','QUARTA • Inferiores completo','Prioridade em inferiores'],[4,'qui','QUINTA • Superiores completo','Superiores + HIIT 20 min'],[5,'sex','SEXTA • Inferiores completo','Inferiores completo']];
    defs.forEach(([dow,code,title,sub])=>{const d=document.createElement('details');d.id='workout-'+code;d.dataset.dow=dow;d.innerHTML=`<summary><span>${title}</span><span class="sum-meta">${sub}</span></summary><div class="detail-body" id="body-${code}">${plans[code].map(exerciseHTML).join('')}</div>`;parent.insertBefore(d,marker)});
    marker.remove();if(typeof setupExercises==='function')setupExercises();
  }

  rebuildTraining();
  if(typeof renderCardio==='function')renderCardio();
  if(typeof renderToday==='function')renderToday();
  if(typeof renderTodayWorkoutCard==='function')renderTodayWorkoutCard();
  if(typeof renderProgress==='function')renderProgress();
})();
