import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export const metadata = {
  title: "Terms of Service - Evermissed",
  description:
    "Terms governing use of Evermissed memorial pages, account features, and paid services."
};

export default function TermsPage() {
  return (
    <MemorialPageShell
      title="Terms of Service"
      subtitle="Rules for using Evermissed safely, respectfully, and lawfully."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <article className="space-y-6 rounded-2xl border border-slate-200/90 bg-white/95 p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            1. Acceptance
          </h2>
          <p className="mt-2">
            By using Evermissed, you agree to these Terms, our Privacy Policy, and
            any additional policies referenced in the platform.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            2. Eligibility and accounts
          </h2>
          <p className="mt-2">
            You are responsible for your account credentials and all activity under
            your account. You must provide accurate account information and keep it up
            to date.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            3. Acceptable use and memorial content
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Content must be lawful, respectful, and non-abusive.</li>
            <li>
              You must have rights to publish text, images, media, and other materials
              you upload.
            </li>
            <li>
              You may not publish hateful, harassing, fraudulent, or infringing
              content.
            </li>
            <li>
              We may remove or restrict content that violates these Terms, applicable
              law, or platform safety standards.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            4. Moderation and enforcement
          </h2>
          <p className="mt-2">
            We may investigate reports, suspend accounts, remove content, or restrict
            access where necessary to protect users, families, and platform integrity.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            5. Paid services, billing, and refunds
          </h2>
          <p className="mt-2">
            You are responsible for account security and for charges linked to your plan or purchases.
            Pricing and plan details are shown before checkout. Unless required by law,
            fees are generally non-refundable after service delivery; billing disputes
            can be raised at{" "}
            <a
              href="mailto:billing@evermissed.com"
              className="rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              billing@evermissed.com
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            6. Availability and changes
          </h2>
          <p className="mt-2">
            We may modify features, pricing, or service components over time. We do not
            guarantee uninterrupted availability, but we aim for reliable service and
            transparent maintenance.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            7. Intellectual property
          </h2>
          <p className="mt-2">
            The platform design, branding, and software are owned by Evermissed or
            licensors. You retain rights to your content, while granting us the limited
            rights needed to host and display it within the service.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            8. Liability
          </h2>
          <p className="mt-2">
            To the maximum extent permitted by law, Evermissed is not liable for
            indirect, incidental, or consequential damages. Nothing in these Terms
            limits rights that cannot be excluded by law.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            9. Governing law and contact
          </h2>
          <p className="mt-2">
            Questions about these Terms can be sent to{" "}
            <a
              href="mailto:support@evermissed.com"
              className="rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              support@evermissed.com
            </a>
            .
          </p>
        </section>
        <p className="text-xs text-slate-500">Last updated: March 2026.</p>
      </article>
    </MemorialPageShell>
  );
}
