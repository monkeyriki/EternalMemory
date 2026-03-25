"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MemorialForm, {
  type MemorialFormData
} from "@/components/memorial/MemorialForm";
import { createMemorialAction } from "./actions";
import type { MemorialPlanCheckoutSku } from "@/lib/memorialStripeHosting";

type MemorialNewClientProps = {
  initialFullName?: string;
  /** After create, redirect to upgrade with Stripe auto-checkout (from /plans). */
  checkoutPlanAfterCreate?: MemorialPlanCheckoutSku | null;
};

export default function MemorialNewClient({
  initialFullName,
  checkoutPlanAfterCreate = null
}: MemorialNewClientProps) {
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
      coverImageUrl: data.coverImageUrl,
      galleryImageUrls: data.galleryImageUrls ?? [],
      tags: data.tags ?? []
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

    const slug = result.slug.trim().toLowerCase();
    if (checkoutPlanAfterCreate) {
      console.log(
        "[MemorialNewClient] Redirecting to upgrade + checkout:",
        slug,
        checkoutPlanAfterCreate
      );
      router.push(
        `/memorials/${slug}/upgrade?autoCheckout=${encodeURIComponent(checkoutPlanAfterCreate)}`
      );
      return;
    }

    console.log("[MemorialNewClient] Redirecting to:", `/memorials/${slug}`);
    router.push(`/memorials/${slug}`);
  }

  return (
    <MemorialForm
      mode="create"
      initialFullName={initialFullName}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      serverBanner={serverError}
    />
  );
}
