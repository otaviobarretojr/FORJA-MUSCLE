const NS='shape12.';
const store={
 get(k,f=null){try{const v=localStorage.getItem(NS+k);return v===null?f:JSON.parse(v)}catch(e){return f}},
 set(k,v){try{localStorage.setItem(NS+k,JSON.stringify(v))}catch(e){}},
 del(k){try{localStorage.removeItem(NS+k)}catch(e){}}
};
const dowPlans={
 0:{type:'Musculação',plan:'Superior B',detail:'Costas + ombros + peito • cardio leve opcional',water:3000},
 1:{type:'Musculação',plan:'Pernas A',detail:'Glúteo + quadríceps • 18:00 • sem cardio',water:3000},
 2:{type:'Cardio',plan:'Caminhada em Zona 2',detail:'Dia sem musculação • 115–130 bpm',water:3000},
 3:{type:'Musculação',plan:'Superior A',detail:'Costas + ombros + braços • cardio pós',water:3000},
 4:{type:'Recuperação',plan:'Descanso',detail:'Rotina normal • mobilidade opcional',water:2500},
 5:{type:'Musculação',plan:'Pernas B',detail:'Glúteo + posterior • 18:00 • sem cardio',water:3000},
 6:{type:'Cardio',plan:'Caminhada em Zona 2',detail:'Dia sem musculação • 115–130 bpm',water:3000}
};
let selectedDate=new Date();
selectedDate.setHours(12,0,0,0);

function isoDate(d){return d.toISOString().slice(0,10)}
function parseISO(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)}
function dk(suffix){return `day.${isoDate(selectedDate)}.${suffix}`}
function fmtDate(d){return new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long'}).format(d)}
function toast(msg){const e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}

function selectDate(v){if(!v)return;selectedDate=parseISO(v);renderAll()}
function moveDate(n){selectedDate.setDate(selectedDate.getDate()+n);renderAll()}
function goToday(){selectedDate=new Date();selectedDate.setHours(12,0,0,0);renderAll()}

document.querySelectorAll('.tab-btn').forEach(btn=>{
 btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');document.getElementById(btn.dataset.tab).classList.add('active');
  store.set('ui.tab',btn.dataset.tab);
 });
});

function mealState(){
 const btns=[...document.querySelectorAll('.meal-check')];
 btns.forEach(b=>{
  const done=store.get(dk('meal.'+b.dataset.key),false);
  b.classList.toggle('done',done);
  b.onclick=()=>{store.set(dk('meal.'+b.dataset.key),!b.classList.contains('done'));renderProgress();renderProgressDashboard();renderHomeToday();renderWeeklySummary()}
 });
}
function mealPct(){
 const btns=[...document.querySelectorAll('.meal-check')];
 const done=btns.filter(b=>store.get(dk('meal.'+b.dataset.key),false)).length;
 return btns.length?Math.round(done/btns.length*100):0
}

function waterTarget(){return dowPlans[selectedDate.getDay()].water}
function waterNow(){return store.get(dk('water'),0)}
function addWater(v){store.set(dk('water'),Math.max(0,waterNow()+v));renderWater();renderProgress();renderHomeToday();renderWeeklySummary()}
function resetWater(){store.set(dk('water'),0);renderWater();renderProgress();renderHomeToday();renderWeeklySummary()}
function renderWater(){
 const now=waterNow(),target=waterTarget(),pct=Math.min(100,Math.round(now/target*100));
 document.getElementById('waterNow').textContent=now;
 document.getElementById('waterTargetLabel').textContent=target.toLocaleString('pt-BR')+' ml';
 document.getElementById('waterBar').style.width=pct+'%';
}

function workoutButtons(){
 return [...document.querySelectorAll(`details[data-dow="${selectedDate.getDay()}"] .ex-check`)]
}
function workoutPct(){
 const btns=workoutButtons();
 if(!btns.length)return dowPlans[selectedDate.getDay()].type==='Cardio'?cardioDonePct():0;
 const done=btns.filter(b=>store.get(dk('ex.'+b.dataset.key),false)).length;
 return Math.round(done/btns.length*100)
}
function cardioDonePct(){return store.get(dk('cardioDone'),false)?100:0}

