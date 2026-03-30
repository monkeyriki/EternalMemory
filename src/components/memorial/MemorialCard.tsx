import Link from "next/link";
import { Heart, Image as ImageIcon, MapPin } from "lucide-react";

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
      ? `${yBirth ?? "—"} — ${yDeath ?? "—"}`
      : "—";
  const summary = plainTextSummary(description);

  const cover = coverImageUrl?.trim() || null;

  return (
    <Link
      href={`/memorials/${slug}`}
      className="group flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.06)] transition hover:shadow-[0_12px_40px_rgb(15,23,42,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 focus-visible:ring-offset-2"
      aria-label={`Open memorial for ${name}`}
    >
      <article className="flex h-full min-h-0 w-full flex-col">
        {/* Hero crop: wide landscape, object-cover like reference */}
        <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-t-2xl bg-slate-100">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs vary by project
            <img
              src={cover}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
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
        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-5">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-2xl font-semibold leading-snug tracking-tight text-[#8b6849] sm:text-[1.65rem]">
              {name}
            </h2>
            <p className="mt-1.5 text-sm font-normal leading-relaxed text-slate-500">
              {dateText}
            </p>
            {summary ? (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                {summary}
              </p>
            ) : null}
            {city ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{city}</span>
              </div>
            ) : null}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-amber-50/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900/90 ring-1 ring-amber-200/60"
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
          <div className="mt-5 shrink-0 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Heart
                  className="h-3.5 w-3.5 text-[#e07a3f]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>{Math.max(tributeCount, 0)} tributes</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-[#e07a3f]" aria-hidden />
                <span>{Math.max(photosCount, 0)} photos</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

