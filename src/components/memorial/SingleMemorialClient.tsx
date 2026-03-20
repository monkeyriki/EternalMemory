"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { createTributeAction, deleteTributeAction } from "@/app/memorials/[slug]/tributes/actions";
import { generateQRAction } from "@/app/memorials/[slug]/qr/actions";

type MemorialType = "human" | "pet";

type TributeItem = {
  id: string;
  message: string | null;
  created_at: string;
  purchaser_id: string | null;
  guest_name: string | null;
  is_approved: boolean;
  store_item_id: string | null;
  highlight_until: string | null;
};

type StoreItem = {
  id: string;
  name: string | null;
  category: string | null;
  price_cents: number | null;
  currency: string | null;
  image_url: string | null;
  is_premium: boolean | null;
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
  storeItems: StoreItem[];
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
  tributes: initialTributes,
  storeItems
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
  const [checkoutLoadingItemId, setCheckoutLoadingItemId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const storeItemById = useMemo(() => {
    return new Map(storeItems.map((s) => [s.id, s]));
  }, [storeItems]);

  const freeTributes = tributes.filter((t) => !t.store_item_id);
  const paidTributes = tributes.filter((t) => !!t.store_item_id);

  const activePremiumHighlight = useMemo(() => {
    const now = Date.now();
    const active = paidTributes
      .map((t) => {
        const item = t.store_item_id ? storeItemById.get(t.store_item_id) : undefined;
        if (!item?.is_premium) return null;
        if (!t.highlight_until) return null;
        const until = new Date(t.highlight_until).getTime();
        if (!Number.isFinite(until) || until <= now) return null;
        return { tribute: t, item, until };
      })
      .filter(Boolean) as Array<{
      tribute: TributeItem;
      item: StoreItem;
      until: number;
    }>;

    active.sort((a, b) => b.until - a.until);
    return active[0] ?? null;
  }, [paidTributes, storeItemById]);

  const tribute = searchParams.get("tribute");

  const formatMoney = (priceCents: number | null, currency: string | null) => {
    const cents = priceCents ?? 0;
    const curr = (currency ?? "usd").toUpperCase();
    const value = (cents / 100).toFixed(2);
    return `${curr} ${value}`;
  };

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
          is_approved: true,
          store_item_id: null,
          highlight_until: null
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

  const handlePurchasePaidTribute = async (storeItemId: string) => {
    setCheckoutError(null);

    setCheckoutLoadingItemId(storeItemId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorial_id: memorial.id,
          memorial_slug: memorial.slug,
          store_item_id: storeItemId
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? "Failed to start checkout.");
      }

      window.location.href = data.url as string;
    } catch (e: any) {
      setCheckoutLoadingItemId(null);
      setCheckoutError(e?.message ?? "Failed to start checkout.");
    }
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

        {tribute === "success" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Thank you for your tribute! 🕯️
          </div>
        )}
        {tribute === "cancelled" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Payment cancelled.
          </div>
        )}

        {activePremiumHighlight && (
          <section className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-purple-100">
                {activePremiumHighlight.item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePremiumHighlight.item.image_url}
                    alt={activePremiumHighlight.item.name ?? "Premium tribute"}
                    className="h-10 w-10 object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-lg" aria-hidden>
                    ✨
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-purple-900">
                  Premium highlight
                </p>
                <p className="mt-1 text-xs text-purple-800">
                  Highlights active until{" "}
                  {formatTributeDate(
                    activePremiumHighlight.tribute.highlight_until ?? ""
                  )}{" "}
                  · from {tributeDisplayName(activePremiumHighlight.tribute)}
                </p>
              </div>
            </div>
          </section>
        )}

        {storeItems.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-800">
                Leave a virtual tribute
              </h2>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                {storeItems.length} items
              </span>
            </div>
            <p className="mb-3 text-sm text-slate-500">
              Choose a tribute to support this memorial.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {storeItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.name ?? "Virtual tribute"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg" aria-hidden>
                          🕯️
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.name ?? "Virtual tribute"}
                        </p>
                        {item.is_premium && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-semibold text-amber-700">
                        {formatMoney(item.price_cents, item.currency)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePurchasePaidTribute(item.id)}
                    disabled={checkoutLoadingItemId === item.id}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutLoadingItemId === item.id ? "Redirecting..." : "Buy"}
                  </button>
                </div>
              ))}
            </div>

            {checkoutError && (
              <p className="mt-3 text-sm text-red-600">{checkoutError}</p>
            )}
          </section>
        )}

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
              No tributes yet. Leave a free message or purchase a paid tribute.
            </div>
          ) : (
            <div className="space-y-5">
              {freeTributes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Free tributes
                  </h3>
                  <div className="space-y-3">
                    {freeTributes.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700"
                      >
                        <p className="mb-1 text-xs font-medium text-slate-600">
                          {tributeDisplayName(t)}
                        </p>
                        <p>{t.message ?? ""}</p>
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
                </div>
              )}

              {paidTributes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Paid tributes
                  </h3>
                  <div className="space-y-3">
                    {paidTributes.map((t) => {
                      const item =
                        t.store_item_id ? storeItemById.get(t.store_item_id) : undefined;
                      const highlightLabel = t.highlight_until
                        ? `Highlighted until ${formatTributeDate(t.highlight_until)}`
                        : "";

                      return (
                        <div
                          key={t.id}
                          className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-lg border border-purple-200 bg-white flex-shrink-0 flex items-center justify-center">
                                {item?.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image_url}
                                    alt={item?.name ?? "Paid tribute"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg" aria-hidden>
                                    🕯️
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {item?.name ?? "Paid tribute"}
                              </p>
                              <p className="mt-1 text-xs text-slate-600">
                                {tributeDisplayName(t)}
                              </p>
                              {highlightLabel && (
                                <p className="mt-2 text-xs font-medium text-purple-700">
                                  {highlightLabel}
                                </p>
                              )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
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
                      );
                    })}
                  </div>
                </div>
              )}
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

