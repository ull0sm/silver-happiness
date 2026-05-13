import { NextResponse } from "next/server";

export async function GET() {
  // Simulate a quick DB call
  await new Promise((resolve) => setTimeout(resolve, 600));

  return NextResponse.json({
    weightLifted: 24.5, // 24.5k tons or just 24.5
    registeredUsers: 14250, 
    repsCompleted: 8.5, // 8.5M reps
    caloriesBurned: 42.5, // 42.5M calories
  });
}
