import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <div className="max-w-xl px-6 text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          EternalMemory
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          A calm, respectful digital memorial platform. This is the starting
          point for building the full experience described in the PRD.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button>Get started</Button>
          <Button variant="secondary">Browse memorials</Button>
        </div>
      </div>
    </main>
  );
}
