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

  if (!isOwner && !isAdmin) {
    redirect("/memorials/humans");
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Edit memorial
        </h1>
        <EditMemorialClient memorial={memorialWithGallery as any} />
      </div>
    </div>
  );
}

