// VITAFIT 3.6.9 — semana completa com cardio + dashboard por tipo de dia
(function(){
  const BUILD='3.6.9';
  const CARDIO={2:{label:'TER',minutes:20},4:{label:'QUI',minutes:40},6:{label:'SÁB',minutes:20}};
  const STRENGTH={1:{label:'SEG',day:'seg',title:'Inferiores completo'},3:{label:'QUA',day:'qua',title:'Superiores completo'},5:{label:'SEX',day:'sex',title:'Inferiores completo'},0:{label:'DOM',day:'dom',title:'Superiores completo'}};
  const ORDER=[1,2,3,4,5,6,0];
  const NS='shape12.v369.';
  const DAYNAME=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const dateObj=()=>{try{return window.selectedDate instanceof Date?window.selectedDate:new Date()}catch(e){return new Date()}};
  const dateKey=()=>{const d=dateObj();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const get=(k,f=false)=>{try{const v=localStorage.getItem(NS+k);return v===null?f:JSON.parse(v)}catch(e){return f}};
  const put=(k,v)=>{try{localStorage.setItem(NS+k,JSON.stringify(v))}catch(e){}};
  function syncBuild(){window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);const m=document.querySelector('#vitaMoreBrand small');if(m)m.textContent='versão '+BUILD}

  function ensureWeek(){
    const app=document.getElementById('v360TrainingApp');if(!app)return;
    let strip=app.querySelector('#v369Week');
    if(!strip){
      strip=document.createElement('div');strip.id='v369Week';strip.className='v369-week';
      const original=app.querySelector('.v360-week');original?.insertAdjacentElement('beforebegin',strip);
      strip.addEventListener('click',e=>{const b=e.target.closest('[data-v369-dow]');if(!b)return;selectDow(Number(b.dataset.v369Dow),true)});
    }
    strip.innerHTML=ORDER.map(d=>{
      const s=STRENGTH[d],c=CARDIO[d],active=d===dateObj().getDay();
      return `<button type="button" class="v369-day ${s?'strength':'cardio'} ${active?'today':''}" data-v369-dow="${d}"><b>${s?s.label:c.label}</b><span>${s?(s.title.startsWith('Inferiores')?'Inferiores':'Superiores'):'Cardio'}</span><small>${s?'Treino':c.minutes+' min'}</small></button>`
    }).join('');
    app.querySelector('.v360-week')?.classList.add('v369-native-hidden');
  }

  function selectDow(dow,user=false){
    const app=document.getElementById('v360TrainingApp');if(!app)return;
    if(CARDIO[dow])showCardio(dow);else if(STRENGTH[dow]){
      app.classList.remove('v369-cardio-mode');app.querySelector('#v369CardioPanel')?.remove();
      const native=app.querySelector(`.v360-week .v360-day[data-day="${STRENGTH[dow].day}"]`);
      if(native&&!native.classList.contains('active'))native.click();
      requestAnimationFrame(()=>{ensureWeek();markSelected(dow);syncDashboard()});
    }
    if(user)markSelected(dow)
  }
  function markSelected(dow){document.querySelectorAll('#v369Week .v369-day').forEach(b=>b.classList.toggle('selected',Number(b.dataset.v369Dow)===dow))}

  function showCardio(dow){
    const app=document.getElementById('v360TrainingApp');if(!app||!CARDIO[dow])return;const c=CARDIO[dow];
    app.classList.add('v369-cardio-mode');
    let panel=app.querySelector('#v369CardioPanel');if(!panel){panel=document.createElement('section');panel.id='v369CardioPanel';panel.className='v369-cardio-panel';const week=app.querySelector('#v369Week');week?.insertAdjacentElement('afterend',panel)}
    const done=get(`cardio.${dateKey()}`,false);
    panel.innerHTML=`<span class="v369-kicker">${DAYNAME[dow].toUpperCase()} • CARDIO</span><h2>${c.minutes} min de cardio</h2><p>Cardio programado do dia. Mantenha intensidade sustentável e execução confortável.</p><div class="v369-cardio-meta"><div><b>${c.minutes}</b><span>minutos</span></div><div><b>1</b><span>sessão</span></div><div><b>${done?'100%':'0%'}</b><span>concluído</span></div></div><button type="button" id="v369CardioDone" class="${done?'done':''}">${done?'✓ Cardio concluído':'Marcar cardio concluído'}</button>`;
    panel.querySelector('#v369CardioDone')?.addEventListener('click',()=>{const val=!get(`cardio.${dateKey()}`,false);put(`cardio.${dateKey()}`,val);showCardio(dow);syncDashboard()});
    markSelected(dow);syncDashboard();
  }

  function syncDashboard(){
    const root=document.getElementById('vitaHomeDashboard');if(!root)return;const dow=dateObj().getDay(),c=CARDIO[dow],s=STRENGTH[dow];
    const title=root.querySelector('#vitaWorkoutTitle'),sub=root.querySelector('#vitaWorkoutSubtitle'),a=root.querySelector('#vitaStatA'),al=root.querySelector('#vitaStatALabel'),b=root.querySelector('#vitaStatB'),bl=root.querySelector('#vitaStatBLabel'),cc=root.querySelector('#vitaStatC'),cl=root.querySelector('#vitaStatCLabel'),pct=root.querySelector('#vitaProgressPct'),pt=root.querySelector('#vitaProgressText'),bar=root.querySelector('#vitaProgressBar'),action=root.querySelector('#vitaPrimaryAction'),cardioTitle=root.querySelector('#vitaCardioTitle'),cardioDetail=root.querySelector('#vitaCardioDetail'),eyebrow=root.querySelector('#vitaCardioEyebrow');
    if(c){
      const done=get(`cardio.${dateKey()}`,false);
      if(title)title.textContent='Cardio';if(sub)sub.textContent=`${DAYNAME[dow]} • ${c.minutes} min programados`;
      if(a)a.textContent='1';if(al)al.textContent='sessão';if(b)b.textContent=String(c.minutes);if(bl)bl.textContent='min';if(cc)cc.textContent='Cardio';if(cl)cl.textContent='atividade';
      if(pct)pct.textContent=done?'100%':'0%';if(pt)pt.textContent=done?'Cardio concluído':`${c.minutes} min pendentes`;if(bar)bar.style.width=done?'100%':'0%';if(action)action.textContent=done?'✓ CARDIO CONCLUÍDO':'▶ ABRIR CARDIO';
      if(eyebrow)eyebrow.textContent='CARDIO DO DIA';if(cardioTitle)cardioTitle.textContent=`${c.minutes} min`;if(cardioDetail)cardioDetail.textContent=done?'Concluído':'Programado para hoje';
    }else if(s){
      if(title)title.textContent=s.title;if(sub)sub.textContent=`${DAYNAME[dow]} • musculação`;if(eyebrow)eyebrow.textContent='TIPO DO DIA';if(cardioTitle)cardioTitle.textContent='Musculação';if(cardioDetail)cardioDetail.textContent=s.title;if(action)action.textContent='▶ INICIAR TREINO';
    }
  }

  function syncScreen(){ensureWeek();const dow=dateObj().getDay();selectDow(dow,false);syncDashboard();syncBuild()}
  const prev=window.setAppScreen;
  window.setAppScreen=function(id,opts={}){if(typeof prev==='function')prev(id,opts);if(id==='treino')requestAnimationFrame(syncScreen);if(id==='hoje')requestAnimationFrame(syncDashboard);syncBuild()};
  window.setAppScreen.__vitafitFast=true;
  const prevRender=window.renderAll;if(typeof prevRender==='function')window.renderAll=function(){prevRender();requestAnimationFrame(syncScreen)};
  document.addEventListener('vitafit-screen-change',e=>{if(e.detail?.id==='treino')requestAnimationFrame(syncScreen);if(e.detail?.id==='hoje')requestAnimationFrame(syncDashboard)});
  document.addEventListener('click',e=>{if(e.target.closest('#v360TrainingApp .v360-day'))requestAnimationFrame(()=>{ensureWeek();markSelected(dateObj().getDay())})},{passive:true});
  requestAnimationFrame(syncScreen);
})();