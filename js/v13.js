// ===== v1.3 • sessão, descanso e progressão por série =====
let sessionTimer=null, restTimer=null, restRemaining=0, restPaused=false;

function currentWorkoutDetails(){
 const dow=selectedDate.getDay();
 if(dow===1)return {id:'workout-seg',name:'Pernas A',tag:'Glúteo + quadríceps'};
 if(dow===3)return {id:'workout-qua',name:'Superior A',tag:'Costas + ombros'};
 if(dow===5)return {id:'workout-sex',name:'Pernas B',tag:'Glúteo + posterior'};
 if(dow===0)return {id:'workout-dom',name:'Superior B',tag:'Costas + ombros'};
 if(dow===2||dow===6)return {id:null,name:'Cardio',tag:'Caminhada Zona 2'};
 return {id:null,name:'Descanso',tag:'Recuperação'};
}

function renderTodayWorkoutCard(){
 const w=currentWorkoutDetails(),c=cardioPlan(),dow=selectedDate.getDay();
 twTitle.textContent=w.name;twTag.textContent=w.tag;
 let sub='';
 if(dow===1||dow===5)sub='18:00 • musculação • sem cardio formal';
 if(dow===3)sub=`18:00 • musculação + ${c.wed} de Zona 2`;
 if(dow===0)sub=`musculação + ${c.sun}`;
 if(dow===2)sub=`${c.tue} • caminhada • 115–130 bpm`;
 if(dow===6)sub=`${c.sat} • caminhada • 115–130 bpm`;
 if(dow===4)sub='Dia de recuperação • mobilidade opcional';
 twSubtitle.textContent=sub;
 startWorkoutBtn.style.display=w.id?'inline-block':'none';
 cardioDoneBtn.style.display=([0,2,3,6].includes(dow))?'inline-block':'none';
 cardioDoneBtn.classList.toggle('done',store.get(dk('cardioDone'),false));
 cardioDoneBtn.textContent=store.get(dk('cardioDone'),false)?'✓ Cardio concluído':'✓ Marcar cardio';
 restoreSessionUI();renderSessionKpis()
}

function focusTodayWorkout(){
 const w=currentWorkoutDetails();
 if(!w.id){toast('Hoje não há musculação programada');return}
 const el=document.getElementById(w.id);el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})
}

function toggleCardioDone(){
 store.set(dk('cardioDone'),!store.get(dk('cardioDone'),false));
 renderTodayWorkoutCard();renderProgress();renderProgressDashboard();renderHomeToday()
}

function toggleWorkoutSession(){
 const running=store.get(dk('session.running'),false);
 if(running){finishWorkoutSession();return}
 store.set(dk('session.running'),true);store.set(dk('session.start'),Date.now());
 restoreSessionUI();focusTodayWorkout();toast('Treino iniciado')
}

function restoreSessionUI(){
 if(sessionTimer)clearInterval(sessionTimer);
 const running=store.get(dk('session.running'),false);
 sessionStrip.classList.toggle('active',running);
 startWorkoutBtn.textContent=running?'■ Encerrar treino':'▶ Iniciar treino';
 if(!running){sessionTime.textContent=formatDuration(store.get(dk('session.elapsed'),0));return}
 const start=store.get(dk('session.start'),Date.now()),prior=store.get(dk('session.elapsed'),0);
 const tick=()=>{sessionTime.textContent=formatDuration(prior+(Date.now()-start))};
 tick();sessionTimer=setInterval(tick,1000)
}

function finishWorkoutSession(){
 const running=store.get(dk('session.running'),false);
 if(running){
   const start=store.get(dk('session.start'),Date.now()),prior=store.get(dk('session.elapsed'),0);
   store.set(dk('session.elapsed'),prior+(Date.now()-start))
 }
 store.set(dk('session.running'),false);store.del(dk('session.start'));
 if(sessionTimer)clearInterval(sessionTimer);
 saveAllCurrentSetHistories();restoreSessionUI();renderSessionKpis();toast('Sessão salva')
}

