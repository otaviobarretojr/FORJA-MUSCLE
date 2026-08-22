// VITAFIT v3.5.4 — versão final sempre sincronizada após renders legados
(function(){
  const BUILD='3.5.4';
  function sync(){
    document.documentElement.dataset.forjaBuild=BUILD;
    document.documentElement.dataset.vitafitBuild=BUILD;
    document.querySelectorAll('.version').forEach(el=>el.textContent=`v${BUILD}`);
    const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent=`versão ${BUILD}`;
  }
  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function')window.renderAll=function(){previousRenderAll();requestAnimationFrame(sync)};
  document.addEventListener('vitafit-screen-change',()=>requestAnimationFrame(sync));
  sync();requestAnimationFrame(sync);
})();
