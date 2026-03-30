import type { Metadata } from "next";
import { WhyEverMissedRedirect } from "./WhyEverMissedRedirect";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Why ${SITE_NAME}`,
  description:
    "A meaningful way to remember loved ones: privacy, rich media, guestbook, virtual tributes, and a lasting digital legacy."
};

export default function WhyEverMissedPage() {
  return (
    <>
      <WhyEverMissedRedirect />
      <p className="sr-only" aria-live="polite">
        Redirecting to the home page…
      </p>
    </>
  );
}
