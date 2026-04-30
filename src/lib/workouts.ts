"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Start a workout from a template (curated or custom). Redirects to active log. */
export async function startSessionFromTemplate(templateId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tpl, error: tplErr } = await supabase
    .from("workout_templates")
    .select("id, name")
    .eq("id", templateId)
    .single();
  if (tplErr || !tpl) throw new Error("Template not found");

  const { data: session, error: sErr } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, template_id: tpl.id, name: tpl.name })
    .select("id")
    .single();
  if (sErr || !session) throw new Error(sErr?.message ?? "Failed to start session");

  // Pre-populate session_exercises from template_exercises (day 0)
  const { data: tplExs } = await supabase
    .from("template_exercises")
    .select("exercise_id, position")
    .eq("template_id", tpl.id)
    .eq("day_index", 0)
    .order("position", { ascending: true });

  if (tplExs && tplExs.length > 0) {
    await supabase.from("session_exercises").insert(
      tplExs.map((te) => ({
        session_id: session.id,
        exercise_id: te.exercise_id,
        position: te.position,
      })),
    );
  }

  revalidatePath("/workouts");
  redirect(`/workouts/sessions/${session.id}`);
}

/** Start a blank ad-hoc session. */
export async function startBlankSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, name: "Quick Session" })
    .select("id")
    .single();
  if (error || !session) throw new Error(error?.message ?? "Failed to start");
  redirect(`/workouts/sessions/${session.id}`);
}

/** Repeat (clone) a previous session as a new active session. */
export async function repeatSession(prevSessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prev } = await supabase
    .from("workout_sessions")
    .select("name")
    .eq("id", prevSessionId)
    .eq("user_id", user.id)
    .single();
  if (!prev) throw new Error("Session not found");

  const { data: ne } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, name: prev.name })
    .select("id")
    .single();
  if (!ne) throw new Error("Failed to start session");

  const { data: prevExs } = await supabase
    .from("session_exercises")
    .select("exercise_id, position")
    .eq("session_id", prevSessionId)
    .order("position", { ascending: true });

  if (prevExs && prevExs.length > 0) {
    await supabase.from("session_exercises").insert(
      prevExs.map((e) => ({
        session_id: ne.id,
        exercise_id: e.exercise_id,
        position: e.position,
      })),
    );
  }

  redirect(`/workouts/sessions/${ne.id}`);
}

interface BuilderExercise {
  exercise_id: string;
  position: number;
  target_sets: number;
  target_reps: string;
  rest_seconds: number;
}

/** Save a custom workout template with its exercise list. */
export async function saveCustomTemplate(input: {
  name: string;
  description?: string;
  split?: string | null;
  exercises: BuilderExercise[];
  templateId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let templateId = input.templateId;

  if (!templateId) {
    const { data, error } = await supabase
      .from("workout_templates")
      .insert({
        owner_id: user.id,
        name: input.name,
        description: input.description ?? null,
        type: "custom",
        split: input.split ?? null,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to save template");
    templateId = data.id;
  } else {
    const { error } = await supabase
      .from("workout_templates")
      .update({
        name: input.name,
        description: input.description ?? null,
        split: input.split ?? null,
      })
      .eq("id", templateId)
      .eq("owner_id", user.id);
    if (error) throw new Error(error.message);
    await supabase.from("template_exercises").delete().eq("template_id", templateId);
  }

  if (input.exercises.length > 0) {
    const rows = input.exercises.map((e) => ({
      template_id: templateId!,
      day_index: 0,
      exercise_id: e.exercise_id,
      position: e.position,
      target_sets: e.target_sets,
      target_reps: e.target_reps,
      rest_seconds: e.rest_seconds,
    }));
    const { error } = await supabase.from("template_exercises").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/workouts");
  return { templateId };
}

/** Add a single exercise to a session (during active workout). */
export async function addExerciseToSession(sessionId: string, exerciseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("session_exercises")
    .select("position")
    .eq("session_id", sessionId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPos = (existing?.position ?? -1) + 1;

  const { error } = await supabase.from("session_exercises").insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    position: nextPos,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/workouts/sessions/${sessionId}`);
}

/** Insert or update a session set. */
export async function upsertSet(input: {
  id?: string;
  session_exercise_id: string;
  set_index: number;
  weight: number;
  reps: number;
  is_warmup?: boolean;
  completed?: boolean;
  sessionId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = {
    session_exercise_id: input.session_exercise_id,
    set_index: input.set_index,
    weight: input.weight,
    reps: input.reps,
    is_warmup: input.is_warmup ?? false,
    completed_at: input.completed ? new Date().toISOString() : null,
  };

  if (input.id) {
    const { error } = await supabase.from("session_sets").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("session_sets").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/workouts/sessions/${input.sessionId}`);
}

/** Finalise the workout: marks finished, runs streak + badge logic. */
export async function finishSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("finish_session", { p_session_id: sessionId });
  if (error) throw new Error(error.message);
  revalidatePath("/workouts");
  revalidatePath("/analytics");
  return { awarded: (data?.[0]?.awarded_badges as string[] | undefined) ?? [] };
}
