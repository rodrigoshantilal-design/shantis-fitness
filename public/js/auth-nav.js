// auth-nav.js
// Este ficheiro gere a barra de navegação consoante o estado de autenticação do utilizador.
// Se o utilizador estiver autenticado, substitui o botão de login pelo nome do utilizador
// e por um botão de logout. Caso contrário, mantém o botão de login original.

(function () {
  // IIFE para encapsular o código e não poluir o espaço de nomes global.

  // Recupera o utilizador autenticado do localStorage.
  // JSON.parse transforma a string armazenada de volta num objeto.
  // Se não existir, o valor será null.
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

  // Procura o botão de login na barra de navegação através do seu seletor CSS.
  const btn = document.querySelector('.nav-login-btn');

  // Se o botão de login não existir na página, não há nada a fazer — termina aqui.
  if (!btn) return;

  // Se existir um utilizador autenticado, personaliza a navegação.
  if (user) {
    // Determina o nome a mostrar: usa o campo 'name' se existir,
    // caso contrário extrai a parte antes do '@' do endereço de email.
    const name = user.name || user.email.split('@')[0];

    // Substitui completamente o botão de login (outerHTML) por um bloco
    // que mostra o nome do utilizador e um botão de logout.
    // O estilo inline posiciona o bloco no canto superior esquerdo de forma fixa (fixed).
    btn.outerHTML = `
      <div style="position:fixed;top:1rem;left:1.5rem;z-index:101;display:flex;align-items:center;gap:8px;">
        <span style="color:white;font-size:13px;font-weight:700;background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.4);padding:6px 12px;border-radius:8px;">${name}</span>
        <button onclick="logout()" style="color:#9ca3af;font-size:12px;font-weight:700;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:8px;cursor:pointer;">Logout</button>
      </div>`;
  }

  // Define a função 'logout' no objeto global (window) para que possa ser chamada
  // diretamente no atributo onclick do botão gerado acima.
  window.logout = function () {
    // Remove os dados da sessão do utilizador do localStorage,
    // efetivamente encerrando a sessão.
    localStorage.removeItem('currentUser');

    // Redireciona o utilizador para a página de login após o logout.
    window.location.href = '/login.html';
  };
})();
