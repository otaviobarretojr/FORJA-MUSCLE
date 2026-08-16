const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'});
    const page=await context.newPage();
    page.setDefaultTimeout(7000);
    page.setDefaultNavigationTimeout(12000);
    const pageErrors=[];
    const badResponses=[];
    page.on('pageerror',err=>{pageErrors.push(String(err));console.log('[PAGEERROR]',String(err))});
    page.on('response',res=>{if(res.status()>=400)badResponses.push(`${res.status()} ${res.url()}`)});
    page.on('framenavigated',frame=>{if(frame===page.mainFrame())console.log('[NAV]',frame.url())});

    await page.addInitScript(()=>{
      localStorage.setItem('shape12.training.cycleStart',JSON.stringify('2026-06-01'));
      localStorage.setItem('shape12.e2e.persist',JSON.stringify('ok'));
    });

    console.log('[1/7] Abrindo VITAFIT e validando Home');
    await page.goto('http://127.0.0.1:4173/?e2e=vitafit350',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true');
    const home=await page.evaluate(()=>({
      title:document.title,
      brand:document.documentElement.dataset.brand,
      header:document.getElementById('vitaStableHeader')?.innerText||'',
      home:!!document.getElementById('vitaHomeDashboard'),
      today:!!document.getElementById('vitaTodayCard'),
      cta:document.getElementById('vitaPrimaryAction')?.innerText||'',
      workoutTitle:document.getElementById('vitaWorkoutTitle')?.innerText||'',
      navCount:document.querySelectorAll('.app-nav-btn').length,
      legacyVisible:[...document.querySelectorAll('.vita-legacy-hero')].some(el=>getComputedStyle(el).display!=='none')
    }));
    console.log('[HOME]',JSON.stringify(home));
    assert.match(home.title,/VITAFIT/);
    assert.equal(home.brand,'vitafit');
    assert.match(home.header,/VITAFIT/);
    assert.doesNotMatch(home.header,/FORJA MUSCLE/);
    assert.equal(home.home,true);
    assert.equal(home.today,true);
    assert.equal(home.navCount,5);
    assert.match(home.workoutTitle,/.+/);
    assert.match(home.cta,/(INICIAR|CONTINUAR|CONCLUÍDO|CARDIO)/);
    assert.equal(home.legacyVisible,false);

    console.log('[2/7] Testando navegação das cinco áreas');
    for(const id of ['treino','nutricao','evolucao','mais','hoje']){
      const nav=await page.evaluate(screen=>{
        window.setAppScreen(screen,{instant:true});
        const targetId=screen==='hoje'?'screen-hoje':screen;
        return {
          screen,
          targetExists:!!document.getElementById(targetId),
          targetActive:document.getElementById(targetId)?.classList.contains('active')||false,
          activeScreens:[...document.querySelectorAll('.app-screen.active')].map(el=>el.id),
          navActive:[...document.querySelectorAll('.app-nav-btn.active')].map(el=>el.dataset.screen)
        };
      },id);
      console.log('[SCREEN]',JSON.stringify(nav));
      assert.equal(nav.targetExists,true,`Tela ${id} não existe`);
      assert.equal(nav.targetActive,true,`Tela ${id} não ficou ativa`);
      assert.deepEqual(nav.activeScreens,[id==='hoje'?'screen-hoje':id]);
      assert.deepEqual(nav.navActive,[id]);
    }

    console.log('[3/7] Testando sessão, carga, reps, série e descanso');
    const workoutState=await page.evaluate(()=>({
      title:document.getElementById('vitaWorkoutTitle')?.innerText||'',
      cta:document.getElementById('vitaPrimaryAction')?.innerText||''
    }));
    assert.match(workoutState.title,/(Superior|Inferior|Full Body)/);
    if(!/CONCLUÍDO/.test(workoutState.cta)){
      const started=await page.evaluate(()=>{
        document.getElementById('vitaPrimaryAction').click();
        return document.getElementById('treino')?.classList.contains('active')||false;
      });
      assert.equal(started,true,'CTA não abriu a aba Treino');
      await page.waitForFunction(()=>!!document.querySelector('#trainingDayStage .exercise.guided-active .set-load')&&!!document.querySelector('#trainingDayStage .exercise.guided-active .set-reps')&&!!document.querySelector('#trainingDayStage .exercise.guided-active .set-done'));
      await page.evaluate(()=>{
        const active=document.querySelector('#trainingDayStage .exercise.guided-active');
        const load=active.querySelector('.set-load');
        const reps=active.querySelector('.set-reps');
        load.value='10';
        load.dispatchEvent(new Event('input',{bubbles:true}));
        reps.value='10';
        reps.dispatchEvent(new Event('input',{bubbles:true}));
        active.querySelector('.set-done').click();
      });
      await page.waitForFunction(()=>!!document.querySelector('#treino .rest-mini-card.rest-mini-active'));
      const saved=await page.evaluate(()=>({
        done:Object.keys(localStorage).some(k=>k.startsWith('shape12.day.')&&k.includes('.set.')&&k.endsWith('.done')&&localStorage.getItem(k)==='true'),
        load:Object.keys(localStorage).some(k=>k.startsWith('shape12.day.')&&k.includes('.set.')&&k.endsWith('.load')&&localStorage.getItem(k)==='"10"'),
        reps:Object.keys(localStorage).some(k=>k.startsWith('shape12.day.')&&k.includes('.set.')&&k.endsWith('.reps')&&localStorage.getItem(k)==='"10"'),
        rest:!!document.querySelector('#treino .rest-mini-card.rest-mini-active')
      }));
      assert.equal(saved.done,true,'Conclusão da série não foi persistida');
      assert.equal(saved.load,true,'Carga não foi persistida');
      assert.equal(saved.reps,true,'Repetições não foram persistidas');
      assert.equal(saved.rest,true,'Timer compacto não iniciou');
    }

    console.log('[4/7] Testando Programa somente consulta');
    const program=await page.evaluate(()=>{
      window.setAppScreen('evolucao',{instant:true});
      return {
        active:document.getElementById('evolucao')?.classList.contains('active')||false,
        roadmap:!!document.getElementById('programRoadmap'),
        stages:document.querySelectorAll('.program-stage').length,
        label:[...document.querySelectorAll('.app-nav-btn')].find(b=>b.dataset.screen==='evolucao')?.innerText||''
      };
    });
    assert.equal(program.active,true);
    assert.equal(program.roadmap,true);
    assert.equal(program.stages,3);
    assert.match(program.label,/Programa/);

    console.log('[5/7] Testando Nutrição');
    const nutrition=await page.evaluate(()=>{
      window.setAppScreen('nutricao',{instant:true});
      return {
        active:document.getElementById('nutricao')?.classList.contains('active')||false,
        meals:!!document.getElementById('meals'),
        mealChecks:document.querySelectorAll('.meal-check').length,
        water:!!document.getElementById('waterNow')
      };
    });
    assert.equal(nutrition.active,true);
    assert.equal(nutrition.meals,true);
    assert.equal(nutrition.mealChecks>0,true);
    assert.equal(nutrition.water,true);

    console.log('[6/7] Testando Mais, identidade e configurações');
    const more=await page.evaluate(()=>{
      window.setAppScreen('mais',{instant:true});
      return {
        active:document.getElementById('mais')?.classList.contains('active')||false,
        brand:document.getElementById('vitaMoreBrand')?.innerText||'',
        settings:document.querySelectorAll('.settings-actions').length,
        exportFn:typeof window.exportData==='function'
      };
    });
    assert.equal(more.active,true);
    assert.match(more.brand,/VITAFIT/);
    assert.equal(more.settings>0,true);
    assert.equal(more.exportFn,true);

    console.log('[7/7] Testando persistência após reload real');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true');
    const reloaded=await page.evaluate(()=>({
      persisted:JSON.parse(localStorage.getItem('shape12.e2e.persist')),
      brand:document.getElementById('vitaStableHeader')?.innerText||'',
      home:!!document.getElementById('vitaHomeDashboard'),
      navCount:document.querySelectorAll('.app-nav-btn').length
    }));
    assert.equal(reloaded.persisted,'ok');
    assert.match(reloaded.brand,/VITAFIT/);
    assert.equal(reloaded.home,true);
    assert.equal(reloaded.navCount,5);
    assert.deepEqual(pageErrors,[],`Erros JS no navegador: ${pageErrors.join(' | ')}`);
    assert.deepEqual(badResponses,[],`Recursos HTTP com erro: ${badResponses.join(' | ')}`);
    console.log('VITAFIT Chromium audit: OK');
  } finally {
    if(browser)await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});
