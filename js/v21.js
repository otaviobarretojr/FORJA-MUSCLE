// ===== FORJA MUSCLE v2.1 =====
function weekBoundsForDate(d){
 const x=new Date(d);x.setHours(12,0,0,0);
 const dow=x.getDay();
 const diffToMon=(dow===0?-6:1-dow);
 const start=new Date(x);start.setDate(x.getDate()+diffToMon);
 const end=new Date(start);end.setDate(start.getDate()+6);
 return {start,end}
}
function weekSummaryData(){
 const {start,end}=weekBoundsForDate(selectedDate);
 const today=new Date();today.setHours(12,0,0,0);
 const cutoff=end<today?end:today;
 const days=cutoff>=start?datesBetween(start,cutoff):[];

 const trainDays=days.filter(d=>isMuscleDay(d.getDay()));
 const trainDone=trainDays.filter(d=>trainingCompletedForDate(d)).length;
 const cardioDays=days.filter(d=>isCardioPlanned(d.getDay()));
 const cardioDone=cardioDays.filter(d=>cardioCompletedForDate(d)).length;
 const tracked=days.filter(d=>dayHasAnyTracking(d));
 const nutrition=tracked.length?Math.round(tracked.reduce((a,d)=>a+nutritionPctForDate(d),0)/tracked.length):0;
 const water=tracked.length?Math.round(tracked.reduce((a,d)=>{
   const date=isoDate(d),target=dowPlans[d.getDay()].water,now=dateStoreGet(date,'water',0);
   return a+Math.min(100,Math.round(now/target*100))
 },0)/tracked.length):0;
 return {start,end,days,trainDays,trainDone,cardioDays,cardioDone,tracked,nutrition,water}
}
function dayCompletionScore(d){
 const date=isoDate(d);
 const meal=nutritionPctForDate(d);
 const target=dowPlans[d.getDay()].water,wat=Math.min(100,Math.round(dateStoreGet(date,'water',0)/target*100));
 let activity=100;
 if(isMuscleDay(d.getDay())) activity=trainingCompletedForDate(d)?100:0;
 else if(isCardioPlanned(d.getDay())) activity=cardioCompletedForDate(d)?100:0;
 return Math.round((meal+wat+activity)/3)
}
function consistencyStreak(){
 const today=new Date();today.setHours(12,0,0,0);
 let streak=0;
 for(let i=0;i<84;i++){
   const d=new Date(today);d.setDate(today.getDate()-i);
   if(dayCompletionScore(d)>=70)streak++;
   else if(i===0 && !dayHasAnyTracking(d))continue;
   else break
 }
 return streak
}
function renderWeeklySummary(){
 const s=weekSummaryData(),w=projectWeek(),streak=consistencyStreak();
 wsTitle.textContent=`Semana ${w} • ${phaseInfo().name}`;
 wsSubtitle.textContent=`${s.start.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} a ${s.end.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}`;
 streakDays.textContent=`${streak} dia${streak===1?'':'s'}`;
 wsTraining.textContent=`${s.trainDone}/${s.trainDays.length}`;
 wsTrainingPct.textContent=(s.trainDays.length?Math.round(s.trainDone/s.trainDays.length*100):0)+'%';
 wsCardio.textContent=`${s.cardioDone}/${s.cardioDays.length}`;
 wsCardioPct.textContent=(s.cardioDays.length?Math.round(s.cardioDone/s.cardioDays.length*100):0)+'%';
 wsNutrition.textContent=s.nutrition+'%';wsWater.textContent=s.water+'%';

 const trainPct=s.trainDays.length?s.trainDone/s.trainDays.length*100:0;
 const cardioPct=s.cardioDays.length?s.cardioDone/s.cardioDays.length*100:0;
 const overall=Math.round((trainPct+cardioPct+s.nutrition+s.water)/4);
 let title='Construindo consistência',detail='Continue registrando os dias para acompanhar a tendência.';
 if(overall>=90){title='Semana excelente';detail='Treino, cardio e rotina estão muito consistentes. O foco agora é manter qualidade e recuperação.'}
 else if(overall>=75){title='Boa semana';detail='A base está consistente. Ajustes pequenos valem mais do que aumentar volume ou restrição.'}
 else if(overall>=55){title='Semana intermediária';detail='Há espaço para melhorar aderência antes de mexer em calorias ou treino.'}
 else if(s.tracked.length>=3){title='Consistência baixa';detail='Priorize cumprir o básico: refeições planejadas, água e sessões programadas.'}
 wsReading.textContent=title;wsReadingDetail.textContent=detail
}
function toggleFocusMode(){
 document.body.classList.toggle('focus-mode');
 const active=document.body.classList.contains('focus-mode');
 focusModeBtn.textContent=active?'✓ Modo treino ativo':'⚡ Modo treino';
 if(active){
   document.querySelector('[data-tab="treino"]').classList.add('active');
   document.getElementById('treino').classList.add('active');
   focusTodayWorkout();
 }
 store.set('ui.focusMode',active)
}
function reportBodyText(){
 const s=weekSummaryData(),w=projectWeek();
 const trainPct=s.trainDays.length?Math.round(s.trainDone/s.trainDays.length*100):0;
 const cardioPct=s.cardioDays.length?Math.round(s.cardioDone/s.cardioDays.length*100):0;
 const arr=measurements(),last=arr[arr.length-1]||{};
 return `FORJA MUSCLE • Semana ${w}
Treinos: ${s.trainDone}/${s.trainDays.length} (${trainPct}%)
Cardio: ${s.cardioDone}/${s.cardioDays.length} (${cardioPct}%)
Nutrição: ${s.nutrition}%
Água: ${s.water}%
Peso: ${last.weight??'—'} kg
Cintura: ${last.waist??'—'} cm
Quadril: ${last.hip??'—'} cm
Coxa: ${last.thigh??'—'} cm
Leitura: ${wsReading.textContent}
${wsReadingDetail.textContent}`
}
function openWeeklyReport(){
 const s=weekSummaryData(),w=projectWeek(),arr=measurements(),last=arr[arr.length-1]||{};
 const trainPct=s.trainDays.length?Math.round(s.trainDone/s.trainDays.length*100):0;
 const cardioPct=s.cardioDays.length?Math.round(s.cardioDone/s.cardioDays.length*100):0;
 reportTitle.textContent=`Semana ${w} • ${phaseInfo().name}`;
 weeklyReportContent.innerHTML=`
   <div class="report-hero"><span>RESULTADO DA SEMANA</span><b>${wsReading.textContent}</b><span>${wsReadingDetail.textContent}</span></div>
   <div class="report-grid">
     <div><span>TREINO</span><b>${s.trainDone}/${s.trainDays.length} • ${trainPct}%</b></div>
     <div><span>CARDIO</span><b>${s.cardioDone}/${s.cardioDays.length} • ${cardioPct}%</b></div>
     <div><span>NUTRIÇÃO</span><b>${s.nutrition}%</b></div>
     <div><span>ÁGUA</span><b>${s.water}%</b></div>
   </div>
   <div class="report-section"><h4>Medidas mais recentes</h4><p>Peso: ${last.weight??'—'} kg • Cintura: ${last.waist??'—'} cm • Quadril: ${last.hip??'—'} cm • Coxa: ${last.thigh??'—'} cm</p></div>
   <div class="report-section"><h4>Check-in</h4><p>${checkinDecision.textContent} — ${checkinDecisionDetail.textContent}</p></div>`;
 weeklyReportModal.classList.add('open')
}
function closeWeeklyReport(){weeklyReportModal.classList.remove('open')}
function printWeeklyReport(){
 const content=weeklyReportContent.innerHTML;
 const win=window.open('','_blank');
 if(!win){toast('Permita pop-ups para imprimir o relatório');return}
 win.document.write(`<html><head><title>FORJA MUSCLE • Relatório</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.report-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.report-grid>div,.report-section,.report-hero{border:1px solid #ddd;border-radius:10px;padding:12px;margin-top:10px}span{color:#666;font-size:12px}b{display:block;margin-top:4px}h4{margin:0 0 6px}</style></head><body><h1>FORJA MUSCLE</h1><h2>${reportTitle.textContent}</h2>${content}</body></html>`);
 win.document.close();win.focus();setTimeout(()=>win.print(),300)
}
async function copyWeeklyReport(){
 const txt=reportBodyText();
 try{await navigator.clipboard.writeText(txt);toast('Resumo copiado')}
 catch(e){
   const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Resumo copiado')
 }
}
