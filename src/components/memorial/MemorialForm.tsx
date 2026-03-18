"use client";

import { useState, useEffect } from "react";
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
}

interface MemorialFormProps {
  onSubmit: (data: MemorialFormData) => void | Promise<void>;
  isLoading: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function MemorialForm({ onSubmit, isLoading }: MemorialFormProps) {
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slugManuallyEdited && fullName) {
      setSlug(generateSlug(fullName));
    }
  }, [fullName, slugManuallyEdited]);

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
    const data: MemorialFormData = {
      type,
      fullName: fullName.trim(),
      slug: slug.trim(),
      visibility,
      status
    };
    if (dateOfBirth) data.dateOfBirth = dateOfBirth;
    if (dateOfDeath) data.dateOfDeath = dateOfDeath;
    if (city.trim()) data.city = city.trim();
    if (visibility === "password_protected") data.password = password;
    await onSubmit(data);
  };

  return (
    <div className="min-h-[60vh] bg-stone-50 py-8 px-4 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-light tracking-tight text-stone-800 sm:text-3xl">
            Create a memorial
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
                className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 ${
                  type === "human"
                    ? "border-stone-900 bg-stone-800 text-white shadow-sm ring-2 ring-stone-800/20"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <User className="h-5 w-5" />
                Human
              </button>
              <button
                type="button"
                onClick={() => setType("pet")}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 ${
                  type === "pet"
                    ? "border-stone-900 bg-stone-800 text-white shadow-sm ring-2 ring-stone-800/20"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <PawPrint className="h-5 w-5" />
                Pet
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

          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-500">
              Status
            </p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-stone-800">
                  {status === "draft" ? "Draft" : "Published"}
                </p>
                <p className="text-xs text-stone-500">
                  {status === "draft"
                    ? "Save and continue later"
                    : "Visible according to your visibility settings"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={status === "publish"}
                onClick={() =>
                  setStatus(status === "draft" ? "publish" : "draft")
                }
                disabled={isLoading}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  status === "publish" ? "bg-stone-800" : "bg-stone-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    status === "publish" ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
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
              "Save memorial"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
