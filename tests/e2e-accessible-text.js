const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const px=v=>Number.parseFloat(String(v||'0'))||0;

const rules=[
  ['.vita-greeting p',14,'Saudação do Home',false],
  ['.vita-today-copy p',14,'Descrição do treino do dia',false],
  ['.vita-stat small',11,'Rótulos dos indicadores',false],
  ['.vita-guidance p',13,'Orientação do Home',false],
  ['.vita-primary-action',15,'Ação principal',false],
  ['.app-nav-btn .nav-label',10,'Menu inferior',false],
  ['.vita-install-copy p',13,'Texto de instalação',true],
  ['.vita-install-action',13,'Botão instalar',true],
  ['#nutricao .meal h3',17,'Título da refeição',false],
  ['#nutricao .meal p',15,'Descrição da refeição',false],
  ['#nutricao .meal .mini',13,'Detalhe nutricional',false],
  ['.program-stage>summary p',14,'Resumo da fase',false],
  ['.program-prescription span',13,'Prescrição da fase',false],
  ['.program-ex b',14,'Nome do exercício no Programa',false],
  ['.program-ex small',12,'Detalhe do exercício no Programa',false],
  ['.more-link-card b',15,'Título das opções',false],
  ['.more-link-card span',12,'Descrição das opções',false],
  ['.metric span',13,'Rótulos do perfil',false],
  ['#treino .screen-intro p',14,'Descrição da tela de treino',false],
  ['.set-input',15,'Carga e repetições',true]
];

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'});
    const page=await context.newPage();
    await page.addInitScript(()=>localStorage.setItem('shape12.training.cycleStart',JSON.stringify('2026-06-01')));
    await page.goto('http://127.0.0.1:4173/?e2e=accessibility',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true');

    const audit=await page.evaluate(rules=>{
      const fonts=rules.map(([selector,min,label,optional])=>{
        const el=document.querySelector(selector);
        return {selector,min,label,optional,value:el?getComputedStyle(el).fontSize:null};
      });
      return {
        fonts,
        viewport:document.documentElement.clientWidth,
        scrollWidth:document.documentElement.scrollWidth,
        ready:document.documentElement.dataset.vitafitReady,
        build:document.documentElement.dataset.vitafitBuild||document.documentElement.dataset.forjaBuild
      };
    },rules);

    assert.equal(audit.ready,'true');
    assert.equal(audit.build,'3.5.1');
    assert.ok(audit.scrollWidth<=audit.viewport+2,`Home: overflow horizontal ${audit.scrollWidth}px > ${audit.viewport}px`);

    for(const item of audit.fonts){
      if(item.optional&&!item.value)continue;
      assert.ok(item.value,`${item.label}: elemento não encontrado (${item.selector})`);
      assert.ok(px(item.value)>=item.min,`${item.label}: ${item.value}, esperado >= ${item.min}px`);
    }

    console.log({viewport:audit.viewport,scrollWidth:audit.scrollWidth,fonts:audit.fonts.map(x=>`${x.label}: ${x.value||'n/a'}`)});
    console.log('VITAFIT mobile readability audit: OK');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});