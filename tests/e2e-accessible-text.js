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

    async function font(selector,min,label){
      const value=await page.evaluate(selector=>{
        const el=document.querySelector(selector);
        return el?getComputedStyle(el).fontSize:null;
      },selector);
      assert.ok(value,`${label}: elemento não encontrado (${selector})`);
      assert.ok(px(value)>=min,`${label}: ${value}, esperado >= ${min}px`);
    }
    async function noOverflow(label){
      const state=await page.evaluate(()=>({w:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth}));
      assert.ok(state.sw<=state.w+2,`${label}: overflow horizontal ${state.sw}px > ${state.w}px`);
    }
    async function screen(id,label){
      await page.evaluate(id=>window.setAppScreen(id,{instant:true}),id);
      await page.waitForTimeout(120);
      await noOverflow(label);
    }

    console.log('[A11Y] Home');
    await font('.vita-greeting p',14,'Saudação do Home');
    await font('.vita-today-copy p',14,'Descrição do treino do dia');
    await font('.vita-stat small',11,'Rótulos dos indicadores');
    await font('.vita-guidance p',13,'Orientação do Home');
    await font('.vita-primary-action',15,'Ação principal');
    await font('.app-nav-btn .nav-label',10,'Menu inferior');
    const installVisible=await page.evaluate(()=>{
      const el=document.getElementById('vitaInstallCard');
      return !!el&&!el.hidden&&getComputedStyle(el).display!=='none';
    });
    if(installVisible){
      await font('.vita-install-copy p',13,'Texto de instalação');
      await font('.vita-install-action',13,'Botão instalar');
    }
    await noOverflow('Home');

    console.log('[A11Y] Nutrição');
    await screen('nutricao','Nutrição');
    await font('#nutricao .meal h3',17,'Título da refeição');
    await font('#nutricao .meal p',15,'Descrição da refeição');
    await font('#nutricao .meal .mini',13,'Detalhe nutricional');

    console.log('[A11Y] Programa');
    await screen('evolucao','Programa');
    await font('.program-stage>summary p',14,'Resumo da fase');
    await font('.program-prescription span',13,'Prescrição da fase');
    await font('.program-ex b',14,'Nome do exercício no Programa');
    await font('.program-ex small',12,'Detalhe do exercício no Programa');

    console.log('[A11Y] Mais');
    await screen('mais','Mais');
    await font('.more-link-card b',15,'Título das opções');
    await font('.more-link-card span',12,'Descrição das opções');
    await font('.metric span',13,'Rótulos do perfil');

    console.log('[A11Y] Treino');
    await screen('treino','Treino');
    await font('.screen-intro p',14,'Descrição da tela de treino');
    const hasSetInput=await page.evaluate(()=>!!document.querySelector('.set-input'));
    if(hasSetInput)await font('.set-input',15,'Carga e repetições');

    console.log('VITAFIT mobile readability audit: OK');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});