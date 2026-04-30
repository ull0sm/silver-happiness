"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createSquad, joinSquad } from "@/lib/social-actions";

type LeaderboardEntry = { rank: number; name: string; score: number; uid: string };
type Squad = { id: string; name: string; invite_code: string } | null;
type SquadMember = { rank: number; name: string; score: number };
type Challenge = { id: string; title: string; metric: string; target: number; current: number; ends: string };

const RANK_COLORS: Record<number, string> = {
  1: "text-primary-container",
  2: "text-on-surface",
  3: "text-on-surface",
};

const ACHIEVEMENTS = [
  { key: "first_session",  label: "FIRST BLOOD",     icon: "fitness_center",       desc: "Complete your first workout",  earned: false },
  { key: "week_streak",    label: "IRON WILL",        icon: "local_fire_department",desc: "7-day streak",                earned: false },
  { key: "century",        label: "CENTURION",        icon: "military_tech",        desc: "100 total sessions",          earned: false },
  { key: "volume_10t",     label: "10 TONNES",        icon: "monitor_weight",       desc: "Lift 10,000kg total",         earned: false },
  { key: "month_streak",   label: "NO REST MONTH",    icon: "emoji_events",         desc: "30-day streak",               earned: false },
  { key: "pr_hunter",      label: "PR HUNTER",        icon: "trending_up",          desc: "Set 10 personal records",     earned: false },
];

