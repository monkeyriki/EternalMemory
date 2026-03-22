"use client";

import { useState, useEffect, useRef } from "react";
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
  ads_free?: boolean | null;
};

interface MemorialFormProps {
  mode: MemorialFormMode;
  initialData?: MemorialInitialData;
  onSubmit: (data: MemorialFormData) => void | Promise<void>;
  isLoading: boolean;
}

const MAX_GALLERY_IMAGES = 24;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function MemorialForm({
  mode,
  initialData,
  onSubmit,
  isLoading
}: MemorialFormProps) {
  const isEdit = mode === "edit";
  const [type, setType] = useState<"human" | "pet">("human");
  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
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

  useEffect(() => {
    if (isEdit && initialData) {
      setType(initialData.type);
      setFullName(initialData.full_name);
      setSlug(initialData.slug);
      setSlugManuallyEdited(true);
      setDateOfBirth(initialData.date_of_birth ?? "");
      setDateOfDeath(initialData.date_of_death ?? "");
      setCity(initialData.city ?? "");
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
    if (
      visibility === "password_protected" &&
      !password.trim()
    ) {
      newErrors.password =
        "Password is required for password-protected memorials";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (visibility === "password_protected") data.password = password;
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
    <div className="min-h-[60vh] bg-stone-50 py-8 px-4 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-light tracking-tight text-stone-800 sm:text-3xl">
            {isEdit ? "Edit memorial" : "Create a memorial"}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Honor and remember those who meant so much
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">
              Memorial type
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("human")}
                aria-pressed={type === "human"}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 ${
                  type === "human"
                    ? "border-amber-600 bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50 ring-offset-2"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
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
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 ${
                  type === "pet"
                    ? "border-amber-600 bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50 ring-offset-2"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
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

          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Basic information
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                placeholder="Mario Rossi"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Memorial URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                <span className="shrink-0 text-sm text-stone-500">
                  /memorials/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-stone-900 focus:outline-none focus:ring-0"
                  placeholder="mario-rossi"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Auto-generated from name; you can edit it
              </p>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Date of death
                </label>
                <input
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                placeholder="e.g. London"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Tags <span className="font-normal text-stone-500">(optional)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                placeholder="e.g. veteran, golden-retriever, acme-funeral-home"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-stone-500">
                Comma-separated. Used for directory search (e.g. breed, organization, military).
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Story{" "}
                <span className="font-normal text-stone-500">
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
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Cover photo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isLoading || coverUploadLoading}
                className="block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-700 hover:file:bg-amber-100"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setCoverUploadError(null);
                  setCoverUploadLoading(true);
                  const fd = new FormData();
                  fd.set("file", f);
                  const result = await uploadCoverImageAction(fd);
                  setCoverUploadLoading(false);
                  if (result.ok && result.url) {
                    setCoverImageUrl(result.url);
                  } else {
                    setCoverUploadError(result.error ?? "Upload failed");
                  }
                  e.target.value = "";
                }}
              />
              {coverUploadLoading && (
                <p className="mt-1 text-sm text-stone-500">Uploading...</p>
              )}
              {coverUploadError && (
                <p className="mt-1 text-sm text-red-600">{coverUploadError}</p>
              )}
              <label className="mt-2 mb-1 block text-xs font-medium text-stone-500">
                Or paste image URL
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => {
                  setCoverImageUrl(e.target.value);
                  setCoverUploadError(null);
                }}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="https://..."
                disabled={isLoading}
              />
              {coverImageUrl.trim() && (
                <div className="mt-2">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="h-32 w-full rounded-lg border border-stone-200 object-cover"
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

            <div className="mt-6 border-t border-stone-100 pt-6">
              <label className="mb-1 block text-sm font-medium text-stone-700">
                More photos (gallery)
              </label>
              <p className="mb-2 text-xs text-stone-500">
                Up to {MAX_GALLERY_IMAGES} images in addition to the cover. Shown on the memorial
                page in a grid.
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                disabled={isLoading || galleryUploadLoading || galleryUrls.length >= MAX_GALLERY_IMAGES}
                className="block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-700 hover:file:bg-amber-100"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length === 0) return;
                  setGalleryError(null);
                  const room = MAX_GALLERY_IMAGES - galleryUrls.length;
                  if (room <= 0) {
                    setGalleryError(`Maximum ${MAX_GALLERY_IMAGES} gallery photos.`);
                    return;
                  }
                  const toUpload = files.slice(0, room);
                  setGalleryUploadLoading(true);
                  try {
                    const next: string[] = [...galleryUrls];
                    for (const f of toUpload) {
                      const fd = new FormData();
                      fd.set("file", f);
                      const result = await uploadCoverImageAction(fd);
                      if (result.ok && result.url) {
                        next.push(result.url);
                      } else {
                        setGalleryError(result.error ?? "One or more uploads failed.");
                        break;
                      }
                    }
                    setGalleryUrls(next.slice(0, MAX_GALLERY_IMAGES));
                  } finally {
                    setGalleryUploadLoading(false);
                  }
                }}
              />
              {galleryUploadLoading && (
                <p className="mt-1 text-sm text-stone-500">Uploading gallery…</p>
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
                        className="h-24 w-full rounded-lg border border-stone-200 object-cover"
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

          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
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
                  className={`flex w-full items-start gap-3 rounded-lg border-2 p-3 text-left transition-colors ${
                    visibility === key
                      ? "border-stone-800 bg-stone-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                  disabled={isLoading}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-stone-600" />
                  <div>
                    <p className="font-medium text-stone-800">{label}</p>
                    <p className="text-xs text-stone-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {visibility === "password_protected" && (
              <div className="pt-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 py-2 pl-10 pr-10 text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
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

          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Ads &amp; premium
            </p>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 transition-colors hover:bg-stone-50">
              <input
                type="checkbox"
                checked={adsFree}
                onChange={(e) => setAdsFree(e.target.checked)}
                disabled={isLoading}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-700 focus:ring-amber-500"
              />
              <span>
                <span className="block text-sm font-medium text-stone-800">
                  Premium memorial (no ads)
                </span>
                <span className="mt-0.5 block text-xs text-stone-500">
                  When enabled, platform advertising is not shown on this page.
                </span>
              </span>
            </label>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">
              Status
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                disabled={isLoading}
                className={`flex items-center justify-center rounded-lg border-2 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 ${
                  status === "draft"
                    ? "border-stone-900 bg-stone-800 text-white shadow-sm ring-2 ring-stone-800/20"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus("publish")}
                disabled={isLoading}
                className={`flex items-center justify-center rounded-lg border-2 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 ${
                  status === "publish"
                    ? "border-stone-900 bg-stone-800 text-white shadow-sm ring-2 ring-stone-800/20"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                Publish
              </button>
            </div>

            <p className="mt-3 text-xs text-stone-500">
              {status === "draft"
                ? "Save and continue later"
                : "Visible according to your visibility settings"}
            </p>
          </section>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </div>
  );
}
