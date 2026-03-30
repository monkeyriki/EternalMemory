import { Globe, Heart, Image as ImageIcon, Share2 } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Start with Love",
    description:
      "Begin by sharing the name and dates of your loved one. Add a heartfelt description that captures who they were.",
    Icon: Heart
  },
  {
    step: "02",
    title: "Add Memories",
    description:
      "Upload cherished photos, share meaningful stories, and add music that reminds you of them.",
    Icon: ImageIcon
  },
  {
    step: "03",
    title: "Invite Family",
    description:
      "Share the memorial with family and friends. They can contribute their own memories and tributes.",
    Icon: Share2
  },
  {
    step: "04",
    title: "Preserve Forever",
    description:
      "Your memorial lives on as a lasting digital legacy, accessible anytime, anywhere in the world.",
    Icon: Globe
  }
] as const;

/**
 * Static “how it works” strip — no links or buttons; informational only.
 */
export function CreatingMemorialStepsSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 border-b border-[#ebe8e4]/80 bg-white py-14 sm:py-16 md:py-20"
      aria-labelledby="creating-memorial-steps-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="creating-memorial-steps-heading"
            className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-[2.35rem] md:leading-tight"
          >
            Creating a Memorial Is Easy
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            In just a few thoughtful steps, create a beautiful tribute that honors your loved
            one&apos;s memory.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map(({ step, title, description, Icon }) => (
            <article
              key={step}
              className="relative overflow-hidden rounded-2xl border border-[#ebe8e4]/90 bg-[#faf8f5] p-6 pt-8 shadow-sm"
            >
              <span
                className="pointer-events-none absolute right-3 top-2 font-serif text-5xl font-semibold tabular-nums text-[#f3e0d4] sm:text-[3.25rem]"
                aria-hidden
              >
                {step}
              </span>
              <div className="relative">
                <div className="mb-4 inline-flex rounded-lg bg-white/80 p-2.5 shadow-sm ring-1 ring-[#e07a3f]/10">
                  <Icon className="h-5 w-5 text-[#e07a3f]" strokeWidth={1.85} aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
