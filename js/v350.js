// VITAFIT v3.5.0 — identidade completa e Home orientado à ação, preservando shape12.*
(function(){
  const BUILD='3.5.0';
  const BRAND='VITAFIT';
  const NS_NOTE='shape12.*';
  const DAY_SHORT=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
  const STAGE_TIPS={
    adaptacao:'Priorize a execução. Carga é consequência.',
    iniciante:'Complete boas repetições antes de pensar em subir a carga.',
    intermediario:'Progrida sem perder amplitude, controle e postura.'
  };

  const ICONS={
    brand:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 11l14 27L38 11" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 14c3-5 7-7 12-6-1 5-4 8-10 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    workout:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 20v8m6-13v18m20-18v18m6-13v8M14 24h20" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M18 20v8m12-8v8" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
    cardio:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 26h8l4-9 6 18 5-11h11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 41C12 34 7 28 7 19a8 8 0 0115-4 8 8 0 0115 4c0 9-5 15-13 22z" fill="none" stroke="currentColor" stroke-width="2.3" opacity=".55"/></svg>',
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5L12 3l8.5 7.5V21h-6v-6h-5v6h-6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    train:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6m3-8v10m12-10v10m3-8v6M6 12h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    nutrition:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16c0 6-3 9-8 9s-8-3-8-9zM7 6c2 .2 3 1.2 3 3M15 4c0 2-1 3-3 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    program:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 3v4m8-4v4M4 10h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    more:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7.5 3.5v4m9-4v4M3.5 10h17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    layers:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5zm9 10l-9 5-9-5m18 5l-9 5-9-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    bulb:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 16.5h7M9 19h6M8 14c-1.5-1.2-2.5-3-2.5-5a6.5 6.5 0 1113 0c0 2-1 3.8-2.5 5-.8.7-1 1.2-1 2H9c0-.8-.2-1.3-1-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  function selected(){
    try{return selectedDate instanceof Date?selectedDate:new Date()}catch(e){return new Date()}
  }
  function cycle(){
    try{return typeof trainingCycleInfo==='function'?trainingCycleInfo():null}catch(e){return null}
  }
  function dayKey(field){
    try{return typeof dk==='function'?dk(field):field}catch(e){return field}
  }
  function parseSets(range){
    try{return typeof parsePrescription==='function'?parsePrescription(range).sets:Number((String(range).match(/\d+/)||['0'])[0])||0}catch(e){return 0}
  }
  function doneKey(exKey,i){
    try{return typeof setKey==='function'?setKey(exKey,i,'done'):dayKey(`set.${exKey}.${i}.done`)}catch(e){return dayKey(`set.${exKey}.${i}.done`)}
  }
  function formatShortDate(date){
    const d=String(date.getDate()).padStart(2,'0');
    const mon=date.toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase();
    return `${DAY_SHORT[date.getDay()]}, ${d} ${mon}`
  }
  function hello(){
    const h=new Date().getHours();
    return h<12?'Bom dia, atleta.':h<18?'Boa tarde, atleta.':'Boa noite, atleta.'
  }
  function safePlan(dow){
    try{return dowPlans?.[dow]||null}catch(e){return null}
  }
  function getDailyInfo(){
    const c=cycle();
    const date=selected();
    const dow=date.getDay();
    const stage=c?.stage||{id:'adaptacao',name:'Adaptação',strengthDays:[1,3,5],dayMeta:{},plans:{}};
    const strength=(stage.strengthDays||[]).includes(dow);
    const items=stage.plans?.[dow]||[];
    let totalSets=0,doneSets=0;
    items.forEach(item=>{
      const sets=parseSets(item.range);totalSets+=sets;
      for(let i=1;i<=sets;i++)if(store.get(doneKey(item.key,i),false))doneSets++
    });
    const cardioDone=store.get(dayKey('cardioDone'),false);
    const guidedDone=store.get(dayKey('guided.completed'),false);
    const running=store.get(dayKey('session.running'),false);
    const completed=strength?(guidedDone||(totalSets>0&&doneSets>=totalSets)):cardioDone;
    const progress=strength?(totalSets?Math.round(doneSets/totalSets*100):0):(cardioDone?100:0);
    const meta=stage.dayMeta?.[dow];
    const dayPlan=safePlan(dow);
    const title=strength?(meta?.name||dayPlan?.plan||'Musculação'):(dayPlan?.plan||'Recuperação ativa');
    const subtitle=strength?`${stage.name} • ${meta?.tag||'técnica e controle'}`:`${stage.name} • recuperação ativa`;
    const estimate=strength?Math.max(25,Math.round((totalSets*2.5+items.length*2)/5)*5):Number((dayPlan?.detail||'20 min').match(/\d+/)?.[0]||20);
    return {c,date,dow,stage,strength,items,totalSets,doneSets,progress,completed,running,title,subtitle,dayPlan,estimate}
  }
  function nextCardio(info){
    for(let n=info.strength?1:0;n<7;n++){
      const dow=(info.dow+n)%7;
      if(!(info.stage.strengthDays||[]).includes(dow)){
        const p=safePlan(dow)||{plan:'Cardio leve',detail:'20 min • ritmo confortável'};
        return {dow,...p}
      }
    }
    return {dow:info.dow,plan:'Cardio leve',detail:'20 min • ritmo confortável'}
  }

  function brandHeader(){
    const hero=document.querySelector('.hero');if(!hero)return;
    if(hero.dataset.vitafit==='1'){
      const v=hero.querySelector('.version');if(v)v.textContent=`v${BUILD}`;
      return
    }
    hero.dataset.vitafit='1';
    hero.classList.add('vita-brand-header');
    hero.innerHTML=`<div class="vita-brand-lockup"><span class="vita-mark">${ICONS.brand}</span><div><strong>VITAFIT</strong><small>força • saúde • evolução</small></div></div><span class="vita-header-phase" id="vitaHeaderPhase">Projeto em evolução</span><span class="version">v${BUILD}</span>`;
  }

  function ensureHome(){
    const home=document.getElementById('screen-hoje');if(!home)return null;
    let root=document.getElementById('vitaHomeDashboard');
    if(!root){
      root=document.createElement('div');root.id='vitaHomeDashboard';root.className='vita-home-dashboard';
      const intro=home.querySelector('.screen-intro');
      if(intro)intro.insertAdjacentElement('afterend',root);else home.prepend(root);
      root.innerHTML=`
        <div class="vita-greeting"><h2 id="vitaGreeting">Bom dia, atleta.</h2><p>Vamos construir hoje.</p></div>
        <section class="vita-today-card" id="vitaTodayCard">
          <div class="vita-card-ribbon"><span class="vita-ribbon-mark">${ICONS.brand}</span><b>HOJE NA VITAFIT</b></div>
          <div class="vita-today-top">
            <div class="vita-today-copy"><span class="vita-date" id="vitaDate">HOJE</span><h1 id="vitaWorkoutTitle">—</h1><p id="vitaWorkoutSubtitle">—</p></div>
            <div class="vita-workout-emblem" id="vitaWorkoutEmblem">${ICONS.workout}</div>
          </div>
          <div class="vita-stat-grid">
            <div class="vita-stat"><span>${ICONS.calendar}</span><div><b id="vitaStatA">—</b><small id="vitaStatALabel">exercícios</small></div></div>
            <div class="vita-stat"><span>${ICONS.layers}</span><div><b id="vitaStatB">—</b><small id="vitaStatBLabel">séries</small></div></div>
            <div class="vita-stat"><span>${ICONS.clock}</span><div><b id="vitaStatC">—</b><small id="vitaStatCLabel">min</small></div></div>
          </div>
          <div class="vita-progress"><div class="vita-progress-copy"><b id="vitaProgressPct">0%</b><span id="vitaProgressText">0/0 séries</span></div><div class="vita-progress-track"><div id="vitaProgressBar"></div></div></div>
          <div class="vita-guidance"><span>${ICONS.bulb}</span><p id="vitaGuidance">Priorize a execução. Carga é consequência.</p></div>
          <button class="vita-primary-action" id="vitaPrimaryAction" type="button">▶ INICIAR TREINO</button>
        </section>
        <div class="vita-support-grid">
          <button class="vita-support-card" id="vitaCardioCard" type="button"><span class="vita-support-icon">${ICONS.cardio}</span><div><small id="vitaCardioEyebrow">CARDIO DO DIA</small><b id="vitaCardioTitle">—</b><span id="vitaCardioDetail">—</span></div><i>›</i></button>
          <div class="vita-support-card vita-tip-card"><span class="vita-support-icon">${ICONS.bulb}</span><div><small>DICA RÁPIDA</small><b id="vitaQuickTip">Priorize a execução.</b><span id="vitaQuickTipDetail">Carga é consequência.</span></div></div>
        </div>`;
      root.querySelector('#vitaPrimaryAction').addEventListener('click',startToday);
      root.querySelector('#vitaCardioCard').addEventListener('click',()=>{setAppScreen('treino');setTimeout(()=>{if(typeof syncGuidedTraining==='function')syncGuidedTraining(true)},100)});
    }
    return root
  }

  function startToday(){
    const info=getDailyInfo();
    setAppScreen('treino');
    setTimeout(()=>{
      if(info.strength&&!info.completed&&!store.get(dayKey('session.running'),false)&&typeof toggleWorkoutSession==='function')toggleWorkoutSession();
      if(typeof syncGuidedTraining==='function')syncGuidedTraining(true)
    },120)
  }

  function syncHome(){
    const root=ensureHome();if(!root)return;
    const info=getDailyInfo(),cardio=nextCardio(info);
    root.querySelector('#vitaGreeting').textContent=hello();
    root.querySelector('#vitaDate').textContent=`HOJE • ${formatShortDate(info.date)}`;
    root.querySelector('#vitaWorkoutTitle').textContent=info.title;
    root.querySelector('#vitaWorkoutSubtitle').textContent=info.subtitle;
    root.querySelector('#vitaWorkoutEmblem').innerHTML=info.strength?ICONS.workout:ICONS.cardio;
    if(info.strength){
      root.querySelector('#vitaStatA').textContent=String(info.items.length);
      root.querySelector('#vitaStatALabel').textContent='exercícios';
      root.querySelector('#vitaStatB').textContent=String(info.totalSets);
      root.querySelector('#vitaStatBLabel').textContent='séries';
      root.querySelector('#vitaStatC').textContent=`~${info.estimate}`;
      root.querySelector('#vitaStatCLabel').textContent='min';
      root.querySelector('#vitaProgressText').textContent=`${info.doneSets}/${info.totalSets} séries`;
    }else{
      const duration=(info.dayPlan?.detail||'20 min').match(/\d+\s*min/i)?.[0]||`${info.estimate} min`;
      root.querySelector('#vitaStatA').textContent='1';
      root.querySelector('#vitaStatALabel').textContent='atividade';
      root.querySelector('#vitaStatB').textContent=duration.replace(/\s*min/i,'');
      root.querySelector('#vitaStatBLabel').textContent='min';
      root.querySelector('#vitaStatC').textContent='leve';
      root.querySelector('#vitaStatCLabel').textContent='intensidade';
      root.querySelector('#vitaProgressText').textContent=info.completed?'concluído':'pendente';
    }
    root.querySelector('#vitaProgressPct').textContent=`${info.progress}%`;
    root.querySelector('#vitaProgressBar').style.width=`${info.progress}%`;
    root.querySelector('#vitaGuidance').textContent=info.strength?(info.stage.id==='adaptacao'?'Hoje o foco é aprender os movimentos, não buscar carga.':STAGE_TIPS[info.stage.id]||STAGE_TIPS.adaptacao):'Mantenha um ritmo confortável. O objetivo é se movimentar sem atrapalhar a recuperação.';
    const btn=root.querySelector('#vitaPrimaryAction');
    btn.classList.toggle('is-done',info.completed);
    btn.textContent=info.completed?(info.strength?'✓ TREINO CONCLUÍDO':'✓ CARDIO CONCLUÍDO'):(info.strength?(info.running?'CONTINUAR TREINO →':'▶ INICIAR TREINO'):'ABRIR CARDIO →');
    const currentCardio=!info.strength;
    root.querySelector('#vitaCardioEyebrow').textContent=currentCardio?'CARDIO DO DIA':'PRÓXIMO CARDIO';
    root.querySelector('#vitaCardioTitle').textContent=cardio.plan||'Cardio leve';
    root.querySelector('#vitaCardioDetail').textContent=currentCardio?(info.dayPlan?.detail||cardio.detail||'ritmo confortável'):`${DAY_SHORT[cardio.dow]} • ${cardio.detail||'ritmo confortável'}`;
    const tip=STAGE_TIPS[info.stage.id]||STAGE_TIPS.adaptacao;
    const parts=tip.split('. ');
    root.querySelector('#vitaQuickTip').textContent=(parts[0]||tip).replace(/\.$/,'')+'.';
    root.querySelector('#vitaQuickTipDetail').textContent=parts.slice(1).join('. ')||'Consistência antes de intensidade.';
    document.documentElement.dataset.vitaStage=info.stage.id;
    const hp=document.getElementById('vitaHeaderPhase');
    if(hp)hp.textContent=info.c?.started?`Semana ${info.c.week} • ${info.stage.name}`:`${info.stage.name} • início pendente`;
  }

  function rebrandNav(){
    const iconMap={hoje:ICONS.home,treino:ICONS.train,nutricao:ICONS.nutrition,evolucao:ICONS.program,mais:ICONS.more};
    document.querySelectorAll('.app-nav-btn').forEach(btn=>{
      const icon=btn.querySelector('.nav-icon');if(icon)icon.innerHTML=iconMap[btn.dataset.screen]||'';
      if(btn.dataset.screen==='evolucao'){
        btn.setAttribute('aria-label','Programa');
        const label=btn.querySelector('.nav-label');if(label)label.textContent='Programa'
      }
    })
  }

  function rebrandScreens(){
    document.title='VITAFIT • Força, saúde & evolução';
    document.documentElement.dataset.brand='vitafit';
    document.documentElement.dataset.forjaBuild=BUILD;
    const home=document.getElementById('screen-hoje');home?.classList.add('vita-screen-home');
    const training=document.getElementById('treino'),nutrition=document.getElementById('nutricao'),program=document.getElementById('evolucao'),more=document.getElementById('mais');
    const setIntro=(root,title,subtitle)=>{const intro=root?.querySelector(':scope>.screen-intro');if(!intro)return;const h=intro.querySelector('h2'),p=intro.querySelector('p');if(h)h.textContent=title;if(p)p.textContent=subtitle};
    setIntro(training,'Treino de hoje','Execução guiada, séries, cargas e descanso sem distrações.');
    setIntro(nutrition,'Nutrição','Refeições, macros e hidratação em uma rotina simples de acompanhar.');
    setIntro(program,'Programa','Fases, evolução dos treinos e o que muda em cada bloco.');
    setIntro(more,'Mais','Perfil, compras, relatórios, backup e configurações do projeto.');
    const programIntro=document.getElementById('programScreenIntro');
    if(programIntro){const h=programIntro.querySelector('h2'),p=programIntro.querySelector('p');if(h)h.textContent='Programa';if(p)p.textContent='Consulte as fases, treinos e mudanças planejadas. A execução acontece somente na aba Treino.'}
    const profile=more?.querySelector('.more-profile .eyebrow');if(profile)profile.textContent='PERFIL';
    document.querySelectorAll('.eyebrow').forEach(el=>{
      if(el.textContent.trim()==='HOJE NA FORJA')el.textContent='HOJE NA VITAFIT';
      if(el.textContent.trim()==='SEMANA NA FORJA')el.textContent='SEMANA VITAFIT';
    });
    rebrandNav()
  }

  function ensureMoreBrand(){
    const more=document.getElementById('mais');if(!more||document.getElementById('vitaMoreBrand'))return;
    const intro=more.querySelector(':scope>.screen-intro');
    const card=document.createElement('section');card.id='vitaMoreBrand';card.className='card vita-more-brand';
    card.innerHTML=`<span class="vita-mark">${ICONS.brand}</span><div><strong>VITAFIT</strong><p>Força, saúde e evolução com um plano que acompanha cada fase.</p><small>versão ${BUILD}</small></div>`;
    if(intro)intro.insertAdjacentElement('afterend',card);else more.prepend(card)
  }

  function syncAll(){
    brandHeader();rebrandScreens();ensureMoreBrand();syncHome();
    const version=document.querySelector('.hero .version');if(version)version.textContent=`v${BUILD}`
  }

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function')window.renderAll=function(){previousRenderAll();requestAnimationFrame(syncAll)};
  const previousRenderHome=window.renderHomeToday;
  if(typeof previousRenderHome==='function')window.renderHomeToday=function(){previousRenderHome();requestAnimationFrame(syncHome)};
  const previousScreen=window.setAppScreen;
  if(typeof previousScreen==='function')window.setAppScreen=function(id,opts={}){previousScreen(id,opts);requestAnimationFrame(()=>{rebrandNav();if(id==='hoje')syncHome();if(id==='mais')ensureMoreBrand()})};

  // Keep the legacy namespace untouched; this release is visual-only regarding persistence.
  void BRAND;void NS_NOTE;
  syncAll();
})();
