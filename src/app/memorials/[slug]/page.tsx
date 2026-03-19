import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { SingleMemorialClient } from "@/components/memorial/SingleMemorialClient";
import { PasswordGateWrapper } from "@/components/memorial/PasswordGateWrapper";
import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://eternalmemory.app";

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
  const { data: memorial } = await supabase
    .from("memorials")
    .select(
      "id, slug, full_name, date_of_birth, date_of_death, visibility, is_draft, cover_image_url"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!memorial) {
    return { title: "Memorial" };
  }

  const isDraft = memorial.is_draft;
  const isPasswordProtected =
    memorial.visibility === "password_protected";
  if (isDraft || isPasswordProtected) {
    return {
      title: "Memorial",
      openGraph: {
        title: "Memorial",
        type: "website",
        url: `${BASE_URL}/memorials/${slug}`
      },
      twitter: { card: "summary" }
    };
  }

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

  const openGraph: Metadata["openGraph"] = {
    title,
    description: description.slice(0, 160),
    type: "website",
    url: canonicalUrl
  };
  if (
    memorial.cover_image_url &&
    memorial.cover_image_url.trim().length > 0
  ) {
    openGraph.images = [
      {
        url: memorial.cover_image_url,
        width: 1200,
        height: 630,
        alt: memorial.full_name
      }
    ];
  }

  return {
    title,
    description: description.slice(0, 160),
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 160)
    }
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

  const { data: memorial } = await supabase
    .from("memorials")
    .select(
      "id, slug, owner_id, type, full_name, date_of_birth, date_of_death, city, visibility, is_draft, story, cover_image_url, password_hash"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!memorial) return notFound();

  const { data: tributes } = await supabase
    .from("virtual_tributes")
    .select("id, message, created_at, purchaser_id, guest_name, is_approved")
    .eq("memorial_id", memorial.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const isOwner = !!user && memorial.owner_id === user.id;
  const isAdmin = role === "admin";

  // Draft memorials must not be visible to public visitors.
  if (memorial.is_draft && !isOwner && !isAdmin) return notFound();

  // Password-protected memorials: gate for non-owner/non-admin.
  if (memorial.visibility === "password_protected" && !isOwner && !isAdmin) {
    return (
      <PasswordGateWrapper
        slug={slug}
        memorial={memorial as any}
        tributes={tributes ?? []}
        isAuthenticated={!!user}
      />
    );
  }

  return (
    <SingleMemorialClient
      memorial={memorial as any}
      isOwner={isOwner}
      isAdmin={isAdmin}
      isAuthenticated={!!user}
      tributes={tributes ?? []}
    />
  );
}
