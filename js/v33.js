// FORJA MUSCLE v3.3.0 — treino do dia em player guiado, preservando shape12.*
(function(){
  const BUILD=window.__FORJA_BUILD__||'3.3.0';

  const guides={
    'seg-hip':{machine:'Hip Thrust / banco',kind:'hip',tips:['Apoie a parte alta das costas com estabilidade.','Suba o quadril sem hiperestender a lombar.','Faça a descida de forma controlada.']},
    'seg-leg':{machine:'Leg Press 45°',kind:'legpress',tips:['Mantenha lombar e quadril apoiados.','Joelhos acompanham a direção dos pés.','Use amplitude confortável e controlada.']},
    'seg-bulg':{machine:'Banco + halteres',kind:'bench',tips:['Mantenha o pé da frente firme no chão.','Desça com controle e tronco estável.','Use apoio se precisar manter equilíbrio.']},
    'seg-ext':{machine:'Cadeira extensora',kind:'seated',tips:['Ajuste o eixo da máquina ao joelho.','Evite tirar o quadril do banco.','Suba e desça sem embalo.']},
    'seg-abd':{machine:'Máquina abdutora',kind:'seated',tips:['Mantenha o tronco estável.','Abra as pernas sem impulso.','Controle o retorno até a posição inicial.']},
    'seg-pant':{machine:'Panturrilha em máquina',kind:'calf',tips:['Use amplitude confortável do tornozelo.','Suba sem quicar.','Controle a descida antes da próxima repetição.']},
    'qua-pux':{machine:'Puxada alta',kind:'pulldown',tips:['Mantenha peito aberto e tronco estável.','Puxe conduzindo os cotovelos para baixo.','Evite transformar o movimento em balanço.']},
    'qua-rem':{machine:'Remada sentada',kind:'row',tips:['Mantenha a coluna neutra.','Puxe com os cotovelos próximos ao corpo.','Controle a volta sem arredondar os ombros.']},
    'qua-des':{machine:'Desenvolvimento de ombros',kind:'press',tips:['Ajuste o banco para uma posição confortável.','Mantenha antebraços alinhados.','Evite compensar arqueando excessivamente a lombar.']},
    'qua-lat':{machine:'Halteres / máquina lateral',kind:'dumbbell',tips:['Eleve os braços com controle.','Evite encolher os ombros.','Use carga que permita manter o movimento limpo.']},
    'qua-chest':{machine:'Chest Press',kind:'press',tips:['Ajuste o banco para as pegadas ficarem na linha do peito.','Mantenha escápulas apoiadas.','Empurre sem perder o controle do retorno.']},
    'qua-bic':{machine:'Rosca / halteres',kind:'dumbbell',tips:['Mantenha os cotovelos estáveis.','Evite usar o tronco para lançar a carga.','Controle a extensão do braço.']},
    'qua-tri':{machine:'Polia alta',kind:'cable',tips:['Mantenha cotovelos próximos ao corpo.','Estenda sem balançar os ombros.','Controle a volta do cabo.']},
    'sex-rdl':{machine:'Barra / halteres',kind:'hinge',tips:['Mantenha a coluna neutra.','Leve o quadril para trás durante a descida.','Pare na amplitude em que mantém controle e postura.']},
    'sex-hip':{machine:'Hip Thrust / banco',kind:'hip',tips:['Apoie a parte alta das costas com estabilidade.','Suba o quadril sem hiperestender a lombar.','Faça a descida de forma controlada.']},
    'sex-flex':{machine:'Mesa / cadeira flexora',kind:'seated',tips:['Ajuste a máquina ao tamanho da perna.','Mantenha quadril estável.','Flexione e retorne sem soltar a carga.']},
    'sex-step':{machine:'Step / banco',kind:'bench',tips:['Apoie todo o pé na plataforma.','Suba com controle sem impulsionar demais a perna de trás.','Mantenha joelho alinhado ao pé.']},
    'sex-abd':{machine:'Máquina abdutora',kind:'seated',tips:['Mantenha o tronco estável.','Abra as pernas sem impulso.','Controle o retorno até a posição inicial.']},
    'sex-pant':{machine:'Panturrilha sentada',kind:'calf',tips:['Mantenha o apoio firme.','Suba sem quicar.','Controle a descida antes da próxima repetição.']},
    'dom-pux':{machine:'Puxada neutra',kind:'pulldown',tips:['Mantenha peito aberto.','Conduza o movimento pelos cotovelos.','Controle a volta até alongar sem perder a posição.']},
    'dom-rem':{machine:'Remada unilateral',kind:'row',tips:['Mantenha o tronco estável.','Puxe o cotovelo em direção ao quadril.','Evite girar o corpo para completar a repetição.']},
    'dom-chest':{machine:'Chest Press',kind:'press',tips:['Ajuste o banco para a linha do peito.','Mantenha escápulas apoiadas.','Controle o retorno das alavancas.']},
    'dom-des':{machine:'Desenvolvimento de ombros',kind:'press',tips:['Mantenha o tronco apoiado.','Empurre em trajetória confortável.','Evite compensar com a lombar.']},
    'dom-lat':{machine:'Halteres / máquina lateral',kind:'dumbbell',tips:['Eleve com controle.','Evite encolher os ombros.','Use uma carga que não obrigue a balançar o corpo.']},
    'dom-post':{machine:'Crucifixo invertido',kind:'reversefly',tips:['Mantenha o peito apoiado quando houver suporte.','Abra os braços sem elevar os ombros.','Controle o retorno das alavancas.']},
    'dom-arm':{machine:'Polia / halteres',kind:'cable',tips:['Faça cada exercício com cotovelos estáveis.','Evite balanço do tronco.','Mantenha o movimento controlado nas duas direções.']}
  };

  function todayAtNoon(){const d=new Date();d.setHours(12,0,0,0);return d}
  function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
  function ensureToday(){const t=todayAtNoon();if(!sameDay(selectedDate,t))selectedDate=t}
  function formatToday(date){return new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long'}).format(date).replace(/^./,m=>m.toUpperCase())}
  function currentRows(){const w=currentWorkoutDetails();return w.id?[...document.querySelectorAll(`#${w.id} .exercise[data-ex]`)]:[]}
  function rowDone(row){const p=parsePrescription(row.dataset.range);return currentSetsFor(row.dataset.ex,p).every(s=>s.done)}
  function firstIncomplete(rows){const i=rows.findIndex(row=>!rowDone(row));return i<0?Math.max(0,rows.length-1):i}
  function currentIndex(rows){let idx=Number(store.get(dk('guided.exerciseIndex'),-1));if(!Number.isInteger(idx)||idx<0||idx>=rows.length)idx=firstIncomplete(rows);return Math.max(0,Math.min(idx,Math.max(0,rows.length-1)))}

  function visualSvg(kind,label){
    const common=`<rect x="12" y="12" width="296" height="196" rx="24" fill="#10161d" stroke="#2a3341"/><circle cx="232" cy="60" r="14" fill="none" stroke="#b8ff4f" stroke-width="6"/><path d="M232 76 L222 116 L244 142" fill="none" stroke="#dfe7ef" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M223 95 L194 116 M226 96 L257 110" fill="none" stroke="#dfe7ef" stroke-width="7" stroke-linecap="round"/>`;
    const shapes={
      hip:`<path d="M46 154 H181 M65 153 V174 M166 153 V174" stroke="#6ce5ff" stroke-width="8" stroke-linecap="round"/><path d="M170 121 L258 121" stroke="#ffd166" stroke-width="8" stroke-linecap="round"/><circle cx="185" cy="121" r="12" fill="none" stroke="#ffd166" stroke-width="5"/>`,
      legpress:`<path d="M60 174 L122 60 M122 60 L184 60" stroke="#6ce5ff" stroke-width="9" stroke-linecap="round"/><path d="M72 158 L148 158" stroke="#6ce5ff" stroke-width="9"/><path d="M162 52 L190 92" stroke="#ffd166" stroke-width="10"/>`,
      seated:`<path d="M58 150 H154 M72 150 V180 M145 150 V180 M92 150 V104 H156" stroke="#6ce5ff" stroke-width="9" stroke-linecap="round"/><circle cx="170" cy="130" r="20" fill="none" stroke="#ffd166" stroke-width="7"/>`,
      pulldown:`<path d="M55 184 V45 H184 V184" stroke="#6ce5ff" stroke-width="9"/><path d="M70 58 H168" stroke="#ffd166" stroke-width="7"/><path d="M118 58 V108" stroke="#ffd166" stroke-width="5"/>`,
      row:`<path d="M52 170 H174 M70 170 V190 M158 170 V190" stroke="#6ce5ff" stroke-width="9"/><path d="M176 78 V176 M176 98 H205" stroke="#ffd166" stroke-width="7"/>`,
      press:`<path d="M58 174 V76 H120 M58 138 H132" stroke="#6ce5ff" stroke-width="9" stroke-linecap="round"/><path d="M132 92 H182 M132 122 H182" stroke="#ffd166" stroke-width="8"/>`,
      cable:`<path d="M54 188 V42 H150 V188" stroke="#6ce5ff" stroke-width="9"/><circle cx="102" cy="64" r="13" fill="none" stroke="#ffd166" stroke-width="6"/><path d="M102 77 V130 L168 150" stroke="#ffd166" stroke-width="5"/>`,
      bench:`<path d="M52 154 H170 M68 154 V182 M155 154 V182" stroke="#6ce5ff" stroke-width="9" stroke-linecap="round"/>`,
      calf:`<path d="M70 184 V60 H130 M72 126 H150" stroke="#6ce5ff" stroke-width="9"/><path d="M150 94 V174" stroke="#ffd166" stroke-width="7"/>`,
      dumbbell:`<path d="M74 118 H168" stroke="#ffd166" stroke-width="9"/><path d="M66 98 V138 M82 100 V136 M160 100 V136 M176 98 V138" stroke="#6ce5ff" stroke-width="9"/>`,
      hinge:`<path d="M72 132 H170" stroke="#ffd166" stroke-width="8"/><path d="M64 112 V152 M178 112 V152" stroke="#6ce5ff" stroke-width="9"/>`,
      reversefly:`<path d="M58 178 V70 H128 M58 138 H132" stroke="#6ce5ff" stroke-width="9"/><path d="M132 96 L180 72 M132 96 L180 122" stroke="#ffd166" stroke-width="7"/>`
    };
    const equipment=shapes[kind]||shapes.seated;
    return `<svg viewBox="0 0 320 220" role="img" aria-label="Referência visual: ${label}" xmlns="http://www.w3.org/2000/svg">${common}${equipment}<text x="26" y="38" fill="#9da8b8" font-size="11" font-family="system-ui">REFERÊNCIA VISUAL</text></svg>`
  }

  function ensureShell(){
    const training=document.getElementById('treino'),stage=document.getElementById('trainingDayStage');
    if(!training||!stage)return null;
    const schedule=document.getElementById('schedule');if(schedule)schedule.hidden=true;
    const oldHead=stage.querySelector('.training-day-head');if(oldHead)oldHead.hidden=true;
    const oldCard=document.getElementById('todayWorkoutCard');if(oldCard)oldCard.hidden=true;

    let hero=document.getElementById('guidedTodayHero');
    if(!hero){
      hero=document.createElement('div');hero.id='guidedTodayHero';hero.className='guided-today-hero';
      stage.prepend(hero);
    }
    stage.querySelectorAll('details[id^="workout-"]').forEach(details=>details.querySelector('summary')?.setAttribute('hidden',''));
    return {training,stage,hero};
  }

  function cleanupRows(rows,activeIndex){
    document.querySelectorAll('#trainingDayStage .exercise[data-ex]').forEach(row=>{
      const visible=rows[activeIndex]===row;
      row.classList.toggle('guided-active',visible);
      row.hidden=!visible;
      row.querySelector('.guided-visual')?.remove();
      row.querySelector('.guided-nav')?.remove();
    });
  }

  function injectExerciseChrome(row,index,total){
    const shell=row.querySelector('.v13-shell');if(!shell)return;
    const key=row.dataset.ex,guide=guides[key]||{machine:'Equipamento do exercício',kind:'seated',tips:['Ajuste o equipamento antes de começar.','Mantenha o movimento controlado.','Use uma amplitude confortável e sem dor.']};
    const name=(row._v13meta?.nameHTML||row.querySelector('.name')?.textContent||key).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    let visual=shell.querySelector('.guided-visual');
    if(!visual){visual=document.createElement('div');visual.className='guided-visual';shell.prepend(visual)}
    visual.innerHTML=`<div class="guided-progress-line"><span>EXERCÍCIO ${index+1} DE ${total}</span><b>${Math.round((index/Math.max(total,1))*100)}%</b></div><div class="guided-image-box">${visualSvg(guide.kind,guide.machine)}<div class="guided-image-caption"><b>${guide.machine}</b><span>visual técnico vetorial • disponível offline</span></div></div><div class="guided-tips"><span class="eyebrow">DICAS RÁPIDAS</span>${guide.tips.map(t=>`<p>• ${t}</p>`).join('')}</div>`;

    const p=parsePrescription(row.dataset.range),done=rowDone(row);
    let nav=shell.querySelector('.guided-nav');
    if(!nav){nav=document.createElement('div');nav.className='guided-nav';shell.appendChild(nav)}
    const last=index===total-1;
    nav.innerHTML=`<button class="soft-btn guided-prev" ${index===0?'disabled':''}>← Anterior</button><div class="guided-nav-status"><b>${currentSetsFor(key,p).filter(s=>s.done).length}/${p.sets}</b><span>séries concluídas</span></div><button class="primary-btn guided-next" ${done?'':'disabled'}>${last?'Concluir treino':'Concluir exercício →'}</button>`;
    nav.querySelector('.guided-prev').addEventListener('click',()=>{if(index<=0)return;store.set(dk('guided.exerciseIndex'),index-1);syncGuidedTraining(true)});
    nav.querySelector('.guided-next').addEventListener('click',()=>{
      if(!rowDone(row)){toast('Conclua todas as séries antes de avançar');return}
      saveCurrentSetHistory(key);
      if(last){
        store.set(dk('guided.completed'),true);finishWorkoutSession();syncGuidedTraining(false);toast('Treino concluído e registrado');
      }else{
        store.set(dk('guided.exerciseIndex'),index+1);syncGuidedTraining(true)
      }
    });
  }

  function cardioView(hero,dow){
    const c=cardioPlan();const time=dow===2?c.tue:dow===6?c.sat:dow===3?c.wed:c.sun;
    hero.innerHTML=`<span class="eyebrow">TREINO DE HOJE</span><h2>${formatToday(selectedDate)}</h2><div class="guided-cardio-card"><div class="guided-type-icon">♥</div><div><b>Cardio • Zona 2</b><p>${time} • caminhada, esteira, bike ou opção equivalente do plano.</p></div><button class="primary-btn" id="guidedCardioBtn">${store.get(dk('cardioDone'),false)?'✓ Cardio concluído':'Marcar como concluído'}</button></div>`;
    hero.querySelector('#guidedCardioBtn').addEventListener('click',()=>{toggleCardioDone();syncGuidedTraining(false)});
  }

  function recoveryView(hero){
    hero.innerHTML=`<span class="eyebrow">TREINO DE HOJE</span><h2>${formatToday(selectedDate)}</h2><div class="guided-recovery-card"><div class="guided-type-icon">↻</div><div><b>Recuperação</b><p>Sem musculação programada hoje. Mobilidade leve é opcional.</p></div></div>`;
  }

  function weightsView(hero,rows,index){
    const w=currentWorkoutDetails(),running=store.get(dk('session.running'),false),complete=rows.length&&rows.every(rowDone);
    hero.innerHTML=`<span class="eyebrow">TREINO DE HOJE</span><h2>${formatToday(selectedDate)}</h2><div class="guided-workout-summary"><div><b>${w.name}</b><span>${w.tag}</span></div><div class="guided-summary-progress"><strong>${rows.filter(rowDone).length}/${rows.length}</strong><span>exercícios</span></div><button class="${running?'soft-btn':'primary-btn'}" id="guidedSessionBtn">${running?'■ Encerrar sessão':'▶ Iniciar treino'}</button></div>${complete?'<div class="guided-complete-banner">✓ Todas as séries do treino de hoje estão concluídas.</div>':''}`;
    hero.querySelector('#guidedSessionBtn')?.addEventListener('click',()=>{toggleWorkoutSession();syncGuidedTraining(false)});
    cleanupRows(rows,index);injectExerciseChrome(rows[index],index,rows.length);
  }

  window.syncGuidedTraining=function(scroll=false){
    const shell=ensureShell();if(!shell)return;
    ensureToday();
    if(typeof renderToday==='function')renderToday();
    if(typeof renderTodayWorkoutCard==='function')renderTodayWorkoutCard();
    const dow=selectedDate.getDay(),w=currentWorkoutDetails(),rows=currentRows();
    document.getElementById('schedule')?.setAttribute('aria-hidden','true');
    document.getElementById('trainingExtras')?.removeAttribute('open');

    shell.stage.querySelectorAll('details[id^="workout-"]').forEach(details=>{details.hidden=details.id!==w.id;details.open=details.id===w.id});
    const rest=shell.training.querySelector('.rest-card');if(rest)rest.hidden=!w.id;

    if(w.id&&rows.length){
      let index=currentIndex(rows);if(rows.every(rowDone))index=Math.min(index,rows.length-1);
      store.set(dk('guided.exerciseIndex'),index);weightsView(shell.hero,rows,index)
    }else{
      cleanupRows([],0);
      if(dow===2||dow===6)cardioView(shell.hero,dow);else recoveryView(shell.hero)
    }
    const version=document.querySelector('.hero .version');if(version)version.textContent=`v${BUILD}`;
    document.documentElement.dataset.forjaBuild=BUILD;
    if(scroll)document.getElementById('guidedTodayHero')?.scrollIntoView({behavior:'smooth',block:'start'});
  };

  const previousRenderExerciseSetCard=window.renderExerciseSetCard;
  if(typeof previousRenderExerciseSetCard==='function'){
    window.renderExerciseSetCard=function(row){previousRenderExerciseSetCard(row);if(row.classList.contains('guided-active'))requestAnimationFrame(()=>syncGuidedTraining(false))}
  }

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function'){
    window.renderAll=function(){previousRenderAll();requestAnimationFrame(()=>syncGuidedTraining(false))}
  }

  const previousSetAppScreen=window.setAppScreen;
  if(typeof previousSetAppScreen==='function'){
    window.setAppScreen=function(id,opts={}){
      if(id==='treino')ensureToday();
      previousSetAppScreen(id,opts);
      if(id==='treino')requestAnimationFrame(()=>syncGuidedTraining(false))
    }
  }

  ensureToday();
  syncGuidedTraining(false);
})();
