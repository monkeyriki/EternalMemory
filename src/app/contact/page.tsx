import Link from "next/link";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { getPrivacyEmail } from "@/lib/privacyContact";

export const metadata = {
  title: "Contact & Support - EternalMemory",
  description:
    "Get support for memorial pages, account access, billing, privacy requests, and moderation."
};

export default function ContactPage() {
  const privacyEmail = getPrivacyEmail();

  return (
    <MemorialPageShell
      title="Contact & Support"
      subtitle="Reach the right team quickly for account, billing, trust, and data protection requests."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <section className="space-y-6 rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          Support channels
        </h2>
        <div className="space-y-4 text-sm text-slate-700">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="font-medium text-slate-900">General support</p>
            <p className="mt-1">
              Product help, account questions, and memorial management:
            </p>
            <a
              href="mailto:support@eternalmemory.example"
              className="mt-1 inline-block rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              support@eternalmemory.example
            </a>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="font-medium text-slate-900">Billing and plans</p>
            <p className="mt-1">
              Premium/lifetime plans, subscription questions, invoices, and refunds:
            </p>
            <a
              href="mailto:billing@eternalmemory.example"
              className="mt-1 inline-block rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              billing@eternalmemory.example
            </a>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="font-medium text-slate-900">Trust, safety, and abuse</p>
            <p className="mt-1">
              Urgent moderation issues, impersonation, or harmful content reports:
            </p>
            <a
              href="mailto:trust@eternalmemory.example"
              className="mt-1 inline-block rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              trust@eternalmemory.example
            </a>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="font-medium text-slate-900">Privacy requests (GDPR/CCPA)</p>
            <p className="mt-1">
              Access, correction, deletion, or data portability requests:
            </p>
            <a
              href={`mailto:${privacyEmail}`}
              className="mt-1 inline-block rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              {privacyEmail}
            </a>
            . See also our{" "}
            <Link
              href="/privacy#ccpa-california"
              className="rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              California privacy notice
            </Link>
            .
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">What to include in your request</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The email tied to your account (if applicable).</li>
            <li>Memorial URL or slug related to the issue.</li>
            <li>A concise description and relevant screenshots/details.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/memorials"
            className="rounded-md text-sm font-semibold text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
          >
            Browse memorials
          </Link>
          <Link
            href="/privacy"
            className="rounded-md text-sm font-semibold text-slate-700 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
          >
            Privacy policy
          </Link>
        </div>
      </section>
    </MemorialPageShell>
  );
}
