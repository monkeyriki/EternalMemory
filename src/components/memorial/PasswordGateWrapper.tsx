"use client";

import { useEffect, useState } from "react";
import type { MemorialAdsForClient } from "@/lib/memorialAds";
import { SingleMemorialClient } from "./SingleMemorialClient";

type PasswordGateWrapperProps = {
  slug: string;
  memorial: any;
  tributes: any[];
  storeItems: any[];
  galleryMedia?: { id: string; image_url: string }[];
  isAuthenticated: boolean;
  /** After password unlock, preserve real owner/admin so moderation UI works. */
  isOwner: boolean;
  isAdmin: boolean;
  memorialAds?: MemorialAdsForClient;
};

const storageKeyForSlug = (slug: string) => `memorial_access_${slug}`;

export function PasswordGateWrapper({
  slug,
  memorial,
  tributes,
  storeItems,
  galleryMedia = [],
  isAuthenticated,
  isOwner,
  isAdmin,
  memorialAds = { show: false }
}: PasswordGateWrapperProps) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = storageKeyForSlug(slug);
    const token = window.localStorage.getItem(key);
    if (token) {
      setUnlocked(true);
    }
  }, [slug]);

  if (unlocked) {
    return (
      <SingleMemorialClient
        memorial={memorial}
        isOwner={isOwner}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        tributes={tributes}
        storeItems={storeItems}
        galleryMedia={galleryMedia}
        memorialAds={memorialAds}
      />
    );
  }

  return (
    <PasswordGate
      slug={slug}
      onUnlocked={() => {
        if (typeof window !== "undefined") {
          const key = storageKeyForSlug(slug);
          window.localStorage.setItem(key, "1");
        }
        setUnlocked(true);
      }}
    />
  );
}

type PasswordGateProps = {
  slug: string;
  onUnlocked: () => void;
};

function PasswordGate({ slug, onUnlocked }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/memorials/${slug}/verify-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        setError("Incorrect password. Please try again.");
      } else {
        const data = await res.json().catch(() => null);
        if (data?.ok) {
          onUnlocked();
        } else {
          setError("Incorrect password. Please try again.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-100/35 via-sky-50/15 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl rounded-[2rem] border border-slate-200/90 bg-white/95 p-8 shadow-xl shadow-slate-400/10 backdrop-blur">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Private memorial</p>
          <div className="mx-auto mb-3 mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-lg text-amber-800 ring-1 ring-amber-200/80">
            <span aria-hidden>🔒</span>
          </div>
          <h1 className="font-serif text-xl font-semibold text-slate-900 sm:text-2xl">
            This memorial is private
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the password to view it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-amber-900/15 transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Verifying..." : "View memorial"}
          </button>
        </form>
      </div>
    </div>
  );
}

