/*
 * ============================================================
 *  SERVIDOR PRINCIPAL — Shanti's Fitness & Wellness
 * ============================================================
 *  Este ficheiro é o coração do back-end da aplicação.
 *  É responsável por:
 *    - Ligar ao servidor de base de dados (MongoDB)
 *    - Definir as rotas HTTP (API) que o front-end consome
 *    - Gerir autenticação de utilizadores (registo, login,
 *      verificação de email)
 *    - Guardar e devolver dados de fitness do utilizador
 *    - Comunicar com a API do ChatGPT para o treinador virtual
 *    - Servir os ficheiros estáticos (HTML, CSS, JS do front-end)
 *
 *  Tecnologias utilizadas:
 *    - Express.js  → framework HTTP para Node.js
 *    - Mongoose    → ODM (Object Document Mapper) para MongoDB
 *    - bcryptjs    → encriptação segura de palavras-passe
 *    - crypto      → geração de tokens aleatórios seguros
 *    - dotenv      → leitura de variáveis de ambiente (.env)
 *    - Brevo API   → envio de emails transacionais
 *    - OpenAI API  → respostas do treinador virtual com IA
 * ============================================================
 */

// --- IMPORTAÇÃO DE DEPENDÊNCIAS ---

// Express: framework minimalista que nos permite criar um servidor HTTP
// e definir rotas de forma simples.
const express = require('express');

// CORS (Cross-Origin Resource Sharing): permite que o front-end,
// mesmo que esteja noutro domínio ou porta, comunique com este servidor.
const cors = require('cors');

// bcryptjs: biblioteca para fazer hash (encriptação unidirecional) de
// palavras-passe. Nunca guardamos a palavra-passe em texto simples.
const bcrypt = require('bcryptjs');

// Mongoose: torna mais fácil trabalhar com MongoDB, permitindo-nos
// definir "schemas" (estruturas de dados) e fazer queries de forma intuitiva.
const mongoose = require('mongoose');

// Path: módulo nativo do Node.js para construir caminhos de ficheiros
// de forma compatível com todos os sistemas operativos.
const path = require('path');

// Crypto: módulo nativo do Node.js para gerar valores criptográficos
// seguros — usado aqui para criar tokens de verificação de email.
const crypto = require('crypto');

// Dotenv: carrega as variáveis definidas no ficheiro .env para o objeto
// process.env, mantendo chaves secretas fora do código-fonte.
require('dotenv').config();


/* ============================================================
 *  FUNÇÃO: sendVerificationEmail
 * ============================================================
 *  Objetivo: enviar um email de verificação ao utilizador
 *  recém-registado, com um link único que confirma a sua
 *  identidade e ativa a conta.
 *
 *  Parâmetros:
 *    - email    → endereço de email do destinatário
 *    - token    → token único gerado durante o registo
 *    - baseUrl  → URL base do servidor (ex: https://meusite.com)
 *
 *  Como funciona:
 *    Constrói o link de verificação e faz um pedido POST à API
 *    do Brevo (serviço de email) para enviar o email em HTML.
 * ============================================================ */
