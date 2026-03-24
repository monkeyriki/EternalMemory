import Link from "next/link";
import { MapPin } from "lucide-react";

type MemorialType = "human" | "pet";

export type MemorialCardProps = {
  name: string;
  type: MemorialType;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  city?: string | null;
  slug: string;
  tags?: string[];
  /** Public cover image URL (e.g. Supabase storage). */
  coverImageUrl?: string | null;
};

/** Returns 4-digit year string, or null if invalid. Avoids malformed values like 19001. */
function formatYear(date?: string | null): string | null {
  if (!date || typeof date !== "string") return null;
  const s = date.trim();
  // Accept YYYY-MM-DD (e.g. from Supabase) and extract year
  const match = s.match(/^(\d{4})-/);
  if (match) {
    const y = parseInt(match[1], 10);
    if (y >= 1000 && y <= 3000) return String(y);
    return null;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  if (y < 1000 || y > 3000) return null;
  return String(y);
}

export default function MemorialCard({
  name,
  type,
  dateOfBirth,
  dateOfDeath,
  city,
  slug,
  tags = [],
  coverImageUrl
}: MemorialCardProps) {
  const label = type === "human" ? "Human" : "Pet";
  const yBirth = formatYear(dateOfBirth);
  const yDeath = formatYear(dateOfDeath);
  const dateText =
    yBirth || yDeath
      ? `${yBirth ?? "—"} – ${yDeath ?? "—"}`
      : "—";

  const cover = coverImageUrl?.trim() || null;

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-md shadow-slate-400/10 backdrop-blur transition hover:border-amber-200/60 hover:shadow-lg hover:shadow-amber-900/5">
      <div className="relative aspect-[4/3] w-full shrink-0 bg-slate-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs vary by project
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/90 text-slate-400"
            aria-hidden
          >
            <span className="font-serif text-sm font-medium tracking-wide">
              {label}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-serif text-lg font-semibold text-slate-900">
              {name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                {label}
              </span>
              <span className="text-xs text-slate-600">{dateText}</span>
            </div>
            {city ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="truncate">{city}</span>
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-600">—</div>
            )}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/80"
                  >
                    {t.replace(/-/g, " ")}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="text-[10px] text-slate-500">
                    +{tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
          <Link
            href={`/memorials/${slug}`}
            className="shrink-0 self-start rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
            aria-label={`View memorial ${name}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

