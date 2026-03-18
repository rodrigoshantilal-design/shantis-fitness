(function () {
  function init() {
    const plan = JSON.parse(localStorage.getItem('fitnessPlan') || 'null');
    if (!plan) return; // No plan set up yet

    const startWeight = plan.weight;
    const goalWeight = plan.targetWeight;
    if (!startWeight || !goalWeight || startWeight === goalWeight) return;

    // Get most recent logged weight from tracking logs
    const logs = JSON.parse(localStorage.getItem('trackingLogs') || '[]');
    const logsWithWeight = logs.filter(l => l.weight != null);
    if (logsWithWeight.length === 0) return;

    logsWithWeight.sort((a, b) => new Date(b.date) - new Date(a.date));
    const currentWeight = logsWithWeight[0].weight;

    // Calculate progress (works for both weight loss and weight gain)
    const totalDelta = startWeight - goalWeight;
    const achievedDelta = startWeight - currentWeight;
    let pct = Math.round((achievedDelta / totalDelta) * 100);
    pct = Math.max(0, Math.min(100, pct));

    const losing = goalWeight < startWeight;
    const isOverGoal = losing ? currentWeight <= goalWeight : currentWeight >= goalWeight;

    // Build bar
    const bar = document.createElement('div');
    bar.id = 'global-weight-bar';
    bar.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:9999',
      'background:rgba(8,8,16,0.96)', 'backdrop-filter:blur(16px)',
      'border-top:1px solid rgba(255,255,255,0.08)',
      'padding:10px 24px 14px', 'font-family:Montserrat,sans-serif'
    ].join(';');

    const fillColor = isOverGoal
      ? 'linear-gradient(to right,#22c55e,#16a34a)'
      : 'linear-gradient(to right,#a855f7,#ec4899)';

    const remaining = Math.abs(currentWeight - goalWeight).toFixed(1);
    const direction = losing ? 'to lose' : 'to gain';

    bar.innerHTML = `
      <div style="max-width:900px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="color:#a855f7;font-size:12px;font-weight:700;letter-spacing:0.05em;">WEIGHT GOAL</span>
          <span style="color:rgba(255,255,255,0.5);font-size:11px;">${remaining} kg ${direction}</span>
          <span style="color:white;font-size:12px;font-weight:700;">${currentWeight} kg &rarr; ${goalWeight} kg</span>
        </div>
        <div style="width:100%;height:7px;background:rgba(255,255,255,0.07);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;border-radius:999px;background:${fillColor};transition:width 0.5s ease;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">
          <span style="color:rgba(255,255,255,0.3);font-size:10px;">Start ${startWeight} kg</span>
          <span style="color:#a855f7;font-size:10px;font-weight:700;">${pct}% complete</span>
          <span style="color:rgba(255,255,255,0.3);font-size:10px;">Goal ${goalWeight} kg</span>
        </div>
      </div>`;

    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
