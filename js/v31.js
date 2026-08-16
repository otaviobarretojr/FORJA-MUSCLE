// FORJA MUSCLE v3.1.2 — navegação em 5 áreas sem alterar as chaves de dados
(function(){
  const screenMeta={
    hoje:{label:'Hoje',icon:'⌂'},
    treino:{label:'Treino',icon:'🏋️'},
    nutricao:{label:'Nutrição',icon:'🥗'},
    evolucao:{label:'Evolução',icon:'📈'},
    mais:{label:'Mais',icon:'☰'}
  };

  function intro(title,subtitle){
    const el=document.createElement('div');
    el.className='screen-intro';
    el.innerHTML=`<h2>${title}</h2><p>${subtitle}</p>`;
    return el;
  }

  function findBlock(root,title){
    if(!root)return null;
    const h=[...root.querySelectorAll('.section-title h2')].find(x=>x.textContent.trim()===title);
    if(!h)return null;
    const heading=h.closest('.section-title');
    const content=heading.nextElementSibling;
    return {heading,content};
  }

  function moveBlock(root,title,target){
    const block=findBlock(root,title);
    if(!block)return;
    target.appendChild(block.heading);
    if(block.content)target.appendChild(block.content);
  }

  function createProfileCard(){
    const heroProfile=document.querySelector('.hero .profile');
    if(!heroProfile)return null;
    const wrap=document.createElement('section');
    wrap.className='card more-profile';
    wrap.innerHTML='<span class="eyebrow">PERFIL DO PROJETO</span>';
    const cloned=heroProfile.cloneNode(true);
    wrap.appendChild(cloned);
    return wrap;
  }

  function createBottomNav(host){
    const nav=document.createElement('nav');
    nav.id='appBottomNav';
    nav.className='app-bottom-nav';
    nav.setAttribute('aria-label','Navegação principal');
    nav.innerHTML=Object.entries(screenMeta).map(([id,m])=>`<button class="app-nav-btn" data-screen="${id}" onclick="setAppScreen('${id}')" aria-label="${m.label}"><span class="nav-icon">${m.icon}</span><span class="nav-label">${m.label}</span></button>`).join('');
    host.appendChild(nav);
  }

  window.setAppScreen=function(id,opts={}){
    const target=document.getElementById(id==='hoje'?'screen-hoje':id);
    if(!target)return;
    document.querySelectorAll('.app-screen').forEach(s=>s.classList.remove('active'));
    target.classList.add('active');
    document.querySelectorAll('.app-nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));
    store.set('ui.screen',id);
    if(!opts.keepScroll)window.scrollTo({top:0,behavior:opts.instant?'auto':'smooth'});
  };

  function renderV31Header(){
    document.documentElement.dataset.forjaBuild=window.__FORJA_BUILD__||'3.1.2';
    const v=document.querySelector('.hero .version');
    if(v)v.textContent='v3.1.2';
    const eyebrow=document.querySelector('.hero>.eyebrow');
    if(eyebrow&&typeof phaseInfo==='function'){
      const p=phaseInfo();
      eyebrow.textContent=`SEMANA ${p.w} • ${p.name.toUpperCase()}`;
    }
  }

  function organize(){
    const app=document.querySelector('.app');
    const main=document.querySelector('main');
    const nutrition=document.getElementById('nutricao');
    const training=document.getElementById('treino');
    if(!app||!main||!nutrition||!training||document.getElementById('appBottomNav'))return;

    const legacyTabs=document.querySelector('.tabs');
    if(legacyTabs)legacyTabs.classList.add('legacy-tabs');

    const home=document.createElement('section');
    home.id='screen-hoje';home.className='app-screen';
    home.appendChild(intro('Hoje','Só o que precisa ser feito agora.'));

    const evolution=document.createElement('section');
    evolution.id='evolucao';evolution.className='app-screen';
    evolution.appendChild(intro('Evolução','Medidas, consistência, fotos e check-in em um só lugar.'));

    const more=document.createElement('section');
    more.id='mais';more.className='app-screen';
    more.appendChild(intro('Mais','Compras, cadastros, relatórios e dados do aplicativo.'));

    nutrition.classList.add('app-screen');
    training.classList.add('app-screen');
    nutrition.prepend(intro('Nutrição','Refeições, macros e hidratação do dia.'));
    training.prepend(intro('Treino','Sessão do dia, cardio, progressão e biblioteca.'));

    main.prepend(home);
    main.appendChild(evolution);
    main.appendChild(more);

    // Hoje: somente execução do dia.
    const today=document.getElementById('homeToday');
    const daily=document.querySelector('.today-wrap');
    if(today)home.appendChild(today);
    if(daily)home.appendChild(daily);

    // Evolução: acompanhamento, comparação e check-in.
    const weekly=document.getElementById('weeklySummary');
    const progress=document.getElementById('progressDashboard');
    const target=document.getElementById('targetCard');
    if(progress)evolution.appendChild(progress);
    if(weekly)evolution.appendChild(weekly);
    moveBlock(nutrition,'Evolução corporal',evolution);
    moveBlock(training,'Check-in semanal',evolution);
    if(target)evolution.appendChild(target);

    // Mais: configurações e funções usadas com menor frequência.
    const profile=createProfileCard();
    if(profile)more.appendChild(profile);
    moveBlock(nutrition,'Alimentos próprios',more);
    moveBlock(nutrition,'Compras da semana',more);
    moveBlock(training,'Dados e backup',more);
    document.querySelectorAll('.footer-note').forEach(n=>more.appendChild(n));

    // Treino do dia aparece antes do planejamento semanal.
    const workoutTitle=findBlock(training,'Musculação completa');
    if(workoutTitle){
      const frag=document.createDocumentFragment();
      frag.appendChild(workoutTitle.heading);
      if(workoutTitle.content)frag.appendChild(workoutTitle.content);
      const rest=training.querySelector('.rest-card');if(rest)frag.appendChild(rest);
      ['workout-seg','workout-qua','workout-sex','workout-dom'].forEach(id=>{const n=document.getElementById(id);if(n)frag.appendChild(n)});
      const screenIntro=training.querySelector('.screen-intro');
      if(screenIntro)screenIntro.after(frag);
    }

    createBottomNav(document.body);
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.app-screen').forEach(s=>s.classList.remove('active'));
    setAppScreen('hoje',{instant:true});
    renderV31Header();
  }

  window.openTodayRoutine=function(){
    const type=dowPlans[selectedDate.getDay()].type;
    if(type==='Musculação'||type==='Cardio'){
      setAppScreen('treino');
      setTimeout(()=>{if(typeof focusTodayWorkout==='function')focusTodayWorkout()},120);
    }else{
      setAppScreen('nutricao');
      setTimeout(()=>document.getElementById('meals')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
    }
  };

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function'){
    window.renderAll=function(){
      previousRenderAll();
      renderV31Header();
    };
  }

  organize();
})();
