import { getSupabaseServerClient } from "@/lib/supabaseServer";
import BlockedWordsAdminClient, {
  type BlockedWordRow
} from "./BlockedWordsAdminClient";

export default async function AdminBlockedWordsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: rows, error } = await (supabase as any)
    .from("blocked_words")
    .select("id, word, is_active, created_at")
    .order("is_active", { ascending: false })
    .order("word", { ascending: true });

  if (error) {
    console.error("[AdminBlockedWordsPage]", error);
  }

  const list: BlockedWordRow[] = (rows ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    word: String(r.word ?? ""),
    is_active: Boolean(r.is_active),
    created_at: String(r.created_at ?? "")
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Blocked words
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage the English profanity / banned-term list used to block guestbook messages, guest
          names, optional checkout notes, and report descriptions. No Supabase console required.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load blocked words. Confirm the{" "}
          <code className="rounded bg-red-100/80 px-1">blocked_words</code> table exists and RLS
          allows admin access.
        </p>
      ) : null}

      <BlockedWordsAdminClient initialRows={list} />
    </div>
  );
}
