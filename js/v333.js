// FORJA MUSCLE v3.3.3 — descanso circular compacto sem alterar shape12.*
(function(){
  const restCard=document.querySelector('#treino .rest-card');
  if(!restCard||typeof window.startRest!=='function'||typeof window.renderRest!=='function')return;

  const previousStartRest=window.startRest;
  const previousRenderRest=window.renderRest;
  const previousResetRest=window.resetRest;
  let totalSeconds=0;

  function hideMiniRest(){
    restCard.classList.remove('rest-mini-active');
    restCard.setAttribute('aria-hidden','true');
    restCard.style.setProperty('--rest-progress','0%');
  }

  function syncMiniRest(){
    const remaining=Math.max(0,Number(restRemaining)||0);
    if(remaining<=0){hideMiniRest();return}
    const total=Math.max(1,totalSeconds||remaining);
    const pct=Math.max(0,Math.min(100,(remaining/total)*100));
    restCard.style.setProperty('--rest-progress',pct+'%');
    restCard.classList.add('rest-mini-active');
    restCard.removeAttribute('aria-hidden');
    restCard.setAttribute('aria-label','Descanso: '+restClock.textContent+' restantes');
  }

  restCard.classList.add('rest-mini-card');
  restCard.innerHTML=`<button class="rest-mini-close" id="restMiniClose" type="button" aria-label="Dispensar descanso">×</button><div class="rest-mini-ring"><div class="rest-clock" id="restClock">00:00</div></div><button id="pauseRestBtn" type="button" hidden tabindex="-1" aria-hidden="true">Ⅱ</button>`;
  hideMiniRest();

  document.getElementById('restMiniClose')?.addEventListener('click',event=>{
    event.stopPropagation();
    if(typeof previousResetRest==='function')previousResetRest();
    hideMiniRest();
  });

  window.renderRest=function(){
    previousRenderRest();
    syncMiniRest();
  };

  window.startRest=function(seconds){
    totalSeconds=Math.max(1,Number(seconds)||60);
    previousStartRest(totalSeconds);
    syncMiniRest();
  };

  window.resetRest=function(){
    if(typeof previousResetRest==='function')previousResetRest();
    hideMiniRest();
  };
})();