function setupExercises(){
 document.querySelectorAll('.ex-check').forEach(btn=>{
   const done=store.get(dk('ex.'+btn.dataset.key),false);btn.classList.toggle('done',done);
   btn.onclick=()=>{store.set(dk('ex.'+btn.dataset.key),!btn.classList.contains('done'));renderProgress();setupExercises()}
 });
 document.querySelectorAll('.load-input').forEach(inp=>{
   const dateKey=dk('load.'+inp.dataset.load);
   inp.value=store.get(dateKey,store.get('lastload.'+inp.dataset.load,''));
   inp.oninput=()=>{store.set(dateKey,inp.value);store.set('lastload.'+inp.dataset.load,inp.value)}
 });
 const dow=selectedDate.getDay();
 document.querySelectorAll('details[data-dow]').forEach(d=>{
   if(Number(d.dataset.dow)===dow)d.open=true;
 });
}
function renderProgress(){
 mealState();setupExercises();
 const mp=mealPct(),wp=workoutPct(),ww=Math.min(100,Math.round(waterNow()/waterTarget()*100));
 document.getElementById('topMeal').textContent=mp+'%';document.getElementById('topMealBar').style.width=mp+'%';
 document.getElementById('topWater').textContent=ww+'%';document.getElementById('topWaterBar').style.width=ww+'%';
 document.getElementById('topWorkout').textContent=wp+'%';document.getElementById('topWorkoutBar').style.width=wp+'%';
}

function projectStart(){
 let v=store.get('project.start',null);
 if(!v){v=isoDate(new Date());store.set('project.start',v)}
 return parseISO(v)
}
function projectWeek(){
 const diff=Math.floor((selectedDate-projectStart())/86400000);
 return Math.max(1,Math.min(12,Math.floor(diff/7)+1))
}
function saveStartDate(){
 const v=document.getElementById('startDate').value;
 if(v){store.set('project.start',v);renderPhase();renderCardio();renderToday()}
}
function phaseInfo(){
 const w=projectWeek();
 if(w<=4)return {n:1,name:'Adaptação',w};
 if(w<=8)return {n:2,name:'Construção',w};
 return {n:3,name:'Consolidação',w};
}
function renderPhase(){
 document.getElementById('startDate').value=isoDate(projectStart());
 const p=phaseInfo(),pct=Math.round(p.w/12*100);
 document.getElementById('phaseTitle').textContent=`Semana ${p.w} • ${p.name}`;
 document.getElementById('phaseProgress').style.width=pct+'%';document.getElementById('phasePct').textContent=pct+'%';
 document.querySelectorAll('.phase').forEach(e=>e.classList.remove('active'));
 document.getElementById('phase'+p.n).classList.add('active');
}
function cardioPlan(){
 const p=phaseInfo().n;
 if(p===1)return {tue:'25 min',wed:'20 min',sat:'30 min',sun:'Opcional 10–15 min'};
 if(p===2)return {tue:'30 min',wed:'25 min',sat:'35 min',sun:'Opcional 15 min'};
 return {tue:'35 min',wed:'25–30 min',sat:'40 min',sun:'Opcional 15–20 min'};
}
function renderCardio(){
 const c=cardioPlan(),p=phaseInfo();
 document.getElementById('cardioPhaseHead').textContent=`Tempo • fase ${p.n}`;
 document.getElementById('cardioRows').innerHTML=`
  <tr><td><b>Terça</b></td><td>Rua, parque ou esteira</td><td>${c.tue}</td><td><span class="tag">115–130 bpm</span></td></tr>
  <tr><td><b>Quarta</b></td><td>Esteira, bike ou elíptico após treino</td><td>${c.wed}</td><td><span class="tag">115–130 bpm</span></td></tr>
  <tr><td><b>Sábado</b></td><td>Rua, parque ou esteira</td><td>${c.sat}</td><td><span class="tag">115–130 bpm</span></td></tr>
  <tr><td><b>Domingo</b></td><td>Após musculação, somente se recuperada</td><td>${c.sun}</td><td><span class="tag">leve/moderado</span></td></tr>`;
}
function renderToday(){
 const dow=selectedDate.getDay(),plan=dowPlans[dow],c=cardioPlan();
 document.getElementById('dateInput').value=isoDate(selectedDate);
 document.getElementById('selectedDateTitle').textContent=fmtDate(selectedDate);
 document.getElementById('todayType').textContent=plan.type;
 document.getElementById('todayPlan').textContent=plan.plan;
 let detail=plan.detail;
 if(dow===2)detail+=` • ${c.tue}`;
 if(dow===3)detail+=` • ${c.wed}`;
 if(dow===6)detail+=` • ${c.sat}`;
 if(dow===0)detail+=` • ${c.sun}`;
 document.getElementById('todayDetail').textContent=detail;
 document.querySelectorAll('.day').forEach(d=>d.classList.toggle('today',Number(d.dataset.dow)===dow));
}
function notesRender(){
 const e=document.getElementById('notes');e.value=store.get(dk('notes'),'');e.oninput=()=>store.set(dk('notes'),e.value)
}

