// VITAFIT 3.6.4 — remove Programa e sistema de edição, sem observer global
(function(){
  const BUILD='3.6.4';
  const EDIT_TERMS=['editar aplicativo','editar app','modo edição','modo de edição','editor do aplicativo','personalizar aplicativo','personalização do aplicativo','edição completa','sistema de edição'];
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}
  function removeProgram(){
    document.querySelectorAll('.app-nav-btn[data-screen="evolucao"]').forEach(el=>el.remove());
    const screen=document.getElementById('evolucao');if(screen)screen.remove();
    document.querySelectorAll('[data-screen="evolucao"]').forEach(el=>{if(el.tagName==='BUTTON'||el.tagName==='A')el.remove()});
  }
  function removeEditor(){
    const more=document.getElementById('mais');if(!more)return;
    ['#appEditor','#app-editor','#editorPanel','#editor-panel','.app-editor','.editor-panel','.edit-app','.app-customizer','.customizer-panel','[data-editor]','[data-app-editor]'].forEach(sel=>{try{more.querySelectorAll(sel).forEach(el=>el.remove())}catch(e){}});
    [...more.querySelectorAll('section,.card,details,.settings-card,.more-card,.settings-group,button,a')].forEach(el=>{const t=norm(el.textContent);if(EDIT_TERMS.some(term=>t.includes(norm(term))))el.remove()});
  }
  function redirectOldScreen(){try{if(store?.get?.('ui.screen','')==='evolucao')store.set('ui.screen','hoje')}catch(e){}if(document.documentElement.dataset.vitaScreen==='evolucao')document.documentElement.dataset.vitaScreen='hoje'}
  function syncBuild(){window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD}
  function apply(){removeProgram();removeEditor();redirectOldScreen();syncBuild()}
  const previous=window.setAppScreen;
  window.setAppScreen=function(id,opts={}){const target=id==='evolucao'?'hoje':id;if(typeof previous==='function')previous(target,opts);if(target==='mais')requestAnimationFrame(removeEditor);syncBuild()};
  window.setAppScreen.__vitafitFast=previous?.__vitafitFast===true;
  document.addEventListener('vitafit-screen-change',e=>{if(e.detail?.id==='mais')requestAnimationFrame(removeEditor)});
  apply();
})();