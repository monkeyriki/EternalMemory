"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

type CreateTributeInput = {
  memorial_id: string;
  message: string;
  guest_name?: string;
};

type TributeActionResult = {
  ok: boolean;
  error?: string;
};

export async function createTributeAction(
  input: CreateTributeInput
): Promise<TributeActionResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const message = input.message.trim();
  if (!message) {
    return { ok: false, error: "Tribute message cannot be empty." };
  }
  if (message.length > 500) {
    return {
      ok: false,
      error: "Tribute message must be at most 500 characters."
    };
  }

  const guestName = input.guest_name?.trim();
  if (guestName && guestName.length > 50) {
    return {
      ok: false,
      error: "Guest name must be at most 50 characters."
    };
  }

  if (user) {
    const { error } = await supabase.from("virtual_tributes").insert({
      memorial_id: input.memorial_id,
      purchaser_id: user.id,
      message,
      order_id: null,
      store_item_id: null,
      guest_name: null,
      is_approved: true
    });
    if (error) {
      return { ok: false, error: "Failed to post tribute. Please try again." };
    }
    return { ok: true };
  }

  const { error } = await supabase.from("virtual_tributes").insert({
    memorial_id: input.memorial_id,
    purchaser_id: null,
    message,
    order_id: null,
    store_item_id: null,
    guest_name: guestName || "Anonymous",
    is_approved: false
  });
  if (error) {
    return { ok: false, error: "Failed to post tribute. Please try again." };
  }
  return { ok: true };
}

type DeleteTributeInput = {
  id: string;
};

export async function deleteTributeAction(
  input: DeleteTributeInput
): Promise<TributeActionResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to delete a tribute." };
  }

  // Check ownership or admin
  const { data: tribute, error: tributeError } = await supabase
    .from("virtual_tributes")
    .select("id, memorial_id")
    .eq("id", input.id)
    .maybeSingle();

  if (tributeError || !tribute) {
    return { ok: false, error: "Tribute not found." };
  }

  const { data: memorial } = await supabase
    .from("memorials")
    .select("owner_id")
    .eq("id", tribute.memorial_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  const isOwner = memorial?.owner_id === user.id;

  if (!isOwner && !isAdmin) {
    return {
      ok: false,
      error: "You do not have permission to delete this tribute."
    };
  }

  const { error } = await supabase
    .from("virtual_tributes")
    .delete()
    .eq("id", input.id);

  if (error) {
    return { ok: false, error: "Failed to delete tribute. Please try again." };
  }

  return { ok: true };
}

