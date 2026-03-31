"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  User,
  PawPrint,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Globe,
  Link2,
  Shield
} from "lucide-react";
import { uploadCoverImageAction } from "@/app/memorials/actions/uploadCoverImage";
import { normalizeTagsFromInput, tagsToInputString } from "@/lib/memorialTags";
import { sanitizeMemorialStory } from "@/lib/sanitizeMemorialStory";
import MemorialStoryEditor, {
  type MemorialStoryEditorHandle
} from "@/components/memorial/MemorialStoryEditor";
import {
  BASIC_PLAN_MAX_GALLERY_IMAGES,
  getEffectiveHostingPlan,
  maxGalleryImagesForMemorial
} from "@/lib/memorialHostingPlan";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export interface MemorialFormData {
  type: "human" | "pet";
  fullName: string;
  slug: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  city?: string;
  visibility: "public" | "unlisted" | "password_protected";
  password?: string;
  status: "draft" | "publish";
  story?: string;
  coverImageUrl?: string;
  /** Gallery image URLs (order = display order), max 24 */
  galleryImageUrls?: string[];
  /** Normalized tag slugs (server re-validates) */
  tags?: string[];
  /** Premium / no third-party ads on this memorial */
  adsFree?: boolean;
}

type MemorialFormMode = "create" | "edit";

type MemorialInitialData = {
  id: string;
  slug: string;
  type: "human" | "pet";
  full_name: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  city: string | null;
  visibility: "public" | "unlisted" | "password_protected";
  is_draft: boolean;
  story: string | null;
  cover_image_url: string | null;
  gallery_image_urls?: string[] | null;
  tags?: string[] | null;
  ads_free?: boolean | null;
  hosting_plan?: string | null;
  plan_expires_at?: string | null;
};

