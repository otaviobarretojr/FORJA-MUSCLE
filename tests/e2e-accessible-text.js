const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const px=v=>Number.parseFloat(String(v||'0'))||0;

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'});
    const page=await context.newPage();
    await page.addInitScript(()=>localStorage.setItem('shape12.training.cycleStart',JSON.stringify('2026-06-01')));
    await page.goto('http://127.0.0.1:4173/?e2e=accessibility',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true');

    async function font(selector,min,label,optional=false){
      const value=await page.evaluate(({selector})=>{
        const el=document.querySelector(selector);
        return el?getComputedStyle(el).fontSize:null;
      },{selector});
      if(optional&&!value)return;
      assert.ok(value,`${label}: elemento não encontrado (${selector})`);
      assert.ok(px(value)>=min,`${label}: ${value}, esperado >= ${min}px`);
    }
    async function noOverflow(label){
      const state=await page.evaluate(()=>({w:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth}));
      assert.ok(state.sw<=state.w+2,`${label}: overflow horizontal ${state.sw}px > ${state.w}px`);
    }

    console.log('[A11Y] Home');
    await font('.vita-greeting p',14,'Saudação do Home');
    await font('.vita-today-copy p',14,'Descrição do treino do dia');
    await font('.vita-stat small',11,'Rótulos dos indicadores');
    await font('.vita-guidance p',13,'Orientação do Home');
    await font('.vita-primary-action',15,'Ação principal');
    await font('.app-nav-btn .nav-label',10,'Menu inferior');
    await font('.vita-install-copy p',13,'Texto de instalação',true);
    await font('.vita-install-action',13,'Botão instalar',true);
    await noOverflow('Home');

    // Os fragments de todas as áreas já existem no DOM. Para auditar tipografia,
    // não precisamos disparar setAppScreen/renderAll e pagar o custo das renderizações do app.
    console.log('[A11Y] Nutrição');
    await font('#nutricao .meal h3',17,'Título da refeição');
    await font('#nutricao .meal p',15,'Descrição da refeição');
    await font('#nutricao .meal .mini',13,'Detalhe nutricional');

    console.log('[A11Y] Programa');
    await font('.program-stage>summary p',14,'Resumo da fase');
    await font('.program-prescription span',13,'Prescrição da fase');
    await font('.program-ex b',14,'Nome do exercício no Programa');
    await font('.program-ex small',12,'Detalhe do exercício no Programa');

    console.log('[A11Y] Mais');
    await font('.more-link-card b',15,'Título das opções');
    await font('.more-link-card span',12,'Descrição das opções');
    await font('.metric span',13,'Rótulos do perfil');

    console.log('[A11Y] Treino');
    await font('#treino .screen-intro p',14,'Descrição da tela de treino');
    await font('.set-input',15,'Carga e repetições',true);

    console.log('VITAFIT mobile readability audit: OK');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});