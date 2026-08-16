// ===== v1.4 • dashboard de progresso e fotos de marco =====
let pendingMilestone=null;

function projectDateRange(){
 const start=projectStart();
 const end=new Date(start);end.setDate(end.getDate()+83);end.setHours(12,0,0,0);
 return {start,end}
}
function datesBetween(start,end){
 const arr=[],d=new Date(start);d.setHours(12,0,0,0);
 while(d<=end){arr.push(new Date(d));d.setDate(d.getDate()+1)}
 return arr
}
function isMuscleDay(dow){return [0,1,3,5].includes(dow)}
function isCardioPlanned(dow){return [0,2,3,6].includes(dow)}

function dayHasAnyTracking(d){
 const date=isoDate(d);
 const prefix=NS+`day.${date}.`;
 for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i);
   if(k.startsWith(prefix))return true
 }
 return false
}
function dateStoreGet(date,suffix,f=null){
 try{
   const v=localStorage.getItem(NS+`day.${date}.${suffix}`);
   return v===null?f:JSON.parse(v)
 }catch(e){return f}
}
function trainingCompletedForDate(d){
 if(!isMuscleDay(d.getDay()))return null;
 const date=isoDate(d);
 const detailMap={1:'workout-seg',3:'workout-qua',5:'workout-sex',0:'workout-dom'};
 const el=document.getElementById(detailMap[d.getDay()]);
 if(!el)return false;
 const rows=[...el.querySelectorAll('.exercise[data-ex]')];
 let total=0,done=0;
 rows.forEach(row=>{
   const p=parsePrescription(row.dataset.range);
   for(let i=1;i<=p.sets;i++){
     total++;
     if(dateStoreGet(date,`set.${row.dataset.ex}.${i}.done`,false))done++
   }
 });
 return total>0 && done===total
}
function cardioCompletedForDate(d){
 if(!isCardioPlanned(d.getDay()))return null;
 return !!dateStoreGet(isoDate(d),'cardioDone',false)
}
function nutritionPctForDate(d){
 const date=isoDate(d),keys=['0530','0730','1100','1530','1715','1915'];
 const done=keys.filter(k=>dateStoreGet(date,`meal.${k}`,false)).length;
 return Math.round(done/keys.length*100)
}

function renderProgressDashboard(){
 const p=phaseInfo(),range=projectDateRange(),today=new Date();today.setHours(12,0,0,0);
 const cutoff=today<range.end?today:range.end;
 const days=cutoff>=range.start?datesBetween(range.start,cutoff):[];
 pdWeek.textContent=`Semana ${p.w}`;pdPhase.textContent=p.name;

 const trainDays=days.filter(d=>isMuscleDay(d.getDay()));
 const trainDone=trainDays.filter(d=>trainingCompletedForDate(d)).length;
 pdTraining.textContent=trainDays.length?Math.round(trainDone/trainDays.length*100)+'%':'0%';
 pdTrainingSub.textContent=`${trainDone} de ${trainDays.length} sessões`;

 const cardioDays=days.filter(d=>isCardioPlanned(d.getDay()));
 const cardioDone=cardioDays.filter(d=>cardioCompletedForDate(d)).length;
 pdCardio.textContent=cardioDays.length?Math.round(cardioDone/cardioDays.length*100)+'%':'0%';
 pdCardioSub.textContent=`${cardioDone} de ${cardioDays.length} sessões`;

 const trackedDays=days.filter(d=>dayHasAnyTracking(d));
 const nutritionAvg=trackedDays.length?Math.round(trackedDays.reduce((a,d)=>a+nutritionPctForDate(d),0)/trackedDays.length):0;
 pdNutrition.textContent=nutritionAvg+'%';
 pdNutritionSub.textContent=`${trackedDays.length} dias acompanhados`;

 renderDashboardBody();
 renderStrengthDashboard();
 renderMilestonePhotos()
}

