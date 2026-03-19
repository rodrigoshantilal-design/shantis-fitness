// storage.js
// Este ficheiro centraliza toda a gestão de dados da aplicação.
// Funciona como uma camada de abstração entre a lógica da aplicação e o armazenamento,
// suportando tanto o localStorage (armazenamento local no browser) como a sincronização
// com uma base de dados remota através de chamadas à API do servidor.

// Gestão de armazenamento — suporta localStorage e sincronização com base de dados

// URL base da API. Valor vazio indica que os pedidos são feitos para a mesma origem (same-origin).
// Em produção, este valor poderia ser alterado para um domínio externo.
const API_URL = '';  // Vazio para pedidos na mesma origem


// --- GESTÃO DA SESSÃO DO UTILIZADOR ---

// Obtém o utilizador atualmente autenticado a partir do localStorage.
// Devolve o objeto do utilizador se existir, ou null caso contrário.
export function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  // Se existir um valor guardado, converte-o de string JSON para objeto; caso contrário devolve null.
  return user ? JSON.parse(user) : null;
}

// Guarda ou remove os dados do utilizador autenticado no localStorage.
// Se 'user' for um objeto válido, guarda-o; se for null/undefined, remove a entrada.
export function setCurrentUser(user) {
  if (user) {
    // Serializa o objeto para string JSON antes de guardar no localStorage.
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    // Remove a sessão quando o utilizador faz logout ou a sessão é invalidada.
    localStorage.removeItem('currentUser');
  }
}

// Verifica se existe um utilizador autenticado.
// Devolve true se houver sessão ativa, false caso contrário.
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Termina a sessão do utilizador removendo os seus dados do localStorage.
export function logout() {
  localStorage.removeItem('currentUser');
}


// --- SINCRONIZAÇÃO COM O SERVIDOR ---