function formatDuration(ms){
 let s=Math.floor(ms/1000),h=Math.floor(s/3600);s%=3600;let m=Math.floor(s/60);s%=60;
 return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':')
}

function startRest(seconds){
 restRemaining=seconds;restPaused=false;pauseRestBtn.textContent='Ⅱ';renderRest();
 if(restTimer)clearInterval(restTimer);
 restTimer=setInterval(()=>{
   if(restPaused)return;
   restRemaining--;renderRest();
   if(restRemaining<=0){
     clearInterval(restTimer);restTimer=null;restRemaining=0;renderRest();
     if(navigator.vibrate)navigator.vibrate([180,80,180]);
     toast('Descanso finalizado')
   }
 },1000)
}
function pauseRest(){restPaused=!restPaused;pauseRestBtn.textContent=restPaused?'▶':'Ⅱ'}
function resetRest(){if(restTimer)clearInterval(restTimer);restTimer=null;restRemaining=0;restPaused=false;pauseRestBtn.textContent='Ⅱ';renderRest()}
function renderRest(){restClock.textContent=`${String(Math.floor(restRemaining/60)).padStart(2,'0')}:${String(restRemaining%60).padStart(2,'0')}`}

function parsePrescription(range){
 const s=String(range||'');
 const m=s.match(/(\d+)\s*[×x]\s*(\d+)[^\d]+(\d+)/i);
 if(m)return {sets:Number(m[1]),min:Number(m[2]),max:Number(m[3])};
 const nums=(s.match(/\d+/g)||[]).map(Number);
 return {sets:nums[0]||3,min:nums[1]||8,max:nums[2]||nums[1]||12}
}
function prescribedRestSeconds(restText){
 const nums=(String(restText||'').match(/\d+/g)||[]).map(Number);
 return nums[0]||60
}
function num(v){const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null}
function setKey(exKey,i,field){return dk(`set.${exKey}.${i}.${field}`)}

function setHistory(key){return store.get('sethistory.'+key,[])}
function previousSetSession(key){
 return setHistory(key).filter(r=>r.date<isoDate(selectedDate)).sort((a,b)=>a.date.localeCompare(b.date)).slice(-1)[0]||null
}
function bestPreviousLoad(key){
 const vals=[];
 setHistory(key).filter(r=>r.date<isoDate(selectedDate)).forEach(r=>(r.sets||[]).forEach(s=>{const v=num(s.load);if(v!=null)vals.push(v)}));
 return vals.length?Math.max(...vals):null
}
function bestPreviousVolume(key){
 const vals=setHistory(key).filter(r=>r.date<isoDate(selectedDate)).map(r=>(r.sets||[]).reduce((a,s)=>{
   const l=num(s.load),rp=num(s.reps);return a+(l!=null&&rp!=null?l*rp:0)
 },0));
 return vals.length?Math.max(...vals):0
}

function setupExercises(){
 // v1.3 supersedes the legacy single-field exercise editor.
 buildSetCards()
}

function workoutPct(){
 const w=currentWorkoutDetails();
 if(!w.id)return dowPlans[selectedDate.getDay()].type==='Cardio'?cardioDonePct():0;
 const rows=[...document.querySelectorAll(`#${w.id} .exercise[data-ex]`)];
 let total=0,done=0;
 rows.forEach(row=>{
   const p=parsePrescription(row.dataset.range);
   for(let i=1;i<=p.sets;i++){total++;if(store.get(setKey(row.dataset.ex,i,'done'),false))done++}
 });
 return total?Math.round(done/total*100):0
}

function buildSetCards(){
 document.querySelectorAll('.exercise[data-ex]').forEach(row=>{
   if(!row._v13meta){
     const name=row.querySelector('.name');
     const range=row.dataset.range||'3×8–12';
     const rest=row.querySelector('.rest')?.textContent?.trim()||'60s';
     row._v13meta={nameHTML:name?name.innerHTML:row.dataset.ex,range,rest};
     row.classList.add('v13');
   }
   renderExerciseSetCard(row)
 })
}

