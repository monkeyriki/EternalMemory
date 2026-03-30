import type { Metadata } from "next";
import { WhyEverMissedPageContent } from "@/components/marketing/WhyEverMissedPageContent";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Why ${SITE_NAME}`,
  description:
    "A meaningful way to remember loved ones: privacy, rich media, guestbook, virtual tributes, and a lasting digital legacy."
};

export default function WhyEverMissedPage() {
  return <WhyEverMissedPageContent />;
}
