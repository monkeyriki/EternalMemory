import { Clock, Image as ImageIcon, Share2, Shield } from "lucide-react";

const items = [
  {
    Icon: Shield,
    title: "Private & secure",
    description: "Control who can view and contribute to your memorial."
  },
  {
    Icon: Share2,
    title: "Share with family",
    description: "Invite loved ones to add memories and tributes from anywhere."
  },
  {
    Icon: ImageIcon,
    title: "Rich media",
    description: "Photos, stories, and music in one respectful place."
  },
  {
    Icon: Clock,
    title: "Built to last",
    description: "A calm, lasting home for the stories that matter most."
  }
] as const;

/** Non-interactive trust strip below featured memorials (mockup). */
export function HomeFeaturedBenefitsStrip() {
  return (
    <div
      className="mt-14 border-t border-slate-200/70 pt-14 md:mt-16 md:pt-16"
      aria-label="Why families trust EverMissed"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {items.map(({ Icon, title, description }, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/60 bg-[#faf8f5]/80 px-5 py-6 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e07a3f]/12">
              <Icon className="h-6 w-6 text-[#e07a3f]" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
