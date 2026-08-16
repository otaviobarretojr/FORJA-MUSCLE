// FORJA MUSCLE v3.3.2 — simplifica o player de musculação sem alterar shape12.*
(function(){
  const previousSync=window.syncGuidedTraining;
  if(typeof previousSync!=='function')return;

  function cleanWeightsView(scroll=false){
    const stage=document.getElementById('trainingDayStage');
    if(!stage)return;
    const active=stage.querySelector('.exercise[data-ex].guided-active');
    const hero=document.getElementById('guidedTodayHero');

    if(active){
      if(hero){
        hero.hidden=true;
        hero.setAttribute('aria-hidden','true');
        hero.innerHTML='';
      }
      active.querySelector('.guided-visual')?.remove();
      active.classList.add('guided-clean-focus');
      if(scroll)active.scrollIntoView({behavior:'smooth',block:'start'});
    }else if(hero){
      hero.hidden=false;
      hero.removeAttribute('aria-hidden');
    }
  }

  window.syncGuidedTraining=function(scroll=false){
    previousSync(false);
    cleanWeightsView(scroll);
  };

  requestAnimationFrame(()=>window.syncGuidedTraining(false));
})();
