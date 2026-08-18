const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE='http://127.0.0.1:4173/';
const BUDGET={handlerMs:20,handlerWallMs:100,settledWallMs:250};

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true,isMobile:true});
    const page=await context.newPage();
    await page.goto(`${BASE}?e2e=navigation-latency`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true',null,{timeout:20000});
    const fastNav=await page.evaluate(()=>window.setAppScreen?.__vitafitFast===true);
    assert.equal(fastNav,true,'camada de navegação rápida não está ativa');

    const ids=['treino','nutricao','evolucao','mais','hoje'];
    const results=[];
    for(let round=0;round<2;round++){
      for(const id of ids){
        const wallStart=Date.now();
        const click=await page.evaluate(id=>{
          const btn=document.querySelector(`.app-nav-btn[data-screen="${id}"]`);
          const target=document.getElementById(id==='hoje'?'screen-hoje':id);
          if(!btn||!target)return {id,error:'missing'};
          const start=performance.now();
          btn.click();
          return {
            id,
            handlerMs:performance.now()-start,
            active:target.classList.contains('active'),
            navActive:btn.classList.contains('active')
          };
        },id);
        const handlerWall=Date.now()-wallStart;
        assert.equal(click.active,true,`${id} não ativou a tela no handler`);
        assert.equal(click.navActive,true,`${id} não ativou o botão no handler`);
        await new Promise(r=>setTimeout(r,20));
        const state=await page.evaluate(id=>{
          const btn=document.querySelector(`.app-nav-btn[data-screen="${id}"]`);
          const target=document.getElementById(id==='hoje'?'screen-hoje':id);
          return {active:target?.classList.contains('active')||false,navActive:btn?.classList.contains('active')||false};
        },id);
        const settledWall=Date.now()-wallStart;
        const result={id,handlerMs:+click.handlerMs.toFixed(2),handlerWall,settledWall,...state};
        results.push(result);
        console.log(JSON.stringify(result));
        assert.equal(state.active,true,`${id} perdeu a tela ativa`);
        assert.equal(state.navActive,true,`${id} perdeu o botão ativo`);
      }
    }

    const summary={};
    for(const id of ids){
      const rows=results.filter(r=>r.id===id);
      summary[id]={
        handlerMax:Math.max(...rows.map(r=>r.handlerMs)),
        handlerWallMax:Math.max(...rows.map(r=>r.handlerWall)),
        settledWallMax:Math.max(...rows.map(r=>r.settledWall))
      };
      assert.ok(summary[id].handlerMax<BUDGET.handlerMs,`${id}: handler ${summary[id].handlerMax}ms excedeu ${BUDGET.handlerMs}ms`);
      assert.ok(summary[id].handlerWallMax<BUDGET.handlerWallMs,`${id}: resposta do handler ${summary[id].handlerWallMax}ms excedeu ${BUDGET.handlerWallMs}ms`);
      assert.ok(summary[id].settledWallMax<BUDGET.settledWallMs,`${id}: tela levou ${summary[id].settledWallMax}ms, limite ${BUDGET.settledWallMs}ms`);
    }
    console.log('NAVIGATION_BUDGET '+JSON.stringify(BUDGET));
    console.log('NAVIGATION_SUMMARY '+JSON.stringify(summary));
    console.log('VITAFIT navigation latency audit: OK');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});
