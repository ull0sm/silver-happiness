import type { Exercise } from "@/lib/exercises-data";

export type RemoteExercise = {
  id: string;
  name: string;
  force?: string | null;
  level?: string | null;
  mechanic?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  category?: string | null;
  images?: string[];
};

export const EXERCISE_DB_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/dist/exercises.json";
export const EXERCISE_IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const MUSCLE_GROUP_MAP: Record<string, string> = {
  abdominals: "Core",
  abs: "Core",
  adductors: "Legs",
  abductors: "Legs",
  biceps: "Arms",
  calves: "Legs",
  chest: "Chest",
  forearms: "Arms",
  glutes: "Glutes",
  hamstrings: "Legs",
  lats: "Back",
  "lower back": "Back",
  quadriceps: "Legs",
  shoulders: "Shoulders",
  traps: "Shoulders",
  triceps: "Arms",
  neck: "Shoulders",
  cardio: "Cardio",
  fullbody: "Full Body",
};

const EQUIPMENT_MAP: Record<string, string> = {
  "body only": "Bodyweight",
  bands: "Band",
  barbell: "Barbell",
  cable: "Cable",
  dumbbell: "Dumbbell",
  "e-z curl bar": "EZ Curl Bar",
  "exercise ball": "Exercise Ball",
  "foam roll": "Foam Roll",
  kettlebells: "Kettlebell",
  machine: "Machine",
  "medicine ball": "Medicine Ball",
  other: "Other",
};

const DEFAULT_ICON_BY_GROUP: Record<string, string> = {
  Arms: "fitness_center",
  Back: "fitness_center",
  Cardio: "directions_run",
  Chest: "fitness_center",
  Core: "self_improvement",
  Glutes: "fitness_center",
  Legs: "fitness_center",
  Shoulders: "fitness_center",
  "Full Body": "fitness_center",
};

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeEquipment(value?: string | null) {
  if (!value) return "Other";
  const normalized = value.trim().toLowerCase();
  return EQUIPMENT_MAP[normalized] ?? titleCase(normalized);
}

function normalizeMuscleGroup(primaryMuscles: string[] = [], category?: string | null) {
  const firstMuscle = primaryMuscles[0]?.trim().toLowerCase();
  const mappedMuscle = firstMuscle ? MUSCLE_GROUP_MAP[firstMuscle] : undefined;

  if (mappedMuscle) return mappedMuscle;
  if (category === "cardio") return "Cardio";
  return "Full Body";
}

function normalizeDifficulty(level?: string | null): Exercise["difficulty"] {
  switch (level) {
    case "beginner":
      return "beginner";
    case "intermediate":
      return "intermediate";
    case "expert":
    case "advanced":
      return "advanced";
    default:
      return "intermediate";
  }
}

function normalizeCategory(category?: string | null, mechanic?: string | null): Exercise["category"] {
  if (category === "cardio") return "cardio";
  if (category === "plyometrics") return "plyometric";
  return mechanic === "isolation" ? "isolation" : "compound";
}

function normalizeIcon(category: Exercise["category"], muscleGroup: string) {
  if (category === "cardio") return "directions_run";
  if (muscleGroup === "Core") return "self_improvement";
  if (muscleGroup === "Full Body") return "fitness_center";
  return DEFAULT_ICON_BY_GROUP[muscleGroup] ?? "fitness_center";
}

function normalizeSecondaryMuscles(values: string[] = []) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => titleCase(value));
}

export function buildExerciseImageUrl(imagePath: string) {
  return `${EXERCISE_IMAGE_BASE_URL}${imagePath}`;
}

export function normalizeRemoteExercise(exercise: RemoteExercise): Exercise {
  const muscleGroup = normalizeMuscleGroup(exercise.primaryMuscles ?? [], exercise.category);
  const category = normalizeCategory(exercise.category, exercise.mechanic);
  const instructions = (exercise.instructions ?? []).map((step) => step.trim()).filter(Boolean);
  const instructionSummary = instructions[0] ?? "";

  return {
    id: exercise.id,
    name: exercise.name,
    muscle_group: muscleGroup,
    secondary_muscles: normalizeSecondaryMuscles(exercise.secondaryMuscles ?? []),
    equipment: normalizeEquipment(exercise.equipment),
    difficulty: normalizeDifficulty(exercise.level),
    category,
    form_tips: instructionSummary,
    instructions: instructions.join(" "),
    swaps: [],
    icon: normalizeIcon(category, muscleGroup),
    primary_muscles: exercise.primaryMuscles,
    force: exercise.force === "push" || exercise.force === "pull" || exercise.force === "static" ? exercise.force : undefined,
    mechanic: exercise.mechanic === "compound" || exercise.mechanic === "isolation" ? exercise.mechanic : undefined,
    level: normalizeDifficulty(exercise.level),
    instruction_steps: instructions,
    images: exercise.images,
  };
}

export function normalizeRemoteExercises(exercises: RemoteExercise[]) {
  return exercises.map(normalizeRemoteExercise);
}

export function matchesExerciseQuery(exercise: Exercise, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return true;

  const searchableParts = [
    exercise.name,
    exercise.muscle_group,
    exercise.equipment,
    exercise.form_tips,
    exercise.instructions,
    ...(exercise.primary_muscles ?? []),
    ...(exercise.secondary_muscles ?? []),
    ...(exercise.instruction_steps ?? []),
  ];

  return searchableParts.some((part) => part.toLowerCase().includes(normalizedQuery));
}