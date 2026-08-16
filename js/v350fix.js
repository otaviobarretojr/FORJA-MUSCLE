// VITAFIT v3.5.0 — acabamento do Home sem alterar shape12.*
(function(){
  function correctHomeState(){
    const btn=document.getElementById('vitaPrimaryAction');
    if(!btn || typeof trainingCycleInfo!=='function')return;
    const c=trainingCycleInfo();
    const dow=selectedDate.getDay();
    const strength=(c.stage.strengthDays||[]).includes(dow);
    if(!strength)return;
    const completed=store.get(dk('guided.completed'),false);
    if(completed)return;
    btn.classList.remove('is-done');
    const running=store.get(dk('session.running'),false);
    const pct=parseInt((document.getElementById('vitaProgressPct')?.textContent||'0').replace(/\D/g,''),10)||0;
    btn.textContent=(running||pct>0)?'CONTINUAR TREINO →':'▶ INICIAR TREINO';
  }

  function afterRender(){requestAnimationFrame(()=>requestAnimationFrame(correctHomeState))}

  const previousRenderHome=window.renderHomeToday;
  if(typeof previousRenderHome==='function')window.renderHomeToday=function(){previousRenderHome();afterRender()};

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function')window.renderAll=function(){previousRenderAll();afterRender()};

  const previousScreen=window.setAppScreen;
  if(typeof previousScreen==='function')window.setAppScreen=function(id,opts={}){previousScreen(id,opts);if(id==='hoje')afterRender()};

  afterRender();
})();
