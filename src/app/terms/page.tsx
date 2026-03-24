import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export const metadata = {
  title: "Terms of service - EternalMemory",
  description: "Platform usage rules for EternalMemory accounts and memorial pages."
};

export default function TermsPage() {
  return (
    <MemorialPageShell
      title="Terms of service"
      subtitle="Core rules for using EternalMemory respectfully and safely."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <article className="space-y-5 rounded-2xl border border-slate-200/90 bg-white/95 p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">Respectful use</h2>
          <p className="mt-2">
            You agree to publish lawful, respectful memorial content and avoid harassment, hate, or abusive
            behavior.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">Accounts and payments</h2>
          <p className="mt-2">
            You are responsible for account security and for charges linked to your plan or purchases.
            Subscription and one-time plan details are shown before checkout.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">Moderation and enforcement</h2>
          <p className="mt-2">
            We may remove content or suspend access when terms are violated, legal requirements apply, or
            platform safety is at risk.
          </p>
        </section>
        <p className="text-xs text-slate-500">Last updated: March 2026</p>
      </article>
    </MemorialPageShell>
  );
}
