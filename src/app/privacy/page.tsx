import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export const metadata = {
  title: "Privacy Policy - EternalMemory",
  description:
    "How EternalMemory collects, uses, stores, and protects personal data."
};

export default function PrivacyPage() {
  return (
    <MemorialPageShell
      title="Privacy Policy"
      subtitle="How we process personal data for EternalMemory services, including GDPR rights and memorial-specific content handling."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <article className="space-y-6 rounded-2xl border border-slate-200/90 bg-white/95 p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            1. Data controller
          </h2>
          <p className="mt-2">
            EternalMemory acts as data controller for account and platform data.
            For privacy requests, contact{" "}
            <a
              href="mailto:privacy@eternalmemory.example"
              className="rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              privacy@eternalmemory.example
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            2. Data we collect
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Account data:</strong> email, display name, auth identifiers,
              and account role.
            </li>
            <li>
              <strong>Memorial data:</strong> names, dates, story content, media,
              tags, visibility settings, moderation metadata.
            </li>
            <li>
              <strong>Transaction data:</strong> order references, plan purchases,
              billing metadata provided by payment processors.
            </li>
            <li>
              <strong>Technical/security data:</strong> IP address, request logs,
              device/browser information, abuse-prevention signals.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            3. Legal bases (GDPR)
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Contract:</strong> to provide account, memorial, and paid
              service functionality.
            </li>
            <li>
              <strong>Legitimate interests:</strong> service security, abuse
              prevention, moderation, and product reliability.
            </li>
            <li>
              <strong>Legal obligation:</strong> tax/accounting compliance and lawful
              authority requests.
            </li>
            <li>
              <strong>Consent:</strong> where required by law (for example, optional
              communications or cookie categories where applicable).
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            4. How we use personal data
          </h2>
          <p className="mt-2">
            We use personal data to operate memorial pages, process payments, provide
            support, enforce safety rules, investigate abuse, and maintain platform
            performance. We do not sell personal data.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            5. Sharing and processors
          </h2>
          <p className="mt-2">
            We share data only with trusted processors needed to run the service
            (for example hosting, database/auth, email delivery, analytics, and
            payment providers), under contractual confidentiality and data protection
            obligations.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            6. International transfers
          </h2>
          <p className="mt-2">
            When data is transferred outside your jurisdiction, we use appropriate
            safeguards such as Standard Contractual Clauses or equivalent mechanisms
            required by applicable law.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            7. Retention
          </h2>
          <p className="mt-2">
            We retain data only as long as necessary for service delivery, dispute
            resolution, legal compliance, fraud prevention, and legitimate business
            records. You may request deletion, subject to legal retention
            requirements.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            8. Your rights
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Access, correct, or delete your personal data.</li>
            <li>Object to or restrict specific processing activities.</li>
            <li>Data portability where legally applicable.</li>
            <li>
              Withdraw consent at any time where processing is consent-based.
            </li>
            <li>File a complaint with your local data protection authority.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            9. Memorial content and moderation
          </h2>
          <p className="mt-2">
            Memorial content may include sensitive personal information. We provide
            reporting/moderation flows to reduce abuse, remove unlawful content, and
            protect families and visitors.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            10. Contact
          </h2>
          <p className="mt-2">
            For privacy requests or data rights inquiries, contact{" "}
            <a
              href="mailto:privacy@eternalmemory.example"
              className="rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              privacy@eternalmemory.example
            </a>
            .
          </p>
        </section>
        <p className="text-xs text-slate-500">Last updated: March 2026.</p>
      </article>
    </MemorialPageShell>
  );
}
