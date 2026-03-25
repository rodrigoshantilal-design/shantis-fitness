// i18n.js
// Este ficheiro implementa o sistema de internacionalização (i18n) da aplicação.
// "i18n" é uma abreviatura de "internationalization" (18 letras entre o 'i' e o 'n').
// O objetivo é permitir que a aplicação seja apresentada em vários idiomas,
// bastando trocar o locale (código de idioma) ativo.

// Sistema de Internacionalização (i18n)

// Objeto principal que contém todas as traduções da aplicação, organizadas por idioma.
// Cada chave de primeiro nível é um código de idioma ('en' para inglês, 'pt' para português).
// Dentro de cada idioma, as traduções estão agrupadas por secção da aplicação.
const translations = {

  // --- TRADUÇÕES EM INGLÊS ---
  en: {
    // Textos da página inicial (homepage)
    homepage: {
      badge: 'AI-Powered Fitness Planning',                          // Etiqueta de destaque
      heroTitle1: 'Transform Your Body,',                           // Primeira linha do título principal
      heroTitle2: 'Transform Your Life',                            // Segunda linha do título principal
      heroSubtitle: 'Get personalized fitness and nutrition plans tailored to your goals. Track progress, log meals, and achieve lasting transformation.', // Subtítulo descritivo
      ctaButton: 'Get Started Free',                                // Botão de chamada à ação
      noSignup: 'No credit card required. Start your journey in seconds.', // Nota de reasseguramento
      footer: '© 2025/2026 Shanti\'s Fitness And Wellness. All rights reserved.' // Rodapé
    },
    // Textos do painel de controlo do utilizador (dashboard)
    dashboard: {
      title: 'Your Dashboard',                                      // Título do painel
      subtitle: 'Track your progress and stay on top of your goals',// Subtítulo
      yourPlan: 'Your Plan',                                        // Secção do plano
      goal: 'Goal',                                                 // Etiqueta do objetivo
      calories: 'Calories',                                         // Etiqueta de calorias
      protein: 'Protein',                                           // Etiqueta de proteína
      training: 'Training'                                          // Etiqueta de treino
    }
  },

  // --- TRADUÇÕES EM PORTUGUÊS ---
  pt: {
    // Textos da página inicial em português
    homepage: {
      badge: 'Planeamento de Fitness com IA',                       // Etiqueta de destaque em português
      heroTitle1: 'Transforme o Seu Corpo,',                        // Primeira linha do título em português
      heroTitle2: 'Transforme a Sua Vida',                          // Segunda linha do título em português
      heroSubtitle: 'Obtenha planos personalizados de fitness e nutrição adaptados aos seus objetivos. Acompanhe o progresso, registe refeições e alcance uma transformação duradoura.', // Subtítulo em português
      ctaButton: 'Começar Grátis',                                  // Botão de chamada à ação em português
      noSignup: 'Não é necessário cartão de crédito. Comece a sua jornada em segundos.', // Nota de reasseguramento em português
      footer: '© 2025/2026 Shanti\'s Fitness And Wellness. Todos os direitos reservados.' // Rodapé em português
    },
    // Textos do painel de controlo em português
    dashboard: {
      title: 'O Seu Painel',                                        // Título do painel em português
      subtitle: 'Acompanhe o seu progresso e mantenha-se no topo dos seus objetivos', // Subtítulo em português
      yourPlan: 'O Seu Plano',                                      // Secção do plano em português
      goal: 'Objetivo',                                             // Etiqueta do objetivo em português
      calories: 'Calorias',                                         // Etiqueta de calorias em português
      protein: 'Proteína',                                          // Etiqueta de proteína em português
      training: 'Treino'                                            // Etiqueta de treino em português
    }
  }
};


// --- FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO DE IDIOMA ---
// Esta função percorre todos os elementos HTML que têm o atributo 'data-i18n'
// e substitui o seu conteúdo de texto pela tradução correspondente no idioma escolhido.
// Recebe o código do locale desejado (ex: 'en' ou 'pt').
function updateI18n(locale) {
  // Seleciona o conjunto de traduções para o idioma recebido.
  // Se o idioma não existir no objeto de traduções, usa o inglês como alternativa.
  const lang = translations[locale] || translations.en;

  // Percorre todos os elementos do DOM que têm o atributo personalizado 'data-i18n'.
  // Este atributo contém uma chave em notação de ponto (ex: 'homepage.ctaButton').
  document.querySelectorAll('[data-i18n]').forEach(element => {
    // Obtém o valor do atributo 'data-i18n', que é a chave de tradução.
    const key = element.getAttribute('data-i18n');

    // Divide a chave em partes usando o ponto como separador.
    // Ex: 'homepage.ctaButton' torna-se ['homepage', 'ctaButton'].
    const keys = key.split('.');

    // Começa a navegar no objeto de traduções a partir da raiz do idioma selecionado.
    let value = lang;

    // Navega pelo objeto de traduções seguindo cada parte da chave.
    // Ex: lang['homepage']['ctaButton'] → 'Começar Grátis'.
    for (const k of keys) {
      value = value[k];
      if (!value) break; // Se não existir uma chave intermédia, para o ciclo
    }

    // Se foi encontrado um valor de tradução válido, atualiza o conteúdo do elemento.
    // 'textContent' é usado para definir apenas texto simples (sem HTML).
    if (value) {
      element.textContent = value;
    }
  });
}