function toNum(v){if(!v)return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null}
function measurements(){return store.get('measurements',[])}
function saveMeasurement(){
 const rec={date:isoDate(selectedDate),weight:toNum(mWeight.value),waist:toNum(mWaist.value),hip:toNum(mHip.value),thigh:toNum(mThigh.value),note:mNote.value.trim()};
 if([rec.weight,rec.waist,rec.hip,rec.thigh].every(v=>v===null)){toast('Informe pelo menos uma medida');return}
 let arr=measurements().filter(x=>x.date!==rec.date);arr.push(rec);arr.sort((a,b)=>a.date.localeCompare(b.date));store.set('measurements',arr);
 mWeight.value=mWaist.value=mHip.value=mThigh.value=mNote.value='';renderMeasurements();renderProgressDashboard();toast('Medidas salvas')
}
function deltaText(a,b,unit){
 if(a==null||b==null)return '—';const d=b-a;return `${d>0?'+':''}${d.toFixed(1).replace('.',',')} ${unit}`
}
function renderMeasurements(){
 const arr=measurements(),list=document.getElementById('measurementList');
 if(!arr.length){list.innerHTML='<div style="color:var(--muted);font-size:12px;padding:6px">Nenhum registro ainda.</div>';['dWeight','dWaist','dHip','dThigh'].forEach(id=>document.getElementById(id).textContent='—');drawChart([]);return}
 const first=arr[0],last=arr[arr.length-1];
 dWeight.textContent=deltaText(first.weight,last.weight,'kg');dWaist.textContent=deltaText(first.waist,last.waist,'cm');dHip.textContent=deltaText(first.hip,last.hip,'cm');dThigh.textContent=deltaText(first.thigh,last.thigh,'cm');
 list.innerHTML=[...arr].reverse().slice(0,8).map(r=>`<div class="log-item"><b>${r.date.split('-').reverse().join('/')}</b><span>${r.weight??'—'} kg</span><span>${r.waist??'—'} cm cintura</span><span class="hide-mobile">${r.hip??'—'} cm quadril</span><span class="hide-mobile">${r.thigh??'—'} cm coxa</span><button class="delete-btn" onclick="deleteMeasurement('${r.date}')">×</button></div>`).join('');
 drawChart(arr);
}
function deleteMeasurement(date){store.set('measurements',measurements().filter(r=>r.date!==date));renderMeasurements();renderProgressDashboard()}
function drawChart(arr){
 const svg=document.getElementById('trendSvg');svg.innerHTML='';
 if(arr.length<2){svg.innerHTML='<text x="350" y="92" text-anchor="middle" fill="#7f8a99" font-size="12">O gráfico aparece após dois registros.</text>';return}
 const W=700,H=180,pad=18;
 const make=(key,color)=>{
   const pts=arr.map((r,i)=>({x:pad+i*(W-2*pad)/(arr.length-1),v:r[key]})).filter(p=>p.v!=null);
   if(pts.length<2)return '';
   const vals=pts.map(p=>p.v),min=Math.min(...vals),max=Math.max(...vals),span=Math.max(1,max-min);
   const d=pts.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${(H-pad-(p.v-min)/span*(H-2*pad)).toFixed(1)}`).join(' ');
   return `<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
 };
 svg.innerHTML=`<line x1="18" y1="162" x2="682" y2="162" stroke="#2a3341"/><line x1="18" y1="18" x2="18" y2="162" stroke="#2a3341"/>${make('weight','#b8ff4f')}${make('waist','#6ce5ff')}`;
}

function toggleTarget(){const c=targetCard;c.classList.toggle('expanded');targetToggle.textContent=c.classList.contains('expanded')?'🙈 Ocultar projeção':'👁️ Ver projeção'}
function openImageModal(){imgModal.classList.add('open')}function closeImageModal(e){if(e)e.stopPropagation();imgModal.classList.remove('open')}

function exportData(){
 const data={version:'3.0',exportedAt:new Date().toISOString(),storage:{}};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(NS))data.storage[k]=localStorage.getItem(k)}
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`forja-muscle-backup-${isoDate(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Backup exportado')
}
function importData(file){
 if(!file)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);Object.entries(data.storage||{}).forEach(([k,v])=>{if(k.startsWith(NS))localStorage.setItem(k,v)});toast('Backup importado');setTimeout(()=>location.reload(),700)}catch(e){toast('Arquivo de backup inválido')}};r.readAsText(file)
}
function clearSelectedDay(){
 if(!confirm('Limpar refeições, água, treino e notas deste dia?'))return;
 const prefix=NS+`day.${isoDate(selectedDate)}.`,keys=[];
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(prefix))keys.push(k)}
 keys.forEach(k=>localStorage.removeItem(k));renderAll();toast('Dia limpo')
}
