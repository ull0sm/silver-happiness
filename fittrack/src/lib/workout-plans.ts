export type PlanExercise = {
  exercise_id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "8-10" or "12"
  rest_seconds: number;
  muscle_group: string;
  equipment: string;
  icon: string;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  type: "predefined" | "custom";
  tag: string;
  days: string;
  focus: string;
  description: string;
  accent: boolean;
  exercises: PlanExercise[];
};

export const PREDEFINED_PLANS: WorkoutPlan[] = [
  {
    id: "ppl-push",
    name: "PUSH PULL LEGS",
    type: "predefined",
    tag: "3 DAYS",
    days: "Mon / Wed / Fri",
    focus: "HYPERTROPHY",
    accent: true,
    description: "The foundation of raw mass. Isolate and destroy muscle groups systematically.",
    exercises: [
      { exercise_id: "1",  name: "Barbell Bench Press",   sets: 4, reps: "8",    rest_seconds: 120, muscle_group: "Chest",     equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "2",  name: "Incline Dumbbell Press", sets: 3, reps: "10",   rest_seconds: 90,  muscle_group: "Chest",     equipment: "Dumbbell",   icon: "fitness_center" },
      { exercise_id: "5",  name: "Dumbbell Fly",           sets: 3, reps: "12",   rest_seconds: 60,  muscle_group: "Chest",     equipment: "Dumbbell",   icon: "fitness_center" },
      { exercise_id: "21", name: "Overhead Press",         sets: 4, reps: "8",    rest_seconds: 120, muscle_group: "Shoulders", equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "22", name: "Lateral Raise",          sets: 3, reps: "15",   rest_seconds: 60,  muscle_group: "Shoulders", equipment: "Dumbbell",   icon: "fitness_center" },
      { exercise_id: "28", name: "Skull Crusher",          sets: 3, reps: "10",   rest_seconds: 90,  muscle_group: "Arms",      equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "30", name: "Cable Tricep Pushdown",  sets: 3, reps: "12",   rest_seconds: 60,  muscle_group: "Arms",      equipment: "Cable",      icon: "sports_gymnastics" },
    ],
  },
  {
    id: "bro-split",
    name: "BRO SPLIT",
    type: "predefined",
    tag: "5 DAYS",
    days: "Mon–Fri",
    focus: "VOLUME",
    accent: false,
    description: "One muscle group per day. Maximum volume, maximum pump, maximum recovery.",
    exercises: [
      { exercise_id: "1",  name: "Barbell Bench Press",   sets: 5, reps: "5",    rest_seconds: 180, muscle_group: "Chest",     equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "2",  name: "Incline Dumbbell Press", sets: 4, reps: "8",    rest_seconds: 120, muscle_group: "Chest",     equipment: "Dumbbell",   icon: "fitness_center" },
      { exercise_id: "3",  name: "Cable Crossover",        sets: 3, reps: "15",   rest_seconds: 60,  muscle_group: "Chest",     equipment: "Cable",      icon: "sports_gymnastics" },
      { exercise_id: "4",  name: "Dips",                   sets: 3, reps: "12",   rest_seconds: 90,  muscle_group: "Chest",     equipment: "Bodyweight", icon: "accessibility_new" },
      { exercise_id: "5",  name: "Dumbbell Fly",           sets: 3, reps: "15",   rest_seconds: 60,  muscle_group: "Chest",     equipment: "Dumbbell",   icon: "fitness_center" },
    ],
  },
  {
    id: "full-body",
    name: "FULL BODY HEAVY",
    type: "predefined",
    tag: "4 DAYS",
    days: "Mon / Tue / Thu / Fri",
    focus: "STRENGTH",
    accent: true,
    description: "Compound movements only. High frequency, heavy loads. Not for the weak.",
    exercises: [
      { exercise_id: "13", name: "Barbell Squat",     sets: 5, reps: "5",  rest_seconds: 180, muscle_group: "Legs",      equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "7",  name: "Deadlift",          sets: 3, reps: "5",  rest_seconds: 240, muscle_group: "Back",      equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "1",  name: "Bench Press",       sets: 4, reps: "6",  rest_seconds: 180, muscle_group: "Chest",     equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "9",  name: "Barbell Row",       sets: 4, reps: "6",  rest_seconds: 180, muscle_group: "Back",      equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "21", name: "Overhead Press",    sets: 3, reps: "8",  rest_seconds: 120, muscle_group: "Shoulders", equipment: "Barbell",    icon: "fitness_center" },
      { exercise_id: "8",  name: "Pull Up",           sets: 3, reps: "8",  rest_seconds: 120, muscle_group: "Back",      equipment: "Bodyweight", icon: "accessibility_new" },
    ],
  },
];
