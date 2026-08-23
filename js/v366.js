// VITAFIT 3.6.6 — consolidação de navegação, limpeza e interação
(function(){
  const BUILD='3.6.6';
  const REMOVED=new Set(['nutricao','evolucao']);
  let current=document.documentElement.dataset.vitaScreen||'hoje';

  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}

  function pruneNavigation(){
    document.querySelectorAll('.app-nav-btn[data-screen="nutricao"],.app-nav-btn[data-screen="evolucao"],.tab-btn[data-tab="nutricao"],[data-screen="nutricao"]:not(.app-screen),[data-screen="evolucao"]:not(.app-screen)').forEach(el=>el.remove());
    const nav=document.getElementById('appBottomNav');
    if(nav){nav.dataset.items='3';nav.querySelectorAll('.app-nav-btn').forEach(b=>b.setAttribute('draggable','false'))}
    document.querySelectorAll('.tabs').forEach(t=>{t.hidden=true});
  }

  function retireScreens(){
    for(const id of REMOVED){
      const screen=document.getElementById(id);
      if(screen){screen.classList.remove('active');screen.hidden=true;screen.setAttribute('aria-hidden','true')}
    }
    try{const saved=store?.get?.('ui.screen','hoje');if(REMOVED.has(saved))store.set('ui.screen','hoje')}catch(e){}
    if(REMOVED.has(document.documentElement.dataset.vitaScreen))document.documentElement.dataset.vitaScreen='hoje';
  }

  function pruneEditor(){
    const more=document.getElementById('mais');if(!more)return;
    const selectors=['.app-editor','.editor-panel','.edit-app','.app-customizer','.customizer-panel','[data-editor]','[data-app-editor]'];
    selectors.forEach(sel=>{try{more.querySelectorAll(sel).forEach(el=>el.remove())}catch(e){}});
    const terms=['editar aplicativo','editar app','modo edicao','editor do aplicativo','personalizar aplicativo','personalizacao do aplicativo','edicao completa','sistema de edicao'];
    more.querySelectorAll('section,.card,details,.settings-card,.more-card,.settings-group,button,a').forEach(el=>{
      const text=norm(el.textContent);
      if(terms.some(t=>text.includes(t)))el.remove();
    });
  }

  function removeLegacyExerciseVideoUI(){
    document.querySelectorAll('#v360TrainingApp .v360-video-btn,#v360TrainingApp [data-video-ex],#v360VideoModal,#v362WorkoutVideoModal').forEach(el=>el.remove());
  }

  function cleanVisibleLegacyCopy(){
    document.querySelectorAll('#screen-hoje .home-action,#screen-hoje .ws-kpi,#screen-hoje .stat,#mais section,#mais .card').forEach(el=>{
      const text=norm(el.textContent);
      if(/proxima refeicao|alimentacao|nutricao|macros|calorias|refeicoes/.test(text))el.remove();
    });
    document.querySelectorAll('#treino .footer-note').forEach(el=>{if(/nutri/i.test(el.textContent||''))el.textContent='Treino deve ser ajustado conforme resposta individual; dor persistente ou sintomas exigem avaliação profissional.'});
  }

  function syncBuild(){
    window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;
    document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;
    document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);
    const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD;
  }

  function cleanup(){pruneNavigation();retireScreens();pruneEditor();removeLegacyExerciseVideoUI();cleanVisibleLegacyCopy();syncBuild()}

  const previous=window.setAppScreen;
  window.setAppScreen=function(id,opts={}){
    const target=REMOVED.has(id)?'hoje':id;
    const targetEl=document.getElementById(target==='hoje'?'screen-hoje':target);
    if(target===current&&targetEl?.classList.contains('active'))return;
    current=target;
    if(typeof previous==='function')previous(target,opts);
    if(target==='treino')requestAnimationFrame(removeLegacyExerciseVideoUI);
    if(target==='mais')requestAnimationFrame(pruneEditor);
    syncBuild();
  };
  window.setAppScreen.__vitafitFast=true;

  const nav=document.getElementById('appBottomNav');
  if(nav&&!nav.dataset.v366Touch){
    nav.dataset.v366Touch='1';
    nav.addEventListener('pointerdown',e=>{const b=e.target.closest('.app-nav-btn');if(b)b.classList.add('v366-pressed')},{passive:true});
    const clear=()=>nav.querySelectorAll('.v366-pressed').forEach(b=>b.classList.remove('v366-pressed'));
    nav.addEventListener('pointerup',clear,{passive:true});nav.addEventListener('pointercancel',clear,{passive:true});nav.addEventListener('pointerleave',clear,{passive:true});
  }

  document.addEventListener('vitafit-screen-change',e=>{
    if(REMOVED.has(e.detail?.id)){queueMicrotask(()=>window.setAppScreen('hoje',{keepScroll:true}));return}
    current=e.detail?.id||current;
    if(current==='treino')requestAnimationFrame(removeLegacyExerciseVideoUI);
    if(current==='mais')requestAnimationFrame(pruneEditor);
  });
  document.addEventListener('click',e=>{if(e.target.closest('#v360TrainingApp .v360-day,#v360TrainingApp [data-done],#v360Cardio'))requestAnimationFrame(removeLegacyExerciseVideoUI)},{passive:true});

  cleanup();requestAnimationFrame(cleanup);
})();