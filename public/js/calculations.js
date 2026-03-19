// calculations.js
// Este ficheiro contém todas as funções de cálculo relacionadas com saúde e fitness.
// Inclui cálculos de IMC, TMB, TDEE, macronutrientes e planos de treino.
// Cada função é exportada para poder ser importada noutros módulos da aplicação.

// Funções de cálculo provenientes da biblioteca original lib/planner


// --- CÁLCULO DO IMC (Índice de Massa Corporal) ---
// Recebe o peso em kg e a altura em cm.
// Devolve um objeto com o valor numérico do IMC e a categoria correspondente.
export function calculateBMI(weight, height) {
  // Converte a altura de centímetros para metros, pois a fórmula do IMC usa metros.
  const heightM = height / 100;

  // Fórmula do IMC: peso (kg) dividido pelo quadrado da altura (m).
  const bmi = weight / (heightM * heightM);

  // Classifica o IMC de acordo com os critérios da Organização Mundial de Saúde.
  let category;
  if (bmi < 18.5) category = 'underweight';       // Abaixo do peso
  else if (bmi < 25) category = 'normal';          // Peso normal
  else if (bmi < 30) category = 'overweight';      // Excesso de peso
  else category = 'obese';                          // Obesidade

  // Devolve tanto o valor numérico como a categoria classificada.
  return { value: bmi, category };
}


