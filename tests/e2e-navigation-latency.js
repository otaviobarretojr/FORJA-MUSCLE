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
          await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
          const afterPaint=performance.now();
          return {
            id,
            handlerMs:afterHandler-start,
            paintMs:afterPaint-start,
            active:target.classList.contains('active'),
            navActive:btn.classList.contains('active')
          };
        },id);
        results.push(result);
        assert.equal(result.active,true,`${id} não ativou a tela`);
        assert.equal(result.navActive,true,`${id} não ativou o botão`);
      }
    }

    const summary={};
    for(const id of ids){
      const rows=results.filter(r=>r.id===id);
      summary[id]={
        handlerMax:+Math.max(...rows.map(r=>r.handlerMs)).toFixed(2),
        handlerAvg:+(rows.reduce((s,r)=>s+r.handlerMs,0)/rows.length).toFixed(2),
        paintMax:+Math.max(...rows.map(r=>r.paintMs)).toFixed(2),
        paintAvg:+(rows.reduce((s,r)=>s+r.paintMs,0)/rows.length).toFixed(2)
      };
    }
    console.log(JSON.stringify(summary,null,2));
    console.log('VITAFIT navigation latency baseline: OK');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});
