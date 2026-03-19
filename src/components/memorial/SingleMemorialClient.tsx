"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { createTributeAction, deleteTributeAction } from "@/app/memorials/[slug]/tributes/actions";
import { generateQRAction } from "@/app/memorials/[slug]/qr/actions";

type MemorialType = "human" | "pet";

type TributeItem = {
  id: string;
  message: string;
  created_at: string;
  purchaser_id: string | null;
  guest_name: string | null;
  is_approved: boolean;
};

export type SingleMemorialProps = {
  memorial: {
    id: string;
    slug: string;
    type: MemorialType;
    full_name: string;
    date_of_birth: string | null;
    date_of_death: string | null;
    city: string | null;
    visibility: string;
    is_draft: boolean;
    // Optional fields – may or may not exist in DB
    story?: string | null;
    cover_image_url?: string | null;
  };
  isOwner: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  tributes: TributeItem[];
};

function formatYear(date?: string | null): string | null {
  if (!date || typeof date !== "string") return null;
  const s = date.trim();
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

function formatYearRange(
  dateOfBirth: string | null,
  dateOfDeath: string | null
): string {
  const yBirth = formatYear(dateOfBirth);
  const yDeath = formatYear(dateOfDeath);

  if (yBirth && yDeath) return `${yBirth} – ${yDeath}`;
  if (yBirth && !yDeath) return `${yBirth} – present`;
  if (!yBirth && yDeath) return `— – ${yDeath}`;
  return "—";
}

function formatTypeLabel(type: MemorialType): string {
  return type === "human" ? "Human" : "Pet";
}

function formatVisibility(value: string): string {
  switch (value) {
    case "public":
      return "Public";
    case "unlisted":
      return "Unlisted";
    case "password_protected":
      return "Password Protected";
    default:
      return value;
  }
}

export function SingleMemorialClient({
  memorial,
  isOwner,
  isAdmin,
  isAuthenticated,
  tributes: initialTributes
}: SingleMemorialProps) {
  const approvedTributes = (initialTributes ?? []).filter((t) => t.is_approved);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tributeMessage, setTributeMessage] = useState("");
  const [tributeGuestName, setTributeGuestName] = useState("");
  const [tributeError, setTributeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tributes, setTributes] = useState<TributeItem[]>(approvedTributes);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleShare = async () => {
    if (typeof window === "undefined" || !window.location) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const formatTributeDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleCreateTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tributeMessage.trim()) {
      setTributeError("Tribute message cannot be empty.");
      return;
    }
    if (tributeMessage.length > 500) {
      setTributeError("Tribute message must be at most 500 characters.");
      return;
    }

    setIsSubmitting(true);
    setTributeError(null);

    const result = await createTributeAction({
      memorial_id: memorial.id,
      message: tributeMessage,
      guest_name: isAuthenticated ? undefined : (tributeGuestName.trim() || undefined)
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setTributeError(result.error ?? "Failed to post tribute. Please try again.");
      return;
    }

    const now = new Date().toISOString();
    if (isAuthenticated) {
      setTributes((prev) => [
        {
          id: `optimistic-${now}`,
          message: tributeMessage.trim(),
          created_at: now,
          purchaser_id: "me",
          guest_name: null,
          is_approved: true
        },
        ...prev
      ]);
    }
    setTributeMessage("");
    setTributeGuestName("");
    setShowForm(false);
  };

  const tributeDisplayName = (t: TributeItem) => {
    if (t.purchaser_id) return "A registered user";
    if (t.guest_name?.trim()) return t.guest_name.trim();
    return "Anonymous";
  };

  const handleGetQR = async () => {
    if (qrDataUrl) {
      setShowQr(true);
      return;
    }
    setQrLoading(true);
    setQrError(null);
    const result = await generateQRAction({
      memorial_id: memorial.id,
      slug: memorial.slug
    });
    setQrLoading(false);
    if (!result.ok) {
      setQrError(result.error ?? "Failed to generate QR code.");
      return;
    }
    if (result.dataUrl) {
      setQrDataUrl(result.dataUrl);
      setShowQr(true);
    }
  };

  const handleDeleteTribute = async (id: string) => {
    const existing = tributes.find((t) => t.id === id);
    if (!existing) return;

    const prev = tributes;
    setTributes((current) => current.filter((t) => t.id !== id));

    const result = await deleteTributeAction({ id });
    if (!result.ok) {
      // revert optimistic delete
      setTributes(prev);
      // keep error local, not surfaced in UI for now
    }
  };

  const canEdit = isOwner || isAdmin;
  const visibilityLabel = formatVisibility(memorial.visibility);
  const typeLabel = formatTypeLabel(memorial.type);
  const yearRange = formatYearRange(
    memorial.date_of_birth,
    memorial.date_of_death
  );
  const story = memorial.story ?? null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-100 bg-white p-8 shadow-sm space-y-8">
        {/* Hero */}
        <header className="space-y-3 border-b border-slate-100 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-bold tracking-tight text-slate-900">
                {memorial.full_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {typeLabel}
                </span>
                <span className="text-sm text-slate-700">{yearRange}</span>
                {memorial.city && (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{memorial.city}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {visibilityLabel}
              </span>
              {memorial.is_draft && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Draft
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Cover photo */}
        <section className="space-y-3">
          {memorial.cover_image_url ? (
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
              <Image
                src={memorial.cover_image_url}
                alt={memorial.full_name}
                width={800}
                height={400}
                className="h-56 w-full object-cover sm:h-72"
              />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-300">
              No photo yet
            </div>
          )}
        </section>

        {/* Story / About */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800">About</h2>
          {story && story.trim().length > 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {story}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm italic text-slate-400">
              No story added yet.
            </div>
          )}
        </section>

        {/* Tributes */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Tributes</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {tributes.length}
            </span>
          </div>

          {tributes.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              No tributes yet. Be the first to leave one.
            </div>
          ) : (
            <div className="space-y-3">
              {tributes.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700"
                >
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    {tributeDisplayName(t)}
                  </p>
                  <p>{t.message}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-400">
                    <span>{formatTributeDate(t.created_at)}</span>
                    {(isOwner || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTribute(t.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              {showForm ? "Cancel" : "Leave a tribute"}
            </button>
            {showForm && (
              <form onSubmit={handleCreateTribute} className="mt-4 space-y-2">
                {!isAuthenticated && (
                  <div>
                    <label htmlFor="tribute-guest-name" className="mb-1 block text-sm font-medium text-slate-700">
                      Your name (optional)
                    </label>
                    <input
                      id="tribute-guest-name"
                      type="text"
                      value={tributeGuestName}
                      onChange={(e) => setTributeGuestName(e.target.value)}
                      maxLength={50}
                      placeholder="e.g. Maria Rossi"
                      className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                )}
                <textarea
                  rows={4}
                  value={tributeMessage}
                  onChange={(e) => setTributeMessage(e.target.value)}
                  maxLength={500}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Share a memory or condolence..."
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {tributeMessage.length} / 500
                  </span>
                  {tributeError && (
                    <span className="text-red-500">{tributeError}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Posting..." : "Post tribute"}
                </button>
                {!isAuthenticated && (
                  <p className="text-xs text-slate-400">
                    Posted as guest — your message will be visible after approval.
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        {/* Actions bar */}
        <footer className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Share
            </button>
            <button
              type="button"
              onClick={handleGetQR}
              disabled={qrLoading}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              {qrLoading ? "Generating..." : "Get QR Code"}
            </button>
            {qrError && (
              <p className="w-full text-xs text-red-500">{qrError}</p>
            )}
            {canEdit && (
              <Link
                href={`/memorials/${memorial.slug}/edit`}
                className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
              >
                Edit memorial
              </Link>
            )}
          </div>
          {copied && (
            <p className="text-xs text-emerald-600">Link copied!</p>
          )}
        </footer>

        {showQr && qrDataUrl && (
          <div className="relative mt-4 rounded-xl border border-slate-100 bg-white p-6 text-center shadow-sm">
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="mx-auto h-48 w-48"
            />
            <p className="mt-2 text-xs text-slate-500">
              Scan to visit this memorial
            </p>
            <a
              href={qrDataUrl}
              download={`${memorial.slug}-qr.png`}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              Download QR
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

