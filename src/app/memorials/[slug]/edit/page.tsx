import { redirect, notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import EditMemorialClient from "./EditMemorialClient";

export default async function EditMemorialPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const slug = params.slug.toLowerCase();

  const { data: memorial } = await supabase
    .from("memorials")
    .select(
      "id, slug, owner_id, type, full_name, date_of_birth, date_of_death, city, visibility, is_draft, story, cover_image_url, tags, ads_free, hosting_plan, plan_expires_at"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!memorial) {
    return notFound();
  }

  // Basic auth: only owner or admin can access edit page.
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  const isOwner = !!user && memorial.owner_id === user.id;
  const isAdmin = role === "admin";

  if (!user) {
    redirect(
      `/auth/login?next=${encodeURIComponent(`/memorials/${slug}/edit`)}`
    );
  }

  if (!isOwner && !isAdmin) {
    redirect(`/memorials/${slug}`);
  }

  const { data: galleryRows } = await supabase
    .from("memorial_media")
    .select("image_url")
    .eq("memorial_id", memorial.id)
    .order("sort_order", { ascending: true });

  const memorialWithGallery = {
    ...memorial,
    gallery_image_urls: galleryRows?.map((r) => r.image_url) ?? []
  };

  return <EditMemorialClient memorial={memorialWithGallery as any} />;
}

