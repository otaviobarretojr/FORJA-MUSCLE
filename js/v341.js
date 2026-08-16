// FORJA MUSCLE v3.4.1 — Home alinhado aos ciclos, cardio em dias sem musculação e aba Programa
(function(){
  const BUILD='3.4.1';
  const WEEK_ORDER=[1,2,3,4,5,6,0];
  const DAY_NAME={0:'Domingo',1:'Segunda',2:'Terça',3:'Quarta',4:'Quinta',5:'Sexta',6:'Sábado'};
  const DAY_SHORT={0:'DOM',1:'SEG',2:'TER',3:'QUA',4:'QUI',5:'SEX',6:'SÁB'};
  const DETAIL_ID={0:'workout-dom',1:'workout-seg',3:'workout-qua',5:'workout-sex'};

  const CARDIO={
    adaptacao:{
      2:{type:'Bicicleta ergométrica',time:'20 min',note:'ritmo leve • consegue conversar normalmente'},
      4:{type:'Caminhada na esteira',time:'20 min',note:'plano ou inclinação mínima • sem buscar velocidade'},
      6:{type:'Bicicleta ergométrica',time:'25 min',note:'ritmo confortável e contínuo'},
      0:{type:'Caminhada leve',time:'20 min',note:'esteira ou ao ar livre • recuperação ativa'}
    },
    iniciante:{
      2:{type:'Bicicleta ergométrica',time:'25 min',note:'leve/moderado • respiração controlada'},
      4:{type:'Caminhada na esteira',time:'25 min',note:'ritmo contínuo • inclinação leve se estiver confortável'},
      6:{type:'Elíptico ou bicicleta',time:'30 min',note:'baixo impacto • sem transformar em HIIT'},
      0:{type:'Caminhada leve',time:'25 min',note:'ao ar livre ou esteira • recuperação ativa'}
    },
    intermediario:{
      2:{type:'Caminhada na esteira',time:'30 min',note:'ritmo moderado e sustentável'},
      4:{type:'Bicicleta ergométrica',time:'25 min',note:'baixo impacto • cadência confortável'},
      6:{type:'Elíptico ou esteira',time:'35 min',note:'ritmo contínuo • sem chegar à exaustão'}
    }
  };

  const KIND_TIP={
    legpress:'Lombar apoiada e joelhos acompanhando a direção dos pés.',
    legcurl:'Quadril apoiado; flexione e retorne sem soltar a carga.',
    chestpress:'Banco ajustado e ombros apoiados durante todo o movimento.',
    pulldown:'Peito aberto; conduza a puxada pelos cotovelos.',
    abductor:'Abra sem impulso e controle totalmente o retorno.',
    extension:'Alinhe o joelho ao eixo da máquina e evite chutar a carga.',
    glute:'Suba contraindo glúteos sem hiperestender a lombar.',
    row:'Tronco estável; puxe os cotovelos para trás.',
    shoulderpress:'Tronco apoiado e amplitude confortável para os ombros.',
    calf:'Amplitude controlada, sem quicar no fundo do movimento.',
    lateral:'Eleve com controle e sem encolher os ombros.',
    triceps:'Cotovelos estáveis junto ao corpo.',
    biceps:'Evite balanço do tronco e controle a descida.',
    hack:'Costas apoiadas e joelhos alinhados aos pés.',
    reversefly:'Peito apoiado e ombros longe das orelhas.'
  };

  const PROGRAM=[
    {
      id:'adaptacao',n:1,name:'Adaptação',weeks:'Semanas 1–4',
      summary:'Aprender os movimentos, criar rotina e terminar cada sessão com sensação de que conseguiria fazer um pouco mais.',
      effort:'Carga leve • 2 séries por exercício • 3–4 repetições na reserva',
      changes:['3 treinos Full Body por semana.','Somente movimentos simples e previsíveis, principalmente em máquinas.','Poucas séries e carga leve para aprender posição, amplitude e controle.','Todo dia sem musculação recebe cardio leve de recuperação ativa.'],
      tips:['Prioridade absoluta para técnica e conforto.','Aumentar carga não é objetivo desta fase.','Se surgir dor aguda, pontada ou piora clara, interromper o exercício.'],
      days:{
        1:{name:'Full Body A',tag:'Máquinas • técnica',items:[['Leg Press 45°','2×12–15','legpress'],['Cadeira flexora','2×12–15','legcurl'],['Chest Press','2×10–12','chestpress'],['Puxada neutra','2×10–12','pulldown'],['Cadeira abdutora','2×15–20','abductor']]},
        3:{name:'Full Body B',tag:'Máquinas • controle',items:[['Cadeira extensora','2×12–15','extension'],['Glute Drive / Hip Thrust máquina','2×12–15','glute'],['Remada sentada','2×10–12','row'],['Desenvolvimento máquina','2×10–12','shoulderpress'],['Panturrilha sentada','2×12–15','calf']]},
        5:{name:'Full Body C',tag:'Repetir e aprender',items:[['Leg Press 45°','2×12–15','legpress'],['Cadeira flexora','2×12–15','legcurl'],['Chest Press','2×10–12','chestpress'],['Puxada frontal','2×10–12','pulldown'],['Cadeira abdutora','2×15–20','abductor']]}
      }
    },
    {
      id:'iniciante',n:2,name:'Iniciante',weeks:'Semanas 5–8',
      summary:'Depois da adaptação, o volume sobe devagar e o treino começa a ter divisão mais específica.',
      effort:'2–3 séries • 2–3 repetições na reserva • subir repetições antes da carga',
      changes:['Sai o Full Body e entra Inferior A + Superior + Inferior B.','Os principais exercícios passam para 3 séries.','Entram elevação lateral, tríceps corda e rosca Scott em máquina.','A progressão começa pelas repetições; carga sobe somente com execução estável.'],
      tips:['Manter os mesmos ajustes de máquina de uma sessão para outra.','Quando completar o topo das repetições com boa técnica, considerar pequeno aumento de carga.','Cardio continua nos dias sem musculação, sempre sem prejudicar a recuperação.'],
      days:{
        1:{name:'Inferior A',tag:'Pernas + glúteos',items:[['Leg Press 45°','3×10–12','legpress'],['Glute Drive / Hip Thrust máquina','3×10–12','glute'],['Cadeira extensora','2×12–15','extension'],['Cadeira flexora','2×12–15','legcurl'],['Cadeira abdutora','2×15–20','abductor'],['Panturrilha sentada','2×12–15','calf']]},
        3:{name:'Superior',tag:'Costas + peito + ombros',items:[['Puxada neutra','3×10–12','pulldown'],['Remada sentada','3×10–12','row'],['Chest Press','3×10–12','chestpress'],['Desenvolvimento máquina','2×10–12','shoulderpress'],['Elevação lateral máquina','2×12–15','lateral'],['Tríceps corda','2×10–15','triceps'],['Rosca Scott máquina','2×10–15','biceps']]},
        5:{name:'Inferior B',tag:'Posterior + glúteos',items:[['Cadeira flexora','3×10–12','legcurl'],['Glute Drive / Hip Thrust máquina','3×10–12','glute'],['Leg Press 45°','3×10–12','legpress'],['Cadeira extensora','2×12–15','extension'],['Cadeira abdutora','2×15–20','abductor'],['Panturrilha no Leg Press','2×12–15','calf']]}
      }
    },
    {
      id:'intermediario',n:3,name:'Intermediário',weeks:'Semanas 9–12+',
      summary:'O corpo já conhece os padrões básicos. A frequência sobe para quatro sessões e o volume fica mais completo.',
      effort:'3 séries na base • 1–3 repetições na reserva • carga sobe só com técnica consistente',
      changes:['A musculação passa de 3 para 4 dias por semana.','Entra um segundo treino de superiores no domingo.','Entram Hack Squat, remada articulada, Chest Press inclinado e Peck Deck reverso.','Mais volume, mas ainda sem necessidade de técnicas avançadas ou falha constante.'],
      tips:['Progredir uma variável por vez: repetições ou carga.','Manter controle da execução mesmo nas últimas repetições.','Cardio fica concentrado nos três dias sem musculação.'],
      days:{
        1:{name:'Inferior A',tag:'Quadríceps + glúteos',items:[['Leg Press 45°','3×8–12','legpress'],['Hack Squat máquina','3×10–12','hack'],['Glute Drive / Hip Thrust máquina','3×10–12','glute'],['Cadeira extensora','3×12–15','extension'],['Cadeira abdutora','3×15–20','abductor'],['Panturrilha sentada','3×12–15','calf']]},
        3:{name:'Superior A',tag:'Costas + peito + ombros',items:[['Puxada neutra','3×8–12','pulldown'],['Remada baixa','3×8–12','row'],['Chest Press','3×8–12','chestpress'],['Desenvolvimento máquina','3×8–12','shoulderpress'],['Elevação lateral máquina','3×12–15','lateral'],['Tríceps corda','2×10–15','triceps'],['Rosca Scott máquina','2×10–15','biceps']]},
        5:{name:'Inferior B',tag:'Posterior + glúteos',items:[['Cadeira flexora','3×10–15','legcurl'],['Glute Drive / Hip Thrust máquina','3×8–12','glute'],['Leg Press 45°','3×10–12','legpress'],['Cadeira extensora','2×12–15','extension'],['Cadeira abdutora','3×15–20','abductor'],['Panturrilha sentada','3×12–15','calf']]},
        0:{name:'Superior B',tag:'Costas + ombros + braços',items:[['Puxada frontal','3×8–12','pulldown'],['Remada articulada','3×10–12','row'],['Chest Press inclinado máquina','3×10–12','chestpress'],['Peck Deck reverso','3×12–15','reversefly'],['Elevação lateral máquina','3×12–15','lateral'],['Rosca no cabo','2×10–15','biceps'],['Tríceps máquina','2×10–15','triceps']]}
      }
    }
  ];

  function currentCycle(){return typeof trainingCycleInfo==='function'?trainingCycleInfo():{started:false,week:1,blockWeek:1,stage:{id:'adaptacao',name:'Adaptação',strengthDays:[1,3,5],dayMeta:{}}}}
  function currentStageGuide(){const id=currentCycle().stage.id;return PROGRAM.find(x=>x.id===id)||PROGRAM[0]}
  function cardioFor(stageId,dow){return CARDIO[stageId]?.[dow]||null}
  function isStrengthDow(dow){return (currentCycle().stage.strengthDays||[]).includes(Number(dow))}

  window.isMuscleDay=function(dow){return isStrengthDow(dow)};
  window.isCardioPlanned=function(dow){return !isStrengthDow(dow)};

  function syncDayPlans(){
    const c=currentCycle(),stage=c.stage;
    for(let dow=0;dow<7;dow++){
      const meta=stage.dayMeta?.[dow];
      if(meta){
        dowPlans[dow]={type:'Musculação',plan:meta.name,detail:`${meta.tag} • ${stage.name}`,water:3000};
      }else{
        const cardio=cardioFor(stage.id,dow)||{type:'Caminhada leve',time:'20 min',note:'ritmo confortável • recuperação ativa'};
        dowPlans[dow]={type:'Cardio',plan:cardio.type,detail:`${cardio.time} • ${cardio.note}`,water:3000};
      }
    }
  }

  window.currentWorkoutDetails=function(){
    const c=currentCycle(),dow=selectedDate.getDay(),meta=c.stage.dayMeta?.[dow];
    if(meta)return {id:DETAIL_ID[dow],name:meta.name,tag:meta.tag};
    const cardio=cardioFor(c.stage.id,dow)||{type:'Cardio leve'};
    return {id:null,name:cardio.type,tag:'Recuperação ativa'}
  };

  window.cardioPlan=function(){
    const c=currentCycle(),get=d=>cardioFor(c.stage.id,d)?.time||'Sem cardio';
    return {tue:get(2),wed:get(3),thu:get(4),sat:get(6),sun:get(0)}
  };

  window.renderCardio=function(){
    const c=currentCycle(),head=document.getElementById('cardioPhaseHead'),rows=document.getElementById('cardioRows');
    if(head)head.textContent=`Tempo • ${c.stage.name}`;
    if(!rows)return;
    const html=WEEK_ORDER.filter(d=>!c.stage.strengthDays.includes(d)).map(d=>{
      const x=cardioFor(c.stage.id,d)||{type:'Caminhada leve',time:'20 min',note:'recuperação ativa'};
      return `<tr><td><b>${DAY_NAME[d]}</b></td><td>${x.type}</td><td>${x.time}</td><td><span class="tag">leve/moderado</span></td></tr>`
    }).join('');
    rows.innerHTML=html
  };

  const previousRenderToday=window.renderToday;
  if(typeof previousRenderToday==='function'){
    window.renderToday=function(){
      syncDayPlans();previousRenderToday();
      const c=currentCycle(),dow=selectedDate.getDay();
      if(!c.stage.strengthDays.includes(dow)){
        const x=cardioFor(c.stage.id,dow)||{type:'Caminhada leve',time:'20 min',note:'recuperação ativa'};
        const type=document.getElementById('todayType'),plan=document.getElementById('todayPlan'),detail=document.getElementById('todayDetail');
        if(type)type.textContent='Cardio';if(plan)plan.textContent=x.type;if(detail)detail.textContent=`${x.time} • ${x.note}`
      }
    }
  }

  function renderHomeCycle(){
    const home=document.getElementById('screen-hoje');if(!home)return;
    let card=document.getElementById('homeCycleCard');
    if(!card){
      card=document.createElement('section');card.id='homeCycleCard';card.className='card home-cycle-card';
      const homeToday=document.getElementById('homeToday');
      if(homeToday)home.insertBefore(card,homeToday);else home.appendChild(card)
    }
    const c=currentCycle(),stage=c.stage,next=c.stage.id==='adaptacao'?'Iniciante':c.stage.id==='iniciante'?'Intermediário':'Continuidade do intermediário';
    const strength=(stage.strengthDays||[]).length,cardios=7-strength;
    const pct=c.started?(c.stage.id==='intermediario'?100:Math.min(100,Math.round(c.blockWeek/4*100))):0;
    card.innerHTML=`
      <div class="home-cycle-head"><div><span class="eyebrow">CICLO ATUAL</span><h2>${c.started?`Semana ${c.week} • ${stage.name}`:'Adaptação • aguardando início'}</h2><p>${c.started?`Semana ${c.blockWeek} de 4 neste bloco.`:'A contagem das quatro semanas começa quando o primeiro treino for concluído.'}</p></div><span class="home-cycle-badge">${stage.name}</span></div>
      <div class="home-cycle-progress"><div style="width:${pct}%"></div></div>
      <div class="home-cycle-kpis"><div><span>MUSCULAÇÃO</span><b>${strength}x/semana</b></div><div><span>CARDIO LEVE</span><b>${cardios}x/semana</b></div><div><span>PRÓXIMA ETAPA</span><b>${next}</b></div></div>
      <button class="soft-btn home-program-btn" onclick="setAppScreen('evolucao')">Ver programação completa</button>`
  }

  window.renderHomeToday=function(){
    syncDayPlans();
    const c=currentCycle(),stage=c.stage,dow=selectedDate.getDay(),strength=stage.strengthDays.includes(dow);
    const greetingEl=document.getElementById('homeGreeting'),dateEl=document.getElementById('homeDate');
    if(greetingEl)greetingEl.textContent=typeof greeting==='function'?greeting():'Hoje na FORJA';
    if(dateEl)dateEl.textContent=fmtDate(selectedDate);
    const nm=typeof nextMealForSelected==='function'?nextMealForSelected():null;
    const next=document.getElementById('homeNextMeal'),nextDetail=document.getElementById('homeNextMealDetail');
    if(next)next.textContent=nm?`${nm.time} • ${nm.meal.name.split('•').pop().trim()}`:'Refeições concluídas';
    if(nextDetail)nextDetail.textContent=nm?`${nm.meal.kcal} kcal • ${nm.meal.p} g proteína`:'Rotina alimentar do dia concluída';
    const wn=waterNow(),wt=waterTarget(),water=document.getElementById('homeWater'),waterDetail=document.getElementById('homeWaterDetail');
    if(water)water.textContent=`${wn.toLocaleString('pt-BR')} / ${wt.toLocaleString('pt-BR')} ml`;
    if(waterDetail)waterDetail.textContent=wn>=wt?'Meta de água concluída':`${Math.max(0,wt-wn).toLocaleString('pt-BR')} ml restantes`;
    const workout=document.getElementById('homeWorkout'),workoutDetail=document.getElementById('homeWorkoutDetail');
    const cardio=document.getElementById('homeCardio'),cardioDetail=document.getElementById('homeCardioDetail');
    if(strength){
      const meta=stage.dayMeta[dow],count=stage.plans?.[dow]?.length||currentStageGuide().days?.[dow]?.items?.length||0;
      if(workout)workout.textContent=meta?.name||'Musculação';
      if(workoutDetail)workoutDetail.textContent=`${count} exercícios • ${stage.name} • ${currentStageGuide().effort.split('•')[0].trim()}`;
      if(cardio)cardio.textContent='Sem cardio formal';
      if(cardioDetail)cardioDetail.textContent='Prioridade para musculação e recuperação';
    }else{
      const x=cardioFor(stage.id,dow)||{type:'Caminhada leve',time:'20 min',note:'recuperação ativa'};
      if(workout)workout.textContent='Recuperação ativa';
      if(workoutDetail)workoutDetail.textContent='Sem musculação programada hoje';
      if(cardio)cardio.textContent=`${x.type} • ${x.time}`;
      if(cardioDetail)cardioDetail.textContent=store.get(dk('cardioDone'),false)?'✓ Cardio concluído':x.note;
    }
    const meal=mealPct(),waterPct=Math.min(100,Math.round(wn/wt*100)),activity=strength?workoutPct():(store.get(dk('cardioDone'),false)?100:0);
    const score=document.getElementById('homeScore');if(score)score.textContent=Math.round((meal+waterPct+activity)/3)+'%';
    renderHomeCycle()
  };

  window.openTodayRoutine=function(){setAppScreen('treino');setTimeout(()=>{if(typeof syncGuidedTraining==='function')syncGuidedTraining(true)},120)};

  function renderRestCardioHero(scroll=false){
    const c=currentCycle(),dow=selectedDate.getDay();if(c.stage.strengthDays.includes(dow))return;
    const hero=document.getElementById('guidedTodayHero');if(!hero)return;
    const x=cardioFor(c.stage.id,dow)||{type:'Caminhada leve',time:'20 min',note:'ritmo confortável • recuperação ativa'};
    const done=store.get(dk('cardioDone'),false);hero.hidden=false;hero.removeAttribute('aria-hidden');
    hero.innerHTML=`<span class="eyebrow">RECUPERAÇÃO ATIVA</span><h2>${fmtDate(selectedDate)}</h2><div class="guided-cardio-card v341-cardio"><div class="guided-type-icon">♥</div><div><b>${x.type}</b><p>${x.time} • ${x.note}</p><small>Objetivo: manter movimento e gasto energético sem transformar o dia em outro treino pesado.</small></div><button class="primary-btn" id="v341CardioDone">${done?'✓ Cardio concluído':'Marcar como concluído'}</button></div>`;
    hero.querySelector('#v341CardioDone')?.addEventListener('click',()=>{
      store.set(dk('cardioDone'),!store.get(dk('cardioDone'),false));
      renderProgress();renderHomeToday();if(typeof renderWeeklySummary==='function')renderWeeklySummary();renderRestCardioHero(false)
    });
    if(scroll)hero.scrollIntoView({behavior:'smooth',block:'start'})
  }

  const previousSync=window.syncGuidedTraining;
  if(typeof previousSync==='function'){
    window.syncGuidedTraining=function(scroll=false){
      syncDayPlans();previousSync(scroll);requestAnimationFrame(()=>renderRestCardioHero(scroll))
    }
  }

  function workoutHtml(stage,dow){
    const d=stage.days[dow];if(!d)return '';
    return `<section class="program-workout"><div class="program-workout-head"><div><span>${DAY_NAME[dow]}</span><h4>${d.name}</h4><small>${d.tag}</small></div><b>${d.items.length} exercícios</b></div><div class="program-ex-list">${d.items.map(([name,range,kind],i)=>`<div class="program-ex"><span class="program-ex-num">${i+1}</span><div><b>${name}</b><small>${KIND_TIP[kind]||'Movimento controlado e amplitude confortável.'}</small></div><strong>${range}</strong></div>`).join('')}</div></section>`
  }

  function programStageHtml(stage,currentId){
    const active=stage.id===currentId;
    const week=WEEK_ORDER.map(d=>{
      const strength=stage.days[d];
      if(strength)return `<div class="program-day strength"><span>${DAY_SHORT[d]}</span><b>${strength.name}</b><small>Musculação</small></div>`;
      const x=cardioFor(stage.id,d)||{type:'Caminhada leve',time:'20 min'};
      return `<div class="program-day cardio"><span>${DAY_SHORT[d]}</span><b>${x.type}</b><small>${x.time}</small></div>`
    }).join('');
    return `<details class="program-stage ${active?'current':''}" ${active?'open':''}><summary><div><span class="eyebrow">FASE ${stage.n} • ${stage.weeks.toUpperCase()}</span><h3>${stage.name}</h3><p>${stage.summary}</p></div><div class="program-stage-side"><span>${active?'FASE ATUAL':'VISUALIZAR'}</span><b>${stage.effort.split('•')[0].trim()}</b></div></summary><div class="program-stage-body"><div class="program-prescription"><b>Como será o bloco</b><span>${stage.effort}</span></div><div class="program-week">${week}</div><div class="program-info-grid"><div><h4>O que muda</h4><ul>${stage.changes.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><h4>Dicas do ciclo</h4><ul>${stage.tips.map(x=>`<li>${x}</li>`).join('')}</ul></div></div><div class="program-workouts">${WEEK_ORDER.filter(d=>stage.days[d]).map(d=>workoutHtml(stage,d)).join('')}</div></div></details>`
  }

  function setupProgramScreen(){
    const screen=document.getElementById('evolucao'),home=document.getElementById('screen-hoje');if(!screen||!home)return;
    const weekly=document.getElementById('weeklySummary');
    const homeToday=document.getElementById('homeToday');
    if(weekly&&homeToday&&weekly.parentElement!==home)homeToday.insertAdjacentElement('afterend',weekly);
    if(weekly){
      const btn=weekly.querySelector('.ws-reading button');if(btn){btn.textContent='Ver programação';btn.onclick=()=>setAppScreen('evolucao')}
    }
    let archive=document.getElementById('legacyEvolutionArchive');
    if(!archive){
      archive=document.createElement('div');archive.id='legacyEvolutionArchive';archive.hidden=true;
      [...screen.children].forEach(child=>{if(child!==weekly)archive.appendChild(child)});
      screen.appendChild(archive)
    }
    let intro=document.getElementById('programScreenIntro');
    if(!intro){intro=document.createElement('div');intro.id='programScreenIntro';intro.className='screen-intro program-intro';screen.insertBefore(intro,archive)}
    intro.innerHTML='<h2>Programação</h2><p>Visualize todas as fases, treinos, séries e mudanças do projeto. Esta área é somente para consulta.</p>';
    let root=document.getElementById('programRoadmap');
    if(!root){root=document.createElement('div');root.id='programRoadmap';root.className='program-roadmap';screen.insertBefore(root,archive)}
    const c=currentCycle();
    root.innerHTML=`<section class="card program-roadmap-head"><div><span class="eyebrow">ROADMAP DO PROJETO</span><h2>Adaptação → Iniciante → Intermediário</h2><p>Os blocos mudam automaticamente conforme o tempo de treino. A execução continua sendo feita somente na aba Treino.</p></div><span class="program-current-pill">${c.started?`Semana ${c.week} • ${c.stage.name}`:'Aguardando 1º treino'}</span></section>${PROGRAM.map(s=>programStageHtml(s,c.stage.id)).join('')}`;
    const nav=document.querySelector('.app-nav-btn[data-screen="evolucao"]');
    if(nav){nav.setAttribute('aria-label','Programação');const icon=nav.querySelector('.nav-icon'),label=nav.querySelector('.nav-label');if(icon)icon.textContent='📋';if(label)label.textContent='Programa'}
  }

  function updateHero(){
    const p=document.querySelector('.hero>p');if(p)p.textContent='Treino guiado por ciclos de 4 semanas, com musculação progressiva, cardio leve nos dias sem pesos e execução simples no celular.';
    const v=document.querySelector('.hero .version');if(v)v.textContent=`v${BUILD}`;
    document.documentElement.dataset.forjaBuild=BUILD
  }

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function'){
    window.renderAll=function(){
      syncDayPlans();previousRenderAll();
      requestAnimationFrame(()=>{syncDayPlans();renderHomeToday();renderCardio();setupProgramScreen();renderProgramScreen();updateHero()})
    }
  }

  window.renderProgramScreen=function(){
    const root=document.getElementById('programRoadmap');if(!root)return;setupProgramScreen();
    const c=currentCycle();
    root.innerHTML=`<section class="card program-roadmap-head"><div><span class="eyebrow">ROADMAP DO PROJETO</span><h2>Adaptação → Iniciante → Intermediário</h2><p>Os blocos mudam automaticamente conforme o tempo de treino. A execução continua sendo feita somente na aba Treino.</p></div><span class="program-current-pill">${c.started?`Semana ${c.week} • ${c.stage.name}`:'Aguardando 1º treino'}</span></section>${PROGRAM.map(s=>programStageHtml(s,c.stage.id)).join('')}`
  };

  syncDayPlans();setupProgramScreen();updateHero();
  requestAnimationFrame(()=>{if(typeof renderAll==='function')renderAll();else{renderHomeToday();renderCardio();renderProgramScreen()}})
})();