function renderExerciseSetCard(row){
 const key=row.dataset.ex,meta=row._v13meta,p=parsePrescription(meta.range),prev=previousSetSession(key);
 let shell=row.querySelector('.v13-shell');
 if(!shell){
   shell=document.createElement('div');shell.className='v13-shell';row.appendChild(shell)
 }
 const rows=[];
 for(let i=1;i<=p.sets;i++){
   const load=store.get(setKey(key,i,'load'),'');
   const reps=store.get(setKey(key,i,'reps'),'');
   const done=store.get(setKey(key,i,'done'),false);
   const ps=prev?.sets?.[i-1]||{};
   rows.push(`
    <div class="set-row ${done?'done':''}" data-set="${i}">
      <div class="set-num">${i}</div>
      <input class="set-input set-load" inputmode="decimal" placeholder="kg" value="${escapeAttr(load)}" aria-label="Carga série ${i}">
      <input class="set-input set-reps" inputmode="numeric" placeholder="${p.min}–${p.max}" value="${escapeAttr(reps)}" aria-label="Repetições série ${i}">
      <div class="previous-set">${prev?`<b>${ps.load||'—'} kg</b><br>${ps.reps||'—'} reps`:'Sem sessão anterior'}</div>
      <button class="set-done ${done?'done':''}" aria-label="Concluir série ${i}">✓</button>
    </div>`)
 }
 shell.innerHTML=`
  <div class="ex-card-head">
    <div class="ex-card-title"><b>${meta.nameHTML}</b></div>
    <div class="ex-card-meta"><strong>${meta.range}</strong><span>descanso ${meta.rest}</span></div>
  </div>
  <div class="set-table">
    <div class="set-head"><span>Série</span><span>Carga</span><span>Reps</span><span class="prev-head">Anterior</span><span>OK</span></div>
    ${rows.join('')}
  </div>
  <div class="ex-footer">
    <span class="ex-hint" id="v13hint-${key}">—</span>
    <div class="ex-actions"><span class="pr-badge" id="v13pr-${key}">★ MELHOR</span><button class="ex-history-btn">Histórico</button></div>
  </div>
  <div class="v13-history" id="v13hist-${key}"></div>`;
 shell.querySelectorAll('.set-row').forEach(sr=>{
   const i=Number(sr.dataset.set),load=sr.querySelector('.set-load'),reps=sr.querySelector('.set-reps'),doneBtn=sr.querySelector('.set-done');
   load.addEventListener('input',()=>{store.set(setKey(key,i,'load'),load.value);saveCurrentSetHistory(key);updateExerciseStatus(row);renderSessionKpis()});
   reps.addEventListener('input',()=>{store.set(setKey(key,i,'reps'),reps.value);saveCurrentSetHistory(key);updateExerciseStatus(row);renderSessionKpis()});
   doneBtn.addEventListener('click',()=>{
     const next=!store.get(setKey(key,i,'done'),false);
     store.set(setKey(key,i,'done'),next);
     saveCurrentSetHistory(key);
     if(next)startRest(prescribedRestSeconds(meta.rest));
     renderExerciseSetCard(row);renderProgress();renderSessionKpis()
   })
 });
 shell.querySelector('.ex-history-btn').addEventListener('click',()=>toggleSetHistory(key));
 updateExerciseStatus(row)
}

