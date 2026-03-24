import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <p className="text-slate-600">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
