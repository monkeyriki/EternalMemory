import Link from "next/link";
import { Heart, Image as ImageIcon } from "lucide-react";

type MemorialType = "human" | "pet";

export type FeaturedMemorialHorizontalCardProps = {
  name: string;
  type: MemorialType;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  description?: string | null;
  slug: string;
  tributeCount?: number;
  photosCount?: number;
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
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Home featured strip: image left, copy + stats right (mockup layout). */
export function FeaturedMemorialHorizontalCard({
  name,
  type,
  dateOfBirth,
  dateOfDeath,
  description,
  slug,
  tributeCount = 0,
  photosCount = 0,
  coverImageUrl
}: FeaturedMemorialHorizontalCardProps) {
  const label = type === "human" ? "Human" : "Pet";
  const yBirth = formatFullDate(dateOfBirth);
  const yDeath = formatFullDate(dateOfDeath);
  const dateText =
    yBirth || yDeath ? `${yBirth ?? "—"} — ${yDeath ?? "—"}` : "—";
  const summary = plainTextSummary(description);
  const cover = coverImageUrl?.trim() || null;

  return (
    <Link
      href={`/memorials/${slug}`}
      className="group flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-[#e07a3f]/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 focus-visible:ring-offset-2 sm:flex-row sm:items-stretch"
      aria-label={`Open memorial for ${name}`}
    >
      <div className="relative h-52 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-[min(42%,240px)] sm:min-h-[220px]">
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
            <span className="font-serif text-sm font-medium tracking-wide">{label}</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[1.35rem]">
            {name}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{dateText}</p>
          {summary ? (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{summary}</p>
          ) : null}
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-[#e07a3f]" strokeWidth={1.75} aria-hidden />
              <span>{Math.max(tributeCount, 0)} tributes</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-[#e07a3f]" aria-hidden />
              <span>{Math.max(photosCount, 0)} photos</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