async function sendVerificationEmail(email, token, baseUrl) {
  // Constrói o URL completo de verificação que o utilizador irá clicar
  const link = `${baseUrl}/api/auth/verify/${token}`;

  // Faz um pedido HTTP POST à API do Brevo para enviar o email
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      // A chave da API do Brevo é lida das variáveis de ambiente (segura)
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // Remetente do email — nome e endereço que aparecem na caixa de entrada
      sender: { name: "Shanti's Fitness", email: 'rodrigoshantilal@gmail.com' },
      // Destinatário — o email do utilizador que acabou de se registar
      to: [{ email }],
      // Assunto do email
      subject: "Verifica o teu email — Shanti's Fitness & Wellness",
      // Corpo do email em HTML com estilo visual personalizado da marca
      htmlContent: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0a0a;color:white;padding:40px;border-radius:16px;">
          <h2 style="color:#a855f7;">Bem-vindo à Shanti's Fitness!</h2>
          <p style="color:#ccc;">Por favor confirma o teu email clicando no botão abaixo:</p>
          <a href="${link}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;border-radius:10px;text-decoration:none;font-weight:bold;">Verificar Email</a>
          <p style="color:#666;font-size:12px;">Se não criaste uma conta, ignora este email.</p>
        </div>
      `
    })
  });

  // Se o Brevo devolveu um erro, lança uma exceção com os detalhes
  if (!response.ok) {
    const err = await response.json();
    throw new Error('Email send failed: ' + JSON.stringify(err));
  }
}


// --- INICIALIZAÇÃO DO SERVIDOR EXPRESS ---

// Cria a instância principal da aplicação Express
const app = express();

// Define a porta onde o servidor vai escutar.
// Tenta usar a variável de ambiente PORT (útil em produção/Render/Heroku),
// caso contrário usa a porta 5000 para desenvolvimento local.
const PORT = process.env.PORT || 5000;


/* ============================================================
 *  LIGAÇÃO À BASE DE DADOS — MongoDB com Mongoose
 * ============================================================
 *  O URI de ligação pode ser definido no .env (para produção,
 *  normalmente o MongoDB Atlas) ou usa um servidor local
 *  para desenvolvimento.
 * ============================================================ */

// Lê o URI da base de dados das variáveis de ambiente ou usa o valor padrão local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shantis-fitness';

// Tenta estabelecer a ligação à base de dados MongoDB.
// .then() → executado se a ligação for bem-sucedida
// .catch() → executado se houver um erro de ligação (ex: servidor offline)
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


/* ============================================================
 *  SCHEMA DO UTILIZADOR — Estrutura dos dados na base de dados
 * ============================================================
 *  Um "schema" define o formato exato de cada documento
 *  (registo) guardado na coleção "users" do MongoDB.
 *  É como definir as colunas de uma tabela numa base de dados
 *  relacional, mas para documentos JSON.
 * ============================================================ */

// Define a estrutura de dados de um utilizador
const userSchema = new mongoose.Schema({
  // Email único — serve também como identificador de login
  email: { type: String, required: true, unique: true },

  // Palavra-passe — SEMPRE guardada como hash (nunca em texto simples)
  password: { type: String, required: true },

  // Nome do utilizador (opcional — pode não ser fornecido no registo)
  name: { type: String },

  // Indica se o utilizador já verificou o email após o registo
  // Começa como false — só muda para true quando clica no link do email
  emailVerified: { type: Boolean, default: false },

  // Token temporário enviado por email para verificação da conta
  // Após a verificação, este campo é apagado por segurança
  verificationToken: { type: String },

  // Plano de fitness personalizado do utilizador (gerado pela app)
  // Guardado como objeto JSON — pode conter metas, calorias, proteínas, etc.
  fitnessPlan: { type: Object, default: null },

  // Histórico de registos de treino do utilizador (array de objetos)
  trackingLogs: { type: Array, default: [] },

  // Entradas de progresso físico (ex: peso registado ao longo do tempo)
  progressEntries: { type: Array, default: [] },

  // Registos de refeições/alimentação do utilizador
  mealLogs: { type: Array, default: [] },

  // Data de criação da conta — preenchida automaticamente
  createdAt: { type: Date, default: Date.now },

  // Data da última atualização dos dados — atualizada manualmente nas rotas
  updatedAt: { type: Date, default: Date.now }
});

// Cria o modelo "User" a partir do schema definido acima.
// O Mongoose vai usar a coleção "users" (plural automático) no MongoDB.
const User = mongoose.model('User', userSchema);


/* ============================================================
 *  MIDDLEWARES GLOBAIS
 * ============================================================
 *  Middlewares são funções que correm para TODOS os pedidos
 *  antes de chegarem às rotas específicas. Preparam o pedido
 *  e/ou a resposta para uso posterior.
 * ============================================================ */

// Ativa o CORS — permite que browsers de outros domínios façam
// pedidos à nossa API sem serem bloqueados por políticas de segurança
app.use(cors());

// Permite que o servidor leia o corpo (body) dos pedidos HTTP
// no formato JSON. Sem isto, req.body seria undefined.
app.use(express.json());

// Serve ficheiros estáticos (HTML, CSS, imagens, JS do front-end)
// a partir da pasta "public". O browser pode aceder diretamente a esses ficheiros.
app.use(express.static('public'));


/* ============================================================
 *  ROTAS DE AUTENTICAÇÃO
 * ============================================================
 *  Estas rotas gerem tudo o que está relacionado com a
 *  identidade do utilizador: criar conta, entrar, verificar email.
 * ============================================================ */


/* ------------------------------------------------------------
 *  ROTA: POST /api/auth/signup
 *  Objetivo: Registar um novo utilizador
 * ------------------------------------------------------------
 *  Fluxo:
 *    1. Valida se o email e a palavra-passe foram enviados
 *    2. Verifica se já existe um utilizador com esse email
 *    3. Faz hash da palavra-passe com bcrypt (segurança)
 *    4. Gera um token de verificação de email único
 *    5. Guarda o novo utilizador na base de dados
 *    6. Envia o email de verificação (falha silenciosa —
 *       a conta é criada mesmo que o email falhe)
 *    7. Responde com uma mensagem de sucesso
 * ------------------------------------------------------------ */
app.post('/api/auth/signup', async (req, res) => {
  try {
    // Extrai os campos enviados pelo front-end no corpo do pedido
    const { email, password, name } = req.body;

    // Validação básica: email e palavra-passe são obrigatórios
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Verifica se já existe um utilizador com este email na base de dados
    const existingUser = await User.findOne({ email });

    // Se já existir, rejeita o registo para evitar duplicados
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Gera o hash da palavra-passe com fator de custo 10.
    // O fator 10 significa que o algoritmo bcrypt faz 2^10 iterações —
    // suficientemente lento para dificultar ataques de força bruta,
    // mas rápido o suficiente para não afetar a experiência do utilizador.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gera um token aleatório e seguro de 32 bytes (64 caracteres em hex)
    // que será enviado por email para confirmar a identidade do utilizador
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Cria o documento do novo utilizador com os dados fornecidos
    const user = new User({
      email,
      password: hashedPassword, // Guarda o hash, NUNCA a palavra-passe original
      name: name || null,        // Nome é opcional — usa null se não fornecido
      verificationToken          // Token para verificação de email
    });

    // Guarda o utilizador na base de dados MongoDB
    await user.save();

    // Tenta enviar o email de verificação.
    // Este bloco try/catch interno garante que, mesmo que o envio falhe,
    // a conta é criada e o utilizador recebe uma resposta de sucesso.
    try {
      // Determina o URL base: usa variável de ambiente ou localhost em desenvolvimento
      const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
      await sendVerificationEmail(email, verificationToken, baseUrl);
    } catch (emailError) {
      // Regista o erro no servidor mas não interrompe o fluxo
      console.error('Email send error:', emailError.message);
    }

    // Responde com HTTP 201 (Created) e mensagem de instruções ao utilizador
    res.status(201).json({
      message: 'Account created! Please check your email to verify your account.'
    });
  } catch (error) {
    // Captura erros inesperados (ex: problema na base de dados) e responde com HTTP 500
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});


/* ------------------------------------------------------------
 *  ROTA: POST /api/auth/login
 *  Objetivo: Autenticar um utilizador existente
 * ------------------------------------------------------------
 *  Fluxo:
 *    1. Valida se os campos obrigatórios foram enviados
 *    2. Procura o utilizador pelo email na base de dados
 *    3. Compara a palavra-passe enviada com o hash guardado
 *    4. Verifica se o email foi verificado (conta ativa)
 *    5. Devolve os dados do utilizador ao front-end
 *
 *  Nota de segurança: tanto "utilizador não encontrado" como
 *  "palavra-passe errada" devolvem a mesma mensagem de erro
 *  ("Invalid credentials") para não revelar ao atacante
 *  se o email existe ou não na base de dados.
 * ------------------------------------------------------------ */
app.post('/api/auth/login', async (req, res) => {
  try {
    // Extrai as credenciais enviadas pelo front-end
    const { email, password } = req.body;

    // Validação: os dois campos são obrigatórios
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Procura o utilizador na base de dados pelo email
    const user = await User.findOne({ email });

    // Se não existir nenhum utilizador com este email, rejeita o login.
    // HTTP 401 significa "não autorizado"
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compara a palavra-passe em texto simples enviada pelo utilizador
    // com o hash guardado na base de dados usando bcrypt
    const isValid = await bcrypt.compare(password, user.password);

    // Se a palavra-passe não coincidir, rejeita o login
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verifica se o utilizador já confirmou o seu email.
    // Contas não verificadas não podem entrar — HTTP 403 significa "proibido"
    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox.' });
    }

    // Login bem-sucedido! Devolve os dados do utilizador ao front-end.
    // IMPORTANTE: a palavra-passe (mesmo o hash) nunca é enviada ao cliente.
    // São devolvidos todos os dados de fitness para hidratação do estado da app.
    res.json({
      id: user._id,                         // ID único do utilizador no MongoDB
      email: user.email,                    // Email do utilizador
      name: user.name,                      // Nome (pode ser null)
      fitnessPlan: user.fitnessPlan,        // Plano de fitness guardado
      trackingLogs: user.trackingLogs,      // Histórico de treinos
      progressEntries: user.progressEntries,// Registos de progresso físico
      mealLogs: user.mealLogs               // Registos de alimentação
    });
  } catch (error) {
    // Erro inesperado no servidor (ex: base de dados offline)
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});


/* ------------------------------------------------------------
 *  ROTA: GET /api/auth/verify/:token
 *  Objetivo: Verificar o email do utilizador através do link
 *            enviado por email após o registo
 * ------------------------------------------------------------
 *  Como funciona:
 *    O utilizador clica no link do email, o browser faz um pedido
 *    GET a esta rota com o token único como parâmetro na URL.
 *    O servidor procura o utilizador com esse token, ativa a conta
 *    e devolve uma página HTML de confirmação.
 *
 *  Nota: esta rota devolve HTML diretamente (não JSON) porque
 *  é acedida diretamente pelo browser ao clicar no link do email.
 * ------------------------------------------------------------ */
app.get('/api/auth/verify/:token', async (req, res) => {
  try {
    // Procura o utilizador cujo token de verificação corresponde
    // ao valor passado na URL (req.params.token)
    const user = await User.findOne({ verificationToken: req.params.token });

    // Se não encontrar nenhum utilizador com este token,
    // o link é inválido (já foi usado) ou expirado — mostra página de erro
    if (!user) {
      return res.send(`<html><body style="background:#0a0a0a;color:white;font-family:sans-serif;text-align:center;padding:80px"><h2 style="color:#f87171;">Link inválido ou expirado.</h2><a href="/login.html" style="color:#a855f7;">Voltar ao login</a></body></html>`);
    }

    // Marca a conta como verificada
    user.emailVerified = true;

    // Remove o token de verificação — já não é necessário e, por segurança,
    // não deve permanecer na base de dados (evita reutilização)
    user.verificationToken = undefined;

    // Guarda as alterações na base de dados
    await user.save();

    // Devolve uma página HTML de sucesso com link para a página de login
    res.send(`<html><body style="background:#0a0a0a;color:white;font-family:sans-serif;text-align:center;padding:80px"><h2 style="color:#a855f7;">✓ Email verificado com sucesso!</h2><p>Já podes fazer login.</p><a href="/login.html" style="display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;border-radius:10px;text-decoration:none;font-weight:bold;">Fazer Login</a></body></html>`);
  } catch (error) {
    // Erro inesperado ao processar a verificação
    res.status(500).send('Erro ao verificar email.');
  }
});


/* ============================================================
 *  ROTAS DE DADOS DO UTILIZADOR
 * ============================================================
 *  Estas rotas gerem os dados de fitness do utilizador:
 *  plano de treino, registos de treino, progresso e alimentação.
 * ============================================================ */


/* ------------------------------------------------------------
 *  ROTA: POST /api/user/save
 *  Objetivo: Guardar/atualizar os dados de fitness do utilizador
 * ------------------------------------------------------------
 *  O front-end chama esta rota sempre que o utilizador:
 *    - Gera ou atualiza o seu plano de fitness
 *    - Regista um treino
 *    - Adiciona uma entrada de progresso (ex: peso)
 *    - Regista uma refeição
 *
 *  Só atualiza os campos que foram enviados — campos não
 *  enviados ficam inalterados na base de dados.
 * ------------------------------------------------------------ */
app.post('/api/user/save', async (req, res) => {
  try {
    // Extrai o ID do utilizador e os dados a guardar do corpo do pedido
    const { userId, fitnessPlan, trackingLogs, progressEntries, mealLogs } = req.body;

    // O ID do utilizador é obrigatório para saber qual documento atualizar
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Começa com um objeto de atualização que sempre inclui a data de modificação
    const updateData = { updatedAt: new Date() };

    // Adiciona ao objeto de atualização apenas os campos que foram enviados.
    // O operador !== undefined distingue "campo não enviado" de "campo enviado como null".
    // Isto evita apagar dados existentes quando apenas um campo é atualizado.
    if (fitnessPlan !== undefined) updateData.fitnessPlan = fitnessPlan;
    if (trackingLogs !== undefined) updateData.trackingLogs = trackingLogs;
    if (progressEntries !== undefined) updateData.progressEntries = progressEntries;
    if (mealLogs !== undefined) updateData.mealLogs = mealLogs;

    // Encontra o utilizador pelo ID e aplica as atualizações.
    // findByIdAndUpdate é uma operação atómica — segura para atualizações simultâneas.
    await User.findByIdAndUpdate(userId, updateData);

    // Confirma ao front-end que os dados foram guardados com sucesso
    res.json({ success: true });
  } catch (error) {
    // Erro inesperado (ex: ID inválido, base de dados offline)
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});


/* ------------------------------------------------------------
 *  ROTA: GET /api/user/:userId
 *  Objetivo: Obter todos os dados de um utilizador pelo seu ID
 * ------------------------------------------------------------
 *  Utilizada quando o front-end precisa de carregar os dados
 *  do utilizador (ex: ao reabrir a app, após sincronização, etc.)
 * ------------------------------------------------------------ */
app.get('/api/user/:userId', async (req, res) => {
  try {
    // Extrai o ID do utilizador dos parâmetros da URL (ex: /api/user/abc123)
    const { userId } = req.params;

    // Procura o utilizador na base de dados pelo seu ID único do MongoDB
    const user = await User.findById(userId);

    // Se não existir nenhum utilizador com este ID, responde com HTTP 404
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Devolve os dados do utilizador ao front-end.
    // Tal como no login, a palavra-passe nunca é incluída na resposta.
    res.json({
      id: user._id,                         // ID único do utilizador
      email: user.email,                    // Email
      name: user.name,                      // Nome
      fitnessPlan: user.fitnessPlan,        // Plano de fitness
      trackingLogs: user.trackingLogs,      // Logs de treino
      progressEntries: user.progressEntries,// Entradas de progresso
      mealLogs: user.mealLogs               // Logs de refeições
    });
  } catch (error) {
    // Erro inesperado (ex: formato de ID inválido)
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});


/* ============================================================
 *  ROTA DO TREINADOR VIRTUAL COM INTELIGÊNCIA ARTIFICIAL
 * ============================================================ */

/* ------------------------------------------------------------
 *  ROTA: POST /api/coach
 *  Objetivo: Enviar uma mensagem ao treinador virtual e obter
 *            uma resposta gerada pela IA (OpenAI GPT-4o-mini)
 * ------------------------------------------------------------
 *  Como funciona:
 *    1. Recebe a mensagem do utilizador e o seu plano de fitness
 *    2. Constrói um "prompt de sistema" que define o papel da IA:
 *       um treinador pessoal com contexto sobre o utilizador
 *    3. Faz um pedido à API da OpenAI com a conversa
 *    4. Devolve a resposta da IA ao front-end
 *
 *  O "system prompt" é a instrução que damos à IA sobre como
 *  deve comportar-se — define a sua personalidade, língua e
 *  contexto do utilizador para respostas mais personalizadas.
 * ------------------------------------------------------------ */
app.post('/api/coach', async (req, res) => {
  try {
    // Extrai a mensagem do utilizador, o plano de fitness e a língua preferida
    const { message, plan, language } = req.body;

    // Constrói o prompt de sistema que define o comportamento da IA.
    // Se o utilizador tem um plano de fitness, inclui esses dados para
    // que a IA possa dar conselhos personalizados e contextualizados.
    const systemPrompt = `You are a personal fitness and wellness coach for Shanti's Fitness & Wellness app.
Be encouraging, concise, and practical. Respond in ${language === 'pt' ? 'Portuguese (Brazil)' : 'English'}.
${plan ? `The user's fitness plan: goal is ${plan.goal}, current weight ${plan.weight}kg, target weight ${plan.targetWeight}kg, daily calories ${Math.round(plan.calories || 0)}, protein ${Math.round(plan.proteinG || 0)}g.` : ''}
Keep answers short and actionable (2-4 sentences max).`;

    // Faz um pedido HTTP POST à API da OpenAI para gerar a resposta do treinador
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // A chave da API da OpenAI é lida das variáveis de ambiente (nunca exposta ao cliente)
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        // Modelo usado: GPT-4o-mini — boa relação qualidade/custo para respostas curtas
        model: 'gpt-4o-mini',
        // A conversa é enviada como um array de mensagens com papéis (roles):
        // "system" → instruções para a IA
        // "user"   → mensagem do utilizador
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        // Limita a resposta a 200 tokens (~150 palavras) para respostas concisas
        max_tokens: 200
      })
    });

    // Lê a resposta JSON devolvida pela API da OpenAI
    const data = await response.json();

    // Extrai o texto da resposta gerado pela IA.
    // O operador ?. (optional chaining) evita erros se a estrutura for inesperada.
    // Se não houver resposta válida, usa uma mensagem de fallback.
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Devolve a resposta da IA ao front-end
    res.json({ reply });
  } catch (error) {
    // Erro na comunicação com a API da OpenAI (ex: quota excedida, rede offline)
    console.error('Coach error:', error);
    res.status(500).json({ error: 'Failed to get coach response' });
  }
});


/* ============================================================
 *  ROTA DE FICHEIROS ESTÁTICOS — Página Principal
 * ============================================================ */

/* ------------------------------------------------------------
 *  ROTA: GET /
 *  Objetivo: Servir a página principal da aplicação (index.html)
 * ------------------------------------------------------------
 *  Quando o utilizador acede ao domínio raiz (ex: https://meusite.com/),
 *  o servidor envia o ficheiro index.html da pasta "public".
 *  path.join garante que o caminho é correto em qualquer sistema operativo.
 * ------------------------------------------------------------ */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


/* ============================================================
 *  INICIALIZAÇÃO DO SERVIDOR
 * ============================================================
 *  app.listen() inicia o servidor e põe-no à escuta de pedidos
 *  HTTP na porta definida. A função de callback é executada
 *  assim que o servidor está pronto para receber pedidos.
 * ============================================================ */
app.listen(PORT, () => {
  // Confirma no terminal que o servidor está ativo e indica o URL local
  console.log(`Server running on http://localhost:${PORT}`);
});
