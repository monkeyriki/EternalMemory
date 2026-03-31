import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { buildMemorialAdsPayload } from "@/lib/memorialAds";
import { maxGalleryImagesForMemorial } from "@/lib/memorialHostingPlan";
import { SingleMemorialClient } from "@/components/memorial/SingleMemorialClient";
import { PasswordGateWrapper } from "@/components/memorial/PasswordGateWrapper";
import type { Metadata } from "next";
import { SITE_URL_PUBLIC } from "@/lib/site";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL_PUBLIC;

function absoluteSiteUrl(path: string): string {
  const base = BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Memorial images from DB may be absolute (storage) or site-relative. */
function absoluteOgImageUrl(url: string): string {
  const u = url.trim();
  if (!u) return absoluteSiteUrl("/og-default.png");
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return absoluteSiteUrl(u);
}

function formatYear(date: string | null | undefined): string | null {
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

function formatYearRangeForMeta(
  dateOfBirth: string | null,
  dateOfDeath: string | null
): string {
  const yBirth = formatYear(dateOfBirth);
  const yDeath = formatYear(dateOfDeath);
  if (yBirth && yDeath) return `${yBirth} – ${yDeath}`;
  if (yBirth && !yDeath) return `${yBirth} – present`;
  if (!yBirth && yDeath) return `– ${yDeath}`;
  return "";
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug.toLowerCase();
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  const { data: memorial } = await admin
    .from("memorials")
    .select(
      "id, slug, full_name, date_of_birth, date_of_death, visibility, is_draft, cover_image_url"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!memorial) {
    return { title: "Memorial" };
  }

  // Draft: no rich preview (not published for the world).
  if (memorial.is_draft) {
    return {
      title: "Memorial",
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false }
      },
      openGraph: {
        title: "Memorial",
        type: "website",
        url: `${BASE_URL}/memorials/${slug}`
      },
      twitter: { card: "summary" }
    };
  }

  // PRD SEO & Social Sharing: dynamic OG — primary photo, full name, lifespan — for
  // any published memorial when the link is shared (iMessage, Facebook, WhatsApp, etc.).
  // Unlisted / password: still noindex in search engines, but link previews stay rich.
  const title = `${memorial.full_name} — Memorial`;
  const yearRange = formatYearRangeForMeta(
    memorial.date_of_birth,
    memorial.date_of_death
  );
  const description =
    yearRange.trim().length > 0
      ? `In loving memory of ${memorial.full_name}. ${yearRange}.`
      : `In loving memory of ${memorial.full_name}.`;
  const canonicalUrl = `${BASE_URL}/memorials/${memorial.slug}`;
  const desc160 = description.slice(0, 160);

  const coverRaw =
    memorial.cover_image_url && memorial.cover_image_url.trim().length > 0
      ? memorial.cover_image_url.trim()
      : null;

  let ogImageUrl: string | null = coverRaw ? absoluteOgImageUrl(coverRaw) : null;

  if (!ogImageUrl) {
    const { data: firstMedia } = await supabase
      .from("memorial_media")
      .select("url")
      .eq("memorial_id", memorial.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const galleryUrl = (firstMedia as any)?.url?.trim();
    if (galleryUrl) {
      ogImageUrl = absoluteOgImageUrl(galleryUrl);
    }
  }

  if (!ogImageUrl) {
    ogImageUrl = absoluteSiteUrl("/og-default.png");
  }

  const openGraph: Metadata["openGraph"] = {
    title,
    description: desc160,
    type: "website",
    url: canonicalUrl,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: memorial.full_name
      }
    ]
  };

  const twitterImages = [
    {
      url: ogImageUrl,
      width: 1200,
      height: 630,
      alt: memorial.full_name
    }
  ];

  const isPublic = memorial.visibility === "public";
  const robots: Metadata["robots"] = isPublic
    ? { index: true, follow: true, googleBot: { index: true, follow: true } }
    : {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false }
      };

  return {
    title,
    description: desc160,
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description: desc160,
      images: twitterImages
    },
    robots
  };
}

export default async function MemorialSlugPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  const slug = params.slug.toLowerCase();
  const admin = getSupabaseAdminClient();

  const { data: memorial } = await admin
    .from("memorials")
    .select(
      "id, slug, owner_id, type, full_name, date_of_birth, date_of_death, city, visibility, is_draft, story, cover_image_url, ads_free, hosting_plan, plan_expires_at, tags"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!memorial) return notFound();

  const memorialAds = await buildMemorialAdsPayload(supabase, memorial);

  const { data: tributes } = await supabase
    .from("virtual_tributes")
    .select(
      "id, message, created_at, purchaser_id, guest_name, is_approved, store_item_id, highlight_until"
    )
    .eq("memorial_id", memorial.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: storeItems } = await supabase
    .from("store_items")
    .select(
      "id, name, price_cents, currency, image_url, category, is_premium, highlight_duration_days"
    )
    .eq("is_active", true)
    .order("price_cents", { ascending: true });

  const isOwner = !!user && memorial.owner_id === user.id;
  const isAdmin = role === "admin";

  // Do not load gallery server-side for password-gated guests (RLS would return [] anyway;
  // avoids exposing URLs in props before unlock).
  let galleryMedia: { id: string; image_url: string }[] = [];
  const skipGalleryForPasswordGuest =
    memorial.visibility === "password_protected" && !isOwner && !isAdmin;

  if (!skipGalleryForPasswordGuest) {
    const { data: galleryRows } = await supabase
      .from("memorial_media")
      .select("id, url")
      .eq("memorial_id", memorial.id)
      .order("position", { ascending: true });
    galleryMedia = (galleryRows ?? []).map((r: any) => ({
      id: r.id,
      image_url: r.url
    }));
    const maxGal = maxGalleryImagesForMemorial({
      hosting_plan: memorial.hosting_plan as string | null | undefined,
      plan_expires_at: memorial.plan_expires_at as string | null | undefined
    });
    if (!isOwner && !isAdmin && galleryMedia.length > maxGal) {
      galleryMedia = galleryMedia.slice(0, maxGal);
    }
  }

  // Pending guest tributes: only owner/admin should receive them (privacy).
  const tributesForClient =
    isOwner || isAdmin
      ? (tributes ?? [])
      : (tributes ?? []).filter((t) => t.is_approved);

  // Draft memorials must not be visible to public visitors.
  if (memorial.is_draft && !isOwner && !isAdmin) return notFound();

  // Password-protected memorials: gate for non-owner/non-admin.
  if (memorial.visibility === "password_protected" && !isOwner && !isAdmin) {
    return (
      <PasswordGateWrapper
        slug={slug}
        memorial={memorial as any}
        tributes={tributesForClient}
        storeItems={storeItems ?? []}
        galleryMedia={galleryMedia}
        isAuthenticated={!!user}
        isOwner={isOwner}
        isAdmin={isAdmin}
        memorialAds={memorialAds}
      />
    );
  }

  return (
    <SingleMemorialClient
      memorial={memorial as any}
      isOwner={isOwner}
      isAdmin={isAdmin}
      isAuthenticated={!!user}
      tributes={tributesForClient}
      storeItems={storeItems ?? []}
      galleryMedia={galleryMedia}
      memorialAds={memorialAds}
    />
  );
}
