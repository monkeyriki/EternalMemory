import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Playfair_Display } from "next/font/google";
import "./tailwind.generated.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_NAME } from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Digital memorial & obituary platform"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_38%,_#f8fafc_100%)] text-slate-900`}>
        <SiteHeader logoFontClassName={playfair.className} />
        <main className="flex-1">{children}</main>
        <SpeedInsights />
        <SiteFooter />
      </body>
    </html>
  );
}
