const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE='http://127.0.0.1:4173/';
const BUDGET={handlerMs:16,handlerWallMs:80,settledWallMs:180};

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true,isMobile:true});
    const page=await context.newPage();
    await page.goto(`${BASE}?e2e=navigation-latency-v365`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true',null,{timeout:20000});
    assert.equal(await page.evaluate(()=>window.setAppScreen?.__vitafitFast===true),true,'camada de navegação rápida não está ativa');
    assert.equal(await page.locator('.app-nav-btn').count(),3,'navegação deve ter apenas 3 abas');

    const ids=['treino','mais','hoje'];
    const results=[];
    for(let round=0;round<3;round++){
      for(const id of ids){
        const wallStart=Date.now();
        const click=await page.evaluate(id=>{
          const btn=document.querySelector(`.app-nav-btn[data-screen="${id}"]`);
          const target=document.getElementById(id==='hoje'?'screen-hoje':id);
          if(!btn||!target)return {id,error:'missing'};
          const start=performance.now();btn.click();
          return {id,handlerMs:performance.now()-start,active:target.classList.contains('active'),navActive:btn.classList.contains('active')};
        },id);
        const handlerWall=Date.now()-wallStart;
        assert.equal(click.active,true,`${id} não ativou a tela no handler`);
        assert.equal(click.navActive,true,`${id} não ativou o botão no handler`);
        await new Promise(r=>setTimeout(r,16));
        const state=await page.evaluate(id=>{const btn=document.querySelector(`.app-nav-btn[data-screen="${id}"]`);const target=document.getElementById(id==='hoje'?'screen-hoje':id);return {active:target?.classList.contains('active')||false,navActive:btn?.classList.contains('active')||false}},id);
        const settledWall=Date.now()-wallStart;
        results.push({id,handlerMs:+click.handlerMs.toFixed(2),handlerWall,settledWall,...state});
        assert.equal(state.active,true,`${id} perdeu a tela ativa`);assert.equal(state.navActive,true,`${id} perdeu o botão ativo`);
      }
    }
    for(const id of ids){
      const rows=results.filter(r=>r.id===id);
      const max={handler:Math.max(...rows.map(r=>r.handlerMs)),wall:Math.max(...rows.map(r=>r.handlerWall)),settled:Math.max(...rows.map(r=>r.settledWall))};
      assert.ok(max.handler<BUDGET.handlerMs,`${id}: handler ${max.handler}ms excedeu ${BUDGET.handlerMs}ms`);
      assert.ok(max.wall<BUDGET.handlerWallMs,`${id}: resposta ${max.wall}ms excedeu ${BUDGET.handlerWallMs}ms`);
      assert.ok(max.settled<BUDGET.settledWallMs,`${id}: assentamento ${max.settled}ms excedeu ${BUDGET.settledWallMs}ms`);
    }
    console.log('NAVIGATION_BUDGET '+JSON.stringify(BUDGET));
    console.log('NAVIGATION_RESULTS '+JSON.stringify(results));
    console.log('VITAFIT 3.6.5 navigation latency audit: OK');
  } finally {await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});
