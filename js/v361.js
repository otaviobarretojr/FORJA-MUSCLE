// VITAFIT 3.6.1 — player de exercício em crop HD do vídeo original
(function(){
  const BUILD='3.6.1';
  const TILES={
    'seg-sumo':1,'seg-afundo':2,'seg-pelvica':3,'seg-stiff':4,'seg-coice':5,
    'ter-remada':1,'ter-supino':2,'ter-desenvolvimento':3,'ter-rosca':4,'ter-triceps':5,
    'qua-extensora':1,'qua-smith':2,'qua-leguni':3,'qua-flexora':4,'qua-stiff':5,'qua-abdutora':6,
    'qui-remada':1,'qui-supino':2,'qui-desenvolvimento':3,'qui-rosca':4,'qui-triceps':5,
    'sex-afundo':1,'sex-bulgaro':2,'sex-sumo':3,'sex-coice-abd':4,'sex-abdutora':5,'sex-pelvica':6
  };
  // Regiões medidas diretamente nos MP4 originais 720x900. Não há nova compressão.
  const REGIONS={
    1:{x:45,y:137,w:190,h:268},
    2:{x:273,y:137,w:185,h:268},
    3:{x:500,y:137,w:182,h:268},
    4:{x:47,y:526,w:187,h:264},
    5:{x:273,y:526,w:185,h:264},
    6:{x:501,y:526,w:180,h:264}
  };

  function syncBuild(){
    window.__FORJA_BUILD__=BUILD;window.__VITAFIT_BUILD__=BUILD;
    document.documentElement.dataset.forjaBuild=BUILD;document.documentElement.dataset.vitafitBuild=BUILD;
    document.querySelectorAll('.version').forEach(el=>el.textContent='v'+BUILD);
    const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent='versão '+BUILD;
  }

  function ensureCropShell(){
    const modal=document.getElementById('v360VideoModal'),video=document.getElementById('v360Video');
    if(!modal||!video)return null;
    let crop=modal.querySelector('.v361-crop');
    if(!crop){
      crop=document.createElement('div');crop.className='v361-crop';
      video.parentNode.insertBefore(crop,video);crop.appendChild(video);
      video.controls=false;video.muted=true;video.playsInline=true;
      const hint=document.createElement('div');hint.className='v361-video-status';hint.innerHTML='<span>▶</span><small>toque para pausar</small>';crop.appendChild(hint);
      crop.addEventListener('click',()=>{if(video.paused){video.play().catch(()=>{});crop.classList.remove('paused')}else{video.pause();crop.classList.add('paused')}});
      video.addEventListener('play',()=>crop.classList.remove('paused'));
      video.addEventListener('pause',()=>crop.classList.add('paused'));
    }
    return {modal,video,crop};
  }

  function applyTile(exKey){
    const shell=ensureCropShell();if(!shell)return;
    const tile=TILES[exKey]||1,r=REGIONS[tile];
    const {modal,video,crop}=shell;
    modal.dataset.v361Tile=String(tile);
    crop.style.aspectRatio=`${r.w}/${r.h}`;
    const zoom=720/r.w;
    video.style.width=(zoom*100)+'%';
    video.style.height='auto';
    video.style.left=(-(r.x/r.w)*100)+'%';
    video.style.top=(-(r.y/r.w)*100)+'%';
    video.style.maxWidth='none';
    video.style.position='absolute';
    video.style.margin='0';
    video.style.borderRadius='0';
  }

  // O v3.6.0 continua cuidando da leitura do MP4 e do loop. Aqui só mudamos a janela visual.
  document.addEventListener('click',event=>{
    const btn=event.target.closest('#v360TrainingApp [data-video-ex]');
    if(btn)applyTile(btn.dataset.videoEx);
  },true);

  const observer=new MutationObserver(()=>{if(document.getElementById('v360VideoModal'))ensureCropShell()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  ensureCropShell();syncBuild();
})();
