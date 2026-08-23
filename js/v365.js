// VITAFIT 3.6.5 — remove Nutrição e consolida auditoria de toque/velocidade
(function(){
  const BUILD='3.6.5';
  const REMOVED=new Set(['nutricao','evolucao']);
  let current=document.documentElement.dataset.vitaScreen||'hoje';

  function removeNutritionUI(){
    document.querySelectorAll('.app-nav-btn[data-screen="nutricao"],.tab-btn[data-tab="nutricao"],[data-screen="nutricao"]:not(.app-screen)').forEach(el=>el.remove());
    const nutrition=document.getElementById('nutricao');
    if(nutrition){nutrition.classList.remove('active');nutrition.hidden=true;nutrition.setAttribute('aria-hidden','true')}
    document.querySelectorAll('.tabs').forEach(t=>{if(!t.querySelector('.tab-btn:not([data-tab="nutricao"])'))t.remove();else t.hidden=true});

    // Remove referências residuais visíveis da estrutura antiga sem tocar nos dados de treino.
    document.querySelectorAll('#screen-hoje .home-action,#screen-hoje .ws-kpi,#screen-hoje .stat,#mais section,#mais .card').forEach(el=>{
      const txt=(el.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      if(/proxima refeicao|alimentacao|nutricao|macros|calorias|refeicoes/.test(txt))el.remove();
    });
    document.querySelectorAll('#treino .footer-note').forEach(el=>{if(/nutri/i.test(el.textContent||''))el.textContent='Treino deve ser ajustado conforme resposta individual; dor persistente ou sintomas exigem avaliação profissional.'});
  }

  function redirectLegacy(){
    try{const saved=store?.get?.('ui.screen','hoje');if(REMOVED.has(saved))store.set('ui.screen','hoje')}catch(e){}
    if(REMOVED.has(document.documentElement.dataset.vitaScreen))document.documentElement.dataset.vitaScreen='hoje';
  }

  function syncNav(){
    const nav=document.getElementById('appBottomNav');
    if(!nav)return;
    nav.dataset.items='3';
    const buttons=[...nav.querySelectorAll('.app-nav-btn')].filter(b=>!REMOVED.has(b.dataset.screen));
    buttons.forEach(b=>b.setAttribute('draggable','false'));
  }

  function syncBuild(){
    window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;
    document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;
    document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);
    const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD;
  }

  function cleanup(){removeNutritionUI();redirectLegacy();syncNav();syncBuild()}

  // Última camada de navegação: bloqueia telas aposentadas e ignora toques repetidos.
  const previous=window.setAppScreen;
  window.setAppScreen=function(id,opts={}){
    const target=REMOVED.has(id)?'hoje':id;
    if(target===current&&document.getElementById(target==='hoje'?'screen-hoje':target)?.classList.contains('active'))return;
    current=target;
    if(typeof previous==='function')previous(target,opts);
    if(target==='mais')requestAnimationFrame(cleanup);else {syncNav();syncBuild()}
  };
  window.setAppScreen.__vitafitFast=true;

  // Feedback de toque por delegação única; evita centenas de listeners e dá resposta visual imediata.
  const nav=document.getElementById('appBottomNav');
  if(nav&&!nav.dataset.v365Touch){
    nav.dataset.v365Touch='1';
    nav.addEventListener('pointerdown',e=>{const b=e.target.closest('.app-nav-btn');if(b)b.classList.add('v365-pressed')},{passive:true});
    const clear=()=>nav.querySelectorAll('.v365-pressed').forEach(b=>b.classList.remove('v365-pressed'));
    nav.addEventListener('pointerup',clear,{passive:true});nav.addEventListener('pointercancel',clear,{passive:true});
  }

  // Não permite que renderizações legadas reabram Nutrição.
  document.addEventListener('vitafit-screen-change',e=>{
    if(REMOVED.has(e.detail?.id)){queueMicrotask(()=>window.setAppScreen('hoje',{keepScroll:true}));return}
    current=e.detail?.id||current;
    if(current==='mais')requestAnimationFrame(cleanup);
  });

  cleanup();
  requestAnimationFrame(cleanup);
})();