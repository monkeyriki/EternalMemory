import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export const metadata = {
  title: "Privacy policy - EternalMemory",
  description: "How EternalMemory handles personal data and account information."
};

export default function PrivacyPage() {
  return (
    <MemorialPageShell
      title="Privacy policy"
      subtitle="A clear summary of how we collect, use, and protect personal information."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <article className="space-y-5 rounded-2xl border border-slate-200/90 bg-white/95 p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">What we collect</h2>
          <p className="mt-2">
            We collect account details you provide, memorial content you publish, and basic service logs needed
            to secure and operate the platform.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">How we use data</h2>
          <p className="mt-2">
            Data is used to provide memorial pages, process payments, moderate content, prevent abuse, and
            improve reliability. We do not sell personal data.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">Your controls</h2>
          <p className="mt-2">
            You can request account and memorial data access or deletion through support. We process requests
            according to applicable privacy laws.
          </p>
        </section>
        <p className="text-xs text-slate-500">Last updated: March 2026</p>
      </article>
    </MemorialPageShell>
  );
}
