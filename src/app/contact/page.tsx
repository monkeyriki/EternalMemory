import Link from "next/link";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export const metadata = {
  title: "Contact - EternalMemory",
  description: "Get help with memorials, account access, billing, and moderation."
};

export default function ContactPage() {
  return (
    <MemorialPageShell
      title="Contact"
      subtitle="Need help? Reach out for account, billing, or moderation support."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Support channels</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-700">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="font-medium text-slate-900">General support</p>
            <p className="mt-1">Email: support@eternalmemory.example</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="font-medium text-slate-900">Billing and plans</p>
            <p className="mt-1">Email: billing@eternalmemory.example</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="font-medium text-slate-900">Urgent moderation issues</p>
            <p className="mt-1">Email: trust@eternalmemory.example</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          For account recovery, include the email used to sign in and a short summary of the issue.
        </p>

        <div className="mt-6">
          <Link href="/memorials" className="text-sm font-semibold text-amber-800 underline-offset-4 hover:underline">
            Browse memorials
          </Link>
        </div>
      </section>
    </MemorialPageShell>
  );
}
