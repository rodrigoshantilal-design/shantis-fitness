// Internationalization (i18n) system
const translations = {
  en: {
    homepage: {
      badge: 'AI-Powered Fitness Planning',
      heroTitle1: 'Transform Your Body,',
      heroTitle2: 'Transform Your Life',
      heroSubtitle: 'Get personalized fitness and nutrition plans tailored to your goals. Track progress, log meals, and achieve lasting transformation.',
      ctaButton: 'Get Started Free',
      noSignup: 'No credit card required. Start your journey in seconds.',
      footer: '© 2024 Shanti\'s Fitness And Wellness. All rights reserved.'
    },
    dashboard: {
      title: 'Your Dashboard',
      subtitle: 'Track your progress and stay on top of your goals',
      yourPlan: 'Your Plan',
      goal: 'Goal',
      calories: 'Calories',
      protein: 'Protein',
      training: 'Training'
    }
  },
  pt: {
    homepage: {
      badge: 'Planeamento de Fitness com IA',
      heroTitle1: 'Transforme o Seu Corpo,',
      heroTitle2: 'Transforme a Sua Vida',
      heroSubtitle: 'Obtenha planos personalizados de fitness e nutrição adaptados aos seus objetivos. Acompanhe o progresso, registe refeições e alcance uma transformação duradoura.',
      ctaButton: 'Começar Grátis',
      noSignup: 'Não é necessário cartão de crédito. Comece a sua jornada em segundos.',
      footer: '© 2024 Shanti\'s Fitness And Wellness. Todos os direitos reservados.'
    },
    dashboard: {
      title: 'O Seu Painel',
      subtitle: 'Acompanhe o seu progresso e mantenha-se no topo dos seus objetivos',
      yourPlan: 'O Seu Plano',
      goal: 'Objetivo',
      calories: 'Calorias',
      protein: 'Proteína',
      training: 'Treino'
    }
  }
};

function updateI18n(locale) {
  const lang = translations[locale] || translations.en;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const keys = key.split('.');
    let value = lang;

    for (const k of keys) {
      value = value[k];
      if (!value) break;
    }

    if (value) {
      element.textContent = value;
    }
  });
}
