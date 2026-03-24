"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MessageCircle,
  Link2,
  Flag
} from "lucide-react";
import {
  approveTributeAction,
  createTributeAction,
  deleteTributeAction
} from "@/app/memorials/[slug]/tributes/actions";
import { generateQRAction } from "@/app/memorials/[slug]/qr/actions";
import { MemorialStoryContent } from "@/components/memorial/MemorialStoryContent";
import { AdSenseSlot } from "@/components/ads/AdSenseSlot";
import { ReportContentModal } from "@/components/memorial/ReportContentModal";
import type { MemorialAdsForClient } from "@/lib/memorialAds";

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
  /** Days of top spotlight when premium (from store_items). */
  highlight_duration_days?: number | null;
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
    /** When true, memorial page does not show platform ads */
    ads_free?: boolean | null;
  };
  isOwner: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  tributes: TributeItem[];
  storeItems: StoreItem[];
  galleryMedia?: { id: string; image_url: string }[];
  memorialAds?: MemorialAdsForClient;
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
  storeItems,
  galleryMedia = [],
  memorialAds = { show: false }
}: SingleMemorialProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tributeMessage, setTributeMessage] = useState("");
  const [tributeGuestName, setTributeGuestName] = useState("");
  const [tributeError, setTributeError] = useState<string | null>(null);
  const [freeTributeNotice, setFreeTributeNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tributes, setTributes] = useState<TributeItem[]>(initialTributes ?? []);
  const [approveLoadingId, setApproveLoadingId] = useState<string | null>(null);
  const [checkoutLoadingItemId, setCheckoutLoadingItemId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [payModalItemId, setPayModalItemId] = useState<string | null>(null);
  const [payModalNote, setPayModalNote] = useState("");
  const [reportModal, setReportModal] = useState<
    null | { scope: "memorial" } | { scope: "tribute"; tributeId: string }
  >(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!shareToast) return;
    const t = setTimeout(() => setShareToast(null), 3500);
    return () => clearTimeout(t);
  }, [shareToast]);

  useEffect(() => {
    if (!freeTributeNotice) return;
    const t = setTimeout(() => setFreeTributeNotice(null), 10000);
    return () => clearTimeout(t);
  }, [freeTributeNotice]);

  useEffect(() => {
    if (!payModalItemId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (checkoutLoadingItemId) return;
      setPayModalItemId(null);
      setPayModalNote("");
      setCheckoutError(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [payModalItemId, checkoutLoadingItemId]);

  const storeItemById = useMemo(() => {
    return new Map(storeItems.map((s) => [s.id, s]));
  }, [storeItems]);

  const canModerate = isOwner || isAdmin;

  const approvedTributes = useMemo(
    () => tributes.filter((t) => t.is_approved),
    [tributes]
  );

  /** Free-text tributes awaiting approval (not paid store items). */
  const pendingFreeTributes = useMemo(
    () => tributes.filter((t) => !t.is_approved && !t.store_item_id),
    [tributes]
  );

  const freeTributes = approvedTributes.filter((t) => !t.store_item_id);
  const paidTributes = approvedTributes.filter((t) => !!t.store_item_id);

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

  const handleApproveTribute = async (id: string) => {
    setApproveLoadingId(id);
    const result = await approveTributeAction(id);
    setApproveLoadingId(null);
    if (result.ok) {
      setTributes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t))
      );
    }
  };

  const tribute = searchParams.get("tribute");

  const formatMoney = (priceCents: number | null, currency: string | null) => {
    const cents = priceCents ?? 0;
    const curr = (currency ?? "usd").toUpperCase();
    const value = (cents / 100).toFixed(2);
    return `${curr} ${value}`;
  };

  const shareTitle = useMemo(
    () => `In memory of ${memorial.full_name}`,
    [memorial.full_name]
  );

  const copyPageLink = async (message: string) => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast(message);
    } catch {
      setShareToast("Could not copy link.");
    }
  };

  const shareIconClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-40";

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

    if (result.pending_moderation === false) {
      setFreeTributeNotice(null);
      router.refresh();
    } else {
      setFreeTributeNotice(
        "Thank you. Your message was submitted and is pending approval by the memorial owner."
      );
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

  const openPayTributeModal = (storeItemId: string) => {
    setCheckoutError(null);
    setPayModalItemId(storeItemId);
    setPayModalNote("");
  };

  const closePayTributeModal = () => {
    if (checkoutLoadingItemId) return;
    setPayModalItemId(null);
    setPayModalNote("");
    setCheckoutError(null);
  };

  const submitPaidTributeCheckout = async () => {
    const storeItemId = payModalItemId;
    if (!storeItemId) return;
    setCheckoutError(null);
    setCheckoutLoadingItemId(storeItemId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorial_id: memorial.id,
          memorial_slug: memorial.slug,
          store_item_id: storeItemId,
          optional_message: payModalNote.trim() || undefined
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? "Failed to start checkout.");
      }

      window.location.href = data.url as string;
    } catch (e: unknown) {
      setCheckoutLoadingItemId(null);
      setCheckoutError(
        e instanceof Error ? e.message : "Failed to start checkout."
      );
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
      setTributes(prev);
    }
  };

  const canEdit = canModerate;
  const visibilityLabel = formatVisibility(memorial.visibility);
  const typeLabel = formatTypeLabel(memorial.type);
  const yearRange = formatYearRange(
    memorial.date_of_birth,
    memorial.date_of_death
  );
  const story = memorial.story ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-100/35 via-sky-50/15 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl space-y-8 rounded-[2rem] border border-slate-200/90 bg-white/95 p-8 shadow-xl shadow-slate-400/10 backdrop-blur">
        {/* Hero */}
        <header className="space-y-3 border-b border-slate-100 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">In loving memory</p>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
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
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setReportModal({ scope: "memorial" })}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 underline-offset-2 hover:text-amber-800 hover:underline"
            >
              <Flag className="h-3.5 w-3.5" aria-hidden />
              Report this page
            </button>
          </div>
        </header>

        {memorialAds.show && memorialAds.topHtml && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3">
            <AdSenseSlot html={memorialAds.topHtml} className="text-center" />
          </div>
        )}

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

        {/* Gallery (additional photos) */}
        {galleryMedia.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-slate-900">Gallery</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {galleryMedia.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 aspect-square"
                >
                  <Image
                    src={item.image_url}
                    alt=""
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Story / About */}
        <section>
          <h2 className="mb-3 font-serif text-xl font-semibold text-slate-900">About</h2>
          {story && story.trim().length > 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <MemorialStoryContent html={story} />
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
          <section
            className="memorial-premium-glow rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-amber-50/40 p-4"
            aria-label="Premium tribute spotlight"
          >
            <div className="flex items-start gap-4">
              <div
                className="memorial-premium-flicker flex h-12 w-12 items-center justify-center rounded-xl border border-purple-200 bg-white shadow-sm"
              >
                {activePremiumHighlight.item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePremiumHighlight.item.image_url}
                    alt={activePremiumHighlight.item.name ?? "Premium tribute"}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-lg" aria-hidden>
                    ✨
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-purple-900">
                  Premium tribute — lit for the memorial
                </p>
                <p className="mt-1 text-xs text-purple-800">
                  Spotlight until{" "}
                  {formatTributeDate(
                    activePremiumHighlight.tribute.highlight_until ?? ""
                  )}{" "}
                  · from {tributeDisplayName(activePremiumHighlight.tribute)}
                </p>
                {activePremiumHighlight.tribute.message?.trim() && (
                  <p className="mt-2 rounded-lg border border-purple-100/80 bg-white/70 px-3 py-2 text-sm text-slate-800">
                    &ldquo;{activePremiumHighlight.tribute.message.trim()}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {storeItems.length > 0 && (
          <section aria-label="Virtual tribute shop">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-800">
                Guestbook — virtual tributes
              </h2>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                {storeItems.length} items
              </span>
            </div>
            <p className="mb-3 text-sm text-slate-500">
              Purchase a digital candle, flower, or symbol to attach to this guestbook. Premium
              items include an animated spotlight at the top of the page for a set time.
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
                            Premium · {item.highlight_duration_days ?? 30}d spotlight
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
                    onClick={() => openPayTributeModal(item.id)}
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

        {/* Guestbook entries: free messages + paid virtual items */}
        <section aria-label="Guestbook">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Guestbook</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {approvedTributes.length} published
              </span>
              {canModerate && pendingFreeTributes.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {pendingFreeTributes.length} pending
                </span>
              )}
            </div>
          </div>

          {freeTributeNotice && (
            <div
              className="mb-4 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-sm text-amber-950"
              role="status"
            >
              {freeTributeNotice}
            </div>
          )}

          {canModerate && pendingFreeTributes.length > 0 && (
            <div className="mb-5 space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                Pending approval (free messages)
              </h3>
              <p className="text-xs text-amber-800/90">
                Only you and admins can see these until you approve them.
              </p>
              <div className="space-y-3">
                {pendingFreeTributes.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-700"
                  >
                    <p className="mb-1 text-xs font-medium text-slate-600">
                      {tributeDisplayName(t)}
                    </p>
                    <p>{t.message ?? ""}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span>{formatTributeDate(t.created_at)}</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={approveLoadingId === t.id}
                          onClick={() => handleApproveTribute(t.id)}
                          className="font-medium text-amber-700 hover:underline disabled:opacity-50"
                        >
                          {approveLoadingId === t.id ? "Approving…" : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTribute(t.id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {approvedTributes.length === 0 && pendingFreeTributes.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              No guestbook entries yet. Leave a free message or purchase a virtual tribute above.
            </div>
          ) : approvedTributes.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              No published guestbook entries yet.
              {!canModerate &&
                pendingFreeTributes.length > 0 &&
                " Messages may appear after the memorial owner approves them."}
            </div>
          ) : (
            <div className="space-y-5">
              {freeTributes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Free condolences
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
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                          <span>{formatTributeDate(t.created_at)}</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setReportModal({
                                  scope: "tribute",
                                  tributeId: t.id
                                })
                              }
                              className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-amber-800 hover:underline"
                            >
                              <Flag className="h-3 w-3" aria-hidden />
                              Report
                            </button>
                            {canModerate && (
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paidTributes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Virtual tributes (purchased)
                  </h3>
                  <div className="space-y-3">
                    {paidTributes.map((t) => {
                      const item =
                        t.store_item_id ? storeItemById.get(t.store_item_id) : undefined;
                      const highlightLabel = t.highlight_until
                        ? `Spotlight until ${formatTributeDate(t.highlight_until)}`
                        : "";
                      const spotlightActive =
                        !!t.highlight_until &&
                        new Date(t.highlight_until).getTime() > Date.now();
                      const iconAnimClass =
                        item?.is_premium && spotlightActive
                          ? "memorial-premium-flicker"
                          : "";

                      return (
                        <div
                          key={t.id}
                          className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`h-10 w-10 overflow-hidden rounded-lg border border-purple-200 bg-white flex-shrink-0 flex items-center justify-center ${iconAnimClass}`}
                              >
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
                                {item?.name ?? "Virtual tribute"}
                              </p>
                              <p className="mt-1 text-xs text-slate-600">
                                {tributeDisplayName(t)}
                              </p>
                              {t.message?.trim() && (
                                <p className="mt-2 text-sm text-slate-800">
                                  &ldquo;{t.message.trim()}&rdquo;
                                </p>
                              )}
                              {highlightLabel && (
                                <p className="mt-2 text-xs font-medium text-purple-700">
                                  {highlightLabel}
                                </p>
                              )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                            <span>{formatTributeDate(t.created_at)}</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setReportModal({
                                    scope: "tribute",
                                    tributeId: t.id
                                  })
                                }
                                className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-amber-800 hover:underline"
                              >
                                <Flag className="h-3 w-3" aria-hidden />
                                Report
                              </button>
                              {canModerate && (
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
              {showForm ? "Cancel" : "Write a free message"}
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

        {memorialAds.show && memorialAds.bottomHtml && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3">
            <AdSenseSlot html={memorialAds.bottomHtml} className="text-center" />
          </div>
        )}

        {/* Actions bar */}
        <footer className="border-t border-slate-100 pt-5 flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Share
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={
                  shareUrl
                    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                className={shareIconClass}
                aria-label="Share on Facebook"
                onClick={(e) => {
                  if (!shareUrl) e.preventDefault();
                }}
              >
                <Facebook className="h-4 w-4" aria-hidden />
              </a>
              <button
                type="button"
                className={shareIconClass}
                aria-label="Copy link for Instagram"
                title="Instagram has no web share URL — copy the link, then paste in Stories or a post"
                onClick={() =>
                  copyPageLink(
                    "Link copied — open Instagram and paste in your Story or caption."
                  )
                }
                disabled={!shareUrl}
              >
                <Instagram className="h-4 w-4" aria-hidden />
              </button>
              <a
                href={
                  shareUrl
                    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                className={shareIconClass}
                aria-label="Share on X (Twitter)"
                onClick={(e) => {
                  if (!shareUrl) e.preventDefault();
                }}
              >
                <Twitter className="h-4 w-4" aria-hidden />
              </a>
              <a
                href={
                  shareUrl
                    ? `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareTitle}\n\n${shareUrl}`)}`
                    : undefined
                }
                className={shareIconClass}
                aria-label="Share by email"
                onClick={(e) => {
                  if (!shareUrl) e.preventDefault();
                }}
              >
                <Mail className="h-4 w-4" aria-hidden />
              </a>
              <a
                href={
                  shareUrl
                    ? `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`${shareIconClass} text-emerald-700 hover:text-emerald-800`}
                aria-label="Share on WhatsApp"
                onClick={(e) => {
                  if (!shareUrl) e.preventDefault();
                }}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
              </a>
              <button
                type="button"
                className={shareIconClass}
                aria-label="Copy memorial link"
                onClick={() => copyPageLink("Link copied to clipboard.")}
                disabled={!shareUrl}
              >
                <Link2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {shareToast && (
              <p className="mt-2 text-xs text-emerald-600">{shareToast}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
            <>
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
            </>
            {canEdit && (
              <Link
                href={`/memorials/${memorial.slug}/edit`}
                className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
              >
                Edit memorial
              </Link>
            )}
            </div>
          </div>
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

      {payModalItemId && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-tribute-title"
          onClick={closePayTributeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="pay-tribute-title"
              className="text-lg font-semibold text-slate-900"
            >
              Complete your tribute
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {storeItemById.get(payModalItemId)?.name ?? "Virtual tribute"} — you can add a short
              message to show in the guestbook with your purchase (optional).
            </p>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Message with your tribute{" "}
              <span className="font-normal text-slate-500">(optional, max 200 characters)</span>
            </label>
            <textarea
              value={payModalNote}
              onChange={(e) => setPayModalNote(e.target.value.slice(0, 200))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="With love…"
            />
            <p className="mt-1 text-xs text-slate-400">{payModalNote.length} / 200</p>
            {checkoutError && payModalItemId && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {checkoutError}
              </p>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closePayTributeModal}
                disabled={checkoutLoadingItemId !== null}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitPaidTributeCheckout()}
                disabled={checkoutLoadingItemId !== null}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
              >
                {checkoutLoadingItemId ? "Redirecting…" : "Continue to payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportContentModal
        memorialId={memorial.id}
        tributeId={
          reportModal?.scope === "tribute" ? reportModal.tributeId : null
        }
        title={
          reportModal?.scope === "tribute"
            ? "Report this guestbook entry"
            : "Report this memorial"
        }
        open={reportModal !== null}
        onClose={() => setReportModal(null)}
      />
    </div>
  );
}

