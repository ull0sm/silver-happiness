import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/Icon";
import { startSessionFromTemplate, repeatSession, startBlankSession } from "@/lib/workouts";

export const metadata = { title: "The Hub — IRON TRACK" };

export const dynamic = "force-dynamic";

const PLAN_VISUAL: Record<string, { gradient: string; chip: string; days: string; tag: string }> = {
  PPL: {
    gradient:
      "from-[#410000] via-black to-black",
    chip: "bg-primary-container text-black",
    days: "3 DAYS",
    tag: "HYPERTROPHY",
  },
  Bro: {
    gradient: "from-[#1c1b1b] via-black to-black",
    chip: "bg-surface-variant text-white",
    days: "5 DAYS",
    tag: "VOLUME",
  },
  FullBody: {
    gradient: "from-[#93000a] via-black to-black",
    chip: "bg-primary-container text-black",
    days: "4 DAYS",
    tag: "STRENGTH",
  },
};

function intensityBars(volume: number) {
  // 12k+ = 5 bars, 8k = 3, etc.
  const lit = Math.min(5, Math.max(1, Math.round(volume / 3000)));
  return Array.from({ length: 5 }, (_, i) =>
    i < lit ? (i === lit - 1 ? "bg-secondary-container" : "bg-primary-container") : "bg-surface-container-highest",
  );
}