export function SocialClient({ leaderboard, currentUserId, squad, squadMembers, challenges }: {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  squad: Squad;
  squadMembers: SquadMember[];
  challenges: Challenge[];
}) {
  const top5 = leaderboard.slice(0, 5);
  const rest  = leaderboard.slice(5);
  const userInTop5 = top5.some((e) => e.uid === currentUserId);

  const [tab, setTab] = useState<"volume" | "streak" | "sessions">("volume");
  const [squadModal, setSquadModal] = useState<"create" | "join" | null>(null);
  const [squadInput, setSquadInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [inviteCode, setInviteCode] = useState<string | null>(squad?.invite_code ?? null);

  function handleSquadAction(type: "create" | "join") {
    if (!squadInput.trim()) return;
    startTransition(async () => {
      if (type === "create") {
        const res = await createSquad(squadInput);
        if (res.error) setFeedback(`⚠ ${res.error}`);
        else { setFeedback("✓ Squad created!"); setInviteCode(res.inviteCode ?? null); setSquadModal(null); }
      } else {
        const res = await joinSquad(squadInput);
        if (res.error) setFeedback(`⚠ ${res.error}`);
        else { setFeedback(`✓ Joined ${res.squadName}!`); setSquadModal(null); }
      }
      setSquadInput("");
    });
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in">

      {/* Header */}
      <div className="border-b-2 border-surface-container-high pb-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none" />
        <h1 className="text-display-xl font-black italic uppercase text-on-background leading-none tracking-tighter relative z-10">
          BATTLEGROUND
        </h1>
        <p className="font-black text-label-bold text-on-surface-variant uppercase mt-2 tracking-widest italic relative z-10 border-l-2 border-primary-container pl-4">
          Prove your worth. Crush the weak.
        </p>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`mb-6 px-4 py-3 border-2 font-black text-sm uppercase tracking-widest animate-fade-in ${
          feedback.startsWith("⚠") ? "border-error bg-error-container text-on-error-container" : "border-primary-container bg-surface-container-high text-primary-container"
        }`}>
          {feedback}
          <button onClick={() => setFeedback(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ── Leaderboard (col-8) ────────────────────── */}
        <div className="md:col-span-8 bg-surface-container-low border-2 border-black p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container opacity-10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-surface-container-high pb-4 mb-6 gap-4 relative z-10">
            <div>
              <h2 className="font-headline-lg text-headline-lg italic uppercase text-on-surface">GLOBAL TOP 5</h2>
              <p className="text-label-bold font-black text-on-surface-variant uppercase tracking-widest mt-1">Weekly Ranking</p>
            </div>
            {/* Metric tabs */}
            <div className="flex gap-1">
              {(["volume", "streak", "sessions"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    tab === t ? "bg-primary-container text-black" : "bg-surface-container-high text-on-surface-variant hover:text-primary-container border border-surface-variant"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Top 5 rows */}
          <div className="flex flex-col gap-2 relative z-10">
            {top5.length === 0 ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">leaderboard</span>
                <p className="font-black italic uppercase text-on-surface-variant">No data yet this week</p>
                <p className="text-xs text-on-surface-variant mt-1">Complete a workout to appear here</p>
              </div>
            ) : (
              top5.map((entry) => (
                <LeaderboardRow
                  key={entry.uid}
                  entry={entry}
                  isCurrentUser={entry.uid === currentUserId}
                  metric={tab}
                />
              ))
            )}
          </div>

          {/* Login gate for rest */}
          {rest.length > 0 && !userInTop5 ? (
            <div className="mt-4 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
                {rest.slice(0, 2).map((entry) => (
                  <div key={entry.uid} className="flex items-center gap-4 p-3 bg-surface-container-high border-l-4 border-surface-variant mb-2 blur-sm">
                    <div className="w-8 text-center font-black text-on-surface-variant italic">{entry.rank}</div>
                    <div className="flex-1">
                      <div className="font-black text-sm uppercase text-on-surface-variant">••••••••</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Link href="/auth" className="bg-primary-container text-black font-black italic uppercase px-8 py-4 hover:bg-secondary-container transition-colors text-sm tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                  VIEW FULL RANKINGS
                </Link>
              </div>
            </div>
          ) : rest.length > 0 ? (
            <details className="mt-4 relative z-10">
              <summary className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-container cursor-pointer transition-colors py-2">
                Show {rest.length} more ranks
              </summary>
              <div className="flex flex-col gap-2 mt-2">
                {rest.map((entry) => (
                  <LeaderboardRow key={entry.uid} entry={entry} isCurrentUser={entry.uid === currentUserId} metric={tab} />
                ))}
              </div>
            </details>
          ) : null}
        </div>

        {/* ── Squad + Challenges (col-4) ─────────────── */}
        <div className="md:col-span-4 flex flex-col gap-4">

          {/* Squad card */}
          <div className="bg-surface-container-low border-2 border-black p-6">
            <div className="flex justify-between items-end border-b-2 border-surface-container-high pb-3 mb-4">
              <div>
                <h3 className="font-headline-md text-headline-md italic uppercase text-on-surface">
                  {squad ? squad.name : "BLOOD PACT"}
                </h3>
                {squad && (
                  <p className="text-label-bold font-black uppercase tracking-widest text-on-surface-variant mt-0.5">
                    CODE: <span className="text-primary-container">{squad.invite_code}</span>
                  </p>
                )}
              </div>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>

            {squadMembers.length > 0 ? (
              <div className="flex flex-col gap-2 mb-4">
                {squadMembers.map((m) => (
                  <div key={m.rank} className={`flex items-center justify-between p-2 border-l-2 ${m.rank === 1 ? "bg-surface-container-high border-primary-container" : "border-surface-variant"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm w-4 ${m.rank === 1 ? "text-primary-container" : "text-on-surface-variant"}`}>{m.rank}</span>
                      <span className={`font-black text-xs uppercase ${m.rank === 1 ? "text-on-surface" : "text-on-surface-variant"}`}>{m.name}</span>
                    </div>
                    <span className={`font-black text-xs ${m.rank === 1 ? "text-primary-container" : "text-on-surface-variant"}`}>
                      {m.score.toLocaleString()}kg
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-xs font-bold uppercase mb-4">
                {squad ? "No sessions logged this week yet." : "No squad yet. Create or join one below."}
              </p>
            )}

            {/* Squad actions */}
            {!squad ? (
              <div className="flex flex-col gap-2">
                <button onClick={() => setSquadModal("create")} className="w-full border-2 border-primary-container text-primary-container font-black italic uppercase py-2 hover:bg-primary-container hover:text-black transition-colors text-xs tracking-widest flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span> CREATE SQUAD
                </button>
                <button onClick={() => setSquadModal("join")} className="w-full border-2 border-surface-container-high text-on-surface-variant font-black italic uppercase py-2 hover:border-primary-container hover:text-primary-container transition-colors text-xs tracking-widest flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">login</span> JOIN SQUAD
                </button>
              </div>
            ) : (
              <button
                onClick={() => { navigator.clipboard.writeText(squad.invite_code); setFeedback("✓ Invite code copied!"); }}
                className="w-full border-2 border-primary-container text-primary-container font-black italic uppercase py-2 hover:bg-primary-container hover:text-black transition-colors text-xs tracking-widest flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span> COPY INVITE CODE
              </button>
            )}
          </div>

          {/* Challenges */}
          <div className="bg-surface-container-low border-2 border-black p-6 flex-1">
            <div className="flex justify-between items-center border-b-2 border-surface-container-high pb-3 mb-4">
              <h3 className="font-headline-md text-headline-md italic uppercase text-on-surface">ACTIVE DIRECTIVES</h3>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            </div>
            <div className="flex flex-col gap-5">
              {challenges.map((c) => {
                const pct = Math.min(100, Math.round((c.current / c.target) * 100));
                const segments = 5;
                const filled = Math.round((pct / 100) * segments);
                return (
                  <div key={c.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-on-surface text-xs uppercase font-black">{c.title}</span>
                      <span className="text-primary-container text-xs font-black">{pct}%</span>
                    </div>
                    <div className="h-4 flex gap-1 bg-black p-1 border border-surface-variant">
                      {Array.from({ length: segments }).map((_, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: i < filled ? "#e60000" : "#2a2a2a" }} />
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase mt-1">Ends {c.ends}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Achievements (col-12) ──────────────────── */}
        <div className="md:col-span-12 bg-surface-container-low border-2 border-black p-6">
          <div className="flex items-end justify-between border-b-2 border-surface-container-high pb-3 mb-6">
            <h2 className="font-headline-lg text-headline-lg italic uppercase text-on-surface">COMBAT MEDALS</h2>
            <span className="text-label-bold font-black text-on-surface-variant uppercase tracking-widest">
              {ACHIEVEMENTS.filter((a) => a.earned).length}/{ACHIEVEMENTS.length} earned
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.key}
                className={`flex flex-col items-center justify-center p-4 border-2 text-center gap-2 transition-all ${
                  a.earned
                    ? "border-primary-container bg-primary-container/10"
                    : "border-surface-container-high bg-surface-container opacity-50 grayscale"
                }`}
              >
                <span className="material-symbols-outlined text-3xl text-primary-container" style={{ fontVariationSettings: a.earned ? "'FILL' 1" : "'FILL' 0" }}>
                  {a.icon}
                </span>
                <div className="font-black text-xs uppercase tracking-widest text-on-surface leading-tight">{a.label}</div>
                <div className="text-[10px] text-on-surface-variant leading-tight">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Squad modal */}
      {squadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSquadModal(null)}>
          <div className="bg-surface-container-lowest border-2 border-primary-container w-full max-w-md p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline-md text-headline-md italic uppercase text-on-surface mb-6">
              {squadModal === "create" ? "FORGE A SQUAD" : "JOIN A SQUAD"}
            </h3>
            <label className="block font-label-bold text-label-bold uppercase tracking-widest text-on-surface-variant mb-2">
              {squadModal === "create" ? "SQUAD NAME" : "INVITE CODE"}
            </label>
            <input
              type="text"
              value={squadInput}
              onChange={(e) => setSquadInput(e.target.value.toUpperCase())}
              placeholder={squadModal === "create" ? "E.G. IRON WOLVES" : "E.G. ABC12345"}
              autoFocus
              className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface font-label-bold text-label-bold italic uppercase px-4 py-3 mb-6"
              onKeyDown={(e) => e.key === "Enter" && handleSquadAction(squadModal)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleSquadAction(squadModal)}
                className="flex-1 bg-primary-container text-black font-label-bold text-label-bold italic uppercase py-3 hover:bg-secondary-container transition-colors tracking-widest"
              >
                {squadModal === "create" ? "CREATE" : "JOIN"}
              </button>
              <button
                onClick={() => setSquadModal(null)}
                className="px-6 border-2 border-surface-container-high text-on-surface-variant hover:border-primary-container transition-colors font-label-bold text-label-bold uppercase"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Leaderboard Row ──────────────────────────────────────── */
function LeaderboardRow({ entry, isCurrentUser, metric }: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  metric: "volume" | "streak" | "sessions";
}) {
  const initials = entry.name.slice(0, 2).toUpperCase();
  const units = { volume: "KG", streak: "DAYS", sessions: "SESS" };

  return (
    <div className={`flex items-center gap-3 p-3 border-l-4 group hover:bg-surface-container transition-colors ${
      entry.rank === 1 ? "border-primary-container bg-surface-container-high" :
      isCurrentUser ? "border-secondary-container bg-surface-container" :
      "border-surface-variant"
    }`}>
      {/* Rank */}
      <div className={`w-8 text-center font-black italic text-xl shrink-0 ${RANK_COLORS[entry.rank] ?? "text-on-surface-variant"}`}>
        {entry.rank}
      </div>
      {/* Avatar */}
      <div className="w-10 h-10 bg-surface-variant border border-surface-container-highest flex items-center justify-center shrink-0">
        <span className="font-black text-xs text-on-surface">{initials}</span>
      </div>
      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className={`font-black text-sm uppercase truncate ${isCurrentUser ? "text-primary-container" : "text-on-surface"}`}>
          {entry.name} {isCurrentUser && <span className="text-[10px] text-on-surface-variant">(YOU)</span>}
        </div>
        <div className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest">
          {entry.score.toLocaleString()} {units[metric]}
        </div>
      </div>
      {/* Badge for #1 */}
      {entry.rank === 1 && (
        <span className="material-symbols-outlined text-primary-container animate-pr-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
          local_fire_department
        </span>
      )}
    </div>
  );
}
