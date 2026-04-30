import { NextResponse } from "next/server";
import { EXERCISES } from "@/lib/exercises-data";
import { EXERCISE_DB_URL, normalizeRemoteExercises, type RemoteExercise } from "@/lib/exercise-catalog";

export async function GET() {
  try {
    const response = await fetch(EXERCISE_DB_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      throw new Error(`Exercise database request failed with ${response.status}`);
    }

    const exercises = (await response.json()) as RemoteExercise[];
    return NextResponse.json(normalizeRemoteExercises(exercises));
  } catch {
    return NextResponse.json(EXERCISES);
  }
}