// auth-check.js
// Este ficheiro é responsável por proteger páginas que exigem autenticação.
// Deve ser incluído no início de qualquer página reservada a utilizadores autenticados.
// Se o utilizador não estiver autenticado, é redirecionado para a página de login.

(function () {
  // Utilizamos uma IIFE (Immediately Invoked Function Expression) para encapsular
  // o código e evitar conflitos com variáveis globais de outros scripts.

  // Tenta ler o utilizador atual a partir do localStorage.
  // O localStorage guarda dados no browser, persistentes entre sessões.
  // Se não existir nenhum valor para 'currentUser', usa 'null' como valor por omissão.
  // JSON.parse converte a string guardada de volta para um objeto JavaScript.
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

  // Verifica se o utilizador não está autenticado (ou seja, se 'user' é null).
  // Se não houver sessão ativa, redireciona o utilizador para a página de login.
  // Isto impede o acesso não autorizado a páginas protegidas.
  if (!user) {
    window.location.href = '/login.html';
  }
})();
