import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { Button } from "@/components/Button";

export const metadata = {
  title: "Our Story — Evermissed",
  description:
    "Why Evermissed exists: preserving legacies, sharing stories, and keeping memories alive for future generations."
};

export default function AboutPage() {
  return (
    <MemorialPageShell
      title="Our story"
      subtitle="Bridging memories across generations"
      eyebrow="About Evermissed"
      maxWidth="5xl"
      contentClassName="mt-10"
    >
      <article className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-lg shadow-slate-400/10 backdrop-blur sm:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:col-span-4">
            <div className="mx-auto max-w-xs lg:mx-0">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-inner">
                <Image
                  src="/founder.png"
                  alt="Evermissed founder and site owner"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 320px"
                  priority
                />
              </div>
              <p className="mt-4 text-center font-serif text-lg font-semibold text-slate-900 lg:text-left">
                Founder
              </p>
              <p className="mt-1 text-center text-sm text-slate-500 lg:text-left">
                Evermissed
              </p>
            </div>
          </aside>

          <div className="space-y-6 text-sm leading-relaxed text-slate-700 lg:col-span-8 lg:text-base">
            <p>
              The vision for this platform was born from a personal journey to rediscover my own roots. While
              attempting to reconstruct the life stories of my grandparents, I realized how much of our heritage is
              often left in the shadows.
            </p>
            <p>
              My grandfather, a veteran of World War II, passed away when I was very young, leaving me with only
              fleeting, hazy memories. My grandmother, a woman of incredible strength, raised her family through the
              hardships of post-war Russia. Though I cherish the tender moments I spent with her, I was struck by how
              little I truly knew about the challenges they overcame and the lives they led.
            </p>
            <p>
              Uncovering their history wasn&apos;t easy. It required digging through forgotten family albums and
              encouraging relatives to share stories that had never been written down. This experience led to a
              profound realization: in our digital age, there should be a simpler way to preserve these legacies.
            </p>

            <h2 className="pt-2 font-serif text-xl font-semibold text-slate-900 sm:text-2xl">
              Why this platform exists
            </h2>
            <p>
              I envisioned a space where families—no matter how far apart they are—could come together to build a
              lasting tribute. This website is designed to be more than just a digital archive; it is a{" "}
              <strong className="font-semibold text-slate-800">living memorial</strong> where you can:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold text-slate-800">Preserve the past:</strong> Easily upload photographs
                and media that might otherwise be lost to time.
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Share the story:</strong> Invite friends and family to
                contribute their own unique memories, tributes, and messages.
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Educate the future:</strong> Ensure that our children
                and grandchildren can grow up knowing the faces and the spirits of the ancestors they never had the
                chance to meet.
              </li>
            </ul>

            <h2 className="pt-2 font-serif text-xl font-semibold text-slate-900 sm:text-2xl">
              Our commitment to you
            </h2>
            <p>
              From day one, my focus has been on simplicity and accessibility. I believe that technology should never
              be a barrier to honoring a loved one. We have worked tirelessly to ensure that anyone, regardless of
              their technical skills, can create a beautiful, dignified space for remembrance.
            </p>
            <p>
              As our community grows, we continue to listen to your feedback. We are dedicated to evolving and
              improving, ensuring that your memories are kept safe, honored, and accessible for generations to come.
            </p>

            <p className="pt-4 font-serif text-lg italic text-slate-600">— Founder, Evermissed</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-stretch justify-between gap-4 border-t border-slate-200/80 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600">Ready to honor someone you love?</p>
          <Link href="/memorials/new" className="inline-flex shrink-0 items-center gap-2 self-start sm:self-auto">
            <Button variant="accent" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              Create a memorial
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-800/90 text-white">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Button>
          </Link>
        </div>
      </article>
    </MemorialPageShell>
  );
}
