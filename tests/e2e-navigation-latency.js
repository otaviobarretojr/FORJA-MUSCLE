const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE='http://127.0.0.1:4173/';

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true,isMobile:true});
    const page=await context.newPage();
    await page.goto(`${BASE}?e2e=navigation-latency`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true',null,{timeout:20000});

    const ids=['treino','nutricao','evolucao','mais','hoje'];
    const results=[];
    for(let round=0;round<3;round++){
      for(const id of ids){
        const result=await page.evaluate(async id=>{
          const btn=document.querySelector(`.app-nav-btn[data-screen="${id}"]`);
          const target=document.getElementById(id==='hoje'?'screen-hoje':id);
          if(!btn||!target)return {id,error:'missing'};
          const start=performance.now();
          btn.click();
          const afterHandler=performance.now();
          const height=target.offsetHeight;
          const display=getComputedStyle(target).display;
          const afterLayout=performance.now();
          await new Promise(resolve=>setTimeout(resolve,20));
          const after20=performance.now();
          return {
            id,
            handlerMs:afterHandler-start,
            layoutMs:afterLayout-start,
            after20Ms:after20-start,
            height,
            display,
            active:target.classList.contains('active'),
            navActive:btn.classList.contains('active')
          };
        },id);
        results.push(result);
        console.log(JSON.stringify(result));
        assert.equal(result.active,true,`${id} não ativou a tela`);
        assert.equal(result.navActive,true,`${id} não ativou o botão`);
        assert.notEqual(result.display,'none',`${id} continuou invisível`);
      }
    }

    const summary={};
    for(const id of ids){
      const rows=results.filter(r=>r.id===id);
      summary[id]={
        handlerMax:+Math.max(...rows.map(r=>r.handlerMs)).toFixed(2),
        handlerAvg:+(rows.reduce((s,r)=>s+r.handlerMs,0)/rows.length).toFixed(2),
        layoutMax:+Math.max(...rows.map(r=>r.layoutMs)).toFixed(2),
        layoutAvg:+(rows.reduce((s,r)=>s+r.layoutMs,0)/rows.length).toFixed(2)
      };
    }
    console.log('NAVIGATION_SUMMARY '+JSON.stringify(summary));
    console.log('VITAFIT navigation latency audit: OK');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});
