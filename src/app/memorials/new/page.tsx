import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import MemorialNewClient from "./MemorialNewClient";

export const metadata = {
  title: "Create memorial | EternalMemory",
  description: "Create a new digital memorial"
};

export default async function MemorialNewPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/memorials/new");
  }

  return <MemorialNewClient />;
}
