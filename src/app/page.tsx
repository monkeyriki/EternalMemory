import Link from "next/link";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          EternalMemory
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          A calm, respectful digital memorial platform.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/memorials">
            <Button variant="secondary">Browse memorials</Button>
          </Link>
          <Link href="/memorials/new">
            <Button>Create memorial</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
