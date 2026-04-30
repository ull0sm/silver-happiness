/**
 * scripts/seed-exercises.ts
 *
 * Seeds the `exercises` table from the open-source `free-exercise-db` project
 * (https://github.com/yuhonas/free-exercise-db, MIT licensed).
 *
 * Usage:
 *   npm run seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (server-only) in your .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import * as path from "node:path";
import * as fs from "node:fs";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const RAW =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

interface FreeExercise {
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
}

async function fetchExercises(): Promise<FreeExercise[]> {
  // Cache locally to avoid re-downloading.
  const cache = path.resolve(process.cwd(), "supabase", "seed", "_exercises.cache.json");
  if (fs.existsSync(cache)) {
    return JSON.parse(fs.readFileSync(cache, "utf8"));
  }
  console.log("Downloading", RAW);
  const res = await fetch(RAW);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as FreeExercise[];
  fs.mkdirSync(path.dirname(cache), { recursive: true });
  fs.writeFileSync(cache, JSON.stringify(json));
  return json;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { persistSession: false },
  });

  const exercises = await fetchExercises();
  console.log(`Loaded ${exercises.length} source exercises`);

  // Build deduped slugs (just in case)
  const seenSlugs = new Set<string>();
  const rows = exercises
    .map((e) => {
      let slug = slugify(e.name);
      if (!slug) return null;
      while (seenSlugs.has(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
      seenSlugs.add(slug);
      return {
        slug,
        name: e.name,
        primary_muscles: e.primaryMuscles ?? [],
        secondary_muscles: e.secondaryMuscles ?? [],
        equipment: e.equipment ?? null,
        category: e.category ?? null,
        level: e.level ?? null,
        force: e.force ?? null,
        mechanic: e.mechanic ?? null,
        instructions: e.instructions ?? [],
        image_urls: (e.images ?? []).map((p) => `${IMAGE_BASE}/${p}`),
        is_custom: false,
      };
    })
    .filter(Boolean) as Record<string, unknown>[];

  console.log(`Upserting ${rows.length} rows in batches of 200...`);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error, count } = await supabase
      .from("exercises")
      .upsert(batch, { onConflict: "slug", count: "exact", ignoreDuplicates: false });
    if (error) {
      console.error("Batch failed at", i, error.message);
      process.exit(1);
    }
    inserted += count ?? batch.length;
    process.stdout.write(`  ${inserted}/${rows.length}\r`);
  }
  console.log(`\nSeed complete: ${inserted} exercises.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
