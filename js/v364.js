// VITAFIT 3.6.4 — remove Programa e sistema de edição do aplicativo
(function(){
  const BUILD='3.6.4';
  const EDIT_TERMS=['editar aplicativo','editar app','modo edição','modo de edição','editor do aplicativo','personalizar aplicativo','personalização do aplicativo','edição completa','sistema de edição'];

  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}

  function removeProgram(){
    document.querySelectorAll('.app-nav-btn[data-screen="evolucao"]').forEach(el=>el.remove());
    const screen=document.getElementById('evolucao');
    if(screen){screen.classList.remove('active');screen.hidden=true;screen.setAttribute('aria-hidden','true')}
    document.querySelectorAll('[data-screen="evolucao"]:not(.app-nav-btn)').forEach(el=>{if(el.tagName==='BUTTON'||el.tagName==='A')el.remove()});
    const nav=document.getElementById('appBottomNav');if(nav)nav.dataset.items='4';
  }

  function removeEditor(){
    const more=document.getElementById('mais');if(!more)return;
    const obvious=['#appEditor','#app-editor','#editorPanel','#editor-panel','.app-editor','.editor-panel','.edit-app','.app-customizer','.customizer-panel','[data-editor]','[data-app-editor]'];
    obvious.forEach(sel=>{try{more.querySelectorAll(sel).forEach(el=>el.remove())}catch(e){}});
    const candidates=[...more.querySelectorAll('section,.card,details,.settings-card,.more-card,.settings-group')];
    candidates.forEach(el=>{
      const t=norm(el.textContent);
      if(EDIT_TERMS.some(term=>t.includes(norm(term))))el.remove();
    });
    [...more.querySelectorAll('button,a')].forEach(el=>{
      const t=norm(el.textContent);
      if(EDIT_TERMS.some(term=>t.includes(norm(term))))el.remove();
    });
  }

  function redirectOldScreen(){
    try{if(store?.get?.('ui.screen','')==='evolucao')store.set('ui.screen','hoje')}catch(e){}
    if(document.documentElement.dataset.vitaScreen==='evolucao')document.documentElement.dataset.vitaScreen='hoje';
  }

  function apply(){removeProgram();removeEditor();redirectOldScreen();syncBuild()}

  const previous=window.setAppScreen;
  window.setAppScreen=function(id,opts={}){
    const target=id==='evolucao'?'hoje':id;
    if(typeof previous==='function')previous(target,opts);
    requestAnimationFrame(apply);
  };
  window.setAppScreen.__vitafitFast=previous?.__vitafitFast===true;

  function syncBuild(){
    window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;
    document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;
    document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);
    const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD;
  }

  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  observer.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('vitafit-screen-change',()=>requestAnimationFrame(apply));
  apply();setTimeout(apply,300);setTimeout(apply,1200);
})();
