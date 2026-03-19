"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MemorialForm, {
  type MemorialFormData
} from "@/components/memorial/MemorialForm";
import { updateMemorialAction } from "./actions";

type EditMemorialClientProps = {
  memorial: {
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
  };
};

export default function EditMemorialClient({ memorial }: EditMemorialClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: MemorialFormData) {
    setIsLoading(true);
    setServerError(null);

    const result = await updateMemorialAction({
      id: memorial.id,
      type: data.type,
      fullName: data.fullName,
      slug: data.slug,
      dateOfBirth: data.dateOfBirth,
      dateOfDeath: data.dateOfDeath,
      city: data.city,
      visibility: data.visibility,
      status: data.status,
      story: data.story ?? null,
      coverImageUrl: data.coverImageUrl ?? null
    });

    setIsLoading(false);

    if (!result.ok) {
      setServerError(result.error);
      throw new Error(result.error || "Failed to update memorial");
    }

    router.push(`/memorials/${memorial.slug}`);
  }

  return (
    <>
      {serverError && (
        <div className="mb-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {serverError}
          </p>
        </div>
      )}
      <MemorialForm
        mode="edit"
        initialData={memorial}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
}