function renderDashboardBody(){
 const arr=measurements(),count=arr.length;
 pdMeasureCount.textContent=`${count} registro${count===1?'':'s'}`;
 if(!count){
   pdWeightDelta.textContent=pdWaistDelta.textContent=pdHipDelta.textContent=pdThighDelta.textContent='—';
   drawPdChart([]);
   return
 }
 const first=arr[0],last=arr[arr.length-1];
 pdWeightDelta.textContent=deltaText(first.weight,last.weight,'kg');
 pdWaistDelta.textContent=deltaText(first.waist,last.waist,'cm');
 pdHipDelta.textContent=deltaText(first.hip,last.hip,'cm');
 pdThighDelta.textContent=deltaText(first.thigh,last.thigh,'cm');
 drawPdChart(arr)
}

function drawPdChart(arr){
 const svg=pdBodyChart;svg.innerHTML='';
 if(arr.length<2){
   svg.innerHTML='<text x="350" y="88" text-anchor="middle" fill="#7f8a99" font-size="11">Registre pelo menos duas medições para visualizar a tendência.</text>';
   return
 }
 const W=700,H=170,pad=16;
 const pathFor=(key,color)=>{
   const pts=arr.map((r,i)=>({x:pad+i*(W-2*pad)/(arr.length-1),v:r[key]})).filter(p=>p.v!=null);
   if(pts.length<2)return '';
   const vals=pts.map(p=>p.v),min=Math.min(...vals),max=Math.max(...vals),span=Math.max(1,max-min);
   const d=pts.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${(H-pad-(p.v-min)/span*(H-2*pad)).toFixed(1)}`).join(' ');
   return `<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
 };
 svg.innerHTML=`<line x1="16" y1="154" x2="684" y2="154" stroke="#2a3341"/><line x1="16" y1="16" x2="16" y2="154" stroke="#2a3341"/>${pathFor('weight','#b8ff4f')}${pathFor('waist','#6ce5ff')}`
}

function exerciseLabel(key){
 const row=document.querySelector(`.exercise[data-ex="${key}"]`);
 if(!row)return key;
 const tmp=document.createElement('div');tmp.innerHTML=row._v13meta?.nameHTML||row.querySelector('.name')?.innerHTML||key;
 return tmp.textContent.trim()
}
function exerciseBestLoadFromRecord(rec){
 const vals=(rec?.sets||[]).map(s=>num(s.load)).filter(v=>v!=null);
 return vals.length?Math.max(...vals):null
}
function renderStrengthDashboard(){
 const keys=[];
 for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i);
   if(k.startsWith(NS+'sethistory.'))keys.push(k.slice((NS+'sethistory.').length))
 }
 const items=[];
 [...new Set(keys)].forEach(key=>{
   const hist=setHistory(key).filter(r=>(r.sets||[]).some(s=>num(s.load)!=null));
   if(hist.length<1)return;
   hist.sort((a,b)=>a.date.localeCompare(b.date));
   const first=exerciseBestLoadFromRecord(hist[0]),last=exerciseBestLoadFromRecord(hist[hist.length-1]);
   if(first==null||last==null)return;
   const gain=first>0?((last-first)/first*100):0;
   items.push({key,label:exerciseLabel(key),first,last,gain,count:hist.length})
 });
 items.sort((a,b)=>Math.abs(b.gain)-Math.abs(a.gain));
 pdExerciseCount.textContent=`${items.length} exercício${items.length===1?'':'s'}`;
 strengthList.innerHTML=items.length?items.slice(0,6).map(x=>`
   <div class="strength-row">
     <b>${x.label}</b>
     <span>${x.first} → ${x.last} kg</span>
     <span class="${x.gain>0?'gain':''}">${x.gain>0?'+':''}${x.gain.toFixed(1).replace('.',',')}%</span>
   </div>`).join(''):'<div class="empty-state">Os dados aparecem após registrar cargas e repetições em pelo menos uma sessão.</div>'
}

function toggleProgressDashboard(){
 progressDashboard.classList.toggle('collapsed');
 pdToggle.textContent=progressDashboard.classList.contains('collapsed')?'Mostrar painel':'Ocultar painel';
 store.set('ui.pdCollapsed',progressDashboard.classList.contains('collapsed'))
}