// Função assíncrona interna (não exportada) que envia dados para o servidor.
// É chamada automaticamente sempre que dados são guardados localmente,
// garantindo que o servidor fica sempre atualizado.
// Recebe o tipo de dados ('dataType') e os dados a enviar ('data').
async function syncToServer(dataType, data) {
  // Verifica se existe um utilizador autenticado com ID válido antes de tentar sincronizar.
  // Sem ID, não é possível associar os dados a um utilizador no servidor.
  const user = getCurrentUser();
  if (!user || !user.id) return;

  try {
    // Envia um pedido HTTP POST para o endpoint de gravação da API.
    // O corpo do pedido inclui o ID do utilizador e os dados a guardar,
    // usando a sintaxe de propriedade computada '[dataType]' para definir a chave dinamicamente.
    await fetch(`${API_URL}/api/user/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        [dataType]: data // Chave dinâmica: ex. { fitnessPlan: {...} }
      })
    });
  } catch (error) {
    // Se a sincronização falhar (ex: sem ligação à internet), regista o erro na consola.
    // A aplicação continua a funcionar com os dados locais — a sincronização é um extra.
    console.error('Failed to sync to server:', error);
  }
}


// --- PLANO DE FITNESS ---

// Guarda o plano de fitness do utilizador no localStorage e sincroniza com o servidor.
export function savePlan(plan) {
  localStorage.setItem('fitnessPlan', JSON.stringify(plan));
  syncToServer('fitnessPlan', plan); // Sincronização assíncrona em segundo plano
}

// Recupera o plano de fitness guardado.
// Devolve o objeto do plano ou null se ainda não existir nenhum plano.
export function getPlan() {
  const plan = localStorage.getItem('fitnessPlan');
  return plan ? JSON.parse(plan) : null;
}

// Verifica se o utilizador já completou o processo de configuração inicial (onboarding).
// A existência de um plano de fitness indica que o onboarding foi concluído.
export function hasCompletedOnboarding() {
  return localStorage.getItem('fitnessPlan') !== null;
}


// --- REGISTOS DE ACOMPANHAMENTO (TRACKING LOGS) ---

// Adiciona um novo registo de acompanhamento (ex: peso diário, humor, energia)
// à lista existente e sincroniza com o servidor.
export function saveTrackingLog(log) {
  const logs = getTrackingLogs(); // Obtém a lista atual de registos
  logs.push(log);                 // Adiciona o novo registo ao array
  localStorage.setItem('trackingLogs', JSON.stringify(logs));
  syncToServer('trackingLogs', logs); // Sincroniza o array completo atualizado
}

// Recupera todos os registos de acompanhamento guardados.
// Devolve um array de registos ou um array vazio se não existirem dados.
export function getTrackingLogs() {
  const logs = localStorage.getItem('trackingLogs');
  return logs ? JSON.parse(logs) : [];
}


// --- ENTRADAS DE PROGRESSO (PROGRESS ENTRIES) ---

// Guarda uma nova entrada de progresso (ex: medições corporais, fotos de progresso)
// e sincroniza com o servidor.
export function saveProgressEntry(entry) {
  const entries = getProgressEntries(); // Obtém as entradas existentes
  entries.push(entry);                  // Adiciona a nova entrada
  localStorage.setItem('progressEntries', JSON.stringify(entries));
  syncToServer('progressEntries', entries); // Sincroniza o array completo atualizado
}

// Recupera todas as entradas de progresso guardadas.
// Devolve um array ou um array vazio se não existirem dados.
export function getProgressEntries() {
  const entries = localStorage.getItem('progressEntries');
  return entries ? JSON.parse(entries) : [];
}


// --- REGISTOS DE REFEIÇÕES (MEAL LOGS) ---

// Guarda um novo registo de refeição no diário alimentar e sincroniza com o servidor.
export function saveMealLog(meal) {
  const meals = getMealLogs(); // Obtém os registos de refeições existentes
  meals.push(meal);            // Adiciona a nova refeição
  localStorage.setItem('mealLogs', JSON.stringify(meals));
  syncToServer('mealLogs', meals); // Sincroniza o array completo atualizado
}

// Recupera todos os registos de refeições guardados.
// Devolve um array ou um array vazio se não existirem dados.
export function getMealLogs() {
  const meals = localStorage.getItem('mealLogs');
  return meals ? JSON.parse(meals) : [];
}


// --- LIMPEZA DE DADOS ---

// Remove todos os dados da aplicação do localStorage.
// Útil para "resetar" o perfil do utilizador ou para testes.
// Nota: não remove a sessão do utilizador ('currentUser').
export function clearAllData() {
  localStorage.removeItem('fitnessPlan');
  localStorage.removeItem('trackingLogs');
  localStorage.removeItem('progressEntries');
  localStorage.removeItem('mealLogs');
}


// --- PREFERÊNCIA DE IDIOMA (LOCALE) ---

// Recupera o idioma guardado pelo utilizador.
// Se não existir nenhuma preferência guardada, devolve 'en' (inglês) como padrão.
export function getStoredLocale() {
  return localStorage.getItem('locale') || 'en';
}

// Guarda a preferência de idioma do utilizador para que seja mantida entre sessões.
export function setStoredLocale(locale) {
  localStorage.setItem('locale', locale);
}


// --- CARREGAMENTO DE DADOS DO SERVIDOR ---

// Carrega os dados do utilizador recebidos do servidor para o localStorage.
// É chamada após o login para restaurar os dados guardados na conta do utilizador.
// Só sobrescreve dados locais se existirem dados no servidor (verifica arrays não vazios).
export function loadUserData(userData) {
  // Carrega o plano de fitness se existir no servidor.
  if (userData.fitnessPlan) {
    localStorage.setItem('fitnessPlan', JSON.stringify(userData.fitnessPlan));
  }
  // Carrega os registos de acompanhamento apenas se o array não estiver vazio.
  if (userData.trackingLogs && userData.trackingLogs.length > 0) {
    localStorage.setItem('trackingLogs', JSON.stringify(userData.trackingLogs));
  }
  // Carrega as entradas de progresso apenas se o array não estiver vazio.
  if (userData.progressEntries && userData.progressEntries.length > 0) {
    localStorage.setItem('progressEntries', JSON.stringify(userData.progressEntries));
  }
  // Carrega os registos de refeições apenas se o array não estiver vazio.
  if (userData.mealLogs && userData.mealLogs.length > 0) {
    localStorage.setItem('mealLogs', JSON.stringify(userData.mealLogs));
  }
}


// --- CHAMADAS À API DE AUTENTICAÇÃO ---

// Autentica o utilizador na API do servidor com email e password.
// É uma função assíncrona que envia as credenciais e, em caso de sucesso,
// guarda a sessão localmente e carrega os dados do utilizador.
export async function loginUser(email, password) {
  // Envia as credenciais para o endpoint de login via HTTP POST.
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }) // Serializa as credenciais em JSON
  });

  // Se o servidor devolver um erro (código HTTP >= 400), lança uma exceção.
  // Isto permite que o código que chamou loginUser trate o erro adequadamente.
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  // Parseia a resposta JSON com os dados do utilizador autenticado.
  const userData = await response.json();

  // Guarda a sessão do utilizador (apenas os campos essenciais: id, email, name).
  setCurrentUser({
    id: userData.id,
    email: userData.email,
    name: userData.name
  });

  // Carrega os dados da conta do utilizador para o localStorage local.
  loadUserData(userData);

  // Devolve os dados completos do utilizador ao código chamador.
  return userData;
}

// Regista um novo utilizador na API do servidor.
// Envia email, password e nome para o endpoint de criação de conta.
// Devolve a resposta do servidor (normalmente confirma o sucesso do registo).
export async function signupUser(email, password, name) {
  // Envia os dados de registo para o endpoint de criação de conta via HTTP POST.
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }) // Serializa os dados do novo utilizador
  });

  // Se o servidor devolver um erro, lança uma exceção com a mensagem de erro do servidor.
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  // Devolve a resposta JSON do servidor (ex: confirmação de criação da conta).
  return await response.json();
}
