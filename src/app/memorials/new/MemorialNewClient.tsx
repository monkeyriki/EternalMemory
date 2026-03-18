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
    const result = await createMemorialAction({
      type: data.type,
      fullName: data.fullName,
      slug: data.slug,
      dateOfBirth: data.dateOfBirth,
      dateOfDeath: data.dateOfDeath,
      city: data.city,
      visibility: data.visibility,
      password: data.password,
      status: data.status
    });
    setIsLoading(false);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(`/memorials/${result.slug}`);
    router.refresh();
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
      <MemorialForm onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  );
}
