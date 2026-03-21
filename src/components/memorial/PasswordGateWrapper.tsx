"use client";

import { useEffect, useState } from "react";
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
  isAdmin
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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            {/* Simple lock icon */}
            <span className="text-lg">🔒</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
            className="inline-flex w-full items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Verifying..." : "View memorial"}
          </button>
        </form>
      </div>
    </div>
  );
}

