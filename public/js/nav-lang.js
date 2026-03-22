// nav-lang.js
// Gere a tradução dos links de navegação e o seletor de idioma em todas as páginas.
(function () {
  // Traduções dos links de navegação
  const NAV = {
    en: { Dashboard: 'Dashboard', Plan: 'Plan', Track: 'Track', Meals: 'Meals', Progress: 'Progress', Coach: 'Coach' },
    pt: { Dashboard: 'Dashboard', Plan: 'Plano', Track: 'Registo', Meals: 'Refeições', Progress: 'Progresso', Coach: 'Coach' }
  };

  const locale = localStorage.getItem('locale') || 'en';

  // Aplica as traduções dos links de navegação
  function applyNavTranslations(lang) {
    const t = NAV[lang] || NAV.en;
    document.querySelectorAll('.nav-links a[data-nav]').forEach(function(a) {
      const key = a.getAttribute('data-nav');
      if (t[key] !== undefined) a.textContent = t[key];
    });
    const el = document.getElementById('currentLang');
    if (el) el.textContent = lang.toUpperCase();
  }

  // Abre/fecha o dropdown de idioma
  window.toggleLanguageDropdown = function () {
    const dd = document.getElementById('languageDropdown');
    if (dd) dd.classList.toggle('hidden');
  };

  // Muda o idioma, guarda no localStorage e recarrega a página
  window.setLanguage = function (lang) {
    localStorage.setItem('locale', lang);
    window.location.reload();
  };

  // Aplica traduções quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function () {
    applyNavTranslations(locale);
  });

  // Fecha o dropdown ao clicar fora dele
  document.addEventListener('click', function (e) {
    const sel = document.getElementById('languageSelector');
    const dd = document.getElementById('languageDropdown');
    if (sel && dd && !sel.contains(e.target)) dd.classList.add('hidden');
  });
})();
