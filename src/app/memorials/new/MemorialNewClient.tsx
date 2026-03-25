"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MemorialForm, {
  type MemorialFormData
} from "@/components/memorial/MemorialForm";
import { createMemorialAction } from "./actions";
import type { MemorialPlanCheckoutSku } from "@/lib/memorialStripeHosting";
import type { PlansTier } from "@/lib/plansTier";

type MemorialNewClientProps = {
  initialFullName?: string;
  /** From /plans flow: open upgrade after create (Premium = choose billing; Lifetime = payment). */
  hostingAfterCreate?: PlansTier | null;
  /** Legacy: auto-checkout SKU after create. */
  checkoutPlanAfterCreate?: MemorialPlanCheckoutSku | null;
};

export default function MemorialNewClient({
  initialFullName,
  hostingAfterCreate = null,
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

    if (hostingAfterCreate === "premium") {
      router.push(`/memorials/${slug}/upgrade`);
      return;
    }
    if (hostingAfterCreate === "lifetime") {
      router.push(`/memorials/${slug}/upgrade?autoCheckout=lifetime`);
      return;
    }

    if (checkoutPlanAfterCreate) {
      router.push(
        `/memorials/${slug}/upgrade?autoCheckout=${encodeURIComponent(checkoutPlanAfterCreate)}`
      );
      return;
    }

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