function pickMilestonePhoto(mile){
 pendingMilestone=String(mile);
 milestoneFile.value='';
 milestoneFile.click()
}
function handleMilestonePhoto(file){
 if(!file||pendingMilestone===null)return;
 if(!file.type.startsWith('image/')){toast('Selecione uma imagem');return}
 const reader=new FileReader();
 reader.onload=()=>{
   const img=new Image();
   img.onload=()=>{
     try{
       const max=720,scale=Math.min(1,max/Math.max(img.width,img.height));
       const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
       const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
       const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
       const data=canvas.toDataURL('image/jpeg',.72);
       store.set('milestone.'+pendingMilestone,data);
       renderMilestonePhotos();toast('Foto salva')
     }catch(e){toast('Não foi possível salvar a foto')}
     pendingMilestone=null
   };
   img.src=reader.result
 };
 reader.readAsDataURL(file)
}
function removeMilestonePhoto(mile){
 if(!store.get('milestone.'+mile,null))return;
 if(!confirm('Remover esta foto de marco?'))return;
 store.del('milestone.'+mile);renderMilestonePhotos();toast('Foto removida')
}
function renderMilestonePhotos(){
 ['0','4','8','12'].forEach(m=>{
   const data=store.get('milestone.'+m,null),img=document.getElementById('mileImg'+m),btn=img.closest('.mile-photo');
   if(data){img.src=data;btn.classList.add('has-photo')}
   else{img.removeAttribute('src');btn.classList.remove('has-photo')}
 })
}
function openPhotoCompare(){
 const labels={'0':'Início','4':'Semana 4','8':'Semana 8','12':'Semana 12'};
 const items=['0','4','8','12'].map(m=>({m,data:store.get('milestone.'+m,null)})).filter(x=>x.data);
 compareGrid.innerHTML=items.length?items.map(x=>`<div class="compare-item"><img src="${x.data}" alt="${labels[x.m]}"><div class="compare-label">${labels[x.m]}</div></div>`).join(''):'<div class="compare-empty">Adicione pelo menos uma foto nos marcos para usar a comparação visual.</div>';
 photoCompareModal.classList.add('open')
}
function closePhotoCompare(){photoCompareModal.classList.remove('open')}



// ===== FORJA MUSCLE v2.0 =====
const mealCatalog = {
 '07:30':[
   {name:'Padrão • ovos + pão + banana + aveia',kcal:480,p:22,c:65,f:15,items:{eggs:2,bread:2,banana:1,oats:30}},
   {name:'Whey + leite + banana + aveia + pão',kcal:500,p:31,c:74,f:10,items:{whey:30,milk:200,banana:1,oats:30,bread:1}},
   {name:'Omelete + tapioca + banana',kcal:505,p:24,c:70,f:14,items:{eggs:3,tapioca:70,banana:1}}
 ],
 '11:00':[
   {name:'Arroz + feijão + frango',kcal:520,p:38,c:63,f:15,items:{rice:170,beans:100,chicken:100,oil:10}},
   {name:'Macarrão + frango + legumes',kcal:550,p:38,c:72,f:12,items:{pasta:200,chicken:110,oil:10}},
   {name:'Arroz + feijão + patinho',kcal:575,p:38,c:68,f:16,items:{rice:170,beans:100,beef:100,oil:8}}
 ],
 '15:30':[
   {name:'Whey + leite + banana + aveia',kcal:400,p:32,c:55,f:9,items:{whey:30,milk:200,banana:1,oats:30}},
   {name:'Whey + água + pão + banana',kcal:410,p:30,c:63,f:5,items:{whey:30,bread:2,banana:1}},
   {name:'Leite + ovos + pão + banana',kcal:440,p:25,c:58,f:13,items:{milk:250,eggs:2,bread:2,banana:1}}
 ],
 '17:15':[
   {name:'Pão + mel/geleia',kcal:200,p:5,c:42,f:2,items:{bread:2,honey:20}},
   {name:'Banana + aveia + mel',kcal:225,p:5,c:48,f:3,items:{banana:1,oats:30,honey:10}},
   {name:'Tapioca simples + banana',kcal:230,p:3,c:52,f:1,items:{tapioca:60,banana:1}}
 ],
 '19:15':[
   {name:'Arroz + feijão + frango',kcal:595,p:38,c:63,f:15,items:{rice:170,beans:100,chicken:100,oil:10}},
   {name:'Arroz + patinho + legumes',kcal:560,p:38,c:66,f:15,items:{rice:180,beef:110,oil:8}},
   {name:'Macarrão + frango + legumes',kcal:550,p:38,c:72,f:12,items:{pasta:200,chicken:110,oil:10}}
 ]
};
const mealTimes=['07:30','11:00','15:30','17:15','19:15'];

