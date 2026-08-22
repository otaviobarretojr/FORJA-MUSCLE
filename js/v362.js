// VITAFIT 3.6.2 — vídeo integral por treino, no topo da programação
(function(){
  const BUILD='3.6.2';
  const VIDEO_BY_DAY={seg:'191175',ter:'191177',qua:'191179',qui:'191177',sex:'191181'};
  const LABEL_BY_DAY={seg:'Segunda • Inferiores completo',ter:'Terça • Superiores completo',qua:'Quarta • Inferiores completo',qui:'Quinta • Superiores completo',sex:'Sexta • Inferiores completo'};
  let currentUrl=null;

  function activeDay(){
    const btn=document.querySelector('#v360TrainingApp .v360-day.active');
    return btn?.dataset?.day||'seg';
  }

  async function videoBlob(id){
    const paths=[`assets/videos/${id}.00.b64`,`assets/videos/${id}.01.b64`];
    const chunks=[];
    for(const p of paths){
      const r=await fetch(p+'?v='+BUILD,{cache:'force-cache'});
      if(!r.ok)throw new Error('video');
      chunks.push((await r.text()).trim());
    }
    const bin=atob(chunks.join(''));
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    return new Blob([bytes],{type:'video/mp4'});
  }

  function ensureModal(){
    let modal=document.getElementById('v362WorkoutVideoModal');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='v362WorkoutVideoModal';
    modal.className='v362-video-modal';
    modal.innerHTML=`<div class="v362-video-stage"><header><div><small>EXECUÇÃO DO TREINO</small><b id="v362VideoTitle">Treino</b></div><button id="v362VideoClose" type="button" aria-label="Fechar vídeo">×</button></header><div class="v362-video-wrap"><video id="v362WorkoutVideo" playsinline controls preload="metadata"></video></div><footer>Vídeo completo da programação • assista do início ao fim e feche para voltar à ficha.</footer></div>`;
    document.body.appendChild(modal);
    const close=()=>closeVideo();
    modal.querySelector('#v362VideoClose').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
    return modal;
  }

  async function openVideo(){
    const day=activeDay(),id=VIDEO_BY_DAY[day],modal=ensureModal(),video=modal.querySelector('#v362WorkoutVideo');
    modal.querySelector('#v362VideoTitle').textContent=LABEL_BY_DAY[day]||'Treino';
    modal.classList.add('open');
    document.documentElement.classList.add('v362-video-open');
    document.body.style.overflow='hidden';
    try{
      video.pause();video.removeAttribute('src');video.load();
      if(currentUrl){URL.revokeObjectURL(currentUrl);currentUrl=null;}
      currentUrl=URL.createObjectURL(await videoBlob(id));
      video.src=currentUrl;video.currentTime=0;video.load();
      const play=()=>{video.currentTime=0;video.play().catch(()=>{})};
      if(video.readyState>=1)play();else video.addEventListener('loadedmetadata',play,{once:true});
    }catch(e){
      modal.querySelector('footer').textContent='Não foi possível carregar o vídeo. Tente novamente com conexão ativa.';
    }
  }

  function closeVideo(){
    const modal=document.getElementById('v362WorkoutVideoModal');
    const video=document.getElementById('v362WorkoutVideo');
    if(video)video.pause();
    if(modal)modal.classList.remove('open');
    document.documentElement.classList.remove('v362-video-open');
    document.body.style.overflow='';
    // Mantém a ficha exatamente no ponto onde estava.
  }

  function apply(){
    const app=document.getElementById('v360TrainingApp');if(!app)return;
    // Remove definitivamente as ações de vídeo de cada exercício.
    app.querySelectorAll('.v360-video-btn,[data-video-ex]').forEach(el=>el.remove());
    const overview=app.querySelector('.v360-overview');if(!overview)return;
    let btn=overview.querySelector('#v362WorkoutVideoButton');
    if(!btn){
      btn=document.createElement('button');
      btn.id='v362WorkoutVideoButton';btn.type='button';btn.className='v362-workout-video-btn';
      btn.innerHTML='<span class="v362-play">▶</span><span><b>Ver execução do treino</b><small>Vídeo completo da programação</small></span><span class="v362-arrow">›</span>';
      btn.addEventListener('click',openVideo);
      const copy=overview.firstElementChild||overview;
      copy.appendChild(btn);
    }
    syncBuild();
  }

  function syncBuild(){
    window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;
    document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;
    document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);
    const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD;
  }

  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  observer.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('vitafit-screen-change',e=>{if(e.detail?.id==='treino')requestAnimationFrame(apply)});
  setTimeout(apply,0);setTimeout(apply,400);setTimeout(apply,1200);syncBuild();
})();
