// FORJA MUSCLE v3.4.0 — ciclos progressivos de treino a cada 4 semanas, preservando shape12.*
(function(){
  const BUILD='3.4.0';
  const START_KEY='training.cycleStart';
  const DAY_ID={1:'seg',3:'qua',5:'sex',0:'dom'};
  const DETAIL_ID={1:'workout-seg',3:'workout-qua',5:'workout-sex',0:'workout-dom'};

  const ex=(key,name,note,range,rest,kind)=>({key,name,note,range,rest,kind});

  const STAGES=[
    {
      id:'adaptacao',n:1,name:'Adaptação',weeks:'1–4',
      summary:'Aprender movimentos, criar rotina e sair do treino se sentindo bem.',
      effort:'Carga leve • 2 séries • deixe 3–4 repetições na reserva',
      strengthDays:[1,3,5],
      cardio:{tue:'15–20 min',wed:'Sem cardio',sat:'20–25 min',sun:'Opcional 15–20 min leve'},
      dayMeta:{
        1:{name:'Full Body A',tag:'Máquinas • técnica'},
        3:{name:'Full Body B',tag:'Máquinas • controle'},
        5:{name:'Full Body C',tag:'Repetir e aprender'}
      },
      plans:{
        1:[
          ex('a-seg-leg','Leg Press 45°','Amplitude confortável','2×12–15','75s','legpress'),
          ex('a-seg-flex','Cadeira flexora','Movimento controlado','2×12–15','60–75s','legcurl'),
          ex('a-seg-chest','Chest Press','Banco bem ajustado','2×10–12','60–75s','chestpress'),
          ex('a-seg-pux','Puxada neutra','Pegada confortável','2×10–12','60–75s','pulldown'),
          ex('a-seg-abd','Cadeira abdutora','Sem impulso','2×15–20','60s','abductor')
        ],
        3:[
          ex('a-qua-ext','Cadeira extensora','Sem travar os joelhos','2×12–15','60–75s','extension'),
          ex('a-qua-glute','Glute Drive / Hip Thrust máquina','Carga leve','2×12–15','75s','glute'),
          ex('a-qua-rem','Remada sentada','Peito aberto','2×10–12','60–75s','row'),
          ex('a-qua-des','Desenvolvimento máquina','Amplitude confortável','2×10–12','60–75s','shoulderpress'),
          ex('a-qua-pant','Panturrilha sentada','Controle total','2×12–15','60s','calf')
        ],
        5:[
          ex('a-sex-leg','Leg Press 45°','Repita a técnica de segunda','2×12–15','75s','legpress'),
          ex('a-sex-flex','Cadeira flexora','Quadril apoiado','2×12–15','60–75s','legcurl'),
          ex('a-sex-chest','Chest Press','Retorno controlado','2×10–12','60–75s','chestpress'),
          ex('a-sex-pux','Puxada frontal','Sem balançar o tronco','2×10–12','60–75s','pulldown'),
          ex('a-sex-abd','Cadeira abdutora','Contração sem impulso','2×15–20','60s','abductor')
        ]
      }
    },
    {
      id:'iniciante',n:2,name:'Iniciante',weeks:'5–8',
      summary:'Aumentar gradualmente o volume mantendo exercícios simples e previsíveis.',
      effort:'2–3 séries • deixe 2–3 repetições na reserva • progrida primeiro nas repetições',
      strengthDays:[1,3,5],
      cardio:{tue:'20–25 min',wed:'Opcional 10–15 min',sat:'25–30 min',sun:'Opcional 20 min leve'},
      dayMeta:{
        1:{name:'Inferior A',tag:'Pernas + glúteos'},
        3:{name:'Superior',tag:'Costas + peito + ombros'},
        5:{name:'Inferior B',tag:'Posterior + glúteos'}
      },
      plans:{
        1:[
          ex('b-seg-leg','Leg Press 45°','','3×10–12','75–90s','legpress'),
          ex('b-seg-glute','Glute Drive / Hip Thrust máquina','','3×10–12','75–90s','glute'),
          ex('b-seg-ext','Cadeira extensora','','2×12–15','60–75s','extension'),
          ex('b-seg-flex','Cadeira flexora','','2×12–15','60–75s','legcurl'),
          ex('b-seg-abd','Cadeira abdutora','','2×15–20','60s','abductor'),
          ex('b-seg-pant','Panturrilha sentada','','2×12–15','60s','calf')
        ],
        3:[
          ex('b-qua-pux','Puxada neutra','','3×10–12','75s','pulldown'),
          ex('b-qua-rem','Remada sentada','','3×10–12','75s','row'),
          ex('b-qua-chest','Chest Press','','3×10–12','75s','chestpress'),
          ex('b-qua-des','Desenvolvimento máquina','','2×10–12','75s','shoulderpress'),
          ex('b-qua-lat','Elevação lateral máquina','','2×12–15','60s','lateral'),
          ex('b-qua-tri','Tríceps corda','','2×10–15','60s','triceps'),
          ex('b-qua-bic','Rosca Scott máquina','','2×10–15','60s','biceps')
        ],
        5:[
          ex('b-sex-flex','Cadeira flexora','','3×10–12','75s','legcurl'),
          ex('b-sex-glute','Glute Drive / Hip Thrust máquina','','3×10–12','75–90s','glute'),
          ex('b-sex-leg','Leg Press 45°','','3×10–12','75–90s','legpress'),
          ex('b-sex-ext','Cadeira extensora','','2×12–15','60–75s','extension'),
          ex('b-sex-abd','Cadeira abdutora','','2×15–20','60s','abductor'),
          ex('b-sex-pant','Panturrilha no Leg Press','','2×12–15','60s','calf')
        ]
      }
    },
    {
      id:'intermediario',n:3,name:'Intermediário',weeks:'9–12+',
      summary:'Quatro sessões semanais e mais volume, mantendo progressão controlada.',
      effort:'3 séries na base • deixe 1–3 repetições na reserva • aumente carga só com técnica estável',
      strengthDays:[1,3,5,0],
      cardio:{tue:'25–30 min',wed:'15–20 min',sat:'30–35 min',sun:'Opcional 10–15 min'},
      dayMeta:{
        1:{name:'Inferior A',tag:'Quadríceps + glúteos'},
        3:{name:'Superior A',tag:'Costas + peito + ombros'},
        5:{name:'Inferior B',tag:'Posterior + glúteos'},
        0:{name:'Superior B',tag:'Costas + ombros + braços'}
      },
      plans:{
        1:[
          ex('i-seg-leg','Leg Press 45°','','3×8–12','90s','legpress'),
          ex('i-seg-hack','Hack Squat máquina','Amplitude confortável','3×10–12','90s','hack'),
          ex('i-seg-glute','Glute Drive / Hip Thrust máquina','','3×10–12','90s','glute'),
          ex('i-seg-ext','Cadeira extensora','','3×12–15','75s','extension'),
          ex('i-seg-abd','Cadeira abdutora','','3×15–20','60s','abductor'),
          ex('i-seg-pant','Panturrilha sentada','','3×12–15','60s','calf')
        ],
        3:[
          ex('i-qua-pux','Puxada neutra','','3×8–12','75–90s','pulldown'),
          ex('i-qua-rem','Remada baixa','','3×8–12','75–90s','row'),
          ex('i-qua-chest','Chest Press','','3×8–12','75–90s','chestpress'),
          ex('i-qua-des','Desenvolvimento máquina','','3×8–12','75s','shoulderpress'),
          ex('i-qua-lat','Elevação lateral máquina','','3×12–15','60s','lateral'),
          ex('i-qua-tri','Tríceps corda','','2×10–15','60s','triceps'),
          ex('i-qua-bic','Rosca Scott máquina','','2×10–15','60s','biceps')
        ],
        5:[
          ex('i-sex-flex','Cadeira flexora','','3×10–15','75s','legcurl'),
          ex('i-sex-glute','Glute Drive / Hip Thrust máquina','','3×8–12','90s','glute'),
          ex('i-sex-leg','Leg Press 45°','','3×10–12','90s','legpress'),
          ex('i-sex-ext','Cadeira extensora','','2×12–15','75s','extension'),
          ex('i-sex-abd','Cadeira abdutora','','3×15–20','60s','abductor'),
          ex('i-sex-pant','Panturrilha sentada','','3×12–15','60s','calf')
        ],
        0:[
          ex('i-dom-pux','Puxada frontal','','3×8–12','75–90s','pulldown'),
          ex('i-dom-rem','Remada articulada','','3×10–12','75–90s','row'),
          ex('i-dom-chest','Chest Press inclinado máquina','','3×10–12','75–90s','chestpress'),
          ex('i-dom-post','Peck Deck reverso','','3×12–15','60s','reversefly'),
          ex('i-dom-lat','Elevação lateral máquina','','3×12–15','60s','lateral'),
          ex('i-dom-bic','Rosca no cabo','','2×10–15','60s','biceps'),
          ex('i-dom-tri','Tríceps máquina','','2×10–15','60s','triceps')
        ]
      }
    }
  ];

  const COACH={
    legpress:{how:['Mantenha lombar e quadril apoiados.','Empurre com os pés firmes e joelhos acompanhando a direção dos pés.'],avoid:['Não deixe o quadril levantar do encosto.','Não force amplitude que gere dor ou perda de posição.']},
    legcurl:{how:['Ajuste o equipamento ao tamanho da perna e mantenha o quadril apoiado.','Flexione e retorne de forma controlada.'],avoid:['Não levante o quadril para vencer a carga.','Não solte o peso na volta.']},
    chestpress:{how:['Ajuste o banco para as pegadas ficarem na linha do peito.','Empurre mantendo escápulas apoiadas e controle o retorno.'],avoid:['Não projete os ombros para frente.','Não use carga que obrigue a encurtar a amplitude.']},
    pulldown:{how:['Mantenha peito aberto e conduza a puxada pelos cotovelos.','Controle a subida sem perder a posição do tronco.'],avoid:['Não balance o corpo para puxar.','Não encolha os ombros nem solte a carga de uma vez.']},
    abductor:{how:['Mantenha quadril e tronco estáveis.','Abra as pernas sem impulso e controle o retorno.'],avoid:['Não bata as placas.','Não use balanço do tronco.']},
    extension:{how:['Alinhe o eixo da máquina com o joelho e mantenha o quadril apoiado.','Estenda e retorne com controle.'],avoid:['Não dê impulso com o tronco.','Não trave o joelho com força no final.']},
    glute:{how:['Mantenha pés firmes e costelas controladas.','Suba o quadril contraindo os glúteos e desça devagar.'],avoid:['Não hiperestenda a lombar no topo.','Não empurre apenas pela ponta dos pés.']},
    row:{how:['Mantenha coluna neutra e peito aberto.','Puxe os cotovelos para trás e controle a extensão dos braços.'],avoid:['Não transforme a remada em balanço do tronco.','Não arredonde os ombros para buscar mais alcance.']},
    shoulderpress:{how:['Ajuste o banco e mantenha o tronco apoiado.','Empurre com punhos e antebraços alinhados.'],avoid:['Não arqueie excessivamente a lombar.','Não force uma amplitude desconfortável para o ombro.']},
    calf:{how:['Suba até contrair a panturrilha e desça lentamente.','Use uma amplitude confortável do tornozelo.'],avoid:['Não faça repetições no quique.','Não reduza a amplitude só para usar mais carga.']},
    lateral:{how:['Eleve os braços com controle e cotovelos levemente flexionados.','Pare antes de precisar encolher os ombros.'],avoid:['Não balance o tronco.','Não use carga que transforme o movimento em impulso.']},
    triceps:{how:['Mantenha cotovelos próximos ao corpo.','Estenda com controle e retorne sem mover os ombros.'],avoid:['Não abra os cotovelos.','Não use o peso do corpo para empurrar.']},
    biceps:{how:['Mantenha cotovelos estáveis.','Flexione e estenda com controle sem balançar o corpo.'],avoid:['Não lance a carga com o tronco.','Não encurte a amplitude para usar mais peso.']},
    hack:{how:['Mantenha costas apoiadas e pés firmes na plataforma.','Desça com controle até uma amplitude confortável e suba mantendo joelhos alinhados.'],avoid:['Não deixe os joelhos colapsarem para dentro.','Não desça além do ponto em que perde o apoio da lombar.']},
    reversefly:{how:['Mantenha peito apoiado e pescoço relaxado.','Abra os braços conduzindo os cotovelos e controle a volta.'],avoid:['Não encolha os ombros.','Não use impulso para aumentar a amplitude.']}
  };

  function parseDate(value){if(!value)return null;const [y,m,d]=value.split('-').map(Number);return new Date(y,m-1,d,12)}
  function startValue(){return store.get(START_KEY,null)}
  function cycleInfo(date=selectedDate){
    const start=startValue(),startDate=parseDate(start);
    if(!startDate)return {started:false,start:null,days:0,week:1,blockWeek:1,stage:STAGES[0]};
    const days=Math.max(0,Math.floor((date-startDate)/86400000));
    const week=Math.max(1,Math.floor(days/7)+1);
    const stage=week<=4?STAGES[0]:week<=8?STAGES[1]:STAGES[2];
    const blockWeek=stage.n<3?((week-1)%4)+1:Math.min(4,week-8);
    return {started:true,start,days,week,blockWeek,stage}
  }
  window.trainingCycleInfo=cycleInfo;
  window.phaseInfo=function(){const c=cycleInfo();return {n:c.stage.n,name:c.stage.name,w:c.week,blockWeek:c.blockWeek,pending:!c.started}};
  window.projectWeek=function(){return cycleInfo().week};

  function rowMarkup(item){
    return `<div class="exercise" data-ex="${item.key}" data-kind="${item.kind}" data-range="${item.range}"><div class="name">${item.name}${item.note?`<small>${item.note}</small>`:''}</div><div class="data">${item.range}</div><div class="data rest">${item.rest}</div><input class="load-input" inputmode="decimal" placeholder="kg" data-load="${item.key}"><input class="reps-input" inputmode="numeric" placeholder="reps" data-reps="${item.key}"><button class="ex-check" data-key="${item.key}">✓</button><div class="exercise-sub"><span class="progress-hint" id="hint-${item.key}">Registre carga + repetições</span></div><div class="history-box" id="hist-${item.key}"></div></div>`
  }

  function applyDayPlan(stage){
    const cardio=(dow)=>dow===2||dow===6;
    for(let dow=0;dow<7;dow++){
      const meta=stage.dayMeta[dow];
      if(meta){
        dowPlans[dow]={type:'Musculação',plan:meta.name,detail:`${meta.tag} • ${stage.name}`,water:3000}
      }else if(cardio(dow)){
        dowPlans[dow]={type:'Cardio',plan:'Cardio leve',detail:'Caminhada, esteira ou bike em ritmo confortável',water:3000}
      }else{
        dowPlans[dow]={type:'Recuperação',plan:'Descanso',detail:'Recuperação • mobilidade leve opcional',water:2500}
      }
    }
  }

  function refreshScheduleCards(stage){
    const schedule=document.getElementById('schedule');if(!schedule)return;
    schedule.querySelectorAll('.day[data-dow]').forEach(card=>{
      const dow=Number(card.dataset.dow),meta=stage.dayMeta[dow];
      card.classList.toggle('training',!!meta);
      card.classList.toggle('cardio',!meta&&(dow===2||dow===6));
      const strong=card.querySelector('strong'),small=card.querySelector('small');
      if(meta){if(strong)strong.textContent=meta.name;if(small)small.textContent=meta.tag}
      else if(dow===2||dow===6){if(strong)strong.textContent='Cardio leve';if(small)small.textContent=dow===2?stage.cardio.tue:stage.cardio.sat}
      else{if(strong)strong.textContent='Descanso';if(small)small.textContent='Recuperação'}
    })
  }

  function refreshDetails(stage){
    Object.entries(DAY_ID).forEach(([dowStr,id])=>{
      const dow=Number(dowStr),root=document.getElementById('body-'+id),details=document.getElementById(DETAIL_ID[dow]);
      if(!root||!details)return;
      if(root.dataset.trainingStage===stage.id)return;
      const items=stage.plans[dow]||[];
      root.innerHTML=items.map(rowMarkup).join('');
      root.dataset.trainingStage=stage.id;
      const summary=details.querySelector('summary');
      if(summary){
        const meta=stage.dayMeta[dow];
        const spans=summary.querySelectorAll('span');
        if(spans[0])spans[0].textContent=meta?`${['DOMINGO','SEGUNDA','','QUARTA','','SEXTA'][dow]||'TREINO'} • ${meta.name}`:'Sem musculação';
        if(spans[1])spans[1].textContent=meta?.tag||'Recuperação'
      }
    });
    if(typeof buildSetCards==='function')buildSetCards()
  }

  function applyProgram(){
    const c=cycleInfo(),stage=c.stage;
    applyDayPlan(stage);
    refreshScheduleCards(stage);
    refreshDetails(stage);
    document.documentElement.dataset.trainingStage=stage.id;
    return c
  }

  window.currentWorkoutDetails=function(){
    const c=cycleInfo(),dow=selectedDate.getDay(),meta=c.stage.dayMeta[dow];
    if(meta)return {id:DETAIL_ID[dow],name:meta.name,tag:meta.tag};
    if(dow===2||dow===6)return {id:null,name:'Cardio leve',tag:'Recuperação ativa'};
    return {id:null,name:'Descanso',tag:'Recuperação'}
  };

  window.cardioPlan=function(){
    const c=cycleInfo().stage.cardio;
    return {tue:c.tue,wed:c.wed,sat:c.sat,sun:c.sun}
  };

  function phasePct(c){
    if(!c.started)return 0;
    if(c.stage.n===1)return Math.min(100,Math.round(c.days/28*100));
    if(c.stage.n===2)return Math.min(100,Math.round((c.days-28)/28*100));
    return Math.min(100,Math.round((c.days-56)/28*100))
  }

  function ensureCycleNote(c){
    const bar=document.querySelector('#treino .phase-bar');if(!bar)return;
    let note=document.getElementById('trainingCycleNote');
    if(!note){note=document.createElement('div');note.id='trainingCycleNote';note.className='training-cycle-note';bar.parentElement.appendChild(note)}
    note.innerHTML=c.started
      ? `<b>Ciclo iniciado em ${c.start.split('-').reverse().join('/')}</b><span>Bloco atual: semana ${c.blockWeek} de 4 • a troca de treino é automática.</span>`
      : `<b>Aguardando o primeiro treino concluído</b><span>As 4 semanas de adaptação começam somente quando o primeiro treino for finalizado por completo.</span>`
  }

  window.renderPhase=function(){
    const c=applyProgram(),pct=phasePct(c);
    const input=document.getElementById('startDate');
    if(input){input.value=c.start||'';input.disabled=true;input.title='A data é definida automaticamente na primeira conclusão de treino'}
    const title=document.getElementById('phaseTitle'),bar=document.getElementById('phaseProgress'),pctEl=document.getElementById('phasePct');
    if(title)title.textContent=c.started?`Semana ${c.week} • ${c.stage.name}`:'Semana 1 • Adaptação';
    if(bar)bar.style.width=pct+'%';
    if(pctEl)pctEl.textContent=c.started?`${pct}%`:'aguardando';
    const phaseCopy=[
      ['SEMANAS 1–4','Adaptação','2 séries • máquinas • técnica • carga leve.'],
      ['SEMANAS 5–8','Iniciante','2–3 séries • progressão de repetições e carga.'],
      ['SEMANAS 9–12+','Intermediário','4 dias de musculação • mais volume e progressão controlada.']
    ];
    phaseCopy.forEach((copy,i)=>{
      const card=document.getElementById('phase'+(i+1));if(!card)return;
      card.classList.toggle('active',c.stage.n===i+1);
      const eyebrow=card.querySelector('.eyebrow'),h3=card.querySelector('h3'),p=card.querySelector('p');
      if(eyebrow)eyebrow.textContent=copy[0];if(h3)h3.textContent=copy[1];if(p)p.textContent=copy[2]
    });
    ensureCycleNote(c)
  };

  window.saveStartDate=function(){toast('O ciclo começa automaticamente ao concluir o primeiro treino')};

  window.renderCardio=function(){
    const c=cycleInfo(),p=c.stage.cardio,head=document.getElementById('cardioPhaseHead'),rows=document.getElementById('cardioRows');
    if(head)head.textContent=`Tempo • ${c.stage.name}`;
    if(!rows)return;
    rows.innerHTML=`
      <tr><td><b>Terça</b></td><td>Esteira, bike ou caminhada</td><td>${p.tue}</td><td><span class="tag">leve/moderado</span></td></tr>
      <tr><td><b>Quarta</b></td><td>Após treino somente se previsto</td><td>${p.wed}</td><td><span class="tag">opcional</span></td></tr>
      <tr><td><b>Sábado</b></td><td>Esteira, bike ou caminhada</td><td>${p.sat}</td><td><span class="tag">leve/moderado</span></td></tr>
      <tr><td><b>Domingo</b></td><td>${c.stage.n===3?'Após musculação se recuperada':'Recuperação ativa opcional'}</td><td>${p.sun}</td><td><span class="tag">confortável</span></td></tr>`
  };

  function allWorkoutSetsDone(){
    const w=currentWorkoutDetails();if(!w.id)return false;
    const rows=[...document.querySelectorAll(`#${w.id} .exercise[data-ex]`)];
    if(!rows.length)return false;
    return rows.every(row=>{
      const p=parsePrescription(row.dataset.range);
      return currentSetsFor(row.dataset.ex,p).every(s=>s.done)
    })
  }

  function maybeStartCycle(){
    if(startValue())return false;
    if(!store.get(dk('guided.completed'),false)&&!allWorkoutSetsDone())return false;
    store.set(START_KEY,isoDate(selectedDate));
    store.set('training.cycleVersion',BUILD);
    renderPhase();renderCardio();
    toast('Ciclo iniciado • 4 semanas de adaptação');
    return true
  }

  function renderPhaseCoach(){
    const card=document.getElementById('exerciseCoachCard'),active=document.querySelector('#trainingDayStage .exercise[data-ex].guided-active');
    if(!card||!active)return;
    const c=cycleInfo(),kind=active.dataset.kind,info=COACH[kind]||{how:['Ajuste o equipamento antes de começar.','Use movimento lento e confortável.'],avoid:['Não use impulso.','Não continue se houver dor aguda ou piora progressiva.']};
    const name=(active._v13meta?.nameHTML||active.querySelector('.name')?.textContent||'Exercício').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    card.hidden=false;
    card.innerHTML=`
      <div class="exercise-coach-head">
        <div><span class="eyebrow">${c.stage.name.toUpperCase()} • SEMANA ${c.week}</span><h2>Dicas do movimento</h2></div>
        <span class="exercise-coach-name">${name}</span>
      </div>
      <div class="training-stage-prescription">${c.stage.effort}</div>
      <div class="exercise-coach-grid">
        <div class="exercise-coach-panel coach-do"><b><span>✓</span> Como fazer</b><ul>${info.how.map(x=>`<li>${x}</li>`).join('')}</ul></div>
        <div class="exercise-coach-panel coach-avoid"><b><span>!</span> Evite isso</b><ul>${info.avoid.map(x=>`<li>${x}</li>`).join('')}<li>Se aparecer dor aguda, pontada ou piora clara, interrompa o exercício.</li></ul></div>
      </div>`
  }

  const previousFinish=window.finishWorkoutSession;
  if(typeof previousFinish==='function'){
    window.finishWorkoutSession=function(){
      previousFinish();
      const started=maybeStartCycle();
      if(started&&typeof renderAll==='function')requestAnimationFrame(()=>renderAll())
    }
  }

  const previousSync=window.syncGuidedTraining;
  if(typeof previousSync==='function'){
    window.syncGuidedTraining=function(scroll=false){
      applyProgram();
      previousSync(scroll);
      requestAnimationFrame(()=>{renderPhaseCoach();renderPhase();renderCardio()})
    }
  }

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function'){
    window.renderAll=function(){
      applyProgram();
      previousRenderAll();
      requestAnimationFrame(()=>{renderPhase();renderCardio();renderPhaseCoach()})
    }
  }

  applyProgram();
  renderPhase();
  renderCardio();
  if(typeof renderToday==='function')renderToday();
  if(typeof renderTodayWorkoutCard==='function')renderTodayWorkoutCard();
  if(typeof syncGuidedTraining==='function')requestAnimationFrame(()=>syncGuidedTraining(false));
})();