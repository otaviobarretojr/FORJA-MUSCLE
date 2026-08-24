// VITAFIT 3.6.8 — Mais essencial; rotina semanal agora vive no núcleo do treino
(function(){
  const BUILD='3.6.8';
  function syncBuild(){window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);const m=document.querySelector('#vitaMoreBrand small');if(m)m.textContent='versão '+BUILD}
  function rebuildMore(){
    const more=document.getElementById('mais');if(!more||more.dataset.v368Ready==='1')return;
    more.dataset.v368Ready='1';
    more.innerHTML=`
      <div class="screen-intro v367-more-intro"><span class="eyebrow">VITAFIT</span><h2>Mais</h2><p>Somente o essencial para acompanhar a rotina e manter seus dados.</p></div>
      <section class="card v367-week-card"><div class="v367-head"><div><span class="eyebrow">ROTINA SEMANAL</span><h3>4 treinos de musculação</h3></div><span class="v367-pill">4× semana</span></div>
        <div class="v367-schedule">
          <div class="strength"><b>SEG</b><span>Inferiores</span><small>Musculação</small></div>
          <div class="cardio"><b>TER</b><span>Cardio</span><small>Recuperação ativa</small></div>
          <div class="strength"><b>QUA</b><span>Superiores</span><small>Musculação</small></div>
          <div class="cardio"><b>QUI</b><span>Cardio</span><small>Recuperação ativa</small></div>
          <div class="strength"><b>SEX</b><span>Inferiores</span><small>Musculação</small></div>
          <div class="cardio"><b>SÁB</b><span>Cardio</span><small>Recuperação ativa</small></div>
          <div class="strength"><b>DOM</b><span>Superiores</span><small>Musculação</small></div>
        </div>
      </section>
      <section class="card v367-data"><span class="eyebrow">DADOS</span><h3>Backup</h3><p>Salve ou restaure os registros do aplicativo.</p><div class="v367-actions"><button class="primary-btn" type="button" id="v367Export">Exportar backup</button><button class="soft-btn" type="button" id="v367Import">Importar backup</button><input id="v367ImportFile" type="file" accept=".json,application/json" hidden></div></section>
      <section class="card v367-about" id="vitaMoreBrand"><strong>VITAFIT</strong><p>Treino, consistência e evolução.</p><small>versão ${BUILD}</small></section>`;
    more.querySelector('#v367Export')?.addEventListener('click',()=>{if(typeof exportData==='function')exportData()});
    const file=more.querySelector('#v367ImportFile');more.querySelector('#v367Import')?.addEventListener('click',()=>file?.click());file?.addEventListener('change',()=>{if(typeof importData==='function')importData(file.files?.[0])});
  }
  const prevScreen=window.setAppScreen;
  window.setAppScreen=function(id,opts={}){if(typeof prevScreen==='function')prevScreen(id,opts);if(id==='mais')requestAnimationFrame(rebuildMore);syncBuild()};
  window.setAppScreen.__vitafitFast=true;
  document.addEventListener('vitafit-screen-change',e=>{if(e.detail?.id==='mais')requestAnimationFrame(rebuildMore)});
  requestAnimationFrame(()=>{rebuildMore();syncBuild()});
})();