function mealChoiceKey(t){return 'nutrition.choice.'+t}
function mealChoiceIndex(t){return store.get(mealChoiceKey(t),0)}
function selectedMeal(t){return mealCatalog[t][mealChoiceIndex(t)]||mealCatalog[t][0]}

function renderMealChoices(){
 mealChoiceList.innerHTML=mealTimes.map(t=>{
   const idx=mealChoiceIndex(t),m=selectedMeal(t);
   return `<div class="meal-choice">
     <div class="meal-time">${t}</div>
     <select onchange="setMealChoice('${t}',this.value)">
       ${mealCatalog[t].map((x,i)=>`<option value="${i}" ${i===idx?'selected':''}>${x.name}</option>`).join('')}
     </select>
     <div class="meal-macros"><b>${m.kcal} kcal</b>${m.p}P • ${m.c}C • ${m.f}G</div>
   </div>`
 }).join('');
 renderSmartMacros();renderShoppingList()
}
function setMealChoice(t,v){store.set(mealChoiceKey(t),Number(v));renderMealChoices()}
function resetMealChoices(){mealTimes.forEach(t=>store.set(mealChoiceKey(t),0));renderMealChoices();toast('Plano padrão restaurado')}
function selectedDayMacros(){
 const arr=mealTimes.map(selectedMeal);
 return arr.reduce((a,m)=>({kcal:a.kcal+m.kcal,p:a.p+m.p,c:a.c+m.c,f:a.f+m.f}),{kcal:0,p:0,c:0,f:0})
}
function renderSmartMacros(){
 const x=selectedDayMacros();
 smartKcal.textContent=x.kcal.toLocaleString('pt-BR')+' kcal';
 smartProtein.textContent=x.p+' g';smartCarb.textContent=x.c+' g';smartFat.textContent=x.f+' g'
}

function foodTotalsWeek(){
 const out={};
 mealTimes.forEach(t=>{
   const items=selectedMeal(t).items||{};
   Object.entries(items).forEach(([k,v])=>out[k]=(out[k]||0)+v*7)
 });
 return out
}
const foodLabels={
 chicken:['Peito de frango','g'],eggs:['Ovos','un'],whey:['Whey','g'],milk:['Leite','ml'],
 banana:['Banana','un'],oats:['Aveia','g'],bread:['Pão de forma','fatias'],rice:['Arroz cozido','g'],
 beans:['Feijão cozido','g'],oil:['Azeite/óleo','g'],pasta:['Macarrão cozido','g'],beef:['Patinho/carne magra','g'],
 honey:['Mel/geleia','g'],tapioca:['Tapioca','g']
};
function renderShoppingList(){
 const totals=foodTotalsWeek();
 shoppingList.innerHTML=Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{
   const [label,unit]=foodLabels[k]||[k,''];
   let shown=v;
   if(unit==='g'&&v>=1000)shown=(v/1000).toFixed(1).replace('.',',')+' kg';
   else if(unit==='ml'&&v>=1000)shown=(v/1000).toFixed(1).replace('.',',')+' L';
   else shown=Math.round(v)+' '+unit;
   return `<div class="shopping-item"><b>${label}</b><span>${shown}</span></div>`
 }).join('');
 renderFoodCost()
}
function saveFoodPrices(){
 store.set('price.chicken',priceChicken.value);store.set('price.eggs',priceEggs.value);store.set('price.whey',priceWhey.value);renderFoodCost()
}
function restoreFoodPrices(){
 priceChicken.value=store.get('price.chicken','19');priceEggs.value=store.get('price.eggs','22');priceWhey.value=store.get('price.whey','90')
}
function renderFoodCost(){
 const t=foodTotalsWeek(),pc=num(priceChicken.value)||0,pe=num(priceEggs.value)||0,pw=num(priceWhey.value)||0;
 let cost=0;
 cost+=(t.chicken||0)/1000*pc;
 cost+=(t.eggs||0)/30*pe;
 cost+=(t.whey||0)/1000*pw;
 cost+=(t.rice||0)/1000*6.5+(t.beans||0)/1000*9+(t.oats||0)/1000*14+(t.milk||0)/1000*6;
 cost+=(t.banana||0)*0.9+(t.bread||0)/20*9+(t.pasta||0)/1000*8+(t.beef||0)/1000*40;
 cost+=(t.tapioca||0)/1000*10+(t.honey||0)/1000*25+(t.oil||0)/1000*35;
 weeklyCost.textContent=cost.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 monthlyCost.textContent=(cost*4.33).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
}

