"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MemorialForm, {
  type MemorialFormData
} from "@/components/memorial/MemorialForm";
import { createMemorialAction } from "./actions";

export default function MemorialNewClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: MemorialFormData) {
    setIsLoading(true);
    setServerError(null);
    console.log("[MemorialNewClient] submit payload status:", data.status);
    const result = await createMemorialAction({
      type: data.type,
      fullName: data.fullName,
      slug: data.slug,
      dateOfBirth: data.dateOfBirth,
      dateOfDeath: data.dateOfDeath,
      city: data.city,
      visibility: data.visibility,
      password: data.password,
      status: data.status,
      story: data.story,
      coverImageUrl: data.coverImageUrl
    });
    setIsLoading(false);

    // Browser DevTools → Console
    console.log("[MemorialNewClient] createMemorialAction result:", result);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    if (!result.slug) {
      setServerError("Memorial URL was not returned. Please try again.");
      return;
    }

    console.log("[MemorialNewClient] Redirecting to:", `/memorials/${result.slug}`);
    router.push(`/memorials/${result.slug}`);
  }

  return (
    <>
      {serverError && (
        <div className="mx-auto max-w-xl px-4 pt-4">
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {serverError}
          </p>
        </div>
      )}
      <MemorialForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  );
}
