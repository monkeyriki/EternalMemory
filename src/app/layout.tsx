import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./tailwind.generated.css";
import { SiteHeader } from "@/components/SiteHeader";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"]
});

export const metadata: Metadata = {
  title: "EternalMemory",
  description: "Digital memorial & obituary platform"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_38%,_#f8fafc_100%)] text-slate-900`}>
        <SiteHeader logoFontClassName={playfair.className} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white/95 px-4 py-4 text-center text-sm text-slate-500">
          EternalMemory - A calm digital memorial platform
        </footer>
      </body>
    </html>
  );
}