export default async function WorkoutsHub() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: curated }, { data: customTpls }, { data: recent }] = await Promise.all([
    supabase
      .from("workout_templates")
      .select("id, name, description, split, days_per_week")
      .eq("type", "curated")
      .order("name"),
    supabase
      .from("workout_templates")
      .select("id, name, description, split, days_per_week")
      .eq("type", "custom")
      .eq("owner_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("workout_sessions")
      .select("id, name, started_at, finished_at, total_volume")
      .eq("user_id", user!.id)
      .order("started_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero header */}
      <div className="px-6 md:px-margin-desktop py-stack-md border-b-2 border-surface-container-high relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/20 to-transparent opacity-50 pointer-events-none" />
        <h1 className="font-display-xl text-display-xl text-white uppercase italic relative z-10">
          THE HUB
        </h1>
        <p className="font-body-lg text-body-lg text-tertiary-fixed-dim mt-2 uppercase tracking-wide relative z-10">
          Select your weapon. Build your arsenal.
        </p>
      </div>

      <div className="p-6 md:p-margin-desktop flex flex-col gap-stack-lg">
        {/* CURATED PLANS */}
        <section className="flex flex-col gap-stack-sm">
          <div className="flex items-end justify-between border-b-2 border-surface-container-highest pb-2 mb-4">
            <h2 className="font-headline-lg text-headline-lg text-primary uppercase italic">
              CURATED PLANS
            </h2>
            <span className="font-label-bold text-label-bold text-surface-variant uppercase">
              PRE-BUILT DESTRUCTION
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {(curated ?? []).map((tpl) => {
              const v = (tpl.split && PLAN_VISUAL[tpl.split as string]) || PLAN_VISUAL.FullBody;
              return (
                <form
                  key={tpl.id}
                  action={async () => {
                    "use server";
                    await startSessionFromTemplate(tpl.id);
                  }}
                >
                  <button
                    type="submit"
                    className="bg-surface-container-high border-2 border-black flex flex-col relative group overflow-hidden cursor-pointer h-64 w-full text-left"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary-container group-hover:bg-secondary-container transition-colors" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${v.gradient}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                      <div className="flex gap-2">
                        <span className={`${v.chip} font-label-bold text-label-bold px-2 py-1 uppercase`}>
                          {tpl.days_per_week ? `${tpl.days_per_week} DAYS` : v.days}
                        </span>
                        <span className="bg-black text-primary font-label-bold text-label-bold px-2 py-1 uppercase border border-primary-container">
                          {v.tag}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-white uppercase italic mb-1 group-hover:text-primary transition-colors">
                          {tpl.name}
                        </h3>
                        <p className="font-body-md text-body-md text-tertiary-fixed-dim line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </form>
              );
            })}
          </div>
        </section>

        {/* CUSTOM TEMPLATES */}
        <section className="flex flex-col gap-stack-sm">
          <div className="flex items-end justify-between border-b-2 border-surface-container-highest pb-2 mb-4">
            <h2 className="font-headline-lg text-headline-lg text-white uppercase italic">CUSTOM FORGE</h2>
            <Link
              href="/workouts/builder"
              className="font-label-bold text-label-bold text-primary uppercase hover:text-white transition-colors flex items-center gap-2"
            >
              <Icon name="add" /> NEW ROUTINE
            </Link>
          </div>

          {customTpls && customTpls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {customTpls.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-surface-container border-2 border-surface-variant p-4 flex flex-col gap-2 hover:border-primary-container transition-colors"
                >
                  <h4 className="font-headline-md text-2xl text-white uppercase italic">{tpl.name}</h4>
                  {tpl.description && (
                    <p className="text-body-md text-tertiary-fixed-dim line-clamp-2">{tpl.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <form
                      action={async () => {
                        "use server";
                        await startSessionFromTemplate(tpl.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="bg-primary-container text-black font-label-bold text-label-bold uppercase italic px-4 py-2 hover:bg-secondary-container transition-colors"
                      >
                        START
                      </button>
                    </form>
                    <Link
                      href={`/workouts/builder?id=${tpl.id}`}
                      className="border-2 border-surface-variant text-on-surface font-label-bold text-label-bold uppercase italic px-4 py-2 hover:border-primary-container hover:text-primary-container transition-colors"
                    >
                      EDIT
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Link
              href="/workouts/builder"
              className="border-2 border-dashed border-surface-variant bg-black/40 hover:border-primary-container/60 transition-colors flex flex-col items-center justify-center gap-2 p-12 text-center"
            >
              <Icon name="construction" className="text-4xl text-surface-variant" />
              <span className="font-headline-md text-2xl uppercase italic text-tertiary-fixed-dim">
                Forge your own routine
              </span>
              <span className="font-body-md text-tertiary-fixed-dim">
                Drag and drop exercises into a custom plan.
              </span>
            </Link>
          )}
        </section>

        {/* RECENT */}
        <section className="flex flex-col gap-stack-sm pb-12">
          <div className="flex items-end justify-between border-b-2 border-surface-container-highest pb-2 mb-4">
            <h2 className="font-headline-lg text-headline-lg text-white uppercase italic">RECENT CARNAGE</h2>
            <form action={startBlankSession}>
              <button
                type="submit"
                className="font-label-bold text-label-bold text-primary uppercase hover:text-white transition-colors flex items-center gap-2"
              >
                <Icon name="bolt" /> QUICK SESSION
              </button>
            </form>
          </div>

          {recent && recent.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recent.map((s) => {
                const dt = new Date(s.started_at);
                const day = dt.getDate();
                const mon = dt.toLocaleString("en-US", { month: "short" }).toUpperCase();
                const bars = intensityBars(Number(s.total_volume) || 0);
                const finished = !!s.finished_at;
                return (
                  <div
                    key={s.id}
                    className="bg-black border-2 border-surface-container-high p-4 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-primary-container transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="w-16 h-16 bg-surface-container-high border-2 border-black flex flex-col items-center justify-center text-center">
                        <span className="font-headline-md text-headline-md text-primary leading-none">
                          {day}
                        </span>
                        <span className="font-label-bold text-[10px] text-tertiary-fixed-dim uppercase leading-none mt-1">
                          {mon}
                        </span>
                      </div>
                      <div>
                        <Link
                          href={`/workouts/sessions/${s.id}`}
                          className="font-headline-md text-2xl text-white uppercase italic group-hover:text-primary transition-colors"
                        >
                          {s.name}
                        </Link>
                        <div className="font-label-bold text-label-bold text-tertiary-fixed-dim uppercase mt-1">
                          <span className="text-white">VOL:</span>{" "}
                          {Math.round(Number(s.total_volume) || 0).toLocaleString()}
                          <span className="mx-2">•</span>
                          <span className="text-white">STATUS:</span> {finished ? "DONE" : "ACTIVE"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t-2 border-surface-container-highest md:border-none pt-4 md:pt-0">
                      <div className="flex gap-1">
                        {bars.map((cls, i) => (
                          <div key={i} className={`w-2 h-6 ${cls}`} />
                        ))}
                      </div>
                      {finished ? (
                        <form
                          action={async () => {
                            "use server";
                            await repeatSession(s.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="border-2 border-primary-container text-primary-container font-label-bold text-label-bold px-4 py-2 uppercase hover:bg-primary-container hover:text-black transition-colors"
                          >
                            REPEAT
                          </button>
                        </form>
                      ) : (
                        <Link
                          href={`/workouts/sessions/${s.id}`}
                          className="bg-primary-container text-black font-label-bold text-label-bold px-4 py-2 uppercase hover:bg-secondary-container transition-colors"
                        >
                          RESUME
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-2 border-dashed border-surface-variant p-12 text-center text-tertiary-fixed-dim uppercase">
              No sessions yet. Pick a plan above and start hammering.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
