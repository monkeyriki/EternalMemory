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
};

function formatYear(date?: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  if (!y) return null;
  return String(y);
}

export default function MemorialCard({
  name,
  type,
  dateOfBirth,
  dateOfDeath,
  city,
  slug
}: MemorialCardProps) {
  const label = type === "human" ? "Human" : "Pet";
  const yBirth = formatYear(dateOfBirth);
  const yDeath = formatYear(dateOfDeath);
  const dateText =
    yBirth || yDeath ? `${yBirth ?? "—"} — ${yDeath ?? "—"}` : "—";

  return (
    <article className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-900">
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
        </div>
        <Link
          href={`/memorials/${slug}`}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          aria-label={`View memorial ${name}`}
        >
          View Memorial
        </Link>
      </div>
    </article>
  );
}