// --- CÁLCULO DA TMB (Taxa Metabólica Basal) ---
// A TMB representa as calorias que o organismo necessita em repouso absoluto.
// Recebe peso (kg), altura (cm), idade (anos) e sexo ('male' ou 'female').
// Utiliza a equação de Mifflin-St Jeor, considerada a mais precisa atualmente.
export function calculateBMR(weight, height, age, sex) {
  // Equação de Mifflin-St Jeor
  if (sex === 'male') {
    // Fórmula para homens: a constante +5 é o fator de correção para o sexo masculino.
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Fórmula para mulheres: a constante -161 é o fator de correção para o sexo feminino.
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}


// --- CÁLCULO DO TDEE (Total Daily Energy Expenditure — Gasto Energético Total Diário) ---
// O TDEE representa as calorias totais necessárias por dia, tendo em conta o nível de atividade física.
// Recebe a TMB calculada e o nível de atividade física do utilizador.
export function calculateTDEE(bmr, activityLevel) {
  // Multiplicadores de atividade física reconhecidos internacionalmente.
  // Cada nível ajusta a TMB para estimar o consumo calórico real diário.
  const multipliers = {
    sedentary: 1.2,   // Sedentário: pouco ou nenhum exercício
    light: 1.375,     // Levemente ativo: exercício leve 1-3 dias por semana
    moderate: 1.55,   // Moderadamente ativo: exercício moderado 3-5 dias por semana
    very: 1.725,      // Muito ativo: exercício intenso 6-7 dias por semana
    extra: 1.9        // Extremamente ativo: exercício muito intenso ou trabalho físico
  };

  // Multiplica a TMB pelo fator correspondente ao nível de atividade.
  // Se o nível não for reconhecido, usa 'moderate' (1.55) como valor por omissão.
  return bmr * (multipliers[activityLevel] || 1.55);
}


// --- CÁLCULO DE CALORIAS E MACRONUTRIENTES ---
// Função principal que integra todos os cálculos anteriores e determina as necessidades
// calóricas e de macronutrientes de acordo com o objetivo do utilizador.
// Recebe um objeto 'inputs' com os dados do utilizador.
export function calculateCaloriesAndMacros(inputs) {
  // Desestrutura os dados do utilizador: peso, altura, idade, sexo, nível de atividade e objetivo.
  const { weight, height, age, sex, activityLevel, goal } = inputs;

  // Calcula a TMB usando os dados do utilizador.
  // Se a idade ou o sexo não forem fornecidos, usa valores por omissão (25 anos, masculino).
  const bmr = calculateBMR(weight, height, age || 25, sex || 'male');

  // Calcula o TDEE a partir da TMB e do nível de atividade.
  const tdee = calculateTDEE(bmr, activityLevel);

  // Ajusta as calorias consoante o objetivo do utilizador.
  let calories = tdee;
  if (goal === 'fat_loss') {
    calories = tdee * 0.8; // Défice de 20% para perda de gordura
  } else if (goal === 'muscle_gain') {
    calories = tdee * 1.1; // Excedente de 10% para ganho muscular
  }
  // Se o objetivo for manutenção (ou não especificado), as calorias ficam iguais ao TDEE.

  // --- CÁLCULO DOS MACRONUTRIENTES ---
  // Proteína: 2,2g por kg de peso corporal — essencial para preservar e construir músculo.
  const proteinG = weight * 2.2; // 2.2g por kg

  // Gordura: 1g por kg de peso corporal — importante para funções hormonais e saúde geral.
  const fatG = weight * 1; // 1g por kg

  // Hidratos de carbono: calculados com as calorias restantes após proteína e gordura.
  // Proteína e hidratos fornecem 4 kcal/g; gordura fornece 9 kcal/g.
  const carbG = (calories - (proteinG * 4) - (fatG * 9)) / 4;

  // Devolve um objeto completo com todos os valores calculados.
  return {
    bmr,       // Taxa Metabólica Basal
    tdee,      // Gasto Energético Total Diário
    calories,  // Calorias ajustadas ao objetivo
    macros: {
      protein_g: proteinG, // Gramas de proteína
      carb_g: carbG,       // Gramas de hidratos de carbono
      fat_g: fatG          // Gramas de gordura
    }
  };
}


// --- GERAÇÃO DE PLANO DE TREINO ---
// Gera um plano de treino adequado ao nível de experiência do utilizador e ao seu objetivo.
// Recebe o nível de experiência ('beginner', 'intermediate', 'advanced') e o objetivo.
// Se o nível não for reconhecido, devolve o plano de principiante por omissão.
export function generateTrainingPlan(experience, goal = 'fat_loss') {
  // Objeto que contém os três planos de treino predefinidos, um por nível de experiência.
  const plans = {

    // --- PLANO PRINCIPIANTE: 3 dias por semana, treino de corpo inteiro ---
    beginner: {
      name: '3-Day Full Body',       // Nome do plano
      daysPerWeek: 3,                // Frequência semanal de treino
      description: 'Full body workouts focusing on compound movements', // Descrição
      workouts: [
        {
          day: 'Day 1', // Primeiro dia de treino
          exercises: [
            { name: 'Squats', sets: 3, reps: '10-12' },          // Agachamentos
            { name: 'Push-ups', sets: 3, reps: '8-10' },         // Flexões
            { name: 'Dumbbell Rows', sets: 3, reps: '10-12' },   // Remada com halteres
            { name: 'Plank', sets: 3, reps: '30-45s' }           // Prancha
          ]
        },
        {
          day: 'Day 2', // Segundo dia de treino
          exercises: [
            { name: 'Deadlifts', sets: 3, reps: '8-10' },          // Peso morto
            { name: 'Shoulder Press', sets: 3, reps: '10-12' },    // Desenvolvimento de ombros
            { name: 'Lunges', sets: 3, reps: '10-12' },            // Afundos
            { name: 'Bicycle Crunches', sets: 3, reps: '15-20' }   // Crunch de bicicleta
          ]
        },
        {
          day: 'Day 3', // Terceiro dia de treino
          exercises: [
            { name: 'Leg Press', sets: 3, reps: '12-15' },       // Leg press
            { name: 'Bench Press', sets: 3, reps: '8-10' },      // Supino
            { name: 'Lat Pulldown', sets: 3, reps: '10-12' },    // Puxada na polia
            { name: 'Russian Twists', sets: 3, reps: '20' }      // Rotação russa
          ]
        }
      ]
    },

    // --- PLANO INTERMÉDIO: 4 dias por semana, divisão superior/inferior ---
    intermediate: {
      name: '4-Day Upper/Lower Split',    // Nome do plano
      daysPerWeek: 4,                     // Frequência semanal de treino
      description: 'Upper/Lower split for balanced development', // Descrição
      workouts: [
        {
          day: 'Upper 1', // Treino do tronco superior — sessão 1
          exercises: [
            { name: 'Bench Press', sets: 4, reps: '8-10' },      // Supino
            { name: 'Barbell Rows', sets: 4, reps: '8-10' },     // Remada com barra
            { name: 'Overhead Press', sets: 3, reps: '10-12' },  // Desenvolvimento
            { name: 'Pull-ups', sets: 3, reps: '8-10' }          // Elevações na barra
          ]
        },
        {
          day: 'Lower 1', // Treino dos membros inferiores — sessão 1
          exercises: [
            { name: 'Squats', sets: 4, reps: '8-10' },               // Agachamentos
            { name: 'Romanian Deadlifts', sets: 3, reps: '10-12' },  // Peso morto romeno
            { name: 'Leg Press', sets: 3, reps: '12-15' },           // Leg press
            { name: 'Calf Raises', sets: 4, reps: '15-20' }          // Elevação de gémeos
          ]
        },
        {
          day: 'Upper 2', // Treino do tronco superior — sessão 2
          exercises: [
            { name: 'Incline Bench', sets: 4, reps: '8-10' },     // Supino inclinado
            { name: 'T-Bar Rows', sets: 4, reps: '8-10' },        // Remada T
            { name: 'Lateral Raises', sets: 3, reps: '12-15' },   // Elevações laterais
            { name: 'Barbell Curls', sets: 3, reps: '10-12' }     // Rosca direta
          ]
        },
        {
          day: 'Lower 2', // Treino dos membros inferiores — sessão 2
          exercises: [
            { name: 'Deadlifts', sets: 4, reps: '6-8' },             // Peso morto
            { name: 'Front Squats', sets: 3, reps: '10-12' },        // Agachamento frontal
            { name: 'Walking Lunges', sets: 3, reps: '12-15' },      // Afundos a caminhar
            { name: 'Seated Calf Raises', sets: 4, reps: '15-20' }   // Elevação de gémeos sentado
          ]
        }
      ]
    },

    // --- PLANO AVANÇADO: 5 dias por semana, divisão Push/Pull/Legs (PPL) ---
    advanced: {
      name: '5-Day Push/Pull/Legs',    // Nome do plano
      daysPerWeek: 5,                  // Frequência semanal de treino
      description: 'Advanced PPL split for maximum results', // Descrição
      workouts: [
        {
          day: 'Push', // Dia de "empurrar" — peito, ombros e tríceps
          exercises: [
            { name: 'Bench Press', sets: 5, reps: '6-8' },              // Supino
            { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10' },  // Supino inclinado com halteres
            { name: 'Overhead Press', sets: 4, reps: '8-10' },          // Desenvolvimento
            { name: 'Tricep Dips', sets: 4, reps: '8-10' }              // Mergulhos para tríceps
          ]
        },
        {
          day: 'Pull', // Dia de "puxar" — costas e bíceps
          exercises: [
            { name: 'Deadlifts', sets: 5, reps: '5-6' },       // Peso morto
            { name: 'Pull-ups', sets: 4, reps: '8-10' },       // Elevações na barra
            { name: 'Barbell Rows', sets: 4, reps: '8-10' },   // Remada com barra
            { name: 'Barbell Curls', sets: 3, reps: '10-12' }  // Rosca direta
          ]
        },
        {
          day: 'Legs', // Dia de pernas — quadríceps, isquiotibiais e gémeos
          exercises: [
            { name: 'Squats', sets: 5, reps: '6-8' },                   // Agachamentos
            { name: 'Romanian Deadlifts', sets: 4, reps: '8-10' },      // Peso morto romeno
            { name: 'Leg Press', sets: 4, reps: '10-12' },              // Leg press
            { name: 'Calf Raises', sets: 5, reps: '15-20' }             // Elevação de gémeos
          ]
        },
        {
          day: 'Push 2', // Segundo dia de "empurrar" — variações diferentes para maior volume
          exercises: [
            { name: 'Incline Bench', sets: 4, reps: '8-10' },       // Supino inclinado
            { name: 'Flat Dumbbell Press', sets: 4, reps: '10-12' },// Supino plano com halteres
            { name: 'Arnold Press', sets: 3, reps: '10-12' },       // Arnold press (ombros)
            { name: 'Skull Crushers', sets: 3, reps: '10-12' }      // Extensão de tríceps deitado
          ]
        },
        {
          day: 'Pull 2', // Segundo dia de "puxar" — variações para maior volume e detalhe
          exercises: [
            { name: 'Weighted Pull-ups', sets: 4, reps: '6-8' },   // Elevações com peso
            { name: 'T-Bar Rows', sets: 4, reps: '8-10' },         // Remada T
            { name: 'Lat Pulldown', sets: 3, reps: '10-12' },      // Puxada na polia
            { name: 'Preacher Curls', sets: 3, reps: '10-12' }     // Rosca scott
          ]
        }
      ]
    }
  };

  // Devolve o plano correspondente ao nível de experiência fornecido.
  // Se o nível não for válido, devolve o plano de principiante como valor por omissão.
  return plans[experience] || plans.beginner;
}
