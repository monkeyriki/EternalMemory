import Link from "next/link";
import { Button } from "@/components/Button";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export const metadata = {
  title: "Plans — EternalMemory",
  description: "Basic, Premium, and Lifetime hosting for digital memorials."
};

export default function PlansPage() {
  return (
    <MemorialPageShell
      title="Memorial hosting plans"
      subtitle="Choose how you want to host a memorial. Upgrade anytime from your memorial's edit page after it is created."
      maxWidth="5xl"
      contentClassName="mt-6 space-y-10"
    >
        <div className="flex flex-wrap justify-center gap-3">
            <Link href="/memorials/new">
              <Button variant="accent" className="px-6 py-2.5 text-sm">
                Create a memorial
              </Button>
            </Link>
            <Link href="/memorials">
              <Button variant="secondary" className="px-6 py-2.5 text-sm">
                Browse memorials
              </Button>
            </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/95 shadow-md shadow-slate-400/10 backdrop-blur">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 font-semibold text-slate-900">Feature</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Basic</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Premium</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Lifetime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-4 py-3">Price</td>
                <td className="px-4 py-3">Free</td>
                <td className="px-4 py-3">Subscription (monthly or yearly)</td>
                <td className="px-4 py-3">One-time</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Gallery photos (excl. cover)</td>
                <td className="px-4 py-3">Up to 5</td>
                <td className="px-4 py-3">Up to 24</td>
                <td className="px-4 py-3">Up to 24</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Platform ads on public page</td>
                <td className="px-4 py-3">Yes (unless manually hidden)</td>
                <td className="px-4 py-3">No</td>
                <td className="px-4 py-3">No</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Billing</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">Renews until cancelled</td>
                <td className="px-4 py-3">Pay once per memorial</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-slate-500">
          After you publish a memorial, open <strong>Edit</strong> → hosting section, or go to{" "}
          <code className="rounded bg-slate-200/80 px-1 py-0.5 text-[11px]">
            /memorials/your-slug/upgrade
          </code>
          .
        </p>
    </MemorialPageShell>
  );
}