interface MemorialFormProps {
  mode: MemorialFormMode;
  initialData?: MemorialInitialData;
  /** Optional create-mode prefill, e.g. from homepage hero first/last name */
  initialFullName?: string;
  onSubmit: (data: MemorialFormData) => void | Promise<void>;
  isLoading: boolean;
  /** Server-side error (e.g. create/update action) shown inside the page shell */
  serverBanner?: string | null;
  /** Overrides default shell subtitle (e.g. memorial name on edit) */
  shellSubtitle?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const DEFAULT_SHELL_SUBTITLE = "Honor and remember those who meant so much.";

export default function MemorialForm({
  mode,
  initialData,
  initialFullName,
  onSubmit,
  isLoading,
  serverBanner = null,
  shellSubtitle
}: MemorialFormProps) {
  const isEdit = mode === "edit";
  const createSeedName =
    mode === "create" ? (initialFullName?.trim() ?? "") : "";
  const [type, setType] = useState<"human" | "pet">("human");
  const [fullName, setFullName] = useState(createSeedName);
  const [slug, setSlug] = useState(
    createSeedName ? generateSlug(createSeedName) : ""
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [city, setCity] = useState("");
  const [visibility, setVisibility] = useState<
    "public" | "unlisted" | "password_protected"
  >("public");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"draft" | "publish">("draft");
  const storyEditorRef = useRef<MemorialStoryEditorHandle>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverUploadLoading, setCoverUploadLoading] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryUploadLoading, setGalleryUploadLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [adsFree, setAdsFree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const maxGalleryImages = useMemo(() => {
    if (isEdit && initialData) {
      return maxGalleryImagesForMemorial({
        hosting_plan: initialData.hosting_plan,
        plan_expires_at: initialData.plan_expires_at
      });
    }
    return BASIC_PLAN_MAX_GALLERY_IMAGES;
  }, [isEdit, initialData]);

  const effectiveHostingPlan = useMemo(() => {
    if (isEdit && initialData) {
      return getEffectiveHostingPlan({
        hosting_plan: initialData.hosting_plan,
        plan_expires_at: initialData.plan_expires_at
      });
    }
    return "basic" as const;
  }, [isEdit, initialData]);

  useEffect(() => {
    if (isEdit && initialData) {
      setType(initialData.type);
      setFullName(initialData.full_name);
      setSlug(initialData.slug);
      setSlugManuallyEdited(true);
      setDateOfBirth(initialData.date_of_birth ?? "");
      setDateOfDeath(initialData.date_of_death ?? "");
      setCity(initialData.city ?? "");
      setTagsInput(tagsToInputString(initialData.tags));
      setVisibility(initialData.visibility);
      setStatus(initialData.is_draft ? "draft" : "publish");
      setCoverImageUrl(initialData.cover_image_url ?? "");
      setGalleryUrls(initialData.gallery_image_urls ?? []);
      setAdsFree(!!initialData.ads_free);
    }
  }, [isEdit, initialData]);

  useEffect(() => {
    if (!slugManuallyEdited && fullName && !isEdit) {
      setSlug(generateSlug(fullName));
    }
  }, [fullName, slugManuallyEdited, isEdit]);

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(value));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!slug.trim()) newErrors.slug = "Memorial URL is required";
    const requiresPasswordForProtection =
      visibility === "password_protected" &&
      (!isEdit || initialData?.visibility !== "password_protected");
    if (requiresPasswordForProtection && !password.trim()) {
      newErrors.password =
        "Password is required for password-protected memorials";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (galleryUploadLoading || coverUploadLoading) {
      setSubmitError("Please wait for image uploads to finish before creating the memorial.");
      return;
    }
    if (!validate()) return;
    setSubmitError(null);
    const data: MemorialFormData = {
      type,
      fullName: fullName.trim(),
      slug: slug.trim(),
      visibility,
      status,
      adsFree
    };
    if (dateOfBirth) data.dateOfBirth = dateOfBirth;
    if (dateOfDeath) data.dateOfDeath = dateOfDeath;
    if (city.trim()) data.city = city.trim();
    if (visibility === "password_protected" && password.trim()) {
      data.password = password;
    }
    const rawStory = storyEditorRef.current?.getHTML() ?? "";
    const hasStory = storyEditorRef.current
      ? !storyEditorRef.current.isEmpty()
      : false;
    if (hasStory && rawStory.trim()) {
      data.story = sanitizeMemorialStory(rawStory);
    }
    if (coverImageUrl.trim()) data.coverImageUrl = coverImageUrl.trim();
    data.galleryImageUrls = galleryUrls;
    data.tags = normalizeTagsFromInput(tagsInput);

    try {
      await onSubmit(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    }
  };

  return (
    <MemorialPageShell
      title={isEdit ? "Edit memorial" : "Create a memorial"}
      subtitle={shellSubtitle ?? DEFAULT_SHELL_SUBTITLE}
      maxWidth="xl"
      contentClassName="mt-6"
    >
        {serverBanner ? (
          <div
            className="mb-6 rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm backdrop-blur"
            role="alert"
          >
            {serverBanner}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Memorial type
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("human")}
                aria-pressed={type === "human"}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  type === "human"
                    ? "border-amber-600 bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50 ring-offset-2"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <User className="h-5 w-5" aria-hidden />
                Human
                {type === "human" && (
                  <span className="ml-1 text-amber-200" aria-hidden>✓</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setType("pet")}
                aria-pressed={type === "pet"}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  type === "pet"
                    ? "border-amber-600 bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50 ring-offset-2"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <PawPrint className="h-5 w-5" aria-hidden />
                Pet
                {type === "pet" && (
                  <span className="ml-1 text-amber-200" aria-hidden>✓</span>
                )}
              </button>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Basic information
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Mario Rossi"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Memorial URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="shrink-0 text-sm text-slate-500">
                  /memorials/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-slate-900 focus:outline-none focus:ring-0"
                  placeholder="mario-rossi"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Auto-generated from name; you can edit it
              </p>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date of death
                </label>
                <input
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="e.g. London"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tags <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="e.g. veteran, golden-retriever, acme-funeral-home"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-slate-500">
                Comma-separated. Used for directory search (e.g. breed, organization, military).
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Story{" "}
                <span className="font-normal text-slate-500">
                  (rich text, YouTube &amp; Vimeo)
                </span>
              </label>
              <MemorialStoryEditor
                ref={storyEditorRef}
                key={isEdit && initialData ? `story-${initialData.id}` : "story-new"}
                initialContent={isEdit && initialData ? (initialData.story ?? "") : ""}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Cover photo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isLoading || coverUploadLoading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-700 hover:file:bg-amber-100"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setCoverUploadError(null);
                  setCoverUploadLoading(true);
                  const fd = new FormData();
                  fd.set("file", f);
                  try {
                    const result = await uploadCoverImageAction(fd);
                    if (result?.ok && result.url) {
                      setCoverImageUrl(result.url);
                    } else {
                      setCoverUploadError(result?.error ?? "Upload failed");
                    }
                  } catch {
                    setCoverUploadError("Upload failed");
                  } finally {
                    setCoverUploadLoading(false);
                  }
                  e.target.value = "";
                }}
              />
              {coverUploadLoading && (
                <p className="mt-1 text-sm text-slate-500">Uploading...</p>
              )}
              {coverUploadError && (
                <p className="mt-1 text-sm text-red-600">{coverUploadError}</p>
              )}
              <label className="mt-2 mb-1 block text-xs font-medium text-slate-500">
                Or paste image URL
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => {
                  setCoverImageUrl(e.target.value);
                  setCoverUploadError(null);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://..."
                disabled={isLoading}
              />
              {coverImageUrl.trim() && (
                <div className="mt-2">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="h-32 w-full rounded-lg border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl("")}
                    className="mt-1 text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                More photos (gallery)
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Up to {maxGalleryImages} images in addition to the cover
                {maxGalleryImages <= BASIC_PLAN_MAX_GALLERY_IMAGES
                  ? " on the Basic plan"
                  : ""}
                . Upgrade for more. Shown on the memorial page in a grid.
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                disabled={
                  isLoading || galleryUploadLoading || galleryUrls.length >= maxGalleryImages
                }
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-700 hover:file:bg-amber-100"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length === 0) return;
                  setSubmitError(null);
                  setGalleryError(null);
                  const room = maxGalleryImages - galleryUrls.length;
                  if (room <= 0) {
                    setGalleryError(`Maximum ${maxGalleryImages} gallery photos.`);
                    return;
                  }
                  const toUpload = files.slice(0, room);
                  setGalleryUploadLoading(true);
                  try {
                    const next: string[] = [...galleryUrls];
                    for (const f of toUpload) {
                      const fd = new FormData();
                      fd.set("file", f);
                      let result:
                        | Awaited<ReturnType<typeof uploadCoverImageAction>>
                        | undefined;
                      try {
                        result = await uploadCoverImageAction(fd);
                      } catch {
                        result = undefined;
                      }
                      if (result?.ok && result.url) {
                        next.push(result.url);
                      } else {
                        setGalleryError(
                          result?.error ?? "One or more uploads failed. Please retry."
                        );
                        break;
                      }
                    }
                    setGalleryUrls(next.slice(0, maxGalleryImages));
                  } finally {
                    setGalleryUploadLoading(false);
                  }
                }}
              />
              {galleryUploadLoading && (
                <p className="mt-1 text-sm text-slate-500">Uploading gallery…</p>
              )}
              {galleryError && (
                <p className="mt-1 text-sm text-red-600">{galleryError}</p>
              )}
              {galleryUrls.length > 0 && (
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {galleryUrls.map((url, idx) => (
                    <li key={`${url}-${idx}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="mt-1 text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Visibility
            </p>
            <div className="space-y-2">
              {(
                [
                  {
                    key: "public" as const,
                    label: "Public",
                    desc: "Listed in directory and indexable",
                    icon: Globe
                  },
                  {
                    key: "unlisted" as const,
                    label: "Unlisted",
                    desc: "Only via direct link or QR code",
                    icon: Link2
                  },
                  {
                    key: "password_protected" as const,
                    label: "Password protected",
                    desc: "PIN/password required to view the page",
                    icon: Shield
                  }
                ] as const
              ).map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVisibility(key)}
                  className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                    visibility === key
                      ? "border-amber-700/90 bg-amber-50/80"
                      : "border-slate-200 hover:border-amber-200/60"
                  }`}
                  disabled={isLoading}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {visibility === "password_protected" && (
              <div className="pt-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Ads &amp; plans
            </p>
            {effectiveHostingPlan !== "basic" ? (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-900">
                <p className="font-medium">
                  {effectiveHostingPlan === "lifetime" ? "Lifetime" : "Premium"} plan
                </p>
                <p className="mt-1 text-xs text-emerald-800">
                  Platform ads are not shown on this memorial. Manage billing from{" "}
                  <Link
                    href={`/memorials/${slug}/upgrade`}
                    className="font-medium underline underline-offset-2"
                  >
                    Upgrade plan
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={adsFree}
                    onChange={(e) => setAdsFree(e.target.checked)}
                    disabled={isLoading}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      Hide platform ads (manual)
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      When enabled, AdSense slots are hidden even on the Basic plan. For unlimited
                      gallery + no ads, consider{" "}
                      {isEdit && slug.trim() ? (
                        <Link
                          href={`/memorials/${slug.trim()}/upgrade`}
                          className="font-medium text-amber-800 underline underline-offset-2"
                        >
                          upgrading
                        </Link>
                      ) : (
                        <Link
                          href="/plans"
                          className="font-medium text-amber-800 underline underline-offset-2"
                        >
                          a paid plan
                        </Link>
                      )}
                      .
                    </span>
                  </span>
                </label>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Status
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                disabled={isLoading}
                className={`flex items-center justify-center rounded-xl border-2 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  status === "draft"
                    ? "border-slate-800 bg-slate-800 text-white shadow-sm ring-2 ring-slate-800/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus("publish")}
                disabled={isLoading}
                className={`flex items-center justify-center rounded-xl border-2 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  status === "publish"
                    ? "border-amber-700 bg-amber-700 text-white shadow-sm ring-2 ring-amber-600/30"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                Publish
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {status === "draft"
                ? "Save and continue later"
                : "Visible according to your visibility settings"}
            </p>
          </section>

          <button
            type="submit"
            disabled={isLoading || galleryUploadLoading || coverUploadLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3.5 text-sm font-semibold text-white shadow-md shadow-amber-900/15 transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              isEdit ? "Save changes" : "Create memorial"
            )}
          </button>
          {submitError && (
            <p className="mt-2 text-sm text-red-500">{submitError}</p>
          )}
        </form>
    </MemorialPageShell>
  );
}
