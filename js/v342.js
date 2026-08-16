// FORJA MUSCLE v3.4.2 — Home mais limpo, preservando componentes internos e shape12.*
(function(){
  const BUILD='3.4.2';

  function cleanHome(){
    const home=document.getElementById('screen-hoje');
    if(!home)return;

    let archive=document.getElementById('homeLegacyArchive');
    if(!archive){
      archive=document.createElement('section');
      archive.id='homeLegacyArchive';
      archive.hidden=true;
      archive.setAttribute('aria-hidden','true');
      home.appendChild(archive);
    }

    const weekly=document.getElementById('weeklySummary');
    const daily=document.querySelector('.today-wrap');
    if(weekly&&weekly.parentElement!==archive)archive.appendChild(weekly);
    if(daily&&daily.parentElement!==archive)archive.appendChild(daily);

    const intro=home.querySelector('.screen-intro');
    if(intro){
      const p=intro.querySelector('p');
      if(p)p.textContent='O essencial de hoje e o ciclo atual.';
    }

    const version=document.querySelector('.hero .version');
    if(version)version.textContent=`v${BUILD}`;
    document.documentElement.dataset.forjaBuild=BUILD;
  }

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function'){
    window.renderAll=function(){
      previousRenderAll();
      requestAnimationFrame(cleanHome);
    }
  }

  const previousSetAppScreen=window.setAppScreen;
  if(typeof previousSetAppScreen==='function'){
    window.setAppScreen=function(id,opts={}){
      previousSetAppScreen(id,opts);
      if(id==='hoje')requestAnimationFrame(cleanHome)
    }
  }

  cleanHome();
})();
