// VITAFIT v3.5.0 — cabeçalho estável, independente da estrutura legada, sem alterar shape12.*
(function(){
  const BUILD='3.5.0';
  const BRAND_MARK='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 11l14 27L38 11" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 14c3-5 7-7 12-6-1 5-4 8-10 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';

  function phaseLabel(){
    try{
      if(typeof trainingCycleInfo!=='function')return 'Projeto em evolução';
      const c=trainingCycleInfo();
      return c.started?`Semana ${c.week} • ${c.stage.name}`:`${c.stage.name} • início pendente`;
    }catch(e){return 'Projeto em evolução'}
  }

  function markup(){
    return `<div class="vita-brand-lockup"><span class="vita-mark">${BRAND_MARK}</span><div><strong>VITAFIT</strong><small>força • saúde • evolução</small></div></div><span class="vita-header-phase" id="vitaStableHeaderPhase">${phaseLabel()}</span><span class="version">v${BUILD}</span>`;
  }

  function ensureStableHeader(){
    const app=document.querySelector('.app');
    if(!app)return null;

    let stable=document.getElementById('vitaStableHeader');
    const legacy=[...document.querySelectorAll('.hero')].find(el=>el.id!=='vitaStableHeader');

    if(!stable){
      stable=document.createElement('header');
      stable.id='vitaStableHeader';
      stable.className='hero vita-brand-header vita-stable-header';
      stable.dataset.vitafit='1';
      stable.innerHTML=markup();
      app.insertBefore(stable,app.firstChild);
    }

    // Remove a dependência visual do cabeçalho original sem apagar o nó legado.
    if(legacy){
      legacy.classList.remove('hero');
      legacy.classList.add('vita-legacy-hero');
      legacy.hidden=true;
      legacy.setAttribute('aria-hidden','true');
      legacy.style.display='none';
    }

    stable.hidden=false;
    stable.style.removeProperty('display');
    stable.dataset.vitafit='1';
    const phase=stable.querySelector('#vitaStableHeaderPhase');
    if(phase)phase.textContent=phaseLabel();
    const version=stable.querySelector('.version');
    if(version)version.textContent=`v${BUILD}`;
    return stable;
  }

  function sync(){requestAnimationFrame(()=>ensureStableHeader())}

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function')window.renderAll=function(){previousRenderAll();sync()};

  const previousScreen=window.setAppScreen;
  if(typeof previousScreen==='function')window.setAppScreen=function(id,opts={}){previousScreen(id,opts);sync()};

  ensureStableHeader();
})();
