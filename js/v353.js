// VITAFIT v3.5.3 — navegação instantânea e consolidada, preservando shape12.*
(function(){
  const BUILD='3.5.3';
  const IDS=['hoje','treino','nutricao','evolucao','mais'];
  const screenId=id=>id==='hoje'?'screen-hoje':id;
  let screens=null,buttons=null,current=null;

  function cacheRefs(){
    screens=new Map();buttons=new Map();
    IDS.forEach(id=>{
      const screen=document.getElementById(screenId(id));
      const button=document.querySelector(`.app-nav-btn[data-screen="${id}"]`);
      if(screen)screens.set(id,screen);
      if(button)buttons.set(id,button);
    });
    const active=[...screens.entries()].find(([,el])=>el.classList.contains('active'));
    current=active?.[0]||'hoje';
  }

  function refsValid(){
    return screens&&buttons&&[...screens.values()].every(el=>el.isConnected)&&[...buttons.values()].every(el=>el.isConnected);
  }

  function setCurrent(id){
    buttons.forEach((btn,key)=>{
      const active=key===id;
      btn.classList.toggle('active',active);
      if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
    });
  }

  function jumpTop(){
    if(window.scrollY===0)return;
    const root=document.documentElement;
    const previous=root.style.scrollBehavior;
    root.style.scrollBehavior='auto';
    window.scrollTo(0,0);
    root.style.scrollBehavior=previous;
  }

  function fastSetAppScreen(id,opts={}){
    if(!IDS.includes(id))return;
    if(!refsValid())cacheRefs();
    const target=screens.get(id);if(!target)return;

    // O scroll é zerado enquanto a tela atual ainda está renderizada. Assim a abertura
    // de uma área grande não é forçada a calcular todo o layout dentro do toque.
    if(!opts.keepScroll)jumpTop();

    if(current!==id){
      const previous=screens.get(current);
      if(previous)previous.classList.remove('active');
      target.classList.add('active');
      current=id;
    }
    setCurrent(id);
    try{store.set('ui.screen',id)}catch(e){}
    document.documentElement.dataset.vitaScreen=id;
    document.dispatchEvent(new CustomEvent('vitafit-screen-change',{detail:{id}}));
  }

  fastSetAppScreen.__vitafitFast=true;
  window.setAppScreen=fastSetAppScreen;

  function bindFeedback(){
    const nav=document.getElementById('appBottomNav');if(!nav||nav.dataset.vitaFastBound==='1')return;
    nav.dataset.vitaFastBound='1';
    nav.addEventListener('pointerdown',event=>{
      const btn=event.target.closest('.app-nav-btn');
      if(btn)btn.classList.add('is-pressed');
    },{passive:true});
    const clear=()=>nav.querySelectorAll('.app-nav-btn.is-pressed').forEach(btn=>btn.classList.remove('is-pressed'));
    nav.addEventListener('pointerup',clear,{passive:true});
    nav.addEventListener('pointercancel',clear,{passive:true});
    nav.addEventListener('pointerleave',clear,{passive:true});
  }

  function syncBuild(){
    document.documentElement.dataset.forjaBuild=BUILD;
    document.documentElement.dataset.vitafitBuild=BUILD;
    document.querySelectorAll('.version').forEach(el=>el.textContent=`v${BUILD}`);
    const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent=`versão ${BUILD}`;
  }

  cacheRefs();bindFeedback();syncBuild();
})();