function escapeAttr(v){
 return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function currentSetsFor(key,p){
 const sets=[];
 for(let i=1;i<=p.sets;i++)sets.push({
   load:store.get(setKey(key,i,'load'),''),
   reps:store.get(setKey(key,i,'reps'),''),
   done:store.get(setKey(key,i,'done'),false)
 });
 return sets
}

function saveCurrentSetHistory(key){
 const row=document.querySelector(`.exercise[data-ex="${key}"]`);if(!row)return;
 const p=parsePrescription(row.dataset.range),sets=currentSetsFor(key,p);
 if(!sets.some(s=>s.load||s.reps||s.done))return;
 let arr=setHistory(key).filter(r=>r.date!==isoDate(selectedDate));
 arr.push({date:isoDate(selectedDate),sets});
 arr.sort((a,b)=>a.date.localeCompare(b.date));
 store.set('sethistory.'+key,arr.slice(-20));if(typeof renderStrengthDashboard==='function')renderStrengthDashboard()
}
function saveAllCurrentSetHistories(){document.querySelectorAll('.exercise[data-ex]').forEach(r=>saveCurrentSetHistory(r.dataset.ex))}

function updateExerciseStatus(row){
 const key=row.dataset.ex,p=parsePrescription(row.dataset.range),sets=currentSetsFor(key,p);
 const hint=document.getElementById('v13hint-'+key),badge=document.getElementById('v13pr-'+key);
 if(!hint)return;
 const doneCount=sets.filter(s=>s.done).length;
 const valid=sets.filter(s=>num(s.reps)!=null);
 const allTop=valid.length===p.sets&&valid.every(s=>num(s.reps)>=p.max);
 const currLoads=sets.map(s=>num(s.load)).filter(v=>v!=null);
 const currMax=currLoads.length?Math.max(...currLoads):null;
 const oldMax=bestPreviousLoad(key);
 const currVol=sets.reduce((a,s)=>{const l=num(s.load),r=num(s.reps);return a+(l!=null&&r!=null?l*r:0)},0);
 const oldVol=bestPreviousVolume(key);
 const isPR=(currMax!=null&&oldMax!=null&&currMax>oldMax)||(currVol>0&&oldVol>0&&currVol>oldVol);
 row.classList.toggle('completed',doneCount===p.sets);
 badge.classList.toggle('show',isPR);
 hint.className='ex-hint';
 if(isPR){hint.textContent='★ Melhor desempenho registrado neste exercício';hint.classList.add('pr')}
 else if(allTop){hint.textContent='↑ Faixa completa: considerar pequeno aumento na próxima sessão';hint.classList.add('up')}
 else if(doneCount===p.sets){hint.textContent='Exercício concluído • mantenha técnica e tente progredir gradualmente'}
 else{hint.textContent=`${doneCount}/${p.sets} séries concluídas • alvo ${p.min}–${p.max} reps`}
}

function toggleSetHistory(key){
 const box=document.getElementById('v13hist-'+key),arr=setHistory(key).slice().reverse().slice(0,6);
 box.classList.toggle('open');
 if(!box.classList.contains('open'))return;
 box.innerHTML=arr.length?arr.map(r=>{
   const loads=(r.sets||[]).map(s=>s.load||'—').join(' / ');
   const reps=(r.sets||[]).map(s=>s.reps||'—').join(' / ');
   return `<div class="v13-h-row"><b>${r.date.split('-').reverse().join('/')}</b><span>${loads} kg</span><span>${reps} reps</span></div>`
 }).join(''):'Sem histórico ainda.'
}

function renderSessionKpis(){
 const w=currentWorkoutDetails();
 if(!w.id){twSets.textContent='—';twVolume.textContent='—';twProgress.textContent=w.name;return}
 const rows=[...document.querySelectorAll(`#${w.id} .exercise[data-ex]`)];
 let total=0,done=0,volume=0,ready=0,prs=0;
 rows.forEach(row=>{
   const p=parsePrescription(row.dataset.range),sets=currentSetsFor(row.dataset.ex,p);
   total+=p.sets;done+=sets.filter(s=>s.done).length;
   volume+=sets.reduce((a,s)=>{const l=num(s.load),r=num(s.reps);return a+(l!=null&&r!=null?l*r:0)},0);
   if(sets.filter(s=>num(s.reps)!=null).length===p.sets&&sets.every(s=>num(s.reps)>=p.max))ready++;
   const currLoads=sets.map(s=>num(s.load)).filter(v=>v!=null),old=bestPreviousLoad(row.dataset.ex);
   if(currLoads.length&&old!=null&&Math.max(...currLoads)>old)prs++
 });
 twSets.textContent=`${done}/${total}`;
 twVolume.textContent=volume?`${Math.round(volume).toLocaleString('pt-BR')} kg`:'0 kg';
 twProgress.textContent=prs?`${prs} PR${prs>1?'s':''}`:(ready?`${ready} ↑ carga`:(done===total&&total?'Concluído':'Em andamento'))
}
