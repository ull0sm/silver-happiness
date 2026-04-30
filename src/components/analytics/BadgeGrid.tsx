import { Icon } from "@/components/ui/Icon";

interface BadgeRow {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface Props {
  all: BadgeRow[];
  earnedSlugs: Set<string>;
}

export function BadgeGrid({ all, earnedSlugs }: Props) {
  if (!all.length) {
    return (
      <div className="text-tertiary-fixed-dim font-body-md uppercase">
        No badges configured.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {all.map((b) => {
        const earned = earnedSlugs.has(b.slug);
        return (
          <div
            key={b.slug}
            className={`p-4 border-2 flex flex-col items-center text-center gap-2 transition-all ${
              earned
                ? "bg-primary-container/10 border-primary-container text-on-background"
                : "bg-surface-container border-black text-tertiary-fixed-dim opacity-60"
            }`}
          >
            <Icon
              name={b.icon ?? "trophy"}
              filled={earned}
              className={`text-3xl ${earned ? "text-primary-container" : "text-tertiary-fixed-dim"}`}
            />
            <div className="font-label-bold text-label-bold uppercase">{b.name}</div>
            {b.description && (
              <div className="text-xs text-tertiary-fixed-dim line-clamp-2">{b.description}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
