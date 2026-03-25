// weight-progress-bar.js
// Este ficheiro cria e apresenta uma barra de progresso de peso fixada na base do ecrã.
// A barra mostra visualmente quanto progresso o utilizador já fez em direção ao seu
// objetivo de peso, comparando o peso inicial, o peso atual e o peso objetivo.
// É inserida diretamente no DOM como um elemento HTML gerado dinamicamente.

(function () {
  // IIFE para encapsular todo o código e evitar conflitos com variáveis globais.

  // Função principal que inicializa e constrói a barra de progresso.
  function init() {
    // Lê o plano de fitness guardado no localStorage.
    // O plano contém o peso inicial e o peso objetivo do utilizador.
    const plan = JSON.parse(localStorage.getItem('fitnessPlan') || 'null');

    // Se não existir nenhum plano configurado, não há dados para mostrar — termina.
    if (!plan) return; // Ainda sem plano configurado

    // Extrai o peso inicial (quando o utilizador criou o plano) e o peso objetivo.
    const startWeight = plan.weight;
    const goalWeight = plan.targetWeight;

    // Validações: se faltar algum dos pesos, ou se já estiver no objetivo, não mostra a barra.
    // Evita divisões por zero no cálculo da percentagem.
    if (!startWeight || !goalWeight || startWeight === goalWeight) return;

    // Lê todos os registos de acompanhamento do localStorage.
    const logs = JSON.parse(localStorage.getItem('trackingLogs') || '[]');

    // Filtra apenas os registos que contêm um valor de peso registado.
    const logsWithWeight = logs.filter(l => l.weight != null);

    // Se não houver registos de peso, usa o peso inicial do plano como peso atual (0% de progresso).
    // Isto garante que a barra aparece desde o primeiro momento, mesmo sem check-ins feitos.
    let currentWeight;
    if (logsWithWeight.length === 0) {
      currentWeight = startWeight;
    } else {
      logsWithWeight.sort((a, b) => new Date(b.date) - new Date(a.date));
      currentWeight = logsWithWeight[0].weight;
    }

    // --- CÁLCULO DA PERCENTAGEM DE PROGRESSO ---
    // A lógica funciona tanto para perda de peso como para ganho de peso.

    // 'totalDelta' é a diferença total que precisa de ser percorrida (positivo para perda, negativo para ganho).
    const totalDelta = startWeight - goalWeight;

    // 'achievedDelta' é a diferença já percorrida desde o início.
    const achievedDelta = startWeight - currentWeight;

    // Calcula a percentagem de progresso e arredonda para número inteiro.
    let pct = Math.round((achievedDelta / totalDelta) * 100);

    // Garante que a percentagem está sempre entre 0% e 100%, independentemente de flutuações.
    pct = Math.max(0, Math.min(100, pct));

    // Determina se o objetivo é perder ou ganhar peso.
    const losing = goalWeight < startWeight;

    // Verifica se o utilizador já atingiu ou ultrapassou o seu objetivo de peso.
    const isOverGoal = losing ? currentWeight <= goalWeight : currentWeight >= goalWeight;


    // --- CONSTRUÇÃO DO ELEMENTO HTML DA BARRA ---

    // Cria um novo elemento <div> que será o contentor da barra de progresso.
    const bar = document.createElement('div');

    // Define o ID para permitir identificação/estilização posterior.
    bar.id = 'global-weight-bar';

    // Aplica estilos inline para posicionar a barra de forma fixa na parte inferior do ecrã.
    // 'position:fixed' mantém-na visível independentemente do scroll da página.
    // 'z-index:9999' garante que fica acima de todos os outros elementos da página.
    // 'backdrop-filter:blur' cria um efeito de vidro desfocado no fundo.
    bar.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:9999',
      'background:rgba(8,8,16,0.96)', 'backdrop-filter:blur(16px)',
      'border-top:1px solid rgba(255,255,255,0.08)',
      'padding:10px 24px 14px', 'font-family:Montserrat,sans-serif'
    ].join(';');

    // Define a cor de preenchimento da barra consoante o estado de progresso:
    // - Verde se o objetivo já foi atingido ou ultrapassado.
    // - Gradiente roxo/rosa se ainda estiver em progresso.
    const fillColor = isOverGoal
      ? 'linear-gradient(to right,#22c55e,#16a34a)'   // Verde: objetivo atingido
      : 'linear-gradient(to right,#a855f7,#ec4899)';  // Roxo/Rosa: em progresso

    // Calcula quantos kg faltam para atingir o objetivo (sempre positivo com Math.abs).
    const remaining = Math.abs(currentWeight - goalWeight).toFixed(1);

    // Traduções consoante o idioma guardado no localStorage
    const isPt = (localStorage.getItem('locale') || 'en') === 'pt';
    const labels = isPt
      ? { goal: 'OBJETIVO DE PESO', toLose: 'a perder', toGain: 'a ganhar', start: 'Início', complete: '% concluído', goalLabel: 'Objetivo' }
      : { goal: 'WEIGHT GOAL',      toLose: 'to lose',  toGain: 'to gain',  start: 'Start',  complete: '% complete',  goalLabel: 'Goal' };

    const direction = losing ? labels.toLose : labels.toGain;

    bar.innerHTML = `
      <div style="max-width:900px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="color:#a855f7;font-size:12px;font-weight:700;letter-spacing:0.05em;">${labels.goal}</span>
          <span style="color:rgba(255,255,255,0.5);font-size:11px;">${remaining} kg ${direction}</span>
          <span style="color:white;font-size:12px;font-weight:700;">${currentWeight} kg &rarr; ${goalWeight} kg</span>
        </div>
        <div style="width:100%;height:7px;background:rgba(255,255,255,0.07);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;border-radius:999px;background:${fillColor};transition:width 0.5s ease;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">
          <span style="color:rgba(255,255,255,0.3);font-size:10px;">${labels.start} ${startWeight} kg</span>
          <span style="color:#a855f7;font-size:10px;font-weight:700;">${pct}${labels.complete}</span>
          <span style="color:rgba(255,255,255,0.3);font-size:10px;">${labels.goalLabel} ${goalWeight} kg</span>
        </div>
      </div>`;

    // Adiciona a barra de progresso ao final do <body> da página.
    // Por estar em 'position:fixed', aparecerá na base do ecrã independentemente da posição no DOM.
    document.body.appendChild(bar);
  }

  // --- INICIALIZAÇÃO SEGURA ---
  // Verifica se o DOM já está completamente carregado antes de executar a função init().
  // 'loading' significa que o HTML ainda está a ser processado pelo browser.
  if (document.readyState === 'loading') {
    // Se o DOM ainda não estiver pronto, aguarda pelo evento 'DOMContentLoaded'.
    // Este evento dispara quando todo o HTML foi processado, mesmo que os recursos
    // externos (imagens, folhas de estilo) ainda não estejam carregados.
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Se o DOM já estiver pronto (script carregado após o HTML), executa imediatamente.
    init();
  }
})();
