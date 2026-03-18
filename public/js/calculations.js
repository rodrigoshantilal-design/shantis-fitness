// Calculation functions from the original lib/planner

export function calculateBMI(weight, height) {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  let category;
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25) category = 'normal';
  else if (bmi < 30) category = 'overweight';
  else category = 'obese';

  return { value: bmi, category };
}

export function calculateBMR(weight, height, age, sex) {
  // Mifflin-St Jeor Equation
  if (sex === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extra: 1.9
  };
  return bmr * (multipliers[activityLevel] || 1.55);
}

export function calculateCaloriesAndMacros(inputs) {
  const { weight, height, age, sex, activityLevel, goal } = inputs;

  const bmr = calculateBMR(weight, height, age || 25, sex || 'male');
  const tdee = calculateTDEE(bmr, activityLevel);

  let calories = tdee;
  if (goal === 'fat_loss') {
    calories = tdee * 0.8; // 20% deficit
  } else if (goal === 'muscle_gain') {
    calories = tdee * 1.1; // 10% surplus
  }

  // Macros
  const proteinG = weight * 2.2; // 2.2g per kg
  const fatG = weight * 1; // 1g per kg
  const carbG = (calories - (proteinG * 4) - (fatG * 9)) / 4;

  return {
    bmr,
    tdee,
    calories,
    macros: {
      protein_g: proteinG,
      carb_g: carbG,
      fat_g: fatG
    }
  };
}

export function generateTrainingPlan(experience, goal = 'fat_loss') {
  const plans = {
    beginner: {
      name: '3-Day Full Body',
      daysPerWeek: 3,
      description: 'Full body workouts focusing on compound movements',
      workouts: [
        {
          day: 'Day 1',
          exercises: [
            { name: 'Squats', sets: 3, reps: '10-12' },
            { name: 'Push-ups', sets: 3, reps: '8-10' },
            { name: 'Dumbbell Rows', sets: 3, reps: '10-12' },
            { name: 'Plank', sets: 3, reps: '30-45s' }
          ]
        },
        {
          day: 'Day 2',
          exercises: [
            { name: 'Deadlifts', sets: 3, reps: '8-10' },
            { name: 'Shoulder Press', sets: 3, reps: '10-12' },
            { name: 'Lunges', sets: 3, reps: '10-12' },
            { name: 'Bicycle Crunches', sets: 3, reps: '15-20' }
          ]
        },
        {
          day: 'Day 3',
          exercises: [
            { name: 'Leg Press', sets: 3, reps: '12-15' },
            { name: 'Bench Press', sets: 3, reps: '8-10' },
            { name: 'Lat Pulldown', sets: 3, reps: '10-12' },
            { name: 'Russian Twists', sets: 3, reps: '20' }
          ]
        }
      ]
    },
    intermediate: {
      name: '4-Day Upper/Lower Split',
      daysPerWeek: 4,
      description: 'Upper/Lower split for balanced development',
      workouts: [
        {
          day: 'Upper 1',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: '8-10' },
            { name: 'Barbell Rows', sets: 4, reps: '8-10' },
            { name: 'Overhead Press', sets: 3, reps: '10-12' },
            { name: 'Pull-ups', sets: 3, reps: '8-10' }
          ]
        },
        {
          day: 'Lower 1',
          exercises: [
            { name: 'Squats', sets: 4, reps: '8-10' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '10-12' },
            { name: 'Leg Press', sets: 3, reps: '12-15' },
            { name: 'Calf Raises', sets: 4, reps: '15-20' }
          ]
        },
        {
          day: 'Upper 2',
          exercises: [
            { name: 'Incline Bench', sets: 4, reps: '8-10' },
            { name: 'T-Bar Rows', sets: 4, reps: '8-10' },
            { name: 'Lateral Raises', sets: 3, reps: '12-15' },
            { name: 'Barbell Curls', sets: 3, reps: '10-12' }
          ]
        },
        {
          day: 'Lower 2',
          exercises: [
            { name: 'Deadlifts', sets: 4, reps: '6-8' },
            { name: 'Front Squats', sets: 3, reps: '10-12' },
            { name: 'Walking Lunges', sets: 3, reps: '12-15' },
            { name: 'Seated Calf Raises', sets: 4, reps: '15-20' }
          ]
        }
      ]
    },
    advanced: {
      name: '5-Day Push/Pull/Legs',
      daysPerWeek: 5,
      description: 'Advanced PPL split for maximum results',
      workouts: [
        {
          day: 'Push',
          exercises: [
            { name: 'Bench Press', sets: 5, reps: '6-8' },
            { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10' },
            { name: 'Overhead Press', sets: 4, reps: '8-10' },
            { name: 'Tricep Dips', sets: 4, reps: '8-10' }
          ]
        },
        {
          day: 'Pull',
          exercises: [
            { name: 'Deadlifts', sets: 5, reps: '5-6' },
            { name: 'Pull-ups', sets: 4, reps: '8-10' },
            { name: 'Barbell Rows', sets: 4, reps: '8-10' },
            { name: 'Barbell Curls', sets: 3, reps: '10-12' }
          ]
        },
        {
          day: 'Legs',
          exercises: [
            { name: 'Squats', sets: 5, reps: '6-8' },
            { name: 'Romanian Deadlifts', sets: 4, reps: '8-10' },
            { name: 'Leg Press', sets: 4, reps: '10-12' },
            { name: 'Calf Raises', sets: 5, reps: '15-20' }
          ]
        },
        {
          day: 'Push 2',
          exercises: [
            { name: 'Incline Bench', sets: 4, reps: '8-10' },
            { name: 'Flat Dumbbell Press', sets: 4, reps: '10-12' },
            { name: 'Arnold Press', sets: 3, reps: '10-12' },
            { name: 'Skull Crushers', sets: 3, reps: '10-12' }
          ]
        },
        {
          day: 'Pull 2',
          exercises: [
            { name: 'Weighted Pull-ups', sets: 4, reps: '6-8' },
            { name: 'T-Bar Rows', sets: 4, reps: '8-10' },
            { name: 'Lat Pulldown', sets: 3, reps: '10-12' },
            { name: 'Preacher Curls', sets: 3, reps: '10-12' }
          ]
        }
      ]
    }
  };

  return plans[experience] || plans.beginner;
}
