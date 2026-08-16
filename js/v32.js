// FORJA MUSCLE v3.2.0 — treino semanal por blocos, preservando dados e rotinas existentes
(function(){
  const BUILD=window.__FORJA_BUILD__||'3.2.0';

  function sectionTitle(root,title){
    return [...root.querySelectorAll('.section-title')].find(el=>el.querySelector('h2')?.textContent.trim()===title)||null;
  }

  function mondayOf(date){
    const d=new Date(date);
    d.setHours(12,0,0,0);
    const diff=(d.getDay()+6)%7;
    d.setDate(d.getDate()-diff);
    return d;
  }

  function dateForDow(dow){
    const monday=mondayOf(selectedDate);
    const offset=dow===0?6:dow-1;
    const d=new Date(monday);
    d.setDate(monday.getDate()+offset);
    d.setHours(12,0,0,0);
    return d;
  }

  function dayLabel(date){
    const weekday=new Intl.DateTimeFormat('pt-BR',{weekday:'long'}).format(date);
    const short=new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit'}).format(date);
    return `${weekday.charAt(0).toUpperCase()+weekday.slice(1)} • ${short}`;
  }

  function ensureTrainingLayout(){
    const training=document.getElementById('treino');
    const schedule=document.getElementById('schedule');
    if(!training||!schedule)return null;

    const intro=training.querySelector('.screen-intro');
    const weekTitle=sectionTitle(training,'Semana de treino');
    if(intro&&weekTitle)intro.after(weekTitle);
    if(weekTitle)weekTitle.after(schedule);

    schedule.setAttribute('aria-label','Selecione o dia da semana');
    schedule.querySelectorAll('.day').forEach(day=>{
      if(day.dataset.v32Ready)return;
      day.dataset.v32Ready='1';
      day.setAttribute('role','button');
      day.setAttribute('tabindex','0');
      day.setAttribute('aria-pressed','false');
      const activate=()=>selectTrainingDay(Number(day.dataset.dow));
      day.addEventListener('click',activate);
      day.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();activate()}
      });
    });

    let stage=document.getElementById('trainingDayStage');
    if(!stage){
      stage=document.createElement('section');
      stage.id='trainingDayStage';
      stage.className='training-day-stage';
      stage.innerHTML=`<div class="training-day-head"><div><span class="eyebrow">DIA SELECIONADO</span><h3 id="trainingSelectedDay">—</h3><p id="trainingSelectedHint">Toque em um bloco acima para trocar o dia.</p></div><span class="tag" id="trainingSelectedType">—</span></div>`;
      schedule.after(stage);

      const workoutTitle=sectionTitle(training,'Musculação completa');
      if(workoutTitle)workoutTitle.remove();
      const card=document.getElementById('todayWorkoutCard');
      const rest=training.querySelector('.rest-card');
      if(card)stage.appendChild(card);
      if(rest)stage.appendChild(rest);
      ['workout-seg','workout-qua','workout-sex','workout-dom'].forEach(id=>{
        const el=document.getElementById(id);
        if(el)stage.appendChild(el);
      });
    }

    let extras=document.getElementById('trainingExtras');
    if(!extras){
      extras=document.createElement('details');
      extras.id='trainingExtras';
      extras.className='training-extras';
      extras.innerHTML='<summary><span>Planejamento e ferramentas</span><span class="sum-meta">fase, cardio, biblioteca, volume e notas</span></summary><div class="training-extras-body"></div>';
      stage.after(extras);
      const body=extras.querySelector('.training-extras-body');

      const phaseTitle=sectionTitle(training,'Fase atual');
      if(phaseTitle){
        const phaseCard=phaseTitle.nextElementSibling;
        const phaseGrid=phaseCard?.nextElementSibling?.classList.contains('week-grid')?phaseCard.nextElementSibling:null;
        body.appendChild(phaseTitle);
        if(phaseCard)body.appendChild(phaseCard);
        if(phaseGrid)body.appendChild(phaseGrid);
      }

      ['Cardio da fase atual','Biblioteca de exercícios','Volume semanal por grupo','Notas do dia'].forEach(title=>{
        const heading=sectionTitle(training,title);
        if(!heading)return;
        const content=heading.nextElementSibling;
        body.appendChild(heading);
        if(content)body.appendChild(content);
      });
    }

    return {training,schedule,stage};
  }

  window.selectTrainingDay=function(dow){
    if(!Number.isInteger(dow)||dow<0||dow>6)return;
    selectedDate=dateForDow(dow);
    if(typeof renderAll==='function')renderAll();
    syncTrainingDay();
    document.getElementById('trainingDayStage')?.scrollIntoView({behavior:'smooth',block:'start'});
  };

  function syncTrainingDay(){
    const layout=ensureTrainingLayout();
    if(!layout)return;
    const {training,schedule}=layout;
    const dow=selectedDate.getDay();
    const plan=dowPlans[dow];
    const workout=typeof currentWorkoutDetails==='function'?currentWorkoutDetails():null;
    const hasWeights=Boolean(workout?.id);
    const isCardio=plan.type==='Cardio';
    const isRecovery=plan.type==='Recuperação';

    schedule.querySelectorAll('.day').forEach(day=>{
      const active=Number(day.dataset.dow)===dow;
      day.classList.toggle('selected',active);
      day.setAttribute('aria-pressed',active?'true':'false');
    });

    const selectedDay=document.getElementById('trainingSelectedDay');
    const selectedType=document.getElementById('trainingSelectedType');
    const selectedHint=document.getElementById('trainingSelectedHint');
    if(selectedDay)selectedDay.textContent=dayLabel(selectedDate);
    if(selectedType)selectedType.textContent=plan.type;
    if(selectedHint){
      if(hasWeights)selectedHint.textContent=`${plan.plan} • abra abaixo e execute somente este treino.`;
      else if(isCardio)selectedHint.textContent=`${plan.plan} • hoje o foco é somente o cardio programado.`;
      else selectedHint.textContent='Dia de recuperação • sem musculação programada.';
    }

    ['workout-seg','workout-qua','workout-sex','workout-dom'].forEach(id=>{
      const details=document.getElementById(id);
      if(!details)return;
      const visible=Number(details.dataset.dow)===dow;
      details.hidden=!visible;
      details.open=visible;
    });

    const rest=training.querySelector('.rest-card');
    if(rest)rest.hidden=!hasWeights;

    const card=document.getElementById('todayWorkoutCard');
    if(card){
      card.classList.toggle('cardio-only',isCardio);
      card.classList.toggle('recovery-only',isRecovery);
      const buttons=[...card.querySelectorAll('.tw-actions button')];
      buttons.forEach(btn=>btn.hidden=false);
      const start=document.getElementById('startWorkoutBtn');
      const cardio=document.getElementById('cardioDoneBtn');
      const focus=document.getElementById('focusModeBtn');
      const openExercises=buttons.find(btn=>btn.textContent.includes('Abrir exercícios'));
      if(start)start.hidden=!hasWeights;
      if(focus)focus.hidden=!hasWeights;
      if(openExercises)openExercises.hidden=!hasWeights;
      if(cardio)cardio.hidden=!(isCardio||dow===0||dow===3);
      if(isRecovery)buttons.forEach(btn=>btn.hidden=true);
    }

    training.dataset.selectedType=hasWeights?'musculacao':isCardio?'cardio':'recuperacao';
    const version=document.querySelector('.hero .version');
    if(version)version.textContent=`v${BUILD}`;
    document.documentElement.dataset.forjaBuild=BUILD;
  }

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function'){
    window.renderAll=function(){
      previousRenderAll();
      syncTrainingDay();
    };
  }

  const previousSetAppScreen=window.setAppScreen;
  if(typeof previousSetAppScreen==='function'){
    window.setAppScreen=function(id,opts={}){
      previousSetAppScreen(id,opts);
      if(id==='treino')requestAnimationFrame(syncTrainingDay);
    };
  }

  ensureTrainingLayout();
  syncTrainingDay();
})();
