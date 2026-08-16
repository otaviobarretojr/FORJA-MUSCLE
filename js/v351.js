// VITAFIT v3.5.1 — instalação orientada no primeiro acesso, preservando shape12.*
(function(){
  const BUILD='3.5.1';
  const DISMISS_KEY='ui.installPromptDismissed';
  const INSTALLED_KEY='ui.appInstalled';
  const SESSION_HIDE='vitafit.installHidden';
  const state=window.__VITAFIT_INSTALL__||(window.__VITAFIT_INSTALL__={deferred:null,installed:false});

  const INSTALL_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0l-4-4m4 4l4-4M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function standalone(){
    return window.matchMedia?.('(display-mode: standalone)').matches===true || navigator.standalone===true;
  }
  function ua(){return navigator.userAgent||''}
  function isIOS(){return /iPad|iPhone|iPod/.test(ua()) || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
  function isAndroid(){return /Android/i.test(ua())}
  function dismissed(){try{return store.get(DISMISS_KEY,false)===true}catch(e){return false}}
  function installed(){try{return standalone()||state.installed===true||store.get(INSTALLED_KEY,false)===true}catch(e){return standalone()||state.installed===true}}
  function sessionHidden(){try{return sessionStorage.getItem(SESSION_HIDE)==='1'}catch(e){return false}}
  function markInstalled(){
    state.installed=true;state.deferred=null;
    try{store.set(INSTALLED_KEY,true)}catch(e){}
    hideCard();
  }
  function hideForSession(){try{sessionStorage.setItem(SESSION_HIDE,'1')}catch(e){}hideCard()}

  function ensureCard(){
    const home=document.getElementById('vitaHomeDashboard');
    if(!home)return null;
    let card=document.getElementById('vitaInstallCard');
    if(card)return card;
    card=document.createElement('section');
    card.id='vitaInstallCard';
    card.className='vita-install-card';
    card.hidden=true;
    card.innerHTML=`
      <button class="vita-install-dismiss" id="vitaInstallDismiss" type="button" aria-label="Agora não">×</button>
      <span class="vita-install-icon">${INSTALL_ICON}</span>
      <div class="vita-install-copy">
        <small>PRIMEIRO ACESSO</small>
        <b id="vitaInstallTitle">Instale a VITAFIT</b>
        <p id="vitaInstallText">Abra direto da sua tela inicial, como um aplicativo.</p>
        <div class="vita-install-help" id="vitaInstallHelp" hidden></div>
      </div>
      <button class="vita-install-action" id="vitaInstallAction" type="button">INSTALAR</button>`;
    const today=home.querySelector('#vitaTodayCard');
    if(today)today.insertAdjacentElement('beforebegin',card);else home.prepend(card);
    card.querySelector('#vitaInstallDismiss').addEventListener('click',()=>{
      try{store.set(DISMISS_KEY,true)}catch(e){}
      hideCard();
    });
    card.querySelector('#vitaInstallAction').addEventListener('click',handleInstall);
    return card;
  }

  function hideCard(){
    const card=document.getElementById('vitaInstallCard');
    if(card){card.hidden=true;card.classList.remove('is-help')}
  }

  function manualHelp(card,platform){
    const help=card.querySelector('#vitaInstallHelp');
    const action=card.querySelector('#vitaInstallAction');
    card.classList.add('is-help');
    help.hidden=false;
    if(platform==='ios'){
      help.innerHTML='<b>Como instalar:</b> toque em <strong>Compartilhar ⤴</strong> no Safari e escolha <strong>Adicionar à Tela de Início</strong>.';
    }else{
      help.innerHTML='<b>Como instalar:</b> abra o menu do navegador <strong>⋮</strong> e toque em <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.';
    }
    action.textContent='ENTENDI';
    action.dataset.mode='close-help';
  }

  async function handleInstall(){
    const card=ensureCard();if(!card)return;
    const action=card.querySelector('#vitaInstallAction');
    if(action.dataset.mode==='close-help'){hideForSession();return}
    if(isIOS()){
      manualHelp(card,'ios');
      return;
    }
    const promptEvent=state.deferred;
    if(promptEvent&&typeof promptEvent.prompt==='function'){
      action.disabled=true;action.textContent='ABRINDO…';
      try{
        await promptEvent.prompt();
        const choice=await promptEvent.userChoice;
        state.deferred=null;
        if(choice?.outcome==='accepted')markInstalled();else hideForSession();
      }catch(e){
        state.deferred=null;
        manualHelp(card,isAndroid()?'android':'other');
      }finally{action.disabled=false}
      return;
    }
    manualHelp(card,isAndroid()?'android':'other');
  }

  function shouldShow(){
    if(installed()||dismissed()||sessionHidden())return false;
    if(isIOS())return true;
    if(state.deferred)return true;
    return isAndroid();
  }

  function renderCard(){
    const card=ensureCard();if(!card)return;
    if(!shouldShow()){hideCard();return}
    const title=card.querySelector('#vitaInstallTitle');
    const text=card.querySelector('#vitaInstallText');
    const action=card.querySelector('#vitaInstallAction');
    const help=card.querySelector('#vitaInstallHelp');
    card.classList.remove('is-help');help.hidden=true;help.textContent='';
    action.dataset.mode='';action.disabled=false;
    if(isIOS()){
      title.textContent='Leve a VITAFIT para sua tela inicial';
      text.textContent='No iPhone, a instalação é feita pelo menu Compartilhar do Safari.';
      action.textContent='VER COMO';
    }else if(state.deferred){
      title.textContent='Instale a VITAFIT';
      text.textContent='Abra seus treinos direto da tela inicial, sem precisar procurar o link.';
      action.textContent='INSTALAR';
    }else{
      title.textContent='Instale a VITAFIT';
      text.textContent='Adicione a VITAFIT à tela inicial para usar como aplicativo.';
      action.textContent='VER COMO';
    }
    card.hidden=false;
  }

  function syncVersion(){
    document.querySelectorAll('.version').forEach(el=>el.textContent=`v${BUILD}`);
    const more=document.querySelector('#vitaMoreBrand small');if(more)more.textContent=`versão ${BUILD}`;
    document.documentElement.dataset.forjaBuild=BUILD;
    document.documentElement.dataset.vitafitBuild=BUILD;
  }

  function sync(){syncVersion();renderCard()}

  window.addEventListener('vitafit-install-ready',()=>requestAnimationFrame(renderCard));
  window.addEventListener('vitafit-app-installed',markInstalled);
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change',e=>{if(e.matches)markInstalled()});

  const previousRenderAll=window.renderAll;
  if(typeof previousRenderAll==='function')window.renderAll=function(){previousRenderAll();requestAnimationFrame(sync)};
  const previousScreen=window.setAppScreen;
  if(typeof previousScreen==='function')window.setAppScreen=function(id,opts={}){previousScreen(id,opts);requestAnimationFrame(()=>{syncVersion();if(id==='hoje')renderCard()})};

  if(standalone())markInstalled();
  sync();
  setTimeout(renderCard,1200);
})();