function mealStatusByTime(t){
 const map={'07:30':'0730','11:00':'1100','15:30':'1530','17:15':'1715','19:15':'1915'};
 return store.get(dk('meal.'+map[t]),false)
}
function nextMealForSelected(){
 const now=new Date(),same=isoDate(selectedDate)===isoDate(now);
 if(!same){
   const t=mealTimes.find(x=>!mealStatusByTime(x))||mealTimes[0];
   return {time:t,meal:selectedMeal(t)}
 }
 const cur=now.getHours()*60+now.getMinutes();
 const mins=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
 const upcoming=mealTimes.find(t=>mins(t)>=cur&&!mealStatusByTime(t))||mealTimes.find(t=>!mealStatusByTime(t));
 if(!upcoming)return null;
 return {time:upcoming,meal:selectedMeal(upcoming)}
}
function greeting(){
 const h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'
}
function cardioTextForDay(){
 const dow=selectedDate.getDay(),c=cardioPlan();
 if(dow===2)return `${c.tue} • Zona 2`;
 if(dow===3)return `${c.wed} pós-treino`;
 if(dow===6)return `${c.sat} • Zona 2`;
 if(dow===0)return `${c.sun}`;
 return 'Sem cardio formal'
}
function renderHomeToday(){
 homeGreeting.textContent=greeting();
 homeDate.textContent=fmtDate(selectedDate);
 const nm=nextMealForSelected();
 homeNextMeal.textContent=nm?`${nm.time} • ${nm.meal.name.split('•').pop().trim()}`:'Refeições concluídas';
 homeNextMealDetail.textContent=nm?`${nm.meal.kcal} kcal • ${nm.meal.p} g proteína`:'Ótimo trabalho hoje';
 const wn=waterNow(),wt=waterTarget();homeWater.textContent=`${wn.toLocaleString('pt-BR')} / ${wt.toLocaleString('pt-BR')} ml`;
 homeWaterDetail.textContent=wn>=wt?'Meta de água concluída':`${Math.max(0,wt-wn).toLocaleString('pt-BR')} ml restantes`;
 const w=currentWorkoutDetails();homeWorkout.textContent=w.name;homeWorkoutDetail.textContent=dowPlans[selectedDate.getDay()].detail;
 homeCardio.textContent=cardioTextForDay();homeCardioDetail.textContent=store.get(dk('cardioDone'),false)?'Concluído':'Pendente / opcional conforme o dia';
 const m=mealPct(),wa=Math.min(100,Math.round(wn/wt*100)),wo=workoutPct(),ca=isCardioPlanned(selectedDate.getDay())?(store.get(dk('cardioDone'),false)?100:0):100;
 homeScore.textContent=Math.round((m+wa+wo+ca)/4)+'%'
}
function openTodayRoutine(){
 const dow=selectedDate.getDay();
 if(isMuscleDay(dow)){
   document.querySelector('[data-tab="treino"]').click();setTimeout(focusTodayWorkout,180)
 }else{
   document.querySelector('[data-tab="nutricao"]').click();setTimeout(()=>document.getElementById('meals').scrollIntoView({behavior:'smooth'}),180)
 }
}

