// FORJA MUSCLE v3.3.4 — dicas dinâmicas no topo do exercício, preservando shape12.*
(function(){
  const coaching={
    'seg-hip':{how:['Apoie a parte alta das costas e mantenha o queixo levemente recolhido.','Suba o quadril contraindo os glúteos e desça de forma controlada.'],avoid:['Não hiperestenda a lombar no topo.','Não deixe os joelhos fecharem durante a subida.']},
    'seg-leg':{how:['Mantenha lombar e quadril apoiados no encosto.','Desça com controle e empurre mantendo os joelhos alinhados aos pés.'],avoid:['Não retire o quadril do banco para ganhar amplitude.','Não trave os joelhos com força no final do movimento.']},
    'seg-bulg':{how:['Mantenha o pé da frente inteiro apoiado e o tronco estável.','Desça controlando até uma amplitude confortável e suba pelo pé da frente.'],avoid:['Não deixe o joelho cair para dentro.','Não use a perna de trás para impulsionar o movimento.']},
    'seg-ext':{how:['Alinhe o eixo da máquina com o joelho e mantenha o quadril apoiado.','Estenda os joelhos com controle e retorne sem soltar o peso.'],avoid:['Não dê impulso com o tronco.','Não use carga que obrigue a perder a amplitude ou a posição.']},
    'seg-abd':{how:['Mantenha costas e quadril estáveis no banco.','Abra as pernas de forma controlada e segure brevemente na contração.'],avoid:['Não bata as placas da máquina no retorno.','Não incline o tronco para criar impulso.']},
    'seg-pant':{how:['Use uma amplitude confortável do tornozelo e suba até contrair a panturrilha.','Faça uma descida lenta antes da próxima repetição.'],avoid:['Não faça repetições curtas e rápidas.','Não use quique no fundo do movimento.']},
    'qua-pux':{how:['Mantenha peito aberto e tronco estável; conduza a puxada pelos cotovelos.','Desça a pegada em direção à parte alta do peito e controle a volta.'],avoid:['Não balance o tronco para ganhar impulso.','Não encolha os ombros nem solte o peso na subida.']},
    'qua-rem':{how:['Mantenha coluna neutra e peito aberto durante toda a série.','Puxe os cotovelos para trás e controle a extensão dos braços.'],avoid:['Não arredonde os ombros no retorno.','Não transforme a remada em balanço do tronco.']},
    'qua-des':{how:['Ajuste o banco para manter o tronco bem apoiado.','Empurre mantendo punhos e antebraços alinhados.'],avoid:['Não arqueie excessivamente a lombar.','Não desça além da amplitude em que o ombro permanece confortável.']},
    'qua-lat':{how:['Eleve os braços com cotovelos levemente flexionados e movimento controlado.','Pense em afastar os braços do corpo sem encolher os ombros.'],avoid:['Não balance o corpo para levantar a carga.','Não transforme o movimento em um encolhimento de trapézio.']},
    'qua-chest':{how:['Ajuste o banco para as pegadas ficarem na linha do peito.','Mantenha as escápulas apoiadas e controle a volta das alavancas.'],avoid:['Não projete os ombros para frente no final.','Não deixe o peso voltar de uma vez.']},
    'qua-bic':{how:['Mantenha os cotovelos estáveis e flexione sem mover o ombro.','Controle a descida até quase estender completamente o braço.'],avoid:['Não balance o tronco para lançar a carga.','Não encurte a amplitude só para usar mais peso.']},
    'qua-tri':{how:['Mantenha os cotovelos próximos ao corpo e o tronco firme.','Estenda os braços até contrair o tríceps e retorne devagar.'],avoid:['Não abra os cotovelos durante a repetição.','Não use o peso do corpo para empurrar a polia.']},
    'sex-rdl':{how:['Leve o quadril para trás mantendo a coluna neutra.','Desça a carga próxima das pernas até sentir alongamento dos posteriores.'],avoid:['Não arredonde a lombar para buscar mais amplitude.','Não transforme o movimento em agachamento dobrando demais os joelhos.']},
    'sex-hip':{how:['Apoie a parte alta das costas e mantenha os pés firmes.','Suba o quadril contraindo os glúteos e controle a descida.'],avoid:['Não hiperestenda a lombar no topo.','Não empurre apenas pela ponta dos pés.']},
    'sex-flex':{how:['Ajuste o apoio para o equipamento acompanhar corretamente a perna.','Flexione os joelhos com controle e retorne devagar.'],avoid:['Não levante o quadril do banco.','Não solte a carga de forma brusca na volta.']},
    'sex-step':{how:['Apoie todo o pé na plataforma antes de iniciar a subida.','Suba empurrando pela perna que está no step e desça com controle.'],avoid:['Não impulsione excessivamente com a perna que está no chão.','Não deixe o joelho da perna de apoio cair para dentro.']},
    'sex-abd':{how:['Mantenha o tronco estável e abra as pernas sem impulso.','Segure a contração por um instante e controle o retorno.'],avoid:['Não deixe as placas baterem no final.','Não use balanço do corpo para aumentar a amplitude.']},
    'sex-pant':{how:['Mantenha o apoio firme e suba o calcanhar até contrair a panturrilha.','Desça lentamente até uma amplitude confortável.'],avoid:['Não faça repetições no embalo.','Não reduza a amplitude apenas para aumentar a carga.']},
    'dom-pux':{how:['Mantenha peito aberto e tronco estável; conduza a puxada pelos cotovelos.','Puxe a pegada neutra para a parte alta do peito e controle a volta.'],avoid:['Não jogue o corpo para trás para completar a repetição.','Não encolha os ombros nem solte a carga na subida.']},
    'dom-rem':{how:['Mantenha o tronco firme e o ombro longe da orelha.','Puxe o cotovelo em direção ao quadril e retorne controlando.'],avoid:['Não gire o tronco para aumentar a amplitude.','Não puxe apenas com a mão deixando o cotovelo parado.']},
    'dom-chest':{how:['Ajuste o banco para a linha de empurrar ficar na altura do peito.','Mantenha escápulas apoiadas e controle a fase de retorno.'],avoid:['Não deixe os ombros avançarem no final.','Não bata as placas nem solte a carga na volta.']},
    'dom-des':{how:['Mantenha tronco e cabeça apoiados durante o movimento.','Empurre em uma trajetória confortável mantendo antebraços alinhados.'],avoid:['Não compense arqueando a lombar.','Não force uma amplitude que cause desconforto no ombro.']},
    'dom-lat':{how:['Eleve os braços com controle e cotovelos suavemente flexionados.','Pare antes de precisar encolher os ombros para continuar subindo.'],avoid:['Não use balanço do tronco.','Não escolha uma carga que tire a tensão do deltoide.']},
    'dom-post':{how:['Mantenha peito apoiado quando houver suporte e coluna neutra.','Abra os braços conduzindo os cotovelos e controle o retorno.'],avoid:['Não encolha os ombros durante a abertura.','Não use impulso para aumentar a amplitude.']},
    'dom-arm':{how:['Mantenha os cotovelos estáveis em cada movimento de braço.','Use uma carga que permita controlar tanto a subida quanto a descida.'],avoid:['Não balance o tronco para completar repetições.','Não acelere a fase de retorno só para terminar a série.']}
  };

  const fallback={
    how:['Ajuste o equipamento antes de iniciar e mantenha postura estável.','Faça a repetição com amplitude confortável e controle nas duas fases.'],
    avoid:['Não use impulso para mover a carga.','Não aumente o peso se isso fizer a execução perder o controle.']
  };

  function cleanText(value){
    const box=document.createElement('div');box.innerHTML=String(value||'');
    return (box.textContent||box.innerText||'Exercício').replace(/\s+/g,' ').trim()
  }

  function suppressLegacyTrainingCopy(){
    const training=document.getElementById('treino');if(!training)return;
    const intro=training.querySelector(':scope > .screen-intro');
    if(intro){intro.classList.add('forja-v334-hidden');intro.setAttribute('aria-hidden','true')}
    const week=[...training.querySelectorAll('.section-title')].find(block=>block.querySelector('h2')?.textContent.trim()==='Semana de treino');
    if(week){week.classList.add('forja-v334-hidden');week.setAttribute('aria-hidden','true')}
  }

  function ensureCoachCard(stage){
    let card=document.getElementById('exerciseCoachCard');
    if(card)return card;
    card=document.createElement('section');
    card.id='exerciseCoachCard';card.className='exercise-coach-card';
    stage.insertBefore(card,stage.firstElementChild);
    return card
  }

  function renderExerciseCoach(scroll=false){
    suppressLegacyTrainingCopy();
    const stage=document.getElementById('trainingDayStage');if(!stage)return;
    const card=ensureCoachCard(stage);
    const active=stage.querySelector('.exercise[data-ex].guided-active');
    if(!active){card.hidden=true;return}

    const key=active.dataset.ex,info=coaching[key]||fallback;
    const name=cleanText(active._v13meta?.nameHTML||active.querySelector('.name')?.textContent||key);
    card.hidden=false;
    card.innerHTML=`
      <div class="exercise-coach-head">
        <div><span class="eyebrow">EXECUÇÃO DO EXERCÍCIO</span><h2>Dicas do movimento</h2></div>
        <span class="exercise-coach-name">${name}</span>
      </div>
      <div class="exercise-coach-grid">
        <div class="exercise-coach-panel coach-do">
          <b><span>✓</span> Como fazer</b>
          <ul>${info.how.map(item=>`<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="exercise-coach-panel coach-avoid">
          <b><span>!</span> Evite isso</b>
          <ul>${info.avoid.map(item=>`<li>${item}</li>`).join('')}</ul>
        </div>
      </div>`;
    if(scroll)card.scrollIntoView({behavior:'smooth',block:'start'})
  }

  const previousSync=window.syncGuidedTraining;
  if(typeof previousSync==='function'){
    window.syncGuidedTraining=function(scroll=false){
      previousSync(scroll);
      requestAnimationFrame(()=>renderExerciseCoach(scroll))
    }
  }

  suppressLegacyTrainingCopy();
  requestAnimationFrame(()=>renderExerciseCoach(false));
})();
