// VITAFIT 3.6.7 — rotina 4x/semana e Mais essencial
(function(){
  const BUILD='3.6.7';
  const SESSION_MAP=[
    {source:'seg',day:'SEG',title:'Inferiores completo',sub:'Musculação'},
    {source:'ter',day:'QUA',title:'Superiores completo',sub:'Musculação'},
    {source:'qua',day:'SEX',title:'Inferiores completo',sub:'Musculação'},
    {source:'qui',day:'DOM',title:'Superiores completo',sub:'Musculação'}
  ];
  const SOURCE_BY_DOW={1:'seg',3:'ter',5:'qua',0:'qui'};
  const CARDIO_DOW=new Set([2,4,6]);
  const DOW_NAME=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

  function selectedDow(){try{return selectedDate instanceof Date?selectedDate.getDay():new Date().getDay()}catch(e){return new Date().getDay()}}
  function syncBuild(){window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);const m=document.querySelector('#vitaMoreBrand small');if(m)m.textContent='versão '+BUILD}

  function remapTrainingTabs(){
    const app=document.getElementById('v360TrainingApp');if(!app)return;
    const buttons=[...app.querySelectorAll('.v360-day')];
    for(const item of SESSION_MAP){
      const btn=buttons.find(b=>b.dataset.day===item.source);if(!btn)continue;
      btn.hidden=false;btn.dataset.scheduleDay=item.day;btn.setAttribute('aria-label',`${item.day} • ${item.title}`);
      const b=btn.querySelector('b'),s=btn.querySelector('span');if(b)b.textContent=item.day;if(s)s.textContent=item.title.replace(' completo','');
    }
    buttons.filter(b=>b.dataset.day==='sex').forEach(b=>b.hidden=true);
    const week=app.querySelector('.v360-week');if(week){week.classList.add('v367-week');week.dataset.items='4'}
    const hero=app.querySelector('.v360-hero p');if(hero)hero.textContent='Musculação segunda, quarta, sexta e domingo. Terça, quinta e sábado ficam para cardio e recuperação.';
    const kicker=app.querySelector('.v360-hero .v360-kicker');if(kicker)kicker.textContent='ROTINA SEMANAL • 4 TREINOS';
    syncActiveCopy();
  }

  function syncActiveCopy(){
    const app=document.getElementById('v360TrainingApp');if(!app)return;
    const active=app.querySelector('.v360-day.active');if(!active)return;
    const item=SESSION_MAP.find(x=>x.source===active.dataset.day);if(!item)return;
    const kicker=app.querySelector('.v360-overview .v360-kicker');if(kicker)kicker.textContent=`${item.day} • TREINO DO DIA`;
    const h=app.querySelector('.v360-overview h2');if(h)h.textContent=item.title;
  }

  function selectScheduledSession(){
    const dow=selectedDow(),source=SOURCE_BY_DOW[dow],app=document.getElementById('v360TrainingApp');if(!app)return;
    if(source){const btn=app.querySelector(`.v360-day[data-day="${source}"]`);if(btn&&!btn.classList.contains('active'))btn.click()}
    syncCardioBanner();
  }

  function syncCardioBanner(){
    const app=document.getElementById('v360TrainingApp');if(!app)return;
    let box=app.querySelector('#v367TodayMode');if(!box){box=document.createElement('section');box.id='v367TodayMode';box.className='v367-today-mode';const week=app.querySelector('.v360-week');week?.insertAdjacentElement('afterend',box)}
    const dow=selectedDow();
    if(CARDIO_DOW.has(dow))box.innerHTML=`<span>HOJE • ${DOW_NAME[dow].toUpperCase()}</span><b>Cardio</b><small>Cardio planejado • musculação retorna no próximo dia de treino</small>`;
    else if(SOURCE_BY_DOW[dow])box.innerHTML=`<span>HOJE • ${DOW_NAME[dow].toUpperCase()}</span><b>Musculação</b><small>${SESSION_MAP.find(x=>x.source===SOURCE_BY_DOW[dow])?.title||'Treino programado'}</small>`;
    else box.innerHTML='<span>ROTINA</span><b>Recuperação</b><small>Use o dia conforme sua recuperação.</small>';
  }

  function rebuildMore(){
    const more=document.getElementById('mais');if(!more||more.dataset.v367Ready==='1')return;
    more.dataset.v367Ready='1';
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

  const priorDetails=window.currentWorkoutDetails;
  window.currentWorkoutDetails=function(){
    const dow=selectedDow();
    if(CARDIO_DOW.has(dow))return {id:null,name:'Cardio',tag:'Recuperação ativa'};
    const source=SOURCE_BY_DOW[dow],item=SESSION_MAP.find(x=>x.source===source);
    if(item)return {id:'workout-'+source,name:item.title,tag:item.sub};
    return typeof priorDetails==='function'?priorDetails():{id:null,name:'Recuperação',tag:'Descanso'};
  };

  const prevScreen=window.setAppScreen;
  window.setAppScreen=function(id,opts={}){if(typeof prevScreen==='function')prevScreen(id,opts);if(id==='treino')requestAnimationFrame(()=>{remapTrainingTabs();selectScheduledSession()});if(id==='mais')requestAnimationFrame(rebuildMore);syncBuild()};
  window.setAppScreen.__vitafitFast=true;

  document.addEventListener('click',e=>{if(e.target.closest('#v360TrainingApp .v360-day'))requestAnimationFrame(()=>{remapTrainingTabs();syncActiveCopy()})},{passive:true});
  document.addEventListener('vitafit-screen-change',e=>{if(e.detail?.id==='treino')requestAnimationFrame(()=>{remapTrainingTabs();selectScheduledSession()});if(e.detail?.id==='mais')requestAnimationFrame(rebuildMore)});

  requestAnimationFrame(()=>{remapTrainingTabs();selectScheduledSession();rebuildMore();syncBuild()});
})();