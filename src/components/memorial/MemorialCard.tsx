import Link from "next/link";
import { CalendarDays, Image as ImageIcon, MapPin } from "lucide-react";

type MemorialType = "human" | "pet";

export type MemorialCardProps = {
  name: string;
  type: MemorialType;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  description?: string | null;
  city?: string | null;
  slug: string;
  tags?: string[];
  tributeCount?: number;
  photosCount?: number;
  /** Public cover image URL (e.g. Supabase storage). */
  coverImageUrl?: string | null;
};

function formatFullDate(date?: string | null): string | null {
  if (!date || typeof date !== "string") return null;
  const s = date.trim();
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function plainTextSummary(input?: string | null): string {
  if (!input) return "";
  // Convert HTML-ish story content to plain text for card previews.
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function MemorialCard({
  name,
  type,
  dateOfBirth,
  dateOfDeath,
  description,
  city,
  slug,
  tags = [],
  tributeCount = 0,
  photosCount = 0,
  coverImageUrl
}: MemorialCardProps) {
  const label = type === "human" ? "Human" : "Pet";
  const yBirth = formatFullDate(dateOfBirth);
  const yDeath = formatFullDate(dateOfDeath);
  const dateText =
    yBirth || yDeath
      ? `${yBirth ?? "—"} – ${yDeath ?? "—"}`
      : "—";
  const summary = plainTextSummary(description);

  const cover = coverImageUrl?.trim() || null;

  return (
    <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-md shadow-slate-400/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-[#e07a3f]/30 hover:shadow-lg hover:shadow-amber-900/5">
      {/* Fixed crop: intrinsic image size must not affect layout (absolute fill + object-cover). */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs vary by project
          <img
            src={cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/90 text-slate-400"
            aria-hidden
          >
            <span className="font-serif text-sm font-medium tracking-wide">
              {label}
            </span>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-serif text-3xl font-semibold leading-tight text-slate-900">
            {name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              {label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              {dateText}
            </span>
          </div>
          {summary ? (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{summary}</p>
          ) : null}
          {city ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
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
        <div className="mt-4 flex shrink-0 items-center gap-4 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-[#e07a3f]" />
              <span>{Math.max(photosCount, 0)} photos</span>
            </span>
            <span className="text-slate-400">|</span>
            <span>{Math.max(tributeCount, 0)} tributes</span>
          </div>
          <Link
            href={`/memorials/${slug}`}
            className="ml-auto inline-flex rounded-xl bg-[#e07a3f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d96c2f]"
            aria-label={`View memorial ${name}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

