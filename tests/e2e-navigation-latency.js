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

    const ids=['treino','nutricao','mais','hoje'];
    assert.equal(await page.locator('.app-nav-btn').count(),4);
    assert.equal(await page.locator('.app-nav-btn[data-screen="evolucao"]').count(),0);
    const results=[];
    for(let round=0;round<2;round++){
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
        await new Promise(r=>setTimeout(r,20));
        const state=await page.evaluate(id=>{const btn=document.querySelector(`.app-nav-btn[data-screen="${id}"]`);const target=document.getElementById(id==='hoje'?'screen-hoje':id);return {active:target?.classList.contains('active')||false,navActive:btn?.classList.contains('active')||false}},id);
        const settledWall=Date.now()-wallStart;
        results.push({id,handlerMs:+click.handlerMs.toFixed(2),handlerWall,settledWall,...state});
        assert.equal(state.active,true);assert.equal(state.navActive,true);
      }
    }
    for(const id of ids){
      const rows=results.filter(r=>r.id===id);
      assert.ok(Math.max(...rows.map(r=>r.handlerMs))<BUDGET.handlerMs);
      assert.ok(Math.max(...rows.map(r=>r.handlerWall))<BUDGET.handlerWallMs);
      assert.ok(Math.max(...rows.map(r=>r.settledWall))<BUDGET.settledWallMs);
    }
    console.log('VITAFIT 3.6.4 navigation latency audit: OK');
  } finally {await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});
