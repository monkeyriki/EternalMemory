import { redirect } from "next/navigation";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { DeleteAccountRequestForm } from "./DeleteAccountRequestForm";

export const metadata = {
  title: "Request account deletion - EternalMemory",
  description:
    "Submit a GDPR/CCPA-style account deletion request for review and processing."
};

export default async function AccountDeletePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account/delete");
  }

  return (
    <MemorialPageShell
      title="Request account deletion"
      subtitle="Submit a formal deletion request. We will verify and process it according to privacy law requirements."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <section className="space-y-5 rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm sm:p-8">
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-sm text-amber-900">
          Deletion can remove account access and personal data linked to your profile,
          subject to legal retention obligations (for example billing/tax records).
        </div>
        <DeleteAccountRequestForm />
      </section>
    </MemorialPageShell>
  );
}
