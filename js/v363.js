// VITAFIT 3.6.3 — vídeo local por programação, salvo em IndexedDB
(function(){
  const BUILD='3.6.3';
  const DB_NAME='vitafit-local-media';
  const STORE='workout-videos';
  const LABELS={seg:'Segunda • Inferiores completo',ter:'Terça • Superiores completo',qua:'Quarta • Inferiores completo',qui:'Quinta • Superiores completo',sex:'Sexta • Inferiores completo'};
  let objectUrl=null;

  function activeDay(){return document.querySelector('#v360TrainingApp .v360-day.active')?.dataset?.day||'seg'}
  function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  async function getVideo(day){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(day);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
  async function putVideo(day,file){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put({blob:file,name:file.name,type:file.type,size:file.size,updatedAt:Date.now()},day);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
  async function delVideo(day){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(day);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}

  function ensureInput(){let i=document.getElementById('v363VideoInput');if(i)return i;i=document.createElement('input');i.id='v363VideoInput';i.type='file';i.accept='video/*';i.hidden=true;document.body.appendChild(i);i.addEventListener('change',async()=>{const f=i.files?.[0];if(!f)return;const day=i.dataset.day||activeDay();try{await putVideo(day,f);toast('Vídeo salvo neste aparelho');await apply()}catch(e){toast('Não foi possível salvar o vídeo')}finally{i.value=''}});return i}
  function chooseVideo(day){const i=ensureInput();i.dataset.day=day;i.click()}

  function ensureModal(){let m=document.getElementById('v363LocalVideoModal');if(m)return m;m=document.createElement('div');m.id='v363LocalVideoModal';m.className='v363-modal';m.innerHTML='<div class="v363-stage"><header><div><small>VÍDEO DO TREINO</small><b id="v363Title">Treino</b></div><button id="v363Close" type="button" aria-label="Fechar">×</button></header><div class="v363-player"><video id="v363Video" playsinline controls preload="metadata"></video></div><footer>Vídeo salvo localmente neste aparelho.</footer></div>';document.body.appendChild(m);m.querySelector('#v363Close').addEventListener('click',closeModal);m.addEventListener('click',e=>{if(e.target===m)closeModal()});return m}
  async function openVideo(day){const saved=await getVideo(day);if(!saved){chooseVideo(day);return}const m=ensureModal(),v=m.querySelector('video');m.querySelector('#v363Title').textContent=LABELS[day]||'Treino';if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(saved.blob);v.src=objectUrl;v.currentTime=0;m.classList.add('open');document.body.style.overflow='hidden';v.play().catch(()=>{})}
  function closeModal(){const m=document.getElementById('v363LocalVideoModal'),v=document.getElementById('v363Video');if(v)v.pause();if(m)m.classList.remove('open');document.body.style.overflow=''}
  function toast(t){let e=document.getElementById('v363Toast');if(!e){e=document.createElement('div');e.id='v363Toast';e.className='v363-toast';document.body.appendChild(e)}e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1600)}

  async function apply(){
    const app=document.getElementById('v360TrainingApp');if(!app)return;
    app.querySelectorAll('.v360-video-btn,[data-video-ex],#v362WorkoutVideoButton').forEach(el=>el.remove());
    document.getElementById('v362WorkoutVideoModal')?.remove();
    const overview=app.querySelector('.v360-overview');if(!overview)return;
    const day=activeDay(),saved=await getVideo(day);
    let box=overview.querySelector('#v363VideoBox');if(box)box.remove();
    box=document.createElement('div');box.id='v363VideoBox';box.className='v363-video-box';
    if(saved){
      box.innerHTML='<button class="v363-main" type="button"><span class="v363-play">▶</span><span><b>Ver execução do treino</b><small>Vídeo salvo neste aparelho</small></span><span class="v363-arrow">›</span></button><div class="v363-actions"><button type="button" data-act="replace">Substituir vídeo</button><button type="button" data-act="remove" class="danger">Remover vídeo</button></div>';
      box.querySelector('.v363-main').addEventListener('click',()=>openVideo(day));
      box.querySelector('[data-act="replace"]').addEventListener('click',()=>chooseVideo(day));
      box.querySelector('[data-act="remove"]').addEventListener('click',async()=>{if(!confirm('Remover o vídeo salvo deste treino neste aparelho?'))return;await delVideo(day);toast('Vídeo removido');apply()});
    }else{
      box.innerHTML='<button class="v363-main empty" type="button"><span class="v363-play">＋</span><span><b>Importar vídeo da galeria</b><small>Será salvo localmente, na qualidade original</small></span><span class="v363-arrow">›</span></button>';
      box.querySelector('.v363-main').addEventListener('click',()=>chooseVideo(day));
    }
    (overview.firstElementChild||overview).appendChild(box);
    syncBuild();
  }

  function syncBuild(){window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD}
  const obs=new MutationObserver(()=>requestAnimationFrame(apply));obs.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('vitafit-screen-change',e=>{if(e.detail?.id==='treino')requestAnimationFrame(apply)});
  setTimeout(apply,0);setTimeout(apply,500);syncBuild();
})();