function checkinKey(w){return 'checkin.week.'+w}
function currentCheckinWeek(){return projectWeek()}
function getCheckin(w){return store.get(checkinKey(w),null)}
function loadCurrentCheckin(){
 const w=currentCheckinWeek(),c=getCheckin(w)||{};
 checkinWeekTitle.textContent='Semana '+w;
 checkinStatusTag.textContent=getCheckin(w)?'Salvo':'Pendente';
 ciWeight.value=c.weight??'';ciWaist.value=c.waist??'';ciHip.value=c.hip??'';ciThigh.value=c.thigh??'';
 ciSleep.value=c.sleep??'';ciHunger.value=c.hunger??'';ciEnergy.value=c.energy??'';ciRecovery.value=c.recovery??'';ciNote.value=c.note??'';
 renderCheckinDecision(c)
}
function saveWeeklyCheckin(){
 const w=currentCheckinWeek();
 const c={week:w,date:isoDate(selectedDate),weight:num(ciWeight.value),waist:num(ciWaist.value),hip:num(ciHip.value),thigh:num(ciThigh.value),
   sleep:num(ciSleep.value),hunger:num(ciHunger.value),energy:num(ciEnergy.value),recovery:num(ciRecovery.value),note:ciNote.value.trim()};
 store.set(checkinKey(w),c);
 if(c.weight!=null||c.waist!=null||c.hip!=null||c.thigh!=null){
   let arr=measurements().filter(x=>x.date!==c.date);
   arr.push({date:c.date,weight:c.weight,waist:c.waist,hip:c.hip,thigh:c.thigh,note:'Check-in semanal'});
   arr.sort((a,b)=>a.date.localeCompare(b.date));store.set('measurements',arr)
 }
 loadCurrentCheckin();renderMeasurements();renderProgressDashboard();toast('Check-in salvo')
}
function renderCheckinDecision(c){
 if(!c||Object.keys(c).length===0){checkinDecision.textContent='Aguardando dados';checkinDecisionDetail.textContent='Preencha o check-in para gerar uma leitura simples de tendência.';return}
 const prev=getCheckin(Math.max(1,(c.week||1)-1));
 let decision='Manter o plano';
 let detail='Sem sinal claro para mudar calorias ou cardio nesta semana.';
 if(prev&&c.weight!=null&&prev.weight!=null){
   const dw=c.weight-prev.weight, waistDelta=(c.waist!=null&&prev.waist!=null)?c.waist-prev.waist:0;
   if(dw<-0.35 && (c.energy??3)<=2){decision='Revisar energia para cima';detail='Peso caiu e disposição está baixa. Considere revisar a ingestão com profissional.'}
   else if(dw>0.45 && waistDelta>0.5){decision='Revisar superávit';detail='Peso e cintura subiram rápido. Vale revisar porções e aderência.'}
   else if(Math.abs(dw)<=0.35 && waistDelta<=0 && (c.energy??3)>=3){decision='Manter o plano';detail='Tendência compatível com recomposição: estabilidade de peso e cintura controlada.'}
 }
 if((c.sleep??3)<=2||(c.recovery??3)<=2){decision='Priorizar recuperação';detail='Sono ou recuperação estão baixos. Antes de aumentar treino/cardio, melhore a recuperação.'}
 checkinDecision.textContent=decision;checkinDecisionDetail.textContent=detail
}

function renderProjectCompletion(){
 const p=phaseInfo(),weekPct=Math.min(100,Math.round(p.w/12*100));
 const range=projectDateRange(),today=new Date();today.setHours(12,0,0,0);
 const days=today>=range.start?datesBetween(range.start,today<range.end?today:range.end):[];
 const trainDays=days.filter(d=>isMuscleDay(d.getDay())),trainDone=trainDays.filter(d=>trainingCompletedForDate(d)).length;
 const adherence=trainDays.length?trainDone/trainDays.length:0;
 const score=Math.round(weekPct*.7+adherence*100*.3);
 projectProgressLabel.textContent=`${score}% concluído`;
 projectProgressBar.style.width=score+'%'
